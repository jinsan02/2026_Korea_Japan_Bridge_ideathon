/**
 * The learning loop is the product, so its rules get tests:
 * hints are exactly three and always in order, assistance only fades after a
 * round the user actually carried, and "independent" means no help at all.
 */
import { describe, expect, it } from 'vitest';

import { PRACTICE_SCENARIOS, PRACTICE_PAGES } from '@/lib/fixtures/practice';
import { DOCUMENT_TUTORIALS, getTutorial } from '@/lib/fixtures/tutorials';
import { DOCUMENT_FIXTURES } from '@/lib/fixtures/documents';
import { findBlock } from '@/lib/fixtures/document-page';
import {
  hintReduction,
  independentCompletionRate,
  summarise,
  unaidedByRequest,
  NEXT_LEVEL,
  type PracticeRecord,
} from '@/lib/learning/types';

describe('practice scenarios', () => {
  it('every scenario points at a page that exists', () => {
    for (const scenario of PRACTICE_SCENARIOS) {
      expect(PRACTICE_PAGES[scenario.pageId]).toBeDefined();
    }
  });

  it('every question has exactly one correct option', () => {
    for (const scenario of PRACTICE_SCENARIOS) {
      for (const question of scenario.questions) {
        const correct = question.options.filter((option) => option.correct);
        expect(correct).toHaveLength(1);
      }
    }
  });

  it('every wrong option teaches instead of just being wrong', () => {
    for (const scenario of PRACTICE_SCENARIOS) {
      for (const question of scenario.questions) {
        for (const option of question.options) {
          expect(option.feedback.length).toBeGreaterThan(5);
        }
      }
    }
  });

  it('every question has all three fixed hints', () => {
    for (const scenario of PRACTICE_SCENARIOS) {
      for (const question of scenario.questions) {
        expect(question.hints.location.length).toBeGreaterThan(0);
        expect(question.hints.keyword.length).toBeGreaterThan(0);
        expect(question.hints.answer.length).toBeGreaterThan(0);
      }
    }
  });

  it('hint highlights point at a block that exists on the page', () => {
    for (const scenario of PRACTICE_SCENARIOS) {
      const page = PRACTICE_PAGES[scenario.pageId];
      for (const question of scenario.questions) {
        const blockId = question.hints.highlightBlockId;
        if (!blockId) continue;
        expect(() => findBlock(page, blockId)).not.toThrow();
      }
    }
  });

  it('practice documents use different values from the real fixtures', () => {
    // A practice sheet that repeats the solved document would train recall of
    // one answer rather than the method.
    const taxFixture = DOCUMENT_FIXTURES.find((f) => f.documentType === 'tax_notice');
    const taxPractice = PRACTICE_SCENARIOS.find((s) => s.documentType === 'tax_notice');
    expect(taxFixture && taxPractice).toBeTruthy();

    const fixtureText = taxFixture!.page.blocks.map((b) => b.text).join(' ');
    const practiceText = PRACTICE_PAGES[taxPractice!.pageId].blocks
      .map((b) => b.text)
      .join(' ');

    expect(fixtureText).toContain('86,400원');
    expect(practiceText).not.toContain('86,400원');
    expect(fixtureText).toContain('2026.09.30');
    expect(practiceText).not.toContain('2026.09.30');
  });

  it('the Japanese practice slip differs from the gas slip it reviews', () => {
    const gas = DOCUMENT_FIXTURES.find((f) => f.id === 'jp-gas-bill')!;
    const water = PRACTICE_SCENARIOS.find((s) => s.documentType === 'utility_bill')!;
    const gasText = gas.page.blocks.map((b) => b.text).join(' ');
    const waterText = PRACTICE_PAGES[water.pageId].blocks.map((b) => b.text).join(' ');

    expect(gasText).toContain('8,181円');
    expect(waterText).not.toContain('8,181円');
    expect(gasText).toContain('2026年4月30日');
    expect(waterText).not.toContain('2026年4月30日');
  });

  it('practice documents carry no un-masked personal-data placeholder', () => {
    for (const page of Object.values(PRACTICE_PAGES)) {
      const text = page.blocks.map((block) => block.text).join(' ');
      // The addressee and staff fields must be starred out.
      expect(text).toContain('●●●');
    }
  });
});

describe('tutorials', () => {
  it('each tutorial has an ordered check list with reasons', () => {
    for (const tutorial of DOCUMENT_TUTORIALS) {
      expect(tutorial.checkOrder.length).toBeGreaterThanOrEqual(4);
      tutorial.checkOrder.forEach((step, index) => {
        expect(step.order).toBe(index + 1);
        expect(step.reason.length).toBeGreaterThan(5);
      });
    }
  });

  it('each tutorial points at a practice scenario that exists', () => {
    for (const tutorial of DOCUMENT_TUTORIALS) {
      for (const id of tutorial.practiceScenarioIds) {
        expect(PRACTICE_SCENARIOS.some((scenario) => scenario.id === id)).toBe(true);
      }
    }
  });

  it('every solved document family has a tutorial', () => {
    for (const fixture of DOCUMENT_FIXTURES) {
      expect(getTutorial(fixture.documentType)).toBeDefined();
    }
  });

  it('tutorials contain no values from a specific document', () => {
    // A manual is a method, not a record. These are the figures from the demo
    // documents; none of them may appear in a manual.
    const forbidden = ['86,400', '52,300', '12,400', '2026년 9월 30일'];
    for (const tutorial of DOCUMENT_TUTORIALS) {
      const text = JSON.stringify(tutorial);
      for (const value of forbidden) {
        expect(text).not.toContain(value);
      }
    }
  });
});

