/**
 * Server-side hardening.
 *
 * Schema validation proves the model returned the right *shape*. This pass
 * enforces the product's safety rules on the *content*, and it runs on every
 * analysis including fixtures, so demo mode and live mode behave identically.
 *
 * Rules live here rather than in the prompt because a prompt is a suggestion
 * and this is a guarantee.
 */
import {
  type ActionCard,
  type ContactItem,
  type DocumentAnalysis,
  type PaymentOption,
  type Language,
  type ModelAnalysis,
  type WarningItem,
  HIGH_RISK_DOCUMENT_TYPES,
  MAX_ACTION_CARDS,
} from './schema';

type WarnKey =
  | 'lowConfidence'
  | 'unverifiedDate'
  | 'unverifiedAmount'
  | 'unverifiedContact'
  | 'unverifiedPayment'
  | 'noEvidence'
  | 'courtDocument'
  | 'medicalDocument'
  | 'neverPays'
  | 'demoMode'
  | 'unknownType';

const TEXT: Record<Language, Record<WarnKey, string>> = {
  ko: {
    lowConfidence:
      '문서를 정확히 읽지 못했습니다. 원문을 다시 확인하거나 공식기관에 문의하세요.',
    unverifiedDate:
      '날짜를 원문에서 확실하게 확인하지 못했습니다. 문서의 날짜를 직접 확인하세요.',
    unverifiedAmount:
      '금액을 원문에서 확실하게 확인하지 못했습니다. 문서의 금액을 직접 확인하세요.',
    unverifiedContact:
      '문서에서 연락처를 확인하지 못했습니다. 기관의 공식 홈페이지에서 번호를 확인하세요.',
    unverifiedPayment:
      '문서에 적혀 있지 않은 납부 방법은 지웠습니다. 납부 방법은 고지서 뒷면이나 기관에 확인하세요.',
    noEvidence:
      '원문 근거를 찾지 못한 내용이 있습니다. 확정된 사실로 받아들이지 마세요.',
    courtDocument:
      '법원 관련 문서로 보입니다. AI는 법률 판단을 하지 않습니다. 법원 공식번호나 법률 상담기관에 문의하세요.',
    medicalDocument:
      '건강 관련 안내입니다. AI는 진단하지 않습니다. 건강 상태에 관한 질문은 의료기관에 문의하세요.',
    neverPays:
      'AI Door는 대신 돈을 보내거나 신청을 제출하지 않습니다. 납부와 신청은 직접 하세요.',
    demoMode: '지금은 데모 모드입니다. 실제 AI 분석 결과가 아닙니다.',
    unknownType: '문서의 종류를 확실하게 알지 못했습니다. 종류를 직접 골라 주세요.',
  },
  ja: {
    lowConfidence:
      '文書を 正しく 読み取れませんでした。原本を もう一度 確認するか、公式機関に お問い合わせください。',
    unverifiedDate:
      '日付を 原本で はっきり 確認できませんでした。文書の 日付を 直接 ご確認ください。',
    unverifiedAmount:
      '金額を 原本で はっきり 確認できませんでした。文書の 金額を 直接 ご確認ください。',
    unverifiedContact:
      '文書から 連絡先を 確認できませんでした。機関の 公式サイトで 番号を ご確認ください。',
    unverifiedPayment:
      '文書に 書かれていない 支払い方法は 消しました。支払い方法は 用紙の 裏面か 窓口で ご確認ください。',
    noEvidence:
      '原文の 根拠が 見つからない 内容が あります。確定した 事実として 受け取らないで ください。',
    courtDocument:
      '裁判所に 関する 文書のようです。AIは 法律の 判断を しません。裁判所の 公式番号か 法律相談窓口に お問い合わせください。',
    medicalDocument:
      '健康に 関する お知らせです。AIは 診断を しません。健康状態の ご質問は 医療機関へ どうぞ。',
    neverPays:
      'AI Doorが 代わりに お金を 送ったり 申請を 出したり する ことは ありません。',
    demoMode: '今は デモモードです。実際の AI分析結果では ありません。',
    unknownType: '文書の 種類を はっきり 判断できませんでした。種類を 選んで ください。',
  },
  unknown: {
    lowConfidence:
      'The document could not be read reliably. Please verify with the issuing office.',
    unverifiedDate: 'A date could not be verified against the document text.',
    unverifiedAmount: 'An amount could not be verified against the document text.',
    unverifiedContact: 'No contact details were confirmed in the document.',
    unverifiedPayment: 'Payment routes not stated in the document were removed.',
    noEvidence: 'Some statements have no supporting quote from the document.',
    courtDocument:
      'This looks like a court document. This app does not give legal advice.',
    medicalDocument: 'This is a health notice. This app does not diagnose.',
    neverPays: 'AI Door never sends money or submits applications on your behalf.',
    demoMode: 'Demo mode. This is not a live AI analysis.',
    unknownType: 'The document type could not be determined.',
  },
};

