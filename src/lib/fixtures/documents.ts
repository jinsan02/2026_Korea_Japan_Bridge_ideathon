/**
 * Synthetic demo documents and their verified analyses.
 *
 * SAFETY: every document here is invented for this demo.
 * - Agency and company names use ○○ placeholders and name no real body.
 * - Phone numbers use 0000 patterns that cannot be dialled.
 * - There are no account numbers and no resident registration numbers.
 * - Barcodes are decorative patterns that encode nothing.
 * Never replace these with a real citizen's document.
 *
 * The stored analysis is what FixtureProvider returns. It is written in exactly
 * the shape a live model must produce, so switching provider changes where the
 * data comes from and nothing else.
 *
 * TWO documents are shown: the Korean local tax notice and the Japanese gas
 * slip, the second of which continues into the payment-app screen. The health
 * checkup and welfare notices below are complete and tested but hidden from
 * the picker - they are the proof the pipeline is not hard-wired to two
 * documents, not part of the demo.
 */
import type { DocumentTypeId, Language, ModelAnalysis } from '@/lib/analysis/schema';
import type { Surface } from '@/lib/learning/entry-choices';
import {
  type SyntheticDocumentPage,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  bboxOf,
  fieldRow,
  quoteOf,
} from './document-page';
import { krTaxAnalysisKo, krTaxPage } from './demo-kr-tax';
import {
  jpAppAnalysisKo,
  jpAppPage,
  jpGasAnalysisKo,
  jpGasPage,
} from './demo-jp-utility';
import {
  jpAppAnalysisJa,
  jpGasAnalysisJa,
  krTaxAnalysisJa,
} from './demo-ja';

export interface DocumentFixture {
  id: string;
  documentType: DocumentTypeId;
  /** Language printed on the page. */
  documentLanguage: Language;
  country: 'KR' | 'JP';
  /** Name shown in the demo document picker. */
  title: string;
  description: string;
  /** Emoji for the picker card, always paired with text - never colour alone. */
  icon: string;
  page: SyntheticDocumentPage;
  /**
   * Paper or phone screen. Changes what the reader is offered: you point at a
   * line on paper, but at a button on a screen.
   */
  surface?: Surface;
  /**
   * Kept working but not offered. Hiding rather than deleting means the extra
   * document families still typecheck and still run in tests, so the claim
   * "this generalises past the two we demo" stays checkable.
   */
  hidden?: boolean;
  /**
   * The next screen this document leads to, when solving it does not end on
   * paper. The Japanese slip hands the reader to a payment app, and that app
   * screen is the second half of the same task.
   */
  continuesTo?: string;
  /**
   * Analyses keyed by the language the explanation is written in. Korean is
   * always present; Japanese is provided where the demo needs it. A missing
   * language falls back to Korean rather than showing an empty screen.
   */
  analysisByLanguage: Partial<Record<'ko' | 'ja', ModelAnalysis>>;
}

// ===========================================================================
// 2. 일본 건강검진 안내문 - 확장 시나리오 (일본어 원문 + 한국어 설명)
// ===========================================================================

