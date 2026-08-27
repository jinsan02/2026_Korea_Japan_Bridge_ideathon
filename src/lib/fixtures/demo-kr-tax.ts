/**
 * Demo 1 - Korean local tax notice.
 *
 * Laid out after the real 지방세 납세고지서 (별지 제8호서식(전산용1)): the
 * 납기 내 / 납기 후 pair, the 전자납부번호, the 납부장소 line, and the
 * electronic-payment routes that the real form prints on its reverse. A judge
 * who has held one of these should recognise the shape immediately.
 *
 * SAFETY: entirely invented. ○○구청 names no real office, every digit is a 0
 * pattern that cannot be dialled or paid, and the page says so in print.
 *
 * One value is deliberately absent. The real form leaves the 납기 후 amount to
 * a per-day table on the back, so this notice says "뒷면 일자별 금액 참조"
 * where a figure would go - and the analysis must report that it does not know
 * the number rather than computing one.
 *
 * WHAT THE ANALYSIS EXPLAINS. The reader is a Korean pensioner who has been
 * paying tax for fifty years. They can read "86,400원". What actually stops
 * them is administrative structure: that one notice carries two dates and two
 * different amounts, that 전자납부번호 is not a bank account number, that
 * 가산세 is printed as a formula with a blank in it. Explaining the number
 * would be condescending and would not help; explaining those does.
 */
import type { ModelAnalysis } from '@/lib/analysis/schema';
import {
  type SyntheticDocumentPage,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  bboxOf,
  fieldRow,
  quoteOf,
} from './document-page';

export const krTaxPage: SyntheticDocumentPage = {
  width: PAGE_WIDTH,
  height: PAGE_HEIGHT,
  rules: [132, 268, 590, 700, 940],
  shapes: [
    { id: 'sh-amount-box', kind: 'outline', x: 60, y: 400, width: 680, height: 124 },
    { id: 'sh-barcode', kind: 'barcode', x: 470, y: 1010, width: 260, height: 54 },
  ],
  blocks: [
    {
      id: 'form-code',
      text: '[별지 제8호서식(전산용1)]',
      x: 60,
      y: 40,
      width: 400,
      height: 26,
      style: 'fine',
    },
    { id: 'org', text: '서울 ○○구청', x: 60, y: 74, width: 420, height: 44, style: 'org' },
    { id: 'org-dept', text: '세무과', x: 500, y: 84, width: 240, height: 30, style: 'fine' },
    {
      id: 'title',
      text: '지방세 납세고지서 겸 영수증',
      x: 60,
      y: 162,
      width: 680,
      height: 50,
      style: 'title',
    },
    {
      id: 'subtitle',
      text: '2026년 정기분 재산세입니다. 기한 안에 납부하여 주시기 바랍니다.',
      x: 60,
      y: 220,
      width: 680,
      height: 34,
      style: 'subtitle',
    },
    ...fieldRow({ idPrefix: 'target', label: '과세 대상', value: '주택 (서울 ○○구)', y: 288 }),
    ...fieldRow({ idPrefix: 'taxitem', label: '세목', value: '재산세', y: 344 }),
    {
      id: 'inside-label',
      text: '납기 내 세액',
      x: 80,
      y: 416,
      width: 240,
      height: 34,
      style: 'fieldLabel',
    },
    {
      id: 'inside-amount',
      text: '86,400원',
      x: 80,
      y: 452,
      width: 300,
      height: 56,
      style: 'fieldValueStrong',
    },
    {
      id: 'inside-deadline',
      text: '납기 내: 2026.09.30까지',
      x: 400,
      y: 452,
      width: 330,
      height: 44,
      style: 'fieldValueStrong',
    },
    ...fieldRow({
      idPrefix: 'after',
      label: '납기 후 세액',
      value: '뒷면 일자별 금액 참조',
      y: 540,
    }),
    ...fieldRow({
      idPrefix: 'afterdate',
      label: '납기 후',
      value: '2026.10.31까지',
      y: 606,
      strong: true,
    }),
    ...fieldRow({
      idPrefix: 'paynum',
      label: '전자납부번호',
      value: '0000-0000-0000-0000',
      y: 662,
    }),
    {
      id: 'surcharge-label',
      text: '납부지연가산세',
      x: 60,
      y: 726,
      width: 680,
      height: 32,
      style: 'sectionLabel',
    },
    {
      id: 'surcharge-body',
      text: '기한이 지나면 지방세액의 3%가 더해지고, 1개월마다 (   )%가 추가됩니다.',
      x: 60,
      y: 762,
      width: 680,
      height: 38,
      style: 'body',
    },
    {
      id: 'place-label',
      text: '납부 장소',
      x: 60,
      y: 812,
      width: 680,
      height: 32,
      style: 'sectionLabel',
    },
    {
      id: 'place-body',
      text: '전국 은행, 우체국 창구에서 이 고지서로 납부할 수 있습니다.',
      x: 60,
      y: 848,
      width: 680,
      height: 38,
      style: 'body',
    },
    {
      id: 'epay-body',
      text: '전자납부: 인터넷뱅킹 · ATM · 위택스(07:00~23:30) · 신용카드',
      x: 60,
      y: 890,
      width: 680,
      height: 38,
      style: 'body',
    },
    {
      id: 'contact-dept',
      text: '문의처: 서울 ○○구청 세무과',
      x: 60,
      y: 962,
      width: 400,
      height: 34,
      style: 'body',
    },
    {
      id: 'contact-phone',
      text: '전화 02-0000-0000',
      x: 60,
      y: 1000,
      width: 400,
      height: 38,
      style: 'body',
    },
    {
      id: 'synthetic-note',
      text: '이 문서는 시연용으로 만든 합성문서입니다. 실제 고지서가 아닙니다.',
      x: 60,
      y: 1080,
      width: 680,
      height: 32,
      style: 'fine',
    },
  ],
};