const SEVERITY: Record<WarnKey, WarningItem['severity']> = {
  lowConfidence: 'critical',
  unverifiedDate: 'caution',
  unverifiedAmount: 'caution',
  unverifiedContact: 'caution',
  unverifiedPayment: 'caution',
  noEvidence: 'caution',
  courtDocument: 'critical',
  medicalDocument: 'caution',
  neverPays: 'info',
  demoMode: 'info',
  unknownType: 'caution',
};

const SEVERITY_ORDER: Record<WarningItem['severity'], number> = {
  critical: 0,
  caution: 1,
  info: 2,
};

function bySeverity(a: WarningItem, b: WarningItem): number {
  return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
}

/** Confidence at or below this is treated as "do not present as fact". */
export const LOW_CONFIDENCE_THRESHOLD = 0.55;

/** A phone number we are willing to display: digits, spaces, dashes, parens, +. */
const PHONE_SHAPE = /^[+(\d][\d\s\-()]{6,}$/;

/** Only http(s). A "javascript:" official site is not a thing. */
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export interface HardenOptions {
  language: Language;
  isDemoMode: boolean;
}

/**
 * Applies every safety rule and returns an analysis the UI can render without
 * second-guessing any field.
 */
export function hardenAnalysis(
  model: ModelAnalysis,
  options: HardenOptions,
): DocumentAnalysis {
  const lang: Language = TEXT[options.language] ? options.language : 'unknown';
  const warnings: WarningItem[] = [];
  const seen = new Set<string>();
  const uncertainty = [...model.uncertainty];

  const addWarning = (key: WarnKey, evidenceIds: string[] = []) => {
    if (seen.has(key)) return;
    seen.add(key);
    warnings.push({
      id: key,
      severity: SEVERITY[key],
      message: TEXT[lang][key],
      evidenceIds,
    });
  };

  // Keep warnings the provider itself raised - fixtures carry scenario-specific
  // cautions this way - then layer our own rules on top.
  for (const warning of model.warnings) {
    if (seen.has(warning.id)) continue;
    seen.add(warning.id);
    warnings.push(warning);
  }

  const knownEvidenceIds = new Set(model.evidence.map((item) => item.id));
  /** Drops evidence ids pointing at nothing - a broken link is not a source. */
  const cleanIds = (ids: string[]) => ids.filter((id) => knownEvidenceIds.has(id));

  // --- Rule 1: no evidence, no certainty -----------------------------------
  const importantDates = model.importantDates.map((date) => {
    const evidenceIds = cleanIds(date.evidenceIds);
    const grounded = evidenceIds.length > 0;
    if (!grounded) {
      addWarning('unverifiedDate');
      uncertainty.push(`${date.label}: ${TEXT[lang].unverifiedDate}`);
    }
    return {
      ...date,
      evidenceIds,
      // An ungrounded date must not reach the calendar button.
      isoDate: grounded ? date.isoDate : null,
      confidence: grounded ? date.confidence : Math.min(date.confidence, 0.4),
    };
  });

  const amounts = model.amounts.map((amount) => {
    const evidenceIds = cleanIds(amount.evidenceIds);
    const grounded = evidenceIds.length > 0;
    if (!grounded) {
      addWarning('unverifiedAmount');
      uncertainty.push(`${amount.label}: ${TEXT[lang].unverifiedAmount}`);
    }
    return {
      ...amount,
      evidenceIds,
      value: grounded ? amount.value : null,
      confidence: grounded ? amount.confidence : Math.min(amount.confidence, 0.4),
    };
  });

  // --- Rule 2: contact details are never guessed ---------------------------
  const officialContacts: ContactItem[] = model.officialContacts.map((contact) => {
    const evidenceIds = cleanIds(contact.evidenceIds);
    const grounded = contact.source === 'document' && evidenceIds.length > 0;
    if (!grounded) {
      addWarning('unverifiedContact');
      // Keep the organisation name - useful for "공식 홈페이지에서 찾아보세요" -
      // but drop everything the user could dial or click.
      return {
        ...contact,
        evidenceIds,
        phone: null,
        url: null,
        source: 'not_found' as const,
      };
    }
    return {
      ...contact,
      evidenceIds,
      phone:
        contact.phone !== null && PHONE_SHAPE.test(contact.phone.trim())
          ? contact.phone
          : null,
      url: contact.url !== null && isSafeUrl(contact.url) ? contact.url : null,
    };
  });

  // --- Rule 3: at most three doors, each one grounded ----------------------
  const recipientActions: ActionCard[] = model.recipientActions
    .slice(0, MAX_ACTION_CARDS)
    .map((action) => {
      const evidenceIds = cleanIds(action.evidenceIds);
      if (evidenceIds.length === 0) addWarning('noEvidence');
      return {
        ...action,
        evidenceIds,
        confidence:
          evidenceIds.length > 0
            ? action.confidence
            : Math.min(action.confidence, 0.4),
      };
    });

  // --- Rule 4: a payment route the document does not state is not offered --
  const paymentOptions: PaymentOption[] = [];
  const seenMethods = new Set<string>();
  for (const option of model.paymentOptions) {
    const evidenceIds = cleanIds(option.evidenceIds);
    if (evidenceIds.length === 0) {
      addWarning('unverifiedPayment');
      continue;
    }
    // One row per rail. Two quotes for the same method is one option.
    if (seenMethods.has(option.method)) continue;
    seenMethods.add(option.method);
    paymentOptions.push({ ...option, evidenceIds });
  }

  // --- Rule 5: document families that must end at a human ------------------
  const isHighRisk = HIGH_RISK_DOCUMENT_TYPES.includes(model.documentType);
  if (model.documentType === 'court_notice') addWarning('courtDocument');
  if (model.documentType === 'health_checkup') addWarning('medicalDocument');
  if (model.documentType === 'unknown') addWarning('unknownType');
  if (amounts.length > 0 || model.documentType === 'tax_notice') {
    addWarning('neverPays');
  }
  if (options.isDemoMode) addWarning('demoMode');

  // --- Rule 6: confidence and the human-review gate ------------------------
  let confidence = model.confidence;
  if (model.evidence.length === 0) {
    confidence = Math.min(confidence, 0.3);
    addWarning('noEvidence');
  }
  if (confidence <= LOW_CONFIDENCE_THRESHOLD) addWarning('lowConfidence');

  const ungroundedFact =
    importantDates.some((date) => date.evidenceIds.length === 0) ||
    amounts.some((amount) => amount.evidenceIds.length === 0);

  const requiresHumanVerification =
    model.requiresHumanVerification ||
    isHighRisk ||
    confidence <= LOW_CONFIDENCE_THRESHOLD ||
    model.documentType === 'unknown' ||
    ungroundedFact;

  return {
    language: model.language,
    country: model.country,
    documentType: model.documentType,
    documentTypeLabel: model.documentTypeLabel,
    issuer: model.issuer,
    title: model.title,
    summary: model.summary,
    importantDates,
    amounts,
    recipientActions,
    paymentOptions,
    // Four at most, and the most serious first: truncating a list that got
    // long must never be what removes the court or low-confidence warning.
    warnings: warnings.sort(bySeverity).slice(0, 4),
    officialContacts,
    evidence: model.evidence,
    uncertainty: Array.from(new Set(uncertainty)).slice(0, 3),
    confidence,
    requiresHumanVerification,
  };
}

/**
 * Post-validation triggers for the OpenAI fallback model.
 *
 * These are the spec's conditions for one re-analysis with the stronger model.
 * Each means "the first answer is not safe to show", not "it is imperfect" -
 * a second call costs money and latency, so the bar is deliberately high.
 */
export function needsSecondOpinion(analysis: DocumentAnalysis): {
  needed: boolean;
  reason: string | null;
} {
  if (analysis.documentType === 'unknown') {
    return { needed: true, reason: 'unknown_document_type' };
  }
  if (analysis.confidence <= LOW_CONFIDENCE_THRESHOLD) {
    return { needed: true, reason: 'low_confidence' };
  }
  if (analysis.evidence.length === 0) {
    return { needed: true, reason: 'no_evidence' };
  }
  if (analysis.recipientActions.some((action) => action.evidenceIds.length === 0)) {
    return { needed: true, reason: 'no_evidence' };
  }

  // The same labelled date or amount appearing with two different values means
  // the document was read inconsistently.
  const dateByLabel = new Map<string, string | null>();
  for (const date of analysis.importantDates) {
    if (dateByLabel.has(date.label) && dateByLabel.get(date.label) !== date.isoDate) {
      return { needed: true, reason: 'conflicting_values' };
    }
    dateByLabel.set(date.label, date.isoDate);
  }

  const amountByLabel = new Map<string, number | null>();
  for (const amount of analysis.amounts) {
    if (
      amountByLabel.has(amount.label) &&
      amountByLabel.get(amount.label) !== amount.value
    ) {
      return { needed: true, reason: 'conflicting_values' };
    }
    amountByLabel.set(amount.label, amount.value);
  }

  return { needed: false, reason: null };
}
