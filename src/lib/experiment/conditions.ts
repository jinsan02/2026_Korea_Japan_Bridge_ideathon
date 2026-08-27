/**
 * A/B/C comparison conditions.
 *
 * Conditions are feature flags, not separate builds, so the same screens serve
 * every arm and only what the participant is offered varies.
 *
 * Mapping follows the research plan (08_..._research_plan_KO.md §4.3):
 *   A 원본만  B 쉬운 요약  C AI Door 전체
 * so that `C - B` isolates the effect of the action cards, evidence and the
 * learning loop, and `B - A` isolates plain language alone.
 *
 * C is the default: the product is condition C. A and B exist for the user
 * study and are not part of the presentation flow.
 */
export type ConditionId = 'A' | 'B' | 'C';

export interface ConditionFeatures {
  /** Show the document image. */
  rawDocument: boolean;
  /** One-sentence summary and plain-language fields. */
  easySummary: boolean;
  /** Step-by-step guided solving. */
  guidedSolving: boolean;
  /** Up to three evidence-bound action cards. */
  actionCards: boolean;
  /** Evidence Lens: quotes plus highlighted source region. */
  evidenceLens: boolean;
  /** Official-contact screen with verify-before-you-dial guidance. */
  officialContact: boolean;
  /** Read-aloud. */
  speech: boolean;
  /** The manual and the practice loop. */
  learningLoop: boolean;
}

export interface ConditionDefinition {
  id: ConditionId;
  label: string;
  description: string;
  features: ConditionFeatures;
}

const NONE: ConditionFeatures = {
  rawDocument: false,
  easySummary: false,
  guidedSolving: false,
  actionCards: false,
  evidenceLens: false,
  officialContact: false,
  speech: false,
  learningLoop: false,
};

export const CONDITIONS: Record<ConditionId, ConditionDefinition> = {
  A: {
    id: 'A',
    label: '원본 문서만',
    description: '합성 행정문서를 원래 형태 그대로 봅니다. 현재 과업의 어려움을 측정합니다.',
    features: { ...NONE, rawDocument: true },
  },
  B: {
    id: 'B',
    label: '쉬운 요약',
    description: '쉬운 말 요약과 음성만 제공합니다. 행동카드와 근거는 없습니다.',
    features: { ...NONE, rawDocument: true, easySummary: true, speech: true },
  },
  C: {
    id: 'C',
    label: 'AI Door 전체',
    description:
      '단계별 해결, 행동카드, 원문 근거, 공식기관 확인, 매뉴얼과 복습까지 제공합니다.',
    features: {
      rawDocument: true,
      easySummary: true,
      guidedSolving: true,
      actionCards: true,
      evidenceLens: true,
      officialContact: true,
      speech: true,
      learningLoop: true,
    },
  },
};

export const DEFAULT_CONDITION: ConditionId = 'C';

export const CONDITION_IDS: readonly ConditionId[] = ['A', 'B', 'C'];

export function getCondition(id: ConditionId): ConditionDefinition {
  return CONDITIONS[id] ?? CONDITIONS[DEFAULT_CONDITION];
}

export function isConditionId(value: unknown): value is ConditionId {
  return value === 'A' || value === 'B' || value === 'C';
}
