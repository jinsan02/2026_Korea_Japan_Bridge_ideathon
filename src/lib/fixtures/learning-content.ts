/**
 * Language-aware lookup for manuals and practice sheets.
 *
 * A separate module because the Japanese content is built from the Korean
 * originals: putting these getters in `tutorials.ts` / `practice.ts` would
 * make those files import the translations that import them back.
 *
 * Falls back to Korean when no translation exists. The hidden document
 * families are Korean-only, and a manual in the wrong language is still more
 * use than a blank screen - but for the two documents the demo actually
 * shows, both languages are present.
 */
import type { DocumentTypeId } from '@/lib/analysis/schema';
import type { DocumentTutorial, PracticeScenario } from '@/lib/learning/types';
import type { UiLanguage } from '@/lib/i18n';

import { DOCUMENT_TUTORIALS } from './tutorials';
import { PRACTICE_SCENARIOS } from './practice';
import {
  taxPracticeJa,
  taxTutorialJa,
  utilityTutorialJa,
  waterPracticeJa,
} from './learning-ja';

const TUTORIALS_JA: readonly DocumentTutorial[] = [taxTutorialJa, utilityTutorialJa];
const PRACTICE_JA: readonly PracticeScenario[] = [taxPracticeJa, waterPracticeJa];

export function tutorialFor(
  documentType: DocumentTypeId,
  language: UiLanguage,
): DocumentTutorial | undefined {
  if (language === 'ja') {
    const translated = TUTORIALS_JA.find(
      (tutorial) => tutorial.documentType === documentType,
    );
    if (translated) return translated;
  }
  return DOCUMENT_TUTORIALS.find(
    (tutorial) => tutorial.documentType === documentType,
  );
}

export function practiceById(
  id: string,
  language: UiLanguage,
): PracticeScenario | undefined {
  if (language === 'ja') {
    const translated = PRACTICE_JA.find((scenario) => scenario.id === id);
    if (translated) return translated;
  }
  return PRACTICE_SCENARIOS.find((scenario) => scenario.id === id);
}

export function practiceFor(
  documentType: string,
  language: UiLanguage,
): PracticeScenario | undefined {
  const base = PRACTICE_SCENARIOS.find(
    (scenario) => scenario.documentType === documentType,
  );
  return base ? practiceById(base.id, language) : undefined;
}

/** Every manual the picker can reach, in the reader's language. */
export function tutorialsFor(language: UiLanguage): readonly DocumentTutorial[] {
  return DOCUMENT_TUTORIALS.map(
    (tutorial) => tutorialFor(tutorial.documentType, language) ?? tutorial,
  );
}
