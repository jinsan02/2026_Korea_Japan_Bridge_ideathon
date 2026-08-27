'use client';

/**
 * Demo session state.
 *
 * Everything the flow needs between screens: language, provider choice, the
 * analysis, and the counters the study measures. State is mirrored to
 * sessionStorage so a stray refresh does not restart the demo mid-presentation
 * - except the uploaded image, which is held in memory only and dies with the
 * tab. Long-term learning progress lives separately in localStorage
 * (lib/learning/progress.ts); this object is one visit.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type {
  AnalysisMeta,
  AnalysisOutcome,
  DocumentAnalysis,
  ProviderId,
} from '@/lib/analysis/schema';
import {
  DEFAULT_LANGUAGE,
  getDictionary,
  isUiLanguage,
  type Dictionary,
  type UiLanguage,
} from '@/lib/i18n';
import {
  DEFAULT_CONDITION,
  getCondition,
  isConditionId,
  type ConditionDefinition,
  type ConditionId,
} from '@/lib/experiment/conditions';
import type { EventPayload, EventType } from '@/lib/experiment/events';
import { DEFAULT_FIXTURE_ID } from '@/lib/fixtures/documents';

const STORAGE_KEY = 'ai-door-session-v2';

/** Reader-controlled text scale. Multiplies the whole type scale. */
export const TEXT_SCALES = { normal: 1, large: 1.15, huge: 1.35 } as const;
export type TextScale = keyof typeof TEXT_SCALES;

interface PersistedState {
  sessionId: string;
  language: UiLanguage;
  condition: ConditionId;
  provider: ProviderId;
  fixtureId: string;
  textScale: TextScale;
  startedAt: number;
  backCount: number;
  analysis: DocumentAnalysis | null;
  meta: AnalysisMeta | null;
}

interface StoredImage {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

interface SessionContextValue extends PersistedState {
  t: Dictionary;
  /**
   * False until sessionStorage has been read back.
   *
   * Anything that acts on session state as soon as it mounts must wait for
   * this. A hard load straight onto /analyzing would otherwise fire its
   * request against the defaults and analyse the wrong document - which on
   * stage looks exactly like the model getting it wrong.
   */
  hydrated: boolean;
  /** True while the analysis is being re-read in the newly chosen language. */
  translating: boolean;
  conditionDefinition: ConditionDefinition;
  /** The user's photo. Memory only - never persisted, never logged. */
  image: StoredImage | null;
  elapsedMs: () => number;

  setLanguage: (language: UiLanguage) => void;
  /**
   * Switches language AND re-reads the current document in it.
   *
   * Changing only the interface leaves the document's own words behind, so
   * the screen ends up saying "この 書類は 가스요금 납부용지の ようです" -
   * half translated, which looks broken rather than bilingual. The analysis
   * is written in one language at the time it is produced, so the only honest
   * way to change it is to produce it again.
   */
  switchLanguage: (language: UiLanguage) => void;
  setCondition: (condition: ConditionId) => void;
  setProvider: (provider: ProviderId) => void;
  setFixtureId: (fixtureId: string) => void;
  setTextScale: (scale: TextScale) => void;
  setImage: (image: StoredImage | null) => void;
  setAnalysis: (analysis: DocumentAnalysis | null, meta: AnalysisMeta | null) => void;
  countBack: () => void;
  resetRun: () => void;
  logEvent: (type: EventType, payload?: EventPayload) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function newSessionId(): string {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36).slice(-6);
  return `s-${random}${time}`;
}

function initialState(): PersistedState {
  return {
    sessionId: newSessionId(),
    language: DEFAULT_LANGUAGE,
    condition: DEFAULT_CONDITION,
    provider: 'fixture',
    fixtureId: DEFAULT_FIXTURE_ID,
    textScale: 'normal',
    startedAt: Date.now(),
    backCount: 0,
    analysis: null,
    meta: null,
  };
}

function readPersisted(): PersistedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (typeof parsed.sessionId !== 'string') return null;
    const base = initialState();
    return {
      ...base,
      ...parsed,
      sessionId: parsed.sessionId,
      language: isUiLanguage(parsed.language) ? parsed.language : base.language,
      condition: isConditionId(parsed.condition) ? parsed.condition : base.condition,
    };
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [translating, setTranslating] = useState(false);
  const imageRef = useRef<StoredImage | null>(null);
  /** Mirror of state, so switchLanguage can stay a stable callback. */
  const stateRef = useRef(state);
  stateRef.current = state;
  const [imageVersion, setImageVersion] = useState(0);