const healthPage: SyntheticDocumentPage = {
  width: PAGE_WIDTH,
  height: PAGE_HEIGHT,
  rules: [150, 290, 640, 880],
  blocks: [
    { id: 'org', text: '○○市', x: 72, y: 56, width: 400, height: 44, style: 'org' },
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
      id: 'subtitle',
      text: '今年度の健診の対象となる方にお送りしています。',
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
      value: '2026年11月20日まで',
      y: 366,
      strong: true,
    }),
    ...fieldRow({
      idPrefix: 'exam',
      label: '健診日',
      value: '2026年12月5日',
      y: 422,
      strong: true,
    }),
    ...fieldRow({ idPrefix: 'place', label: '会場', value: '○○市保健センター', y: 478 }),
    ...fieldRow({ idPrefix: 'cost', label: '自己負担', value: 'なし', y: 534 }),
    {
      id: 'prepare-label',
      text: '当日の持ちもの・注意',
      x: 72,
      y: 662,
      width: 656,
      height: 36,
      style: 'sectionLabel',
    },
    {
      id: 'prepare-fasting',
      text: '前日の夜9時以降は食事をしないでください。水は飲めます。',
      x: 72,
      y: 702,
      width: 656,
      height: 44,
      style: 'body',
    },
    {
      id: 'prepare-items',
      text: '保険証と このお知らせを お持ちください。',
      x: 72,
      y: 750,
      width: 656,
      height: 40,
      style: 'body',
    },
    {
      id: 'prepare-medicine',
      text: 'お薬を飲んでいる方は事前にお知らせください。',
      x: 72,
      y: 794,
      width: 656,
      height: 44,
      style: 'body',
    },
    {
      id: 'contact-label',
      text: 'お問い合わせ',
      x: 72,
      y: 902,
      width: 656,
      height: 36,
      style: 'sectionLabel',
    },
    {
      id: 'contact-phone',
      text: '○○市 健康推進課 電話 000-000-0000',
      x: 72,
      y: 942,
      width: 656,
      height: 40,
      style: 'body',
    },
    {
      id: 'synthetic-note',
      text: 'これはデモ用に作成した合成文書です。実際の通知ではありません。',
      x: 72,
      y: 1052,
      width: 656,
      height: 34,
      style: 'fine',
    },
  ],
};

const healthAnalysisKo: ModelAnalysis = {
  language: 'ko',
  country: 'JP',
  documentType: 'health_checkup',
  documentTypeLabel: '건강검진 안내문 (일본)',
  issuer: '○○市 健康推進課',
  title: '特定健康診査のお知らせ',
  summary: '11월 20일까지 예약하고 12월 5일에 건강검진을 받으라는 안내입니다.',
  importantDates: [
    {
      id: 'd-reserve',
      label: '예약기한',
      isoDate: '2026-11-20',
      rawText: '2026年11月20日まで',
      kind: 'deadline',
      evidenceIds: ['ev-reserve'],
      confidence: 0.95,
    },
    {
      id: 'd-exam',
      label: '검진일',
      isoDate: '2026-12-05',
      rawText: '2026年12月5日',
      kind: 'appointment',
      evidenceIds: ['ev-exam'],
      confidence: 0.95,
    },
  ],
  amounts: [
    {
      id: 'am-cost',
      label: '본인부담',
      value: 0,
      currency: 'JPY',
      rawText: 'なし',
      evidenceIds: ['ev-cost'],
      confidence: 0.9,
    },
  ],
  recipientActions: [
    {
      id: 'act-reserve',
      title: '11월 20일까지 예약하기',
      description: '안내문에 적힌 번호로 전화해서 검진을 예약하세요.',
      deadline: '2026-11-20',
      requiredItems: ['안내문'],
      method: ['문서 아래쪽에 적힌 건강추진과 번호로 전화합니다.'],
      evidenceIds: ['ev-reserve', 'ev-contact'],
      confidence: 0.92,
    },
    {
      id: 'act-prepare',
      title: '검진 전 준비물과 금식 확인하기',
      description: '전날 밤 9시 이후 금식이고, 보험증과 안내문을 가져가야 합니다.',
      deadline: '2026-12-05',
      requiredItems: ['보험증', '이 안내문'],
      method: [
        '검사 전날 밤 9시 이후에는 음식을 먹지 않습니다. 물은 마실 수 있습니다.',
        '검진 당일 보험증과 안내문을 챙깁니다.',
      ],
      evidenceIds: ['ev-fasting', 'ev-items', 'ev-medicine'],
      confidence: 0.93,
    },
    {
      id: 'act-contact',
      title: '시청에 공식 확인하기',
      description: '문서에 적힌 문의처를 보여드립니다.',
      deadline: null,
      requiredItems: ['안내문'],
      method: ['문서에 적힌 건강추진과 번호로 문의합니다.'],
      evidenceIds: ['ev-contact'],
      confidence: 0.94,
    },
  ],
  paymentOptions: [],
  warnings: [],
  officialContacts: [
    {
      id: 'c-city',
      organization: '○○市',
      department: '健康推進課',
      phone: '000-000-0000',
      url: null,
      hours: null,
      evidenceIds: ['ev-contact'],
      source: 'document',
    },
  ],
  evidence: [
    {
      id: 'ev-type',
      originalText: quoteOf(healthPage, 'title'),
      translatedText: '특정 건강검진 안내',
      explanation: '무슨 문서인지 알려주는 제목입니다.',
      page: 1,
      region: bboxOf(healthPage, 'title'),
    },
    {
      id: 'ev-reserve',
      originalText: '予約期限: 2026年11月20日まで',
      translatedText: '예약기한: 2026년 11월 20일까지',
      explanation: '언제까지 예약해야 하는지 적힌 줄입니다.',
      page: 1,
      region: bboxOf(healthPage, 'reserve-value'),
    },
    {
      id: 'ev-exam',
      originalText: '健診日: 2026年12月5日',
      translatedText: '검진일: 2026년 12월 5일',
      explanation: '검진을 받는 날짜입니다.',
      page: 1,
      region: bboxOf(healthPage, 'exam-value'),
    },
    {
      id: 'ev-cost',
      originalText: '自己負担: なし',
      translatedText: '본인부담: 없음',
      explanation: '본인이 내는 돈이 없다는 뜻입니다.',
      page: 1,
      region: bboxOf(healthPage, 'cost-value'),
    },
    {
      id: 'ev-fasting',
      originalText: quoteOf(healthPage, 'prepare-fasting'),
      translatedText: '전날 밤 9시 이후에는 식사하지 마세요. 물은 마실 수 있습니다.',
      explanation: '금식 안내입니다.',
      page: 1,
      region: bboxOf(healthPage, 'prepare-fasting'),
    },
    {
      id: 'ev-items',
      originalText: quoteOf(healthPage, 'prepare-items'),
      translatedText: '보험증과 이 안내문을 가져오세요.',
      explanation: '가져가야 할 준비물입니다.',
      page: 1,
      region: bboxOf(healthPage, 'prepare-items'),
    },
    {
      id: 'ev-medicine',
      originalText: quoteOf(healthPage, 'prepare-medicine'),
      translatedText: '약을 드시는 분은 미리 알려 주세요.',
      explanation: '복용 중인 약이 있을 때의 안내입니다.',
      page: 1,
      region: bboxOf(healthPage, 'prepare-medicine'),
    },
    {
      id: 'ev-contact',
      originalText: quoteOf(healthPage, 'contact-phone'),
      translatedText: '○○시 건강추진과 전화 000-000-0000',
      explanation: '문서에 적힌 문의처입니다.',
      page: 1,
      region: bboxOf(healthPage, 'contact-phone'),
    },
  ],
  uncertainty: [],
  confidence: 0.93,
  requiresHumanVerification: false,
};

