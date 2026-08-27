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

export const PROMPT_VERSION = '2026-08-27.2';

/** The ten principles, stated as machine instructions. */
const SYSTEM_RULES = `
You are an assistant that helps older adults in Korea and Japan understand official/administrative documents.

1. You assist understanding. You never make legal, tax, or medical decisions for the user.
2. Use ONLY information visible in the provided document. Never fill gaps from general knowledge.
3. Never invent a date, an amount, an account number, a phone number, a URL, or a case number. If the document does not state it, omit the item or set the value to null.
4. Every date, amount, action and contact MUST reference at least one evidence id. Evidence "originalText" is copied verbatim from the document - never paraphrased, never translated in that field.
5. Produce AT MOST 3 items in recipientActions. Each describes something the USER does next. Never an action that sends money, submits an application, or takes a legal/medical decision on their behalf.
6. Replace administrative jargon with everyday words. One idea per sentence. Short sentences. A 78-year-old reading quickly must be able to follow.
7. For a court document (documentType "court_notice"): report only the document type, any response deadline, and the official contact. Do not assess the legal situation or advise a course of action.
8. For a health document (documentType "health_checkup"): report only what is written. Never diagnose, never interpret results, never comment on the user's health.
9. If anything is unreadable, ambiguous, or self-contradictory: lower "confidence", list the problem in "uncertainty", and set "requiresHumanVerification" to true.
10. Return ONLY the JSON object matching the schema. No markdown fences, no commentary before or after.

FIELD NOTES
- "summary" is ONE sentence: what this document wants from the reader.
- "importantDates[].rawText" is exactly as printed; "isoDate" is null when the printed form cannot be resolved to a calendar date.
- "officialContacts[].source" is "document" only when the contact appears in the document. Otherwise "not_found" with phone and url set to null.
- "confidence" is 0.0-1.0 for the analysis as a whole. Use below 0.55 when you would not want the reader to act on this without checking.
- "uncertainty" is a plain-language list for the reader, not for a developer.
`.trim();

const LANGUAGE_RULE: Record<Language, string> = {
  ko: 'Write every reader-facing string (title, documentTypeLabel, summary, labels, action titles/descriptions, warnings, uncertainty, evidence explanations) in short plain Korean. Keep evidence.originalText in the document\'s own language; if that language is not Korean, also fill translatedText with a Korean rendering.',
  ja: 'Write every reader-facing string (title, documentTypeLabel, summary, labels, action titles/descriptions, warnings, uncertainty, evidence explanations) in やさしい日本語: short sentences, common words, spaces between phrases. Keep evidence.originalText in the document\'s own language; if that language is not Japanese, also fill translatedText with a Japanese rendering.',
  unknown:
    'Write every reader-facing string in the language of the document, using short plain sentences.',
};

