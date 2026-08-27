/**
 * Practice scenarios - the synthetic look-alikes used for review.
 *
 * The user's own document is never stored and never re-shown here. Practice
 * uses a NEW synthetic document of the same family: same layout and same field
 * labels, different dates and amounts. That is what makes it transfer practice
 * rather than memorising one answer.
 *
 * Personal-data-shaped fields are printed as ●●● so the masking is visible on
 * screen, and each page carries a "연습용" note.
 *
 * Hints are a fixed three steps - location, keyword, answer - in that order for
 * every question. No adaptive model decides when to help.
 */
import {
  type SyntheticDocumentPage,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  fieldRow,
} from './document-page';
import type { PracticeScenario } from '@/lib/learning/types';

// ---------------------------------------------------------------------------
// A. 한국 자동차세 안내문 (지방세 유형의 연습본)
// ---------------------------------------------------------------------------

const taxPracticePage: SyntheticDocumentPage = {
  width: PAGE_WIDTH,
  height: PAGE_HEIGHT,
  rules: [150, 290, 620],
  blocks: [
    { id: 'org', text: '○○시 ○○구청', x: 72, y: 56, width: 420, height: 44, style: 'org' },
    { id: 'org-dept', text: '세무과', x: 72, y: 104, width: 300, height: 32, style: 'fine' },
    {
      id: 'title',
      text: '자동차세 납부 안내',
      x: 72,
      y: 180,
      width: 656,
      height: 52,
      style: 'title',
    },
    {
      id: 'addressee',
      text: '●●● 귀하',
      x: 72,
      y: 238,
      width: 656,
      height: 34,
      style: 'subtitle',
    },
    ...fieldRow({ idPrefix: 'staff', label: '담당자', value: '●●●', y: 310 }),
    ...fieldRow({ idPrefix: 'taxitem', label: '세목', value: '자동차세', y: 366 }),
    ...fieldRow({ idPrefix: 'amount', label: '납부 세액', value: '52,300원', y: 422, strong: true }),
    ...fieldRow({
      idPrefix: 'deadline',
      label: '납부 기한',
      value: '2026년 12월 16일',
      y: 478,
      strong: true,
    }),
    ...fieldRow({ idPrefix: 'paynum', label: '전자납부번호', value: '●●●', y: 534 }),
    {
      id: 'late-body',
      text: '납부기한이 지나면 가산금이 더해질 수 있습니다.',
      x: 72,
      y: 650,
      width: 656,
      height: 40,
      style: 'body',
    },
    {
      id: 'method-body',
      text: '납부 방법: 은행 창구 또는 공식 납부 사이트',
      x: 72,
      y: 694,
      width: 656,
      height: 40,
      style: 'body',
    },
    {
      id: 'contact-phone',
      text: '문의: ○○구청 세무과 ●●●',
      x: 72,
      y: 738,
      width: 656,
      height: 40,
      style: 'body',
    },
    {
      id: 'synthetic-note',
      text: '연습용 합성문서입니다. 개인정보는 ●●●로 가렸습니다.',
      x: 72,
      y: 1052,
      width: 656,
      height: 34,
      style: 'fine',
    },
  ],
};

