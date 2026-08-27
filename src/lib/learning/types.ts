/**
 * The learning loop.
 *
 * This is the product, not a feature bolted onto a summariser. The chain is:
 *
 *   real document -> solve it together -> generalise into a manual
 *   -> practise on a synthetic look-alike -> fixed 3-step hints
 *   -> solve alone -> AI only checks at the end
 *
 * Two deliberate constraints, both from the prior-art review:
 *   - Hints are FIXED three steps, not model-personalised. Simpler, explainable,
 *     and it stays clear of adaptive-hint prior art.
 *   - Nothing here scores the user. No cognitive rating, no grade, no profile.
 */
import type { DocumentTypeId } from '@/lib/analysis/schema';

// ---------------------------------------------------------------------------
// Assistance fading
// ---------------------------------------------------------------------------

/**
 * How much the app gives away, per document type. It only ever moves one step
 * at a time, and only after a practice round the user actually completed.
 */
export const ASSISTANCE_LEVELS = ['guided', 'hinted', 'solo', 'final_check'] as const;
export type AssistanceLevel = (typeof ASSISTANCE_LEVELS)[number];

export const NEXT_LEVEL: Record<AssistanceLevel, AssistanceLevel> = {
  guided: 'hinted',
  hinted: 'solo',
  solo: 'final_check',
  final_check: 'final_check',
};

// ---------------------------------------------------------------------------
// Step 1 - solving together
// ---------------------------------------------------------------------------

export const GUIDED_STEP_KINDS = [
  'document_type',
  'important_date',
  'amount_or_items',
  'actions',
  'official_contact',
  'completion',
] as const;
export type GuidedStepKind = (typeof GUIDED_STEP_KINDS)[number];

export interface GuidedStep {
  kind: GuidedStepKind;
  /** Short heading, e.g. "먼저 납부기한을 확인해 볼게요". */
  title: string;
  /** One or two plain sentences. Never the whole answer at once. */
  body: string;
  /** Where to look on the page, in words. */
  whereToLook: string | null;
  /** Evidence backing this step, so "원문에서 보여주세요" works. */
  evidenceIds: string[];
  /** The value being confirmed, when there is one. */
  value: string | null;
}

// ---------------------------------------------------------------------------
// Step 2 - the generalised manual
// ---------------------------------------------------------------------------

export interface TutorialStep {
  order: number;
  title: string;
  /** What to do. Imperative, one action. */
  instruction: string;
  /** Why it matters. This is what makes it transfer to the next document. */
  reason: string;
  /** A generic example label as printed on this kind of document. */
  exampleLabel?: string;
}

export interface KeyTerm {
  term: string;
  easyExplanation: string;
  /** The equivalent term in the other country's documents. */
  translatedTerm?: string;
}

/**
 * A document-type manual.
 *
 * Contains NO personal data and no values from the user's own document - it is
 * a method for handling this kind of paper, not a record of one.
 */
export interface DocumentTutorial {
  documentType: DocumentTypeId;
  country: 'KR' | 'JP';
  language: 'ko' | 'ja';
  title: string;
  purpose: string;
  checkOrder: TutorialStep[];
  keyTerms: KeyTerm[];
  commonWarnings: string[];
  officialVerificationGuide: string[];
  practiceScenarioIds: string[];
}

// ---------------------------------------------------------------------------
// Steps 3-4 - practice with fixed hints
// ---------------------------------------------------------------------------

export interface PracticeOption {
  text: string;
  correct: boolean;
  /** Shown after a wrong pick - teaches rather than just marking it wrong. */
  feedback: string;
}

/**
 * The fixed hint ladder. Exactly three, always in this order:
 *   1 where to look, 2 which word to look for, 3 the evidence and the answer.
 */
export interface PracticeHints {
  /** "문서의 위쪽과 오른쪽을 살펴보세요." */
  location: string;
  /** "'납부기한' 또는 '납기'라고 적힌 부분을 찾아보세요." */
  keyword: string;
  /** "여기에 '납부기한: 9월 30일'이라고 적혀 있어요." */
  answer: string;
  /** Block to highlight from hint 2 onwards. */
  highlightBlockId?: string;
}

export interface PracticeQuestion {
  id: string;
  /** What the user is asked to find. */
  prompt: string;
  /** Which part of the tutorial this exercises. */
  kind: GuidedStepKind;
  options: PracticeOption[];
  hints: PracticeHints;
  /** Shown once answered or revealed. */
  explanation: string;
}

export interface PracticeScenario {
  id: string;
  documentType: DocumentTypeId;
  country: 'KR' | 'JP';
  language: 'ko' | 'ja';
  title: string;
  /** Used in "오늘은 ○○을 확인했습니다". */
  topic: string;
  /** The synthetic look-alike. Different dates and amounts from the real one. */
  pageId: string;
  questions: PracticeQuestion[];
}

// ---------------------------------------------------------------------------
// Records
// ---------------------------------------------------------------------------

export interface QuestionOutcome {
  questionId: string;
  correct: boolean;
  /** True when answered correctly with no help shown at all. */
  independent: boolean;
  /** Total hints on screen, including any the level revealed up front. */
  hintsUsed: number;
  /**
   * Hints the user actually asked for.
   *
   * Separate from `hintsUsed` because at the `guided` level hint 1 is on screen
   * before the question is answered. Counting that against the user would make
   * the first level impossible to graduate from, so fading is decided by what
   * they *requested* while honesty about what was shown stays in `hintsUsed`.
   */
  hintsRequested: number;
}

/** Correct without asking for help - the criterion for fading assistance. */
export function unaidedByRequest(outcome: QuestionOutcome): boolean {
  return outcome.correct && outcome.hintsRequested === 0;
}

export interface PracticeRecord {
  id: string;
  scenarioId: string;
  documentType: DocumentTypeId;
  assistanceLevel: AssistanceLevel;
  completedAt: string;
  outcomes: QuestionOutcome[];
  durationMs: number;
}

/** What the user sees on 지난 연습 보기, and what the deck's KPI is built from. */
export interface PracticeSummary {
  total: number;
  correct: number;
  /** Correct with no hints. The numerator of Independent Completion Rate. */
  independent: number;
  hintsUsed: number;
}

export function summarise(record: PracticeRecord): PracticeSummary {
  return {
    total: record.outcomes.length,
    correct: record.outcomes.filter((outcome) => outcome.correct).length,
    independent: record.outcomes.filter((outcome) => outcome.independent).length,
    hintsUsed: record.outcomes.reduce((sum, outcome) => sum + outcome.hintsUsed, 0),
  };
}

/**
 * Independent Completion Rate: of the steps attempted, how many were completed
 * correctly WITHOUT the app giving the answer away.
 *
 * Reported as a design target, never as proven effect - a synthetic-practice
 * number is not evidence that real dependence fell.
 */
export function independentCompletionRate(records: PracticeRecord[]): number | null {
  const outcomes = records.flatMap((record) => record.outcomes);
  if (outcomes.length === 0) return null;
  return outcomes.filter((outcome) => outcome.independent).length / outcomes.length;
}

/** Hint Reduction: hints in the first round minus hints in the most recent. */
export function hintReduction(records: PracticeRecord[]): number | null {
  if (records.length < 2) return null;
  const ordered = [...records].sort((a, b) =>
    a.completedAt.localeCompare(b.completedAt),
  );
  const first = summarise(ordered[0]).hintsUsed;
  const latest = summarise(ordered[ordered.length - 1]).hintsUsed;
  return first - latest;
}