/** Japanese-language explanation of the same Japanese document. */
const healthAnalysisJa: ModelAnalysis = {
  ...healthAnalysisKo,
  language: 'ja',
  documentTypeLabel: '健康診断の お知らせ',
  summary: '11月20日までに 予約して、12月5日に 健康診断を 受けて くださいという お知らせです。',
  importantDates: [
    { ...healthAnalysisKo.importantDates[0], label: '予約の 期限' },
    { ...healthAnalysisKo.importantDates[1], label: '健診の 日' },
  ],
  amounts: [{ ...healthAnalysisKo.amounts[0], label: '自己負担' }],
  recipientActions: [
    {
      ...healthAnalysisKo.recipientActions[0],
      title: '11月20日までに 予約する',
      description: 'お知らせに 書いて ある 番号に 電話して 予約して ください。',
      method: ['文書の 下に ある 健康推進課の 番号に 電話します。'],
    },
    {
      ...healthAnalysisKo.recipientActions[1],
      title: '持ちものと 食事の 注意を 確認する',
      description: '前の日の 夜9時から 食べません。保険証と お知らせを 持って いきます。',
      requiredItems: ['保険証', 'このお知らせ'],
      method: [
        '前の日の 夜9時から 食べません。水は 飲めます。',
        '当日は 保険証と お知らせを 持って いきます。',
      ],
    },
    {
      ...healthAnalysisKo.recipientActions[2],
      title: '市役所に 確認する',
      description: '文書に 書いて ある 問い合わせ先を お見せします。',
      method: ['文書の 健康推進課の 番号に 問い合わせます。'],
    },
  ],
  evidence: healthAnalysisKo.evidence.map((item) => ({
    id: item.id,
    originalText: item.originalText,
    explanation: item.explanation,
    page: item.page,
    region: item.region,
  })),
};

