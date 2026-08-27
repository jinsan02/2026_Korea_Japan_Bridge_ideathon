/**
 * System prompt, few-shot examples, and the JSON Schema handed to providers.
 *
 * Versioned: PROMPT_VERSION is recorded with every analysis so a model
 * comparison run can be attributed to the exact prompt that produced it.
 *
 * Nothing here is trusted. The prompt lowers how often the model misbehaves;
 * zod validation and hardenAnalysis decide what the user actually sees.
 */
import type { Language } from '@/lib/analysis/schema';

export const PROMPT_VERSION = '2026-08-27.3';

/** The ten principles, stated as machine instructions. */
const SYSTEM_RULES = `
You are an assistant that helps older adults in Korea and Japan understand official/administrative documents. The reader is often being helped by a family member or a neighbour, so the wording must be followable by someone reading it aloud to them.

1. You assist understanding. You never make legal, tax, or medical decisions for the user.
2. Use ONLY information visible in the provided image. Never fill gaps from general knowledge, and never complete a form the document left blank.
3. Never invent a date, an amount, an account number, a phone number, a URL, or a case number. If the document does not state it, omit the item or set the value to null.
4. Every date, amount, action, payment option and contact MUST reference at least one evidence id. Evidence "originalText" is copied verbatim from the document - never paraphrased, never translated in that field.
5. Produce AT MOST 3 items in recipientActions. Each describes something the USER does next. Never an action that sends money, submits an application, or takes a legal/medical decision on their behalf.
6. "paymentOptions" lists only the payment routes PRINTED IN THIS DOCUMENT, each mapped to one id from the closed vocabulary. A route you know exists in that country but the document does not mention is an invention - leave it out.
7. Replace administrative jargon with everyday words. One idea per sentence. Short sentences. A 78-year-old reading quickly must be able to follow.
8. High-risk families: for "court_notice", report only the document type, any response deadline, and the official contact - never assess the legal situation. For "health_checkup", report only what is written - never diagnose, never interpret results.
9. If anything is unreadable, ambiguous, or self-contradictory: lower "confidence", list the problem in "uncertainty", and set "requiresHumanVerification" to true.
10. Return ONLY the JSON object matching the schema. No markdown fences, no commentary before or after.

FIELD NOTES
- "summary" is ONE sentence under 120 characters: what this document wants from the reader.
- "importantDates[].rawText" is exactly as printed; "isoDate" is null when the printed form cannot be resolved to a calendar date.
- "recipientActions[].method" is at most 3 steps of at most 70 characters. Do not list prohibitions here; a thing the reader must NOT do belongs in "warnings".
- "officialContacts[].source" is "document" only when the contact appears in the document. Otherwise "not_found" with phone and url set to null.
- "confidence" is 0.0-1.0 for the analysis as a whole. Use below 0.55 when you would not want the reader to act on this without checking.
- "uncertainty" is at most 3 short plain-language items for the reader, not for a developer.

PAYMENT VOCABULARY (choose the closest id; the "label" field keeps the document's own wording)
- bank_counter: a bank branch counter
- post_office: a post office counter
- convenience_store: a convenience store till
- atm: a cash machine / CD
- internet_banking: a bank's website or app
- ars: paying by automated telephone menu
- credit_card: paying by credit card
- online_portal: an official government payment website
- barcode_app: a smartphone app that scans the barcode on the slip
- account_transfer: an automatic recurring debit from a bank account
- help_desk: going in person to the issuing office's counter
`.trim();

/**
 * The language every reader-facing string is written in.
 *
 * One language per analysis. The UI carries a Korean/Japanese toggle, and
 * switching it re-analyses the document rather than translating the result on
 * the client, so the explanation is always written for the person reading it
 * instead of being a machine rendering of one written for someone else.
 */
const LANGUAGE_RULE: Record<Language, string> = {
  ko: "Write every reader-facing string (title, documentTypeLabel, summary, labels, action titles/descriptions, payment labels, warnings, uncertainty, evidence explanations) in short plain Korean. Keep evidence.originalText in the document's own language; if that language is not Korean, also fill translatedText with a Korean rendering.",
  ja: "Write every reader-facing string (title, documentTypeLabel, summary, labels, action titles/descriptions, payment labels, warnings, uncertainty, evidence explanations) in やさしい日本語: short sentences, common words, spaces between phrases. Keep evidence.originalText in the document's own language; if that language is not Japanese, also fill translatedText with a Japanese rendering.",
  unknown:
    'Write every reader-facing string in the language of the document, using short plain sentences.',
};