function record(
  outcomes: {
    correct: boolean;
    independent: boolean;
    hintsUsed: number;
    hintsRequested?: number;
  }[],
  completedAt = '2026-08-27T10:00:00.000Z',
): PracticeRecord {
  return {
    id: `r-${completedAt}`,
    scenarioId: 'practice-kr-tax-auto',
    documentType: 'tax_notice',
    assistanceLevel: 'hinted',
    completedAt,
    durationMs: 60_000,
    outcomes: outcomes.map((outcome, index) => ({
      questionId: `q${index}`,
      hintsRequested: outcome.hintsRequested ?? outcome.hintsUsed,
      ...outcome,
    })),
  };
}

describe('learning metrics', () => {
  it('summarises a round', () => {
    const stats = summarise(
      record([
        { correct: true, independent: true, hintsUsed: 0 },
        { correct: true, independent: false, hintsUsed: 2 },
        { correct: false, independent: false, hintsUsed: 3 },
      ]),
    );

    expect(stats).toEqual({ total: 3, correct: 2, independent: 1, hintsUsed: 5 });
  });

  it('independent completion rate counts only unaided correct answers', () => {
    const rate = independentCompletionRate([
      record([
        { correct: true, independent: true, hintsUsed: 0 },
        { correct: true, independent: false, hintsUsed: 1 },
      ]),
    ]);
    expect(rate).toBe(0.5);
  });

  it('has no rate to report before any practice', () => {
    expect(independentCompletionRate([])).toBeNull();
  });

  it('hint reduction compares the first round with the latest', () => {
    const first = record(
      [{ correct: true, independent: false, hintsUsed: 3 }],
      '2026-08-20T10:00:00.000Z',
    );
    const latest = record(
      [{ correct: true, independent: true, hintsUsed: 0 }],
      '2026-08-27T10:00:00.000Z',
    );

    expect(hintReduction([latest, first])).toBe(3);
  });

  it('needs two rounds before it can compare', () => {
    expect(hintReduction([record([{ correct: true, independent: true, hintsUsed: 0 }])])).toBeNull();
  });

  it('counts a correct answer as unaided when no hint was requested', () => {
    // At the `guided` level hint 1 is on screen before the user answers. It is
    // still reported in hintsUsed, but it must not block graduating from the
    // first level - otherwise assistance can never fade and the loop stalls.
    expect(
      unaidedByRequest({
        questionId: 'q',
        correct: true,
        independent: false,
        hintsUsed: 1,
        hintsRequested: 0,
      }),
    ).toBe(true);

    expect(
      unaidedByRequest({
        questionId: 'q',
        correct: true,
        independent: false,
        hintsUsed: 2,
        hintsRequested: 1,
      }),
    ).toBe(false);

    expect(
      unaidedByRequest({
        questionId: 'q',
        correct: false,
        independent: false,
        hintsUsed: 0,
        hintsRequested: 0,
      }),
    ).toBe(false);
  });

  it('fades assistance one step at a time and stops at final_check', () => {
    expect(NEXT_LEVEL.guided).toBe('hinted');
    expect(NEXT_LEVEL.hinted).toBe('solo');
    expect(NEXT_LEVEL.solo).toBe('final_check');
    expect(NEXT_LEVEL.final_check).toBe('final_check');
  });
});

describe('synthetic page layout', () => {
  /**
   * SVG <text> does not wrap, so a line that is too long runs off the paper
   * and is simply lost - and it is lost silently, because the block's declared
   * width still says it fits. This estimates the rendered width instead:
   * full-width for CJK and Hangul, roughly 0.6em for Latin and digits.
   */
  const SIZE: Record<string, number> = {
    org: 30,
    title: 36,
    subtitle: 20,
    sectionLabel: 22,
    fieldLabel: 22,
    fieldValue: 24,
    fieldValueStrong: 28,
    body: 21,
    fine: 17,
    amountHuge: 58,
    onFill: 24,
  };

  const estimateWidth = (text: string, fontSize: number): number => {
    let ems = 0;
    for (const char of text) {
      const code = char.codePointAt(0)!;
      const wide =
        (code >= 0x1100 && code <= 0x11ff) ||
        (code >= 0x3000 && code <= 0x30ff) ||
        (code >= 0x4e00 && code <= 0x9fff) ||
        (code >= 0xac00 && code <= 0xd7a3) ||
        (code >= 0xff00 && code <= 0xff60);
      ems += wide ? 1 : char === ' ' ? 0.3 : 0.6;
    }
    return ems * fontSize;
  };

  const pages = [
    ...DOCUMENT_FIXTURES.map((f) => [f.id, f.page] as const),
    ...Object.entries(PRACTICE_PAGES),
  ];

  it('no line runs off the right edge of its page', () => {
    for (const [id, page] of pages) {
      for (const block of page.blocks) {
        const width = estimateWidth(block.text, SIZE[block.style] ?? 21);
        expect(
          { page: id, block: block.id, right: Math.round(block.x + width) },
          `${id}/${block.id} overflows`,
        ).toEqual({
          page: id,
          block: block.id,
          right: Math.min(Math.round(block.x + width), page.width),
        });
      }
    }
  });

  it('no line runs off the bottom of its page', () => {
    for (const [id, page] of pages) {
      for (const block of page.blocks) {
        expect(block.y + block.height, `${id}/${block.id} below the page`).toBeLessThanOrEqual(
          page.height,
        );
      }
    }
  });
});