const taxPractice: PracticeScenario = {
  id: 'practice-kr-tax-auto',
  documentType: 'tax_notice',
  country: 'KR',
  language: 'ko',
  title: '자동차세 안내문으로 연습하기',
  topic: '지방세 안내문에서 납부기한과 납부 방법',
  pageId: 'practice-kr-tax-auto',
  questions: [
    {
      id: 'q-deadline',
      prompt: '이 문서의 납부기한은 언제인가요?',
      kind: 'important_date',
      options: [
        {
          text: '2026년 12월 16일',
          correct: true,
          feedback: '맞습니다. "납부 기한" 줄에 적혀 있습니다.',
        },
        {
          text: '2026년 9월 30일',
          correct: false,
          feedback: '그 날짜는 이 문서에 없습니다. 표를 다시 보세요.',
        },
        {
          text: '문서에 적혀 있지 않습니다',
          correct: false,
          feedback: '표 안에 기한이 적혀 있습니다. 다시 찾아보세요.',
        },
      ],
      hints: {
        location: '문서 가운데 표의 아래쪽을 살펴보세요.',
        keyword: '"납부 기한"이라고 적힌 줄을 찾아보세요.',
        answer:
          '여기에 "납부 기한: 2026년 12월 16일"이라고 적혀 있습니다. 따라서 정답은 12월 16일입니다.',
        highlightBlockId: 'deadline-value',
      },
      explanation:
        '기한은 문서에 적힌 그대로 읽으면 됩니다. 기억이나 짐작에 의존하지 마세요.',
    },
    {
      id: 'q-amount',
      prompt: '얼마를 내야 하나요?',
      kind: 'amount_or_items',
      options: [
        {
          text: '52,300원',
          correct: true,
          feedback: '맞습니다. "납부 세액" 줄의 금액입니다.',
        },
        {
          text: '86,400원',
          correct: false,
          feedback: '그 금액은 지난번 문서의 금액입니다. 이 문서를 다시 보세요.',
        },
        {
          text: '가산금을 더해서 계산해야 합니다',
          correct: false,
          feedback: '가산금은 기한이 지난 뒤의 이야기입니다. 지금 낼 금액은 표에 있습니다.',
        },
      ],
      hints: {
        location: '표에서 기한 바로 위쪽 줄을 보세요.',
        keyword: '"납부 세액"이라고 적힌 줄을 찾아보세요.',
        answer: '여기에 "납부 세액: 52,300원"이라고 적혀 있습니다.',
        highlightBlockId: 'amount-value',
      },
      explanation:
        '금액과 기한은 항상 같은 표 안에 나란히 있습니다. 두 개를 함께 확인하세요.',
    },
    {
      id: 'q-safe-payment',
      prompt: '문자로 "이 링크로 지금 납부하세요"라는 메시지를 받았습니다. 어떻게 할까요?',
      kind: 'actions',
      options: [
        {
          text: '문서에 적힌 구청 번호로 먼저 확인한다',
          correct: true,
          feedback: '맞습니다. 공식 경로로 먼저 확인하는 것이 안전합니다.',
        },
        {
          text: '링크를 눌러 바로 납부한다',
          correct: false,
          feedback: '문자 링크는 사기일 수 있습니다. 링크로 바로 납부하지 마세요.',
        },
        {
          text: '가족에게 링크를 대신 눌러 달라고 한다',
          correct: false,
          feedback: '다른 사람이 눌러도 위험은 같습니다. 먼저 기관에 확인해야 합니다.',
        },
      ],
      hints: {
        location: '문서 아래쪽에 무엇이 적혀 있는지 보세요.',
        keyword: '"문의"라고 적힌 줄과 "납부 방법" 줄을 찾아보세요.',
        answer:
          '문서에는 "납부 방법: 은행 창구 또는 공식 납부 사이트"와 구청 문의처가 적혀 있습니다. 문자 링크가 아니라 이 경로를 씁니다.',
        highlightBlockId: 'method-body',
      },
      explanation:
        '고지서에 적힌 공식 경로와 번호만 사용하면 사기 문자를 피할 수 있습니다.',
    },
  ],
};

// ---------------------------------------------------------------------------
// B. 일본 건강검진 안내문 연습본
// ---------------------------------------------------------------------------

