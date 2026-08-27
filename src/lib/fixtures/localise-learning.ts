/**
 * Builds the other-language version of a manual or a practice sheet.
 *
 * Same discipline as `localise` for analyses: only the words a person reads
 * are supplied, everything structural is copied. For practice that matters
 * more than anywhere else - which option is `correct` and which page block a
 * hint highlights are facts about the exercise, not about the language, and a
 * hand-written second copy is exactly where they would drift apart.
 *
 * Every list is length-checked and every question is matched by id, so a step
 * added on one side and forgotten on the other fails at module load - i.e. at
 * build time, not in front of a Japanese reader.
 */
import type {
  DocumentTutorial,
  PracticeScenario,
  TutorialStep,
} from '@/lib/learning/types';

interface StepText {
  title: string;
  instruction: string;
  reason: string;
  /** The label as printed on that country's form. Often left as-is. */
  exampleLabel?: string;
}

interface TermText {
  term: string;
  easyExplanation: string;
  translatedTerm?: string;
}

export interface TutorialText {
  language: 'ko' | 'ja';
  title: string;
  purpose: string;
  checkOrder: StepText[];
  keyTerms: TermText[];
  commonWarnings: string[];
  officialVerificationGuide: string[];
}

function expectSameLength(a: readonly unknown[], b: readonly unknown[], what: string) {
  if (a.length !== b.length) {
    throw new Error(
      `localise-learning: ${what} has ${a.length} items but ${b.length} translations`,
    );
  }
}

export function localiseTutorial(
  base: DocumentTutorial,
  text: TutorialText,
): DocumentTutorial {
  expectSameLength(base.checkOrder, text.checkOrder, 'checkOrder');
  expectSameLength(base.keyTerms, text.keyTerms, 'keyTerms');
  expectSameLength(base.commonWarnings, text.commonWarnings, 'commonWarnings');
  expectSameLength(
    base.officialVerificationGuide,
    text.officialVerificationGuide,
    'officialVerificationGuide',
  );

  return {
    ...base,
    language: text.language,
    title: text.title,
    purpose: text.purpose,
    checkOrder: base.checkOrder.map((step, index): TutorialStep => {
      const localised = text.checkOrder[index]!;
      return {
        ...step,
        title: localised.title,
        instruction: localised.instruction,
        reason: localised.reason,
        exampleLabel: localised.exampleLabel ?? step.exampleLabel,
      };
    }),
    keyTerms: base.keyTerms.map((term, index) => {
      const localised = text.keyTerms[index]!;
      return {
        ...term,
        term: localised.term,
        easyExplanation: localised.easyExplanation,
        translatedTerm: localised.translatedTerm ?? term.translatedTerm,
      };
    }),
    commonWarnings: text.commonWarnings,
    officialVerificationGuide: text.officialVerificationGuide,
  };
}

interface QuestionText {
  prompt: string;
  /** In the same order as the original options; `correct` is not restated. */
  options: { text: string; feedback: string }[];
  hints: { location: string; keyword: string; answer: string };
  explanation: string;
}

export interface PracticeText {
  language: 'ko' | 'ja';
  title: string;
  topic: string;
  /** Keyed by question id, so a reordering cannot silently mismatch. */
  questions: Record<string, QuestionText>;
}

export function localisePractice(
  base: PracticeScenario,
  text: PracticeText,
): PracticeScenario {
  const ids = new Set(base.questions.map((question) => question.id));
  for (const key of Object.keys(text.questions)) {
    if (!ids.has(key)) {
      throw new Error(`localise-learning: text for unknown question "${key}"`);
    }
  }

  return {
    ...base,
    language: text.language,
    title: text.title,
    topic: text.topic,
    questions: base.questions.map((question) => {
      const localised = text.questions[question.id];
      if (!localised) {
        throw new Error(`localise-learning: missing text for "${question.id}"`);
      }
      expectSameLength(
        question.options,
        localised.options,
        `${question.id} options`,
      );
      return {
        ...question,
        prompt: localised.prompt,
        explanation: localised.explanation,
        options: question.options.map((option, index) => ({
          ...option,
          // `correct` is deliberately not translatable.
          text: localised.options[index]!.text,
          feedback: localised.options[index]!.feedback,
        })),
        hints: {
          ...question.hints,
          location: localised.hints.location,
          keyword: localised.hints.keyword,
          answer: localised.hints.answer,
        },
      };
    }),
  };
}