export function buildSystemPrompt(
  language: Language,
  options: { includeFewShots?: boolean } = {},
): string {
  const sections = [SYSTEM_RULES, `LANGUAGE\n${LANGUAGE_RULE[language]}`];

  // OpenAI receives the complete JSON Schema through Structured Outputs, so
  // repeating full examples there adds cost and latency without adding a new
  // constraint. The smaller local model still benefits from examples.
  if (options.includeFewShots !== false) sections.push(fewShotBlock());

  return sections.join('\n\n');
}

export function buildUserPrompt(userDeclaredType?: string): string {
  const correction = userDeclaredType
    ? `\n\nThe user states this document is of type "${userDeclaredType}". Trust the user over your own classification, but still extract only values that appear in the image.`
    : '';
  return `Analyse the attached document image and return the JSON object.${correction}`;
}

/**
 * Two compact worked examples, one per demo family.
 *
 * Abbreviated on purpose: they teach the shape, the evidence linking, the
 * payment vocabulary and the refusal to guess, without spending the whole
 * context window. Example 1 carries the "the document does not state it, so it
 * goes in uncertainty" lesson, which is the failure mode that matters most.
 */
function fewShotBlock(): string {
  const koTax = {
    language: 'ko',
    country: 'KR',
    documentType: 'tax_notice',
    documentTypeLabel: '지방세 납세고지서',
    issuer: '서울 ○○구청',
    title: '2026년 정기분 재산세 납세고지서',
    summary: '재산세 86,400원을 9월 30일까지 내라는 고지서입니다.',
    importantDates: [
      {
        id: 'd1',
        label: '납기 내',
        isoDate: '2026-09-30',
        rawText: '2026.09.30까지',
        kind: 'deadline',
        evidenceIds: ['e2'],
        confidence: 0.97,
      },
      {
        id: 'd2',
        label: '납기 후',
        isoDate: '2026-10-31',
        rawText: '2026.10.31까지',
        kind: 'deadline',
        evidenceIds: ['e3'],
        confidence: 0.95,
      },
    ],
    amounts: [
      {
        id: 'a1',
        label: '납기 내 세액',
        value: 86400,
        currency: 'KRW',
        rawText: '86,400원',
        evidenceIds: ['e1'],
        confidence: 0.97,
      },
    ],
    recipientActions: [
      {
        id: 'ac1',
        title: '금액과 기한 확인하기',
        description: '고지서에 적힌 금액이 맞는지 보고, 기한을 달력에 적어 두세요.',
        deadline: '2026-09-30',
        requiredItems: ['고지서'],
        method: ['고지서의 납기 내 세액과 기한 칸을 봅니다.'],
        evidenceIds: ['e1', 'e2'],
        confidence: 0.95,
      },
    ],
    paymentOptions: [
      {
        id: 'p1',
        method: 'bank_counter',
        label: '전국 은행 창구',
        note: null,
        evidenceIds: ['e4'],
        confidence: 0.95,
      },
      {
        id: 'p2',
        method: 'atm',
        label: 'ATM 지방세 납부',
        note: '거래은행 ATM에서 납부번호 입력',
        evidenceIds: ['e5'],
        confidence: 0.93,
      },
      {
        id: 'p3',
        method: 'online_portal',
        label: '위택스',
        note: '07:00~23:30',
        evidenceIds: ['e5'],
        confidence: 0.93,
      },
    ],
    warnings: [],
    officialContacts: [
      {
        id: 'c1',
        organization: '서울 ○○구청',
        department: '세무과',
        phone: '02-0000-0000',
        url: null,
        hours: null,
        evidenceIds: ['e6'],
        source: 'document',
      },
    ],
    evidence: [
      {
        id: 'e1',
        originalText: '납기 내 세액 86,400원',
        explanation: '내야 하는 금액이 적힌 줄입니다.',
        page: 1,
      },
      {
        id: 'e2',
        originalText: '납기 내: 2026.09.30까지',
        explanation: '언제까지 내야 하는지 적힌 줄입니다.',
        page: 1,
      },
      {
        id: 'e3',
        originalText: '납기 후: 2026.10.31까지',
        explanation: '기한을 넘겼을 때의 두 번째 날짜입니다.',
        page: 1,
      },
      {
        id: 'e4',
        originalText: '납부장소: 전국 은행, 우체국, 새마을금고',
        explanation: '어디에서 낼 수 있는지 적힌 줄입니다.',
        page: 1,
      },
      {
        id: 'e5',
        originalText: 'ATM 납부, 위택스(www.wetax.go.kr) 07:00~23:30',
        explanation: '기계와 인터넷으로 내는 방법입니다.',
        page: 2,
      },
      {
        id: 'e6',
        originalText: '문의처 세무과 02-0000-0000',
        explanation: '문서에 적힌 담당 부서 전화번호입니다.',
        page: 1,
      },
    ],
    // The form prints the surcharge FORMULA but not a surcharge AMOUNT, so no
    // amount is reported for it. Computing one would be the exact mistake
    // rule 3 forbids.
    uncertainty: ['기한을 넘겼을 때의 가산금 액수는 고지서에 적혀 있지 않습니다.'],
    confidence: 0.94,
    requiresHumanVerification: false,
  };

  const jpUtility = {
    language: 'ko',
    country: 'JP',
    documentType: 'utility_bill',
    documentTypeLabel: '가스요금 납부용지 (일본)',
    issuer: '○○ガス',
    title: 'ガス料金 払込票',
    summary: '가스요금 8,181엔을 4월 30일까지 내라는 납부용지입니다.',
    importantDates: [
      {
        id: 'd1',
        label: '납부기한',
        isoDate: '2026-04-30',
        rawText: '2026年4月30日',
        kind: 'deadline',
        evidenceIds: ['e2'],
        confidence: 0.95,
      },
    ],
    amounts: [
      {
        id: 'a1',
        label: '청구 금액',
        value: 8181,
        currency: 'JPY',
        rawText: '8,181円',
        evidenceIds: ['e1'],
        confidence: 0.96,
      },
    ],
    recipientActions: [
      {
        id: 'ac1',
        title: '납부 방법 하나 고르기',
        description: '편의점, 스마트폰 앱, 은행 중에서 편한 곳을 고르세요.',
        deadline: '2026-04-30',
        requiredItems: ['납부용지'],
        method: ['용지 아래쪽 바코드를 편의점이나 앱에서 읽힙니다.'],
        evidenceIds: ['e3', 'e4'],
        confidence: 0.92,
      },
    ],
    paymentOptions: [
      {
        id: 'p1',
        method: 'convenience_store',
        label: 'コンビニ払い',
        note: null,
        evidenceIds: ['e3'],
        confidence: 0.94,
      },
      {
        id: 'p2',
        method: 'barcode_app',
        label: 'スマホ決済アプリ',
        note: 'バーコードを読み取り',
        evidenceIds: ['e4'],
        confidence: 0.92,
      },
    ],
    warnings: [],
    officialContacts: [
      {
        id: 'c1',
        organization: '○○ガス',
        department: 'お客さまセンター',
        phone: '000-000-0000',
        url: null,
        hours: null,
        evidenceIds: ['e5'],
        source: 'document',
      },
    ],
    evidence: [
      {
        id: 'e1',
        originalText: 'ご請求金額 8,181円',
        translatedText: '청구 금액 8,181엔',
        explanation: '내야 하는 금액입니다.',
        page: 1,
      },
      {
        id: 'e2',
        originalText: 'お支払期限 2026年4月30日',
        translatedText: '납부기한 2026년 4월 30일',
        explanation: '언제까지 내야 하는지입니다.',
        page: 1,
      },
      {
        id: 'e3',
        originalText: 'コンビニエンスストアでお支払いいただけます',
        translatedText: '편의점에서 납부할 수 있습니다',
        explanation: '편의점에서 낼 수 있다는 안내입니다.',
        page: 1,
      },
      {
        id: 'e4',
        originalText: 'スマートフォン決済アプリのバーコード読み取りに対応',
        translatedText: '스마트폰 결제앱 바코드 読み取り 지원',
        explanation: '앱으로 바코드를 찍어 낼 수 있다는 안내입니다.',
        page: 1,
      },
      {
        id: 'e5',
        originalText: 'お客さまセンター 000-000-0000',
        translatedText: '고객센터 000-000-0000',
        explanation: '용지에 적힌 문의처입니다.',
        page: 1,
      },
    ],
    uncertainty: [],
    confidence: 0.93,
    requiresHumanVerification: false,
  };

  return [
    'EXAMPLES (abbreviated - real output follows the same structure):',
    '',
    'Example 1 - Korean local tax notice. Note that the surcharge amount is NOT reported,',
    'because the form prints only the formula: the missing figure goes to "uncertainty".',
    JSON.stringify(koTax),
    '',
    'Example 2 - Japanese utility payment slip, explained in Korean for a Korean reader:',
    JSON.stringify(jpUtility),
  ].join('\n');
}