const healthPracticePage: SyntheticDocumentPage = {
  width: PAGE_WIDTH,
  height: PAGE_HEIGHT,
  rules: [150, 290, 640],
  blocks: [
    { id: 'org', text: '△△市', x: 72, y: 56, width: 400, height: 44, style: 'org' },
    { id: 'org-dept', text: '健康推進課', x: 72, y: 104, width: 300, height: 32, style: 'fine' },
    {
      id: 'title',
      text: '特定健康診査のお知らせ',
      x: 72,
      y: 180,
      width: 656,
      height: 52,
      style: 'title',
    },
    {
      id: 'addressee',
      text: '●●● 様',
      x: 72,
      y: 238,
      width: 656,
      height: 34,
      style: 'subtitle',
    },
    ...fieldRow({ idPrefix: 'target', label: '対象', value: '40歳以上の被保険者', y: 310 }),
    ...fieldRow({
      idPrefix: 'reserve',
      label: '予約期限',
      value: '2027年1月15日まで',
      y: 366,
      strong: true,
    }),
    ...fieldRow({
      idPrefix: 'exam',
      label: '健診日',
      value: '2027年2月3日',
      y: 422,
      strong: true,
    }),
    ...fieldRow({ idPrefix: 'place', label: '会場', value: '△△市 保健センター', y: 478 }),
    ...fieldRow({ idPrefix: 'cost', label: '自己負担', value: 'なし', y: 534 }),
    {
      id: 'prepare-fasting',
      text: '前日の夜8時以降は食事をしないでください。水は飲めます。',
      x: 72,
      y: 662,
      width: 656,
      height: 44,
      style: 'body',
    },
    {
      id: 'prepare-items',
      text: '保険証と このお知らせを お持ちください。',
      x: 72,
      y: 710,
      width: 656,
      height: 40,
      style: 'body',
    },
    {
      id: 'contact-phone',
      text: 'お問い合わせ: △△市 健康推進課 ●●●',
      x: 72,
      y: 754,
      width: 656,
      height: 40,
      style: 'body',
    },
    {
      id: 'synthetic-note',
      text: '練習用の合成文書です。個人情報は ●●● で隠しています。',
      x: 72,
      y: 1052,
      width: 656,
      height: 34,
      style: 'fine',
    },
  ],
};

const healthPractice: PracticeScenario = {
  id: 'practice-jp-health',
  documentType: 'health_checkup',
  country: 'JP',
  language: 'ko',
  title: '일본 건강검진 안내문으로 연습하기',
  topic: '건강검진 안내문에서 예약기한과 준비물',
  pageId: 'practice-jp-health',
  questions: [
    {
      id: 'q-reserve',
      prompt: '언제까지 예약해야 하나요?',
      kind: 'important_date',
      options: [
        {
          text: '2027년 1월 15일까지',
          correct: true,
          feedback: '맞습니다. "予約期限"이 예약기한입니다.',
        },
        {
          text: '2027년 2월 3일까지',
          correct: false,
          feedback: '그 날짜는 검진을 받는 날(健診日)입니다. 예약기한은 그보다 앞입니다.',
        },
        {
          text: '예약은 필요 없습니다',
          correct: false,
          feedback: '예약기한이 적혀 있으므로 예약이 필요합니다.',
        },
      ],
      hints: {
        location: '표의 위쪽 두 줄을 비교해 보세요. 날짜가 두 개 있습니다.',
        keyword: '"予約期限"이라고 적힌 줄을 찾아보세요. 予約은 예약이라는 뜻입니다.',
        answer:
          '여기에 "予約期限: 2027年1月15日まで"라고 적혀 있습니다. まで는 "까지"라는 뜻입니다.',
        highlightBlockId: 'reserve-value',
      },
      explanation:
        '건강검진 안내문에는 날짜가 두 개 나옵니다. 예약기한이 검진일보다 먼저 옵니다.',
    },
    {
      id: 'q-items',
      prompt: '검진 당일에 무엇을 가져가야 하나요?',
      kind: 'amount_or_items',
      options: [
        {
          text: '보험증과 이 안내문',
          correct: true,
          feedback: '맞습니다. 保険証와 このお知らせ가 적혀 있습니다.',
        },
        {
          text: '주민등록증과 도장',
          correct: false,
          feedback: '문서에는 그렇게 적혀 있지 않습니다. 준비물 줄을 다시 보세요.',
        },
        {
          text: '아무것도 필요 없습니다',
          correct: false,
          feedback: '준비물이 적혀 있습니다. 아래쪽을 확인해 보세요.',
        },
      ],
      hints: {
        location: '표 아래쪽 문장들을 읽어 보세요.',
        keyword: '"お持ちください"라고 적힌 줄을 찾아보세요. 가져오라는 뜻입니다.',
        answer:
          '여기에 "保険証と このお知らせを お持ちください"라고 적혀 있습니다. 보험증과 안내문을 가져가면 됩니다.',
        highlightBlockId: 'prepare-items',
      },
      explanation: '준비물은 대부분 표가 아니라 표 아래 문장에 적혀 있습니다.',
    },
    {
      id: 'q-fasting',
      prompt: '검진 전날 밤에 식사를 해도 되나요?',
      kind: 'actions',
      options: [
        {
          text: '밤 8시까지는 먹어도 되고, 그 뒤에는 안 됩니다',
          correct: true,
          feedback: '맞습니다. "前日の夜8時以降"은 전날 밤 8시 이후라는 뜻입니다.',
        },
        {
          text: '전날은 하루 종일 아무것도 먹으면 안 됩니다',
          correct: false,
          feedback: '문서는 밤 8시 이후라고만 적고 있습니다. 그 전에는 먹어도 됩니다.',
        },
        {
          text: '식사 제한이 없습니다',
          correct: false,
          feedback: '금식 안내가 적혀 있습니다. 다시 찾아보세요.',
        },
      ],
      hints: {
        location: '표 아래 첫 번째 문장을 보세요.',
        keyword: '"食事"라는 글자를 찾아보세요. 식사라는 뜻입니다.',
        answer:
          '"前日の夜8時以降は食事をしないでください"라고 적혀 있습니다. 전날 밤 8시 이후로는 먹지 말라는 뜻이고, 물은 마실 수 있습니다.',
        highlightBlockId: 'prepare-fasting',
      },
      explanation:
        '금식 시간은 문서마다 다릅니다. 지난번 문서가 9시였어도 이번 문서는 8시입니다. 매번 확인해야 하는 이유입니다.',
    },
  ],
};