export function buildSystemPrompt(
  language: Language,
  options: { includeFewShots?: boolean } = {},
): string {
  const sections = [SYSTEM_RULES, `LANGUAGE\n${LANGUAGE_RULE[language]}`];

  // OpenAI receives the complete JSON Schema through Structured Outputs, so
  // repeating three full examples there adds cost and latency without adding
  // a new constraint. The smaller local model still benefits from examples.
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
 * Three compact worked examples covering the demo document families.
 *
 * Abbreviated on purpose: they teach the shape, the evidence linking, and the
 * refusal to guess, without spending the whole context window. Example 3
 * exists specifically to show the correct handling of an amount the document
 * does not state.
 */
function fewShotBlock(): string {
  const koTax = {
    language: 'ko',
    country: 'KR',
    documentType: 'tax_notice',
    documentTypeLabel: '지방세 납부 안내문',
    issuer: '서울 ○○구청',
    title: '2026년 지방세 납부 안내',
    summary: '재산세 86,400원을 9월 30일까지 납부하라는 안내입니다.',
    importantDates: [
      {
        id: 'd1',
        label: '납부기한',
        isoDate: '2026-09-30',
        rawText: '2026년 9월 30일',
        kind: 'deadline',
        evidenceIds: ['e2'],
        confidence: 0.97,
      },
    ],
    amounts: [
      {
        id: 'a1',
        label: '납부 세액',
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
        method: ['고지서의 납부 세액과 납부 기한 칸을 확인합니다.'],
        doNotDo: ['금액이 기억과 다르면 바로 납부하지 마세요.'],
        evidenceIds: ['e1', 'e2'],
        confidence: 0.95,
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
        evidenceIds: ['e3'],
        source: 'document',
      },
    ],
    evidence: [
      {
        id: 'e1',
        originalText: '납부 세액: 86,400원',
        explanation: '내야 하는 금액이 적힌 줄입니다.',
        page: 1,
      },
      {
        id: 'e2',
        originalText: '납부 기한: 2026년 9월 30일',
        explanation: '언제까지 내야 하는지 적힌 줄입니다.',
        page: 1,
      },
      {
        id: 'e3',
        originalText: '전화 02-0000-0000',
        explanation: '문서에 적힌 담당 부서 전화번호입니다.',
        page: 1,
      },
    ],
    uncertainty: [],
    confidence: 0.95,
    requiresHumanVerification: false,
  };

  const jpHealth = {
    language: 'ko',
    country: 'JP',
    documentType: 'health_checkup',
    documentTypeLabel: '건강검진 안내문 (일본)',
    issuer: '○○市',
    title: '特定健康診査のお知らせ',
    summary: '11월 20일까지 예약하고 12월 5일에 건강검진을 받으라는 안내입니다.',
    importantDates: [
      {
        id: 'd1',
        label: '예약기한',
        isoDate: '2026-11-20',
        rawText: '2026年11月20日まで',
        kind: 'deadline',
        evidenceIds: ['e1'],
        confidence: 0.94,
      },
      {
        id: 'd2',
        label: '검진일',
        isoDate: '2026-12-05',
        rawText: '2026年12月5日',
        kind: 'appointment',
        evidenceIds: ['e2'],
        confidence: 0.94,
      },
    ],
    amounts: [],
    recipientActions: [
      {
        id: 'ac1',
        title: '검진 예약하기',
        description: '11월 20일까지 안내문에 적힌 번호로 전화해 예약하세요.',
        deadline: '2026-11-20',
        requiredItems: ['안내문', '보험증'],
        method: ['문서에 적힌 문의처로 전화해서 예약합니다.'],
        doNotDo: ['예약 없이 그냥 방문하지 마세요.'],
        evidenceIds: ['e1', 'e3'],
        confidence: 0.9,
      },
    ],
    warnings: [],
    officialContacts: [
      {
        id: 'c1',
        organization: '○○市',
        department: '健康推進課',
        phone: '000-000-0000',
        url: null,
        hours: null,
        evidenceIds: ['e3'],
        source: 'document',
      },
    ],
    evidence: [
      {
        id: 'e1',
        originalText: '予約期限: 2026年11月20日まで',
        translatedText: '예약기한: 2026년 11월 20일까지',
        explanation: '언제까지 예약해야 하는지 적힌 줄입니다.',
        page: 1,
      },
      {
        id: 'e2',
        originalText: '健診日: 2026年12月5日',
        translatedText: '검진일: 2026년 12월 5일',
        explanation: '검진을 받는 날짜입니다.',
        page: 1,
      },
      {
        id: 'e3',
        originalText: '問い合わせ先: 健康推進課 000-000-0000',
        translatedText: '문의처: 건강추진과 000-000-0000',
        explanation: '문서에 적힌 문의처입니다.',
        page: 1,
      },
    ],
    uncertainty: [],
    confidence: 0.92,
    requiresHumanVerification: false,
  };

  const koWelfare = {
    language: 'ko',
    country: 'KR',
    documentType: 'welfare_application',
    documentTypeLabel: '복지 신청 안내문',
    issuer: '○○동 주민센터',
    title: '에너지바우처 신청 안내',
    summary: '10월 31일까지 주민센터에 방문해 신청하라는 안내입니다.',
    importantDates: [
      {
        id: 'd1',
        label: '신청기한',
        isoDate: '2026-10-31',
        rawText: '2026년 10월 31일까지',
        kind: 'deadline',
        evidenceIds: ['e1'],
        confidence: 0.95,
      },
    ],
    // The document says the amount depends on the household and is decided
    // later, so there is no amount to report. Reporting a typical figure here
    // would be the exact mistake rule 3 forbids.
    amounts: [],
    recipientActions: [
      {
        id: 'ac1',
        title: '신청 서류 준비하기',
        description: '신분증과 신청서를 준비해 주민센터에 방문하세요.',
        deadline: '2026-10-31',
        requiredItems: ['신분증', '신청서'],
        method: ['주소지 주민센터에 방문해서 신청합니다.'],
        doNotDo: ['지원 금액을 미리 짐작하지 마세요. 심사 후에 정해집니다.'],
        evidenceIds: ['e1', 'e2'],
        confidence: 0.9,
      },
    ],
    warnings: [],
    officialContacts: [],
    evidence: [
      {
        id: 'e1',
        originalText: '신청 기간: 2026년 10월 31일까지',
        explanation: '언제까지 신청해야 하는지 적힌 줄입니다.',
        page: 1,
      },
      {
        id: 'e2',
        originalText: '준비 서류: 신분증, 신청서',
        explanation: '무엇을 가져가야 하는지 적힌 줄입니다.',
        page: 1,
      },
    ],
    uncertainty: ['지원 금액은 문서에 적혀 있지 않습니다. 주민센터에 문의하세요.'],
    confidence: 0.91,
    requiresHumanVerification: false,
  };

  return [
    'EXAMPLES (abbreviated - real output follows the same structure):',
    '',
    'Example 1 - Korean local tax notice:',
    JSON.stringify(koTax),
    '',
    'Example 2 - Japanese health checkup notice, explained in Korean:',
    JSON.stringify(jpHealth),
    '',
    'Example 3 - Korean welfare notice where the document states NO amount.',
    'Note that "amounts" is empty and the missing figure is listed in "uncertainty" instead of being guessed:',
    JSON.stringify(koWelfare),
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
    summary: { type: 'string' },
    importantDates: {
      type: 'array',
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
          'doNotDo',
          'evidenceIds',
          'confidence',
        ],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          deadline: { type: ['string', 'null'] },
          requiredItems: { type: 'array', items: { type: 'string' } },
          method: { type: 'array', items: { type: 'string' } },
          doNotDo: { type: 'array', items: { type: 'string' } },
          evidenceIds: { type: 'array', items: { type: 'string' } },
          confidence: { type: 'number' },
        },
      },
    },
    warnings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'severity', 'message', 'evidenceIds'],
        properties: {
          id: { type: 'string' },
          severity: { type: 'string', enum: ['info', 'caution', 'critical'] },
          message: { type: 'string' },
          evidenceIds: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    officialContacts: {
      type: 'array',
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
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'originalText', 'explanation'],
        properties: {
          id: { type: 'string' },
          originalText: { type: 'string' },
          translatedText: { type: 'string' },
          explanation: { type: 'string' },
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
    uncertainty: { type: 'array', items: { type: 'string' } },
    confidence: { type: 'number' },
    requiresHumanVerification: { type: 'boolean' },
  },
} as const;