// ===========================================================================
// 3. 한국 복지 신청 안내문 - 금액이 적혀 있지 않은 문서
// ===========================================================================

const welfarePage: SyntheticDocumentPage = {
  width: PAGE_WIDTH,
  height: PAGE_HEIGHT,
  rules: [150, 290, 600, 880],
  blocks: [
    {
      id: 'org',
      text: '서울 ○○구 ○○동 주민센터',
      x: 72,
      y: 56,
      width: 560,
      height: 44,
      style: 'org',
    },
    { id: 'org-dept', text: '복지지원팀', x: 72, y: 104, width: 300, height: 32, style: 'fine' },
    {
      id: 'title',
      text: '2026년 겨울 에너지바우처 신청 안내',
      x: 72,
      y: 180,
      width: 656,
      height: 52,
      style: 'title',
    },
    {
      id: 'subtitle',
      text: '신청 대상에 해당하는 분은 기간 안에 신청하시기 바랍니다.',
      x: 72,
      y: 238,
      width: 656,
      height: 34,
      style: 'subtitle',
    },
    ...fieldRow({
      idPrefix: 'target',
      label: '신청 대상',
      value: '노인이 포함된 저소득 가구',
      y: 310,
    }),
    ...fieldRow({ idPrefix: 'support', label: '지원 내용', value: '겨울철 냉난방비 지원', y: 366 }),
    ...fieldRow({
      idPrefix: 'deadline',
      label: '신청 기간',
      value: '2026년 10월 31일까지',
      y: 422,
      strong: true,
    }),
    ...fieldRow({ idPrefix: 'place', label: '신청 장소', value: '주소지 주민센터 방문', y: 478 }),
    ...fieldRow({ idPrefix: 'result', label: '결과 안내', value: '심사 후 개별 통지', y: 534 }),
    {
      id: 'docs-label',
      text: '준비하실 서류',
      x: 72,
      y: 622,
      width: 656,
      height: 36,
      style: 'sectionLabel',
    },
    { id: 'docs-id', text: '신분증', x: 72, y: 662, width: 656, height: 36, style: 'body' },
    {
      id: 'docs-form',
      text: '신청서 (주민센터에 비치되어 있습니다)',
      x: 72,
      y: 702,
      width: 656,
      height: 36,
      style: 'body',
    },
    {
      id: 'docs-proof',
      text: '가구원 확인이 가능한 서류',
      x: 72,
      y: 742,
      width: 656,
      height: 36,
      style: 'body',
    },
    {
      id: 'note-body',
      text: '지원 금액은 가구 상황에 따라 달라지며, 심사 후 결정됩니다.',
      x: 72,
      y: 800,
      width: 656,
      height: 44,
      style: 'body',
    },
    {
      id: 'contact-label',
      text: '문의처',
      x: 72,
      y: 902,
      width: 656,
      height: 36,
      style: 'sectionLabel',
    },
    {
      id: 'contact-phone',
      text: '○○동 주민센터 복지지원팀 전화 02-0000-0000',
      x: 72,
      y: 942,
      width: 656,
      height: 40,
      style: 'body',
    },
    {
      id: 'synthetic-note',
      text: '이 문서는 시연용으로 만든 합성문서입니다. 실제 안내문이 아닙니다.',
      x: 72,
      y: 1052,
      width: 656,
      height: 34,
      style: 'fine',
    },
  ],
};