// ---------------------------------------------------------------------------
// C. 한국 복지 안내문 연습본
// ---------------------------------------------------------------------------

const welfarePracticePage: SyntheticDocumentPage = {
  width: PAGE_WIDTH,
  height: PAGE_HEIGHT,
  rules: [150, 290, 620],
  blocks: [
    {
      id: 'org',
      text: '○○시 △△동 주민센터',
      x: 72,
      y: 56,
      width: 520,
      height: 44,
      style: 'org',
    },
    { id: 'org-dept', text: '복지지원팀', x: 72, y: 104, width: 300, height: 32, style: 'fine' },
    {
      id: 'title',
      text: '노인 일자리 참여자 모집 안내',
      x: 72,
      y: 180,
      width: 656,
      height: 52,
      style: 'title',
    },
    {
      id: 'addressee',
      text: '●●● 귀하',
      x: 72,
      y: 238,
      width: 656,
      height: 34,
      style: 'subtitle',
    },
    ...fieldRow({ idPrefix: 'target', label: '모집 대상', value: '만 65세 이상 주민', y: 310 }),
    ...fieldRow({
      idPrefix: 'deadline',
      label: '신청 기간',
      value: '2026년 11월 20일까지',
      y: 366,
      strong: true,
    }),
    ...fieldRow({ idPrefix: 'place', label: '신청 장소', value: '△△동 주민센터', y: 422 }),
    ...fieldRow({ idPrefix: 'docs', label: '준비물', value: '신분증, 신청서', y: 478 }),
    ...fieldRow({ idPrefix: 'result', label: '결과 안내', value: '선발 후 개별 통지', y: 534 }),
    {
      id: 'note-body',
      text: '활동비는 참여 유형에 따라 다르며, 선발 후 안내합니다.',
      x: 72,
      y: 650,
      width: 656,
      height: 44,
      style: 'body',
    },
    {
      id: 'contact-phone',
      text: '문의: △△동 주민센터 ●●●',
      x: 72,
      y: 700,
      width: 656,
      height: 40,
      style: 'body',
    },
    {
      id: 'synthetic-note',
      text: '연습용 합성문서입니다. 개인정보는 ●●●로 가렸습니다.',
      x: 72,
      y: 1052,
      width: 656,
      height: 34,
      style: 'fine',
    },
  ],
};