export const krTaxAnalysisKo: ModelAnalysis = {
  language: 'ko',
  country: 'KR',
  documentType: 'tax_notice',
  documentTypeLabel: '지방세 납세고지서',
  issuer: '서울 ○○구청',
  title: '2026년 정기분 재산세 납세고지서',
  summary: '재산세 86,400원을 9월 30일까지 내라는 고지서입니다.',
  importantDates: [
    {
      id: 'd-inside',
      label: '납기 내',
      isoDate: '2026-09-30',
      rawText: '2026.09.30까지',
      kind: 'deadline',
      evidenceIds: ['ev-deadline'],
      confidence: 0.97,
    },
    {
      id: 'd-after',
      label: '납기 후',
      isoDate: '2026-10-31',
      rawText: '2026.10.31까지',
      kind: 'deadline',
      evidenceIds: ['ev-afterdate'],
      confidence: 0.94,
    },
  ],
  amounts: [
    {
      id: 'am-inside',
      label: '납기 내 세액',
      value: 86400,
      currency: 'KRW',
      rawText: '86,400원',
      evidenceIds: ['ev-amount'],
      confidence: 0.97,
    },
  ],
  recipientActions: [
    {
      id: 'act-dates',
      title: '날짜가 두 개인 이유 알기',
      description: '9월 30일까지는 86,400원입니다. 그 뒤에는 금액이 달라집니다.',
      deadline: '2026-09-30',
      requiredItems: ['고지서'],
      method: ['위쪽 칸이 납기 내, 아래쪽 칸이 납기 후입니다.'],
      evidenceIds: ['ev-deadline', 'ev-afterdate', 'ev-amount'],
      confidence: 0.95,
    },
    {
      id: 'act-paynum',
      title: '전자납부번호로 내는 방법',
      description: '이 번호는 계좌번호가 아닙니다. 이 고지서에만 쓰는 번호입니다.',
      deadline: '2026-09-30',
      requiredItems: ['고지서'],
      method: [
        '창구에 가면 고지서만 그대로 내면 됩니다.',
        'ATM과 인터넷은 이 번호를 눌러 넣습니다.',
      ],
      evidenceIds: ['ev-paynum', 'ev-place', 'ev-epay'],
      confidence: 0.93,
    },
    {
      id: 'act-contact',
      title: '이상하면 내기 전에 물어보기',
      description: '한 번 내면 되돌리기 어렵습니다. 세무과에 먼저 전화하세요.',
      deadline: null,
      requiredItems: ['고지서'],
      method: ['고지서 아래쪽 문의처 번호로 전화합니다.'],
      evidenceIds: ['ev-contact'],
      confidence: 0.92,
    },
  ],
  paymentOptions: [
    {
      id: 'pay-bank',
      method: 'bank_counter',
      label: '전국 은행 창구',
      note: '고지서를 그대로 냅니다',
      evidenceIds: ['ev-place'],
      confidence: 0.96,
    },
    {
      id: 'pay-post',
      method: 'post_office',
      label: '우체국 창구',
      note: null,
      evidenceIds: ['ev-place'],
      confidence: 0.95,
    },
    {
      id: 'pay-atm',
      method: 'atm',
      label: 'ATM',
      note: '전자납부번호를 입력합니다',
      evidenceIds: ['ev-epay'],
      confidence: 0.93,
    },
    {
      id: 'pay-net',
      method: 'internet_banking',
      label: '인터넷뱅킹',
      note: null,
      evidenceIds: ['ev-epay'],
      confidence: 0.93,
    },
    {
      id: 'pay-portal',
      method: 'online_portal',
      label: '위택스',
      note: '07:00~23:30',
      evidenceIds: ['ev-epay'],
      confidence: 0.93,
    },
    {
      id: 'pay-card',
      method: 'credit_card',
      label: '신용카드',
      note: null,
      evidenceIds: ['ev-epay'],
      confidence: 0.9,
    },
  ],
  warnings: [
    {
      id: 'two-deadlines',
      severity: 'caution',
      message: '이 고지서에는 날짜가 두 개입니다. 9월 30일이 지나면 낼 금액이 달라집니다.',
      evidenceIds: ['ev-deadline', 'ev-afterdate'],
    },
  ],
  officialContacts: [
    {
      id: 'c-tax-office',
      organization: '서울 ○○구청',
      department: '세무과',
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
      originalText: quoteOf(krTaxPage, 'title'),
      explanation: '고지서 겸 영수증입니다. 내고 나면 이 종이가 영수증이 됩니다.',
      page: 1,
      region: bboxOf(krTaxPage, 'title'),
    },
    {
      id: 'ev-amount',
      originalText: quoteOf(krTaxPage, 'inside-amount'),
      explanation: '9월 30일까지 냈을 때만 이 금액입니다.',
      page: 1,
      region: bboxOf(krTaxPage, 'inside-amount'),
    },
    {
      id: 'ev-deadline',
      originalText: quoteOf(krTaxPage, 'inside-deadline'),
      explanation: '원래 기한입니다. 이 날까지가 가장 쌉니다.',
      page: 1,
      region: bboxOf(krTaxPage, 'inside-deadline'),
    },
    {
      id: 'ev-afterdate',
      originalText: quoteOf(krTaxPage, 'afterdate-value'),
      explanation: '늦게 낼 때 쓰는 날짜입니다. 금액이 더 붙습니다.',
      page: 1,
      region: bboxOf(krTaxPage, 'afterdate-value'),
    },
    {
      id: 'ev-after-blank',
      originalText: quoteOf(krTaxPage, 'after-value'),
      explanation: '늦게 낼 금액은 숫자가 없고 뒷면을 보라고만 되어 있습니다.',
      page: 1,
      region: bboxOf(krTaxPage, 'after-value'),
    },
    {
      id: 'ev-paynum',
      originalText: quoteOf(krTaxPage, 'paynum-value'),
      explanation: '계좌번호가 아닙니다. 이 고지서 한 장에만 쓰는 번호입니다.',
      page: 1,
      region: bboxOf(krTaxPage, 'paynum-value'),
    },
    {
      id: 'ev-place',
      originalText: quoteOf(krTaxPage, 'place-body'),
      explanation: '여기서는 고지서를 그대로 내면 직원이 처리해 줍니다.',
      page: 1,
      region: bboxOf(krTaxPage, 'place-body'),
    },
    {
      id: 'ev-epay',
      originalText: quoteOf(krTaxPage, 'epay-body'),
      explanation: '위택스는 지방세를 내는 공식 인터넷 사이트 이름입니다.',
      page: 1,
      region: bboxOf(krTaxPage, 'epay-body'),
    },
    {
      id: 'ev-surcharge',
      originalText: quoteOf(krTaxPage, 'surcharge-body'),
      explanation: '가산세는 늦게 냈을 때 더 내는 돈입니다. 비율 한 칸이 비어 있습니다.',
      page: 1,
      region: bboxOf(krTaxPage, 'surcharge-body'),
    },
    {
      id: 'ev-contact',
      originalText: quoteOf(krTaxPage, 'contact-phone'),
      explanation: '고지서에 인쇄된 번호입니다. 문자로 온 번호보다 이쪽이 안전합니다.',
      page: 1,
      region: bboxOf(krTaxPage, 'contact-phone'),
    },
  ],
  uncertainty: [
    '늦게 냈을 때 낼 금액은 고지서에 적혀 있지 않습니다.',
    '가산세 비율 한 칸이 비어 있어 얼마인지 알 수 없습니다.',
  ],
  confidence: 0.94,
  requiresHumanVerification: false,
};