const welfareAnalysisKo: ModelAnalysis = {
  language: 'ko',
  country: 'KR',
  documentType: 'welfare_application',
  documentTypeLabel: '복지 신청 안내문',
  issuer: '서울 ○○구 ○○동 주민센터',
  title: '2026년 겨울 에너지바우처 신청 안내',
  summary: '겨울 냉난방비를 도와주는 제도이며 10월 31일까지 주민센터에서 신청하라는 안내입니다.',
  importantDates: [
    {
      id: 'd-apply',
      label: '신청기한',
      isoDate: '2026-10-31',
      rawText: '2026년 10월 31일까지',
      kind: 'deadline',
      evidenceIds: ['ev-deadline'],
      confidence: 0.96,
    },
  ],
  // The document deliberately states no figure. Reporting a typical amount here
  // would be exactly the failure this fixture exists to demonstrate.
  amounts: [],
  recipientActions: [
    {
      id: 'act-eligibility',
      title: '내가 신청 대상인지 확인하기',
      description: '누가 신청할 수 있는지 문서에 적힌 조건을 알려드립니다.',
      deadline: '2026-10-31',
      requiredItems: [],
      method: ['문서의 "신청 대상" 칸을 확인합니다.', '확실하지 않으면 주민센터에 물어봅니다.'],
      evidenceIds: ['ev-target'],
      confidence: 0.9,
    },
    {
      id: 'act-documents',
      title: '준비물과 신청 기한 확인하기',
      description: '무엇을 챙겨서 언제까지 가야 하는지 정리해 드립니다.',
      deadline: '2026-10-31',
      requiredItems: ['신분증', '신청서', '가구원 확인이 가능한 서류'],
      method: ['신분증을 챙깁니다.', '주소지 주민센터에 방문해 신청서를 받습니다.'],
      evidenceIds: ['ev-deadline', 'ev-docs', 'ev-place'],
      confidence: 0.93,
    },
    {
      id: 'act-contact',
      title: '주민센터에 문의하기',
      description: '문서에 적힌 문의처를 보여드립니다.',
      deadline: null,
      requiredItems: [],
      method: ['문서 아래쪽에 적힌 복지지원팀 번호로 전화합니다.'],
      evidenceIds: ['ev-contact'],
      confidence: 0.94,
    },
  ],
  paymentOptions: [],
  warnings: [],
  officialContacts: [
    {
      id: 'c-center',
      organization: '서울 ○○구 ○○동 주민센터',
      department: '복지지원팀',
      phone: '02-0000-0000',
      url: null,
      hours: null,
      evidenceIds: ['ev-contact'],
      source: 'document',
    },
  ],
  evidence: [
    {
      id: 'ev-type',
      originalText: quoteOf(welfarePage, 'title'),
      explanation: '무슨 문서인지 알려주는 제목입니다.',
      page: 1,
      region: bboxOf(welfarePage, 'title'),
    },
    {
      id: 'ev-target',
      originalText: '신청 대상: 노인이 포함된 저소득 가구',
      explanation: '누가 신청할 수 있는지 적힌 줄입니다.',
      page: 1,
      region: bboxOf(welfarePage, 'target-value'),
    },
    {
      id: 'ev-deadline',
      originalText: '신청 기간: 2026년 10월 31일까지',
      explanation: '언제까지 신청해야 하는지 적힌 줄입니다.',
      page: 1,
      region: bboxOf(welfarePage, 'deadline-value'),
    },
    {
      id: 'ev-place',
      originalText: '신청 장소: 주소지 주민센터 방문',
      explanation: '어디에서 신청하는지 적힌 줄입니다.',
      page: 1,
      region: bboxOf(welfarePage, 'place-value'),
    },
    {
      id: 'ev-docs',
      originalText: quoteOf(welfarePage, 'docs-proof'),
      explanation: '가져가야 할 서류입니다.',
      page: 1,
      region: bboxOf(welfarePage, 'docs-proof'),
    },
    {
      id: 'ev-amount-unknown',
      originalText: quoteOf(welfarePage, 'note-body'),
      explanation: '지원 금액이 아직 정해지지 않았다는 뜻입니다.',
      page: 1,
      region: bboxOf(welfarePage, 'note-body'),
    },
    {
      id: 'ev-contact',
      originalText: quoteOf(welfarePage, 'contact-phone'),
      explanation: '문서에 적힌 문의처입니다.',
      page: 1,
      region: bboxOf(welfarePage, 'contact-phone'),
    },
  ],
  uncertainty: [
    '지원 금액은 문서에 적혀 있지 않습니다. 심사 후에 정해지므로 주민센터에 문의하세요.',
  ],
  confidence: 0.92,
  requiresHumanVerification: false,
};