const welfarePractice: PracticeScenario = {
  id: 'practice-kr-welfare',
  documentType: 'welfare_application',
  country: 'KR',
  language: 'ko',
  title: '복지 안내문으로 연습하기',
  topic: '복지 안내문에서 신청기한과 준비물',
  pageId: 'practice-kr-welfare',
  questions: [
    {
      id: 'q-deadline',
      prompt: '언제까지 신청해야 하나요?',
      kind: 'important_date',
      options: [
        {
          text: '2026년 11월 20일까지',
          correct: true,
          feedback: '맞습니다. "신청 기간" 줄에 적혀 있습니다.',
        },
        {
          text: '선발된 뒤에 알려줍니다',
          correct: false,
          feedback: '선발 후 안내되는 것은 활동비입니다. 신청 기간은 따로 적혀 있습니다.',
        },
        {
          text: '기간이 적혀 있지 않습니다',
          correct: false,
          feedback: '표 두 번째 줄에 기간이 적혀 있습니다.',
        },
      ],
      hints: {
        location: '표의 위쪽 절반을 보세요.',
        keyword: '"기간"이라는 글자가 들어간 줄을 찾아보세요.',
        answer: '여기에 "신청 기간: 2026년 11월 20일까지"라고 적혀 있습니다.',
        highlightBlockId: 'deadline-value',
      },
      explanation: '복지 안내문은 기한을 넘기면 다음 모집까지 기다려야 합니다.',
    },
    {
      id: 'q-amount-unknown',
      prompt: '이 문서에서 받게 될 활동비 금액을 알 수 있나요?',
      kind: 'amount_or_items',
      options: [
        {
          text: '문서에 적혀 있지 않습니다',
          correct: true,
          feedback:
            '맞습니다. 적혀 있지 않은 금액은 추측하지 말고 주민센터에 물어봐야 합니다.',
        },
        {
          text: '월 30만 원이라고 적혀 있습니다',
          correct: false,
          feedback: '그런 금액은 이 문서에 없습니다.',
        },
        {
          text: '신분증을 내면 알려준다고 적혀 있습니다',
          correct: false,
          feedback: '신분증은 준비물이고, 금액과는 관계가 없습니다.',
        },
      ],
      hints: {
        location: '표 아래 문장을 읽어 보세요.',
        keyword: '"활동비"라고 적힌 문장을 찾아보세요.',
        answer:
          '"활동비는 참여 유형에 따라 다르며, 선발 후 안내합니다"라고 적혀 있습니다. 즉 지금은 금액을 알 수 없습니다.',
        highlightBlockId: 'note-body',
      },
      explanation:
        '문서에 없는 내용은 AI도 만들어내면 안 됩니다. 이럴 때는 기관에 직접 물어보는 것이 정답입니다.',
    },
  ],
};

// ---------------------------------------------------------------------------

export const PRACTICE_SCENARIOS: readonly PracticeScenario[] = [
  taxPractice,
  healthPractice,
  welfarePractice,
];

/** Pages are looked up by id so a scenario carries no circular import. */
export const PRACTICE_PAGES: Record<string, SyntheticDocumentPage> = {
  'practice-kr-tax-auto': taxPracticePage,
  'practice-jp-health': healthPracticePage,
  'practice-kr-welfare': welfarePracticePage,
};

export function getPracticeScenario(id: string): PracticeScenario | undefined {
  return PRACTICE_SCENARIOS.find((scenario) => scenario.id === id);
}

export function practiceForDocumentType(
  documentType: string,
): PracticeScenario | undefined {
  return PRACTICE_SCENARIOS.find(
    (scenario) => scenario.documentType === documentType,
  );
}
