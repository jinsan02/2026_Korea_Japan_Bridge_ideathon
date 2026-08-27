'use client';

/**
 * Learning progress, stored in the browser.
 *
 * localStorage, deliberately: the thing worth remembering between visits is
 * "you have practised tax notices twice", which needs no account and no server.
 *
 * WHAT IS STORED: document type, assistance level, practice outcomes, and a
 * review reminder time.
 * WHAT IS NEVER STORED: the document image, the extracted text, names,
 * addresses, amounts or dates from the user's own document.
 */
import type { DocumentTypeId } from '@/lib/analysis/schema';
import {
  type AssistanceLevel,
  type PracticeRecord,
  NEXT_LEVEL,
  unaidedByRequest,
} from './types';

const STORAGE_KEY = 'ai-door-progress-v1';
const MAX_RECORDS = 50;

export interface ReviewReminder {
  documentType: DocumentTypeId;
  scenarioId: string;
  /** When the reminder becomes due. */
  dueAt: string;
  /** Label the user picked, e.g. "오늘 저녁". */
  label: string;
}

export interface ProgressState {
  /** Assistance level per document type. Absent means 'guided'. */
  levels: Partial<Record<DocumentTypeId, AssistanceLevel>>;
  /** Document types the user has completed at least once, newest first. */
  learnedTypes: DocumentTypeId[];
  records: PracticeRecord[];
  reminder: ReviewReminder | null;
}

const EMPTY: ProgressState = {
  levels: {},
  learnedTypes: [],
  records: [],
  reminder: null,
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function readProgress(): ProgressState {
  if (!isBrowser()) return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      levels: parsed.levels ?? {},
      learnedTypes: parsed.learnedTypes ?? [],
      records: parsed.records ?? [],
      reminder: parsed.reminder ?? null,
    };
  } catch {
    // Corrupt or blocked storage must not break the app.
    return EMPTY;
  }
}

function write(state: ProgressState): ProgressState {
  if (!isBrowser()) return state;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode / quota. The session still works, it just will not persist.
  }
  return state;
}

export function assistanceLevelFor(documentType: DocumentTypeId): AssistanceLevel {
  return readProgress().levels[documentType] ?? 'guided';
}

/** Records that a document type was solved with the app for the first time. */
export function markTypeLearned(documentType: DocumentTypeId): ProgressState {
  const state = readProgress();
  const learnedTypes = [
    documentType,
    ...state.learnedTypes.filter((type) => type !== documentType),
  ];
  const levels = { ...state.levels };
  if (!levels[documentType]) levels[documentType] = 'guided';
  return write({ ...state, learnedTypes, levels });
}

/**
 * Stores a finished practice round and, if it went well, fades assistance by
 * one step.
 *
 * The bar for fading: at least two thirds of the questions answered correctly
 * without asking for a hint. Fading after a round the user struggled through
 * would punish them for practising.
 */
export function recordPractice(record: PracticeRecord): ProgressState {
  const state = readProgress();
  const records = [record, ...state.records].slice(0, MAX_RECORDS);

  // Fading is judged on what the user asked for, not on what the level put on
  // screen before they answered - otherwise the first level can never be
  // graduated from and the whole loop stalls.
  const total = record.outcomes.length;
  const unaided = record.outcomes.filter(unaidedByRequest).length;
  const earnedFade = total > 0 && unaided / total >= 2 / 3;

  const current = state.levels[record.documentType] ?? 'guided';
  const levels = {
    ...state.levels,
    [record.documentType]: earnedFade ? NEXT_LEVEL[current] : current,
  };

  return write({ ...state, records, levels, reminder: null });
}

export function recordsFor(documentType: DocumentTypeId): PracticeRecord[] {
  return readProgress().records.filter(
    (record) => record.documentType === documentType,
  );
}

export function setReminder(reminder: ReviewReminder | null): ProgressState {
  return write({ ...readProgress(), reminder });
}

/** The reminder, if its time has arrived. Drives the home-screen review card. */
export function dueReminder(now: Date = new Date()): ReviewReminder | null {
  const { reminder } = readProgress();
  if (!reminder) return null;
  return new Date(reminder.dueAt).getTime() <= now.getTime() ? reminder : null;
}

/**
 * Demo affordance: makes a pending reminder due immediately, so a presenter can
 * show the evening-review moment without waiting for evening. The screen labels
 * this as a demo button rather than pretending time passed.
 */
export function fastForwardReminder(): ProgressState {
  const state = readProgress();
  if (!state.reminder) return state;
  return write({
    ...state,
    reminder: { ...state.reminder, dueAt: new Date().toISOString() },
  });
}

export function clearProgress(): ProgressState {
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to do.
    }
  }
  return EMPTY;
}