/**
 * JSON Schema for provider structured-output modes.
 *
 * Mirrors DocumentAnalysisSchema. Zod remains the enforcing layer on our side -
 * this only improves the odds of getting valid JSON back on the first call.
 */
export const ANALYSIS_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'language',
    'country',
    'documentType',
    'documentTypeLabel',
    'issuer',
    'title',
    'summary',
    'importantDates',
    'amounts',
    'recipientActions',
    'paymentOptions',
    'warnings',
    'officialContacts',
    'evidence',
    'uncertainty',
    'confidence',
    'requiresHumanVerification',
  ],
  properties: {
    language: { type: 'string', enum: ['ko', 'ja', 'unknown'] },
    country: { type: 'string', enum: ['KR', 'JP', 'unknown'] },
    documentType: {
      type: 'string',
      enum: [
        'tax_notice',
        'health_checkup',
        'welfare_application',
        'utility_bill',
        'public_office_notice',
        'pension_notice',
        'court_notice',
        'other',
        'unknown',
      ],
    },
    documentTypeLabel: { type: 'string' },
    issuer: { type: ['string', 'null'] },
    title: { type: 'string' },
    summary: { type: 'string', maxLength: 120 },
    importantDates: {
      type: 'array',
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'label', 'isoDate', 'rawText', 'kind', 'evidenceIds', 'confidence'],
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          isoDate: { type: ['string', 'null'] },
          rawText: { type: 'string' },
          kind: {
            type: 'string',
            enum: ['deadline', 'appointment', 'period_start', 'period_end', 'issued', 'other'],
          },
          evidenceIds: { type: 'array', items: { type: 'string' } },
          confidence: { type: 'number' },
        },
      },
    },
    amounts: {
      type: 'array',
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'label', 'value', 'currency', 'rawText', 'evidenceIds', 'confidence'],
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          value: { type: ['number', 'null'] },
          currency: { type: ['string', 'null'], enum: ['KRW', 'JPY', null] },
          rawText: { type: 'string' },
          evidenceIds: { type: 'array', items: { type: 'string' } },
          confidence: { type: 'number' },
        },
      },
    },
    recipientActions: {
      type: 'array',
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'title',
          'description',
          'deadline',
          'requiredItems',
          'method',
          'evidenceIds',
          'confidence',
        ],
        properties: {
          id: { type: 'string' },
          title: { type: 'string', maxLength: 60 },
          description: { type: 'string', maxLength: 100 },
          deadline: { type: ['string', 'null'] },
          requiredItems: { type: 'array', maxItems: 3, items: { type: 'string' } },
          method: {
            type: 'array',
            maxItems: 3,
            items: { type: 'string', maxLength: 70 },
          },
          evidenceIds: { type: 'array', items: { type: 'string' } },
          confidence: { type: 'number' },
        },
      },
    },
    paymentOptions: {
      type: 'array',
      maxItems: 6,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'method', 'label', 'note', 'evidenceIds', 'confidence'],
        properties: {
          id: { type: 'string' },
          method: {
            type: 'string',
            enum: [
              'bank_counter',
              'post_office',
              'convenience_store',
              'atm',
              'internet_banking',
              'ars',
              'credit_card',
              'online_portal',
              'barcode_app',
              'account_transfer',
              'help_desk',
            ],
          },
          label: { type: 'string', maxLength: 60 },
          note: { type: ['string', 'null'], maxLength: 80 },
          evidenceIds: { type: 'array', items: { type: 'string' } },
          confidence: { type: 'number' },
        },
      },
    },
    warnings: {
      type: 'array',
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'severity', 'message', 'evidenceIds'],
        properties: {
          id: { type: 'string' },
          severity: { type: 'string', enum: ['info', 'caution', 'critical'] },
          message: { type: 'string', maxLength: 160 },
          evidenceIds: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    officialContacts: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'organization',
          'department',
          'phone',
          'url',
          'hours',
          'evidenceIds',
          'source',
        ],
        properties: {
          id: { type: 'string' },
          organization: { type: 'string' },
          department: { type: ['string', 'null'] },
          phone: { type: ['string', 'null'] },
          url: { type: ['string', 'null'] },
          hours: { type: ['string', 'null'] },
          evidenceIds: { type: 'array', items: { type: 'string' } },
          source: { type: 'string', enum: ['document', 'not_found'] },
        },
      },
    },
    evidence: {
      type: 'array',
      maxItems: 10,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'originalText', 'explanation'],
        properties: {
          id: { type: 'string' },
          originalText: { type: 'string', maxLength: 200 },
          translatedText: { type: 'string', maxLength: 200 },
          explanation: { type: 'string', maxLength: 120 },
          page: { type: 'integer' },
          region: {
            type: 'object',
            additionalProperties: false,
            required: ['x', 'y', 'width', 'height'],
            properties: {
              x: { type: 'number' },
              y: { type: 'number' },
              width: { type: 'number' },
              height: { type: 'number' },
            },
          },
        },
      },
    },
    uncertainty: {
      type: 'array',
      maxItems: 3,
      items: { type: 'string', maxLength: 80 },
    },
    confidence: { type: 'number' },
    requiresHumanVerification: { type: 'boolean' },
  },
} as const;