  // Restore after mount: reading sessionStorage during render would produce a
  // server/client markup mismatch.
  useEffect(() => {
    const restored = readPersisted();
    if (restored) setState(restored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Private-mode quota errors must not break the flow.
    }
  }, [state, hydrated]);

  const logEvent = useCallback(
    (type: EventType, payload: EventPayload = {}) => {
      const body = {
        events: [
          {
            sessionId: state.sessionId,
            condition: state.condition,
            language: state.language,
            type,
            clientTime: new Date().toISOString(),
            payload: {
              elapsedMs: Math.max(0, Date.now() - state.startedAt),
              ...payload,
            },
          },
        ],
      };
      // Fire and forget: logging must never delay or block a screen.
      void fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(() => undefined);
    },
    [state.sessionId, state.condition, state.language, state.startedAt],
  );

  /**
   * Re-runs the analysis in a new language, in place.
   *
   * The demo documents already hold both languages, so this comes back from
   * the fixture provider without a model call. A live analysis genuinely has
   * to be produced again: machine-translating a result on the client would
   * leave the evidence quotes pointing at words the document does not use.
   */
  const switchLanguage = useCallback((language: UiLanguage) => {
    setState((prev) => ({ ...prev, language }));

    const current = stateRef.current;
    if (!current.analysis) return;

    setTranslating(true);
    const image = imageRef.current;
    void fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        provider: current.provider,
        fixtureId: image ? undefined : current.fixtureId,
        imageBase64: image?.base64,
        mimeType: image?.mimeType,
      }),
    })
      .then((response) => response.json())
      .then((outcome: AnalysisOutcome) => {
        if (!outcome.ok) return;
        setState((prev) => ({
          ...prev,
          analysis: outcome.analysis,
          meta: outcome.meta,
        }));
      })
      // A failed re-read leaves the previous analysis in place, and the
      // mismatch notice on screen then offers the manual retry.
      .catch(() => undefined)
      .finally(() => setTranslating(false));
  }, []);

  const value = useMemo<SessionContextValue>(() => {
    return {
      ...state,
      hydrated,
      translating,
      switchLanguage,
      t: getDictionary(state.language),
      conditionDefinition: getCondition(state.condition),
      image: imageRef.current,
      elapsedMs: () => Math.max(0, Date.now() - state.startedAt),

      setLanguage: (language) => setState((prev) => ({ ...prev, language })),
      setCondition: (condition) => setState((prev) => ({ ...prev, condition })),
      setProvider: (provider) => setState((prev) => ({ ...prev, provider })),
      setFixtureId: (fixtureId) => setState((prev) => ({ ...prev, fixtureId })),
      setTextScale: (textScale) => setState((prev) => ({ ...prev, textScale })),
      setImage: (next) => {
        const previous = imageRef.current;
        if (previous && previous.previewUrl !== next?.previewUrl) {
          URL.revokeObjectURL(previous.previewUrl);
        }
        imageRef.current = next;
        setImageVersion((version) => version + 1);
      },
      setAnalysis: (analysis, meta) => setState((prev) => ({ ...prev, analysis, meta })),
      countBack: () => setState((prev) => ({ ...prev, backCount: prev.backCount + 1 })),
      resetRun: () => {
        const previous = imageRef.current;
        if (previous) URL.revokeObjectURL(previous.previewUrl);
        imageRef.current = null;
        setImageVersion((version) => version + 1);
        setState((prev) => ({
          ...initialState(),
          // Keep the operator's demo setup across restarts.
          language: prev.language,
          condition: prev.condition,
          provider: prev.provider,
          fixtureId: prev.fixtureId,
          textScale: prev.textScale,
        }));
      },
      logEvent,
    };
    // imageVersion is the signal that the ref changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, imageVersion, hydrated, translating, switchLanguage, logEvent]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used inside <SessionProvider>');
  }
  return context;
}

/** Shorthand for the active dictionary. */
export function useT(): Dictionary {
  return useSession().t;
}
