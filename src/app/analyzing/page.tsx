'use client';

/**
 * Analysing.
 *
 * Progress is narrated in plain words, not OCR/LLM jargon, in a live region so
 * a screen reader follows along. Two escape hatches, because a stage demo has
 * no patience: cancel while it runs, and - if it fails - the explicit choice
 * between retrying and continuing with an example document.
 *
 * The fixture substitution is offered, never applied silently: an example
 * document is not an analysis of the user's mail.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/AppShell';
import type { AnalysisOutcome } from '@/lib/analysis/schema';
import { useSession } from '@/lib/session/SessionProvider';

type Phase = 'upload' | 'classify' | 'dates' | 'actions';
const PHASES: Phase[] = ['upload', 'classify', 'dates', 'actions'];

/** After this long the screen offers a way out rather than spinning forever. */
const PATIENCE_MS = 12_000;

export default function AnalyzingScreen() {
  const router = useRouter();
  const {
    t,
    hydrated,
    language,
    provider,
    fixtureId,
    image,
    setAnalysis,
    logEvent,
  } = useSession();

  const [phase, setPhase] = useState<Phase>('upload');
  const [failure, setFailure] = useState<string | null>(null);
  const [slow, setSlow] = useState(false);
  const started = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const post = useCallback(
    async (acceptFixtureFallback: boolean) => {
      const controller = new AbortController();
      abortRef.current = controller;

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          language,
          provider,
                acceptFixtureFallback,
          fixtureId: image ? undefined : fixtureId,
          imageBase64: image?.base64,
          mimeType: image?.mimeType,
        }),
      });
      return (await response.json()) as AnalysisOutcome;
    },
    [language, provider, fixtureId, image],
  );

  const run = useCallback(
    async (acceptFixtureFallback = false) => {
      setFailure(null);
      setSlow(false);
      setPhase('upload');
      logEvent('analysis_started', { screen: 'analyzing', provider });

      const timers = [
        setTimeout(() => setPhase('classify'), 600),
        setTimeout(() => setPhase('dates'), 1_300),
        setTimeout(() => setPhase('actions'), 2_000),
        setTimeout(() => setSlow(true), PATIENCE_MS),
      ];

      try {
        const outcome = await post(acceptFixtureFallback);

        if (!outcome.ok) {
          logEvent('analysis_failed', {
            screen: 'analyzing',
            errorCode: outcome.error.code,
            provider: outcome.meta.provider,
            attemptCount: outcome.meta.attempts.length,
          });
          setFailure(outcome.error.code);
          return;
        }

        setAnalysis(outcome.analysis, outcome.meta);

        if (outcome.meta.fellBack) {
          logEvent('analysis_fell_back', {
            screen: 'analyzing',
            errorCode: outcome.meta.fallbackReason ?? 'unknown',
            provider: outcome.meta.provider,
          });
        }
        logEvent('analysis_succeeded', {
          screen: 'analyzing',
          provider: outcome.meta.provider,
          model: outcome.meta.model ?? undefined,
          fixtureId: outcome.meta.fixtureId ?? undefined,
          durationMs: outcome.meta.totalElapsedMs,
          attemptCount: outcome.meta.attempts.length,
          documentType: outcome.analysis.documentType,
        });

        router.push('/confirm');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          logEvent('analysis_cancelled', { screen: 'analyzing' });
          router.push('/capture');
          return;
        }
        logEvent('analysis_failed', { screen: 'analyzing', errorCode: 'unknown' });
        setFailure('unknown');
      } finally {
        for (const timer of timers) clearTimeout(timer);
        abortRef.current = null;
      }
    },
    [post, logEvent, provider, setAnalysis, router],
  );

  useEffect(() => {
    // Wait for sessionStorage: firing now would analyse the default document
    // rather than the one the user picked, which on stage reads as the model
    // getting it wrong.
    if (!hydrated || started.current) return;
    started.current = true;
    void run();
  }, [hydrated, run]);

  const cancel = () => abortRef.current?.abort();

  if (failure) {
    return (
      <AppShell screen="analyzing" backHref="/capture" showBadges={false}>
        <div className="stack stack--loose">
          <div className="notice notice--caution" role="alert">
            <span className="notice__icon" aria-hidden="true">
              ⚠️
            </span>
            <span>
              <strong>{t.analyzing.failedTitle}</strong>
              <br />
              {t.analyzing.failedBody}
            </span>
          </div>
          <button type="button" className="btn btn--primary" onClick={() => void run()}>
            <span aria-hidden="true">↻</span>
            {t.analyzing.failedRetry}
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => void run(true)}
          >
            <span aria-hidden="true">🧪</span>
            {t.analyzing.failedUseFixture}
          </button>
          <button
            type="button"
            className="btn btn--quiet"
            onClick={() => router.push('/')}
          >
            {t.analyzing.failedGoBack}
          </button>
        </div>
      </AppShell>
    );
  }

  const activeIndex = PHASES.indexOf(phase);

  return (
    <AppShell screen="analyzing" showBadges={false} step={{ current: 3, total: 3 }}>
      <div className="stack stack--loose">
        <div className="stack stack--tight">
          <h1 className="screen-title">{t.analyzing.title}</h1>
          <p className="screen-subtitle">{t.analyzing.subtitle}</p>
        </div>

        <ul className="steps" aria-live="polite">
          {PHASES.map((name, index) => {
            const state =
              index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'todo';
            return (
              <li key={name} data-state={state}>
                <span className="step-mark" aria-hidden="true">
                  {state === 'done' ? '✅' : state === 'active' ? '⏳' : '·'}
                </span>
                <span>{t.analyzing.steps[name]}</span>
                {state === 'active' ? (
                  <span className="spinner" aria-hidden="true" />
                ) : null}
                {state === 'done' ? (
                  <span className="visually-hidden">{t.analyzing.done}</span>
                ) : null}
              </li>
            );
          })}
        </ul>

        {slow ? (
          <div className="stack stack--tight">
            <p className="notice notice--info" role="status">
              <span className="notice__icon" aria-hidden="true">
                ⏱️
              </span>
              <span>{t.analyzing.takingLong}</span>
            </p>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => void run(true)}
            >
              {t.analyzing.seeExample}
            </button>
          </div>
        ) : null}

        <button type="button" className="btn btn--quiet" onClick={cancel}>
          {t.analyzing.cancel}
        </button>
      </div>
    </AppShell>
  );
}