// ===========================================================================

export const DOCUMENT_FIXTURES: readonly DocumentFixture[] = [
  {
    id: 'kr-local-tax',
    documentType: 'tax_notice',
    documentLanguage: 'ko',
    country: 'KR',
    title: '지방세 납세고지서 (한국)',
    description: '집으로 온 고지서. 금액과 기한, 낼 수 있는 방법이 적혀 있습니다.',
    icon: '🏛️',
    page: krTaxPage,
    analysisByLanguage: { ko: krTaxAnalysisKo, ja: krTaxAnalysisJa },
  },
  {
    id: 'jp-gas-bill',
    documentType: 'utility_bill',
    documentLanguage: 'ja',
    country: 'JP',
    title: '가스요금 납부용지 (일본)',
    description: '바코드가 있는 엽서. 편의점과 휴대폰 앱으로 낼 수 있습니다.',
    icon: '🔥',
    page: jpGasPage,
    continuesTo: 'jp-payment-app',
    analysisByLanguage: { ko: jpGasAnalysisKo, ja: jpGasAnalysisJa },
  },
  {
    id: 'jp-payment-app',
    documentType: 'utility_bill',
    documentLanguage: 'ja',
    country: 'JP',
    title: '결제앱 화면 (일본)',
    description: '바코드를 찍은 뒤 나온 화면. 종이가 아니라 화면도 문서입니다.',
    icon: '📱',
    page: jpAppPage,
    surface: 'screen',
    analysisByLanguage: { ko: jpAppAnalysisKo, ja: jpAppAnalysisJa },
  },
  {
    id: 'jp-health-checkup',
    documentType: 'health_checkup',
    documentLanguage: 'ja',
    country: 'JP',
    title: '건강검진 안내문 (일본)',
    description: '일본어 원문을 쉬운 한국어로 설명합니다.',
    icon: '🩺',
    page: healthPage,
    hidden: true,
    analysisByLanguage: { ko: healthAnalysisKo, ja: healthAnalysisJa },
  },
  {
    id: 'kr-welfare',
    documentType: 'welfare_application',
    documentLanguage: 'ko',
    country: 'KR',
    title: '복지 신청 안내문 (한국)',
    description: '금액이 적혀 있지 않은 문서. 추측하지 않는 동작을 보여줍니다.',
    icon: '🤝',
    page: welfarePage,
    hidden: true,
    analysisByLanguage: { ko: welfareAnalysisKo },
  },
];

/** What the demo picker offers. */
export const VISIBLE_DOCUMENT_FIXTURES: readonly DocumentFixture[] =
  DOCUMENT_FIXTURES.filter((fixture) => !fixture.hidden);

export const DEFAULT_FIXTURE_ID = 'kr-local-tax';

export function getFixture(id: string): DocumentFixture | undefined {
  return DOCUMENT_FIXTURES.find((fixture) => fixture.id === id);
}

/** The screen a fixture hands the reader on to, when there is one. */
export function nextFixture(id: string): DocumentFixture | undefined {
  const current = getFixture(id);
  return current?.continuesTo ? getFixture(current.continuesTo) : undefined;
}

export function fixtureForDocumentType(
  documentType: DocumentTypeId,
): DocumentFixture | undefined {
  return (
    VISIBLE_DOCUMENT_FIXTURES.find((fixture) => fixture.documentType === documentType) ??
    DOCUMENT_FIXTURES.find((fixture) => fixture.documentType === documentType)
  );
}

/** Korean is the reference explanation; other languages fall back to it. */
export function fixtureAnalysis(
  fixture: DocumentFixture,
  language: Language,
): ModelAnalysis {
  if (language === 'ja' && fixture.analysisByLanguage.ja) {
    return fixture.analysisByLanguage.ja;
  }
  return fixture.analysisByLanguage.ko ?? fixture.analysisByLanguage.ja!;
}
