/**
 * Common DocumentAnalysis schema.
 *
 * Every provider - OpenAI, Ollama, Fixture - returns exactly this shape, so the
 * UI never learns which one ran.
 *
 * Two rules are encoded structurally rather than requested in the prompt:
 *   1. Facts carry `evidenceIds`. A date, amount or phone number with no
 *      evidence cannot be presented as confirmed (see harden.ts).
 *   2. Unknown means null / "unknown" / requiresHumanVerification - never a
 *      plausible guess.
 */
import { z } from 'zod';

export const SCHEMA_VERSION = '2.0' as const;

export const LanguageSchema = z.enum(['ko', 'ja', 'unknown']);
export type Language = z.infer<typeof LanguageSchema>;

export const CountrySchema = z.enum(['KR', 'JP', 'unknown']);
export type Country = z.infer<typeof CountrySchema>;

/**
 * Controlled document vocabulary. It is still a string as the spec requires,
 * but a closed set lets tutorials and practice scenarios be matched by type
 * instead of by fuzzy label comparison.
 */
export const DOCUMENT_TYPE_IDS = [
  'tax_notice',
  'health_checkup',
  'welfare_application',
  'utility_bill',
  'public_office_notice',
  'pension_notice',
  'court_notice',
  'other',
  'unknown',
] as const;

export const DocumentTypeSchema = z.enum(DOCUMENT_TYPE_IDS);
export type DocumentTypeId = z.infer<typeof DocumentTypeSchema>;

/** Families that must always end at a human or an official channel. */
export const HIGH_RISK_DOCUMENT_TYPES: readonly DocumentTypeId[] = ['court_notice'];

/** Normalised 0..1 rectangle over the page image, for the Evidence Lens. */
export const RegionSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
});
export type Region = z.infer<typeof RegionSchema>;

export const EvidenceItemSchema = z.object({
  id: z.string().min(1).max(40),
  /** Verbatim source text. Never paraphrased. */
  originalText: z.string().min(1).max(400),
  /** Present when the document language differs from the UI language. */
  translatedText: z.string().max(400).optional(),
  /** Why this line matters, in plain words. */
  explanation: z.string().min(1).max(300),
  page: z.number().int().positive().optional(),
  region: RegionSchema.optional(),
});
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

export const DATE_KINDS = [
  'deadline',
  'appointment',
  'period_start',
  'period_end',
  'issued',
  'other',
] as const;

export const ImportantDateSchema = z.object({
  id: z.string().min(1).max(40),
  /** e.g. "납부기한", "予約期限". */
  label: z.string().min(1).max(60),
  /** ISO 8601 when parseable, otherwise null. */
  isoDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  /** Exactly as written in the document. */
  rawText: z.string().min(1).max(80),
  kind: z.enum(DATE_KINDS),
  evidenceIds: z.array(z.string().max(40)).max(5),
  confidence: z.number().min(0).max(1),
});
export type ImportantDate = z.infer<typeof ImportantDateSchema>;

export const AmountItemSchema = z.object({
  id: z.string().min(1).max(40),
  label: z.string().min(1).max(60),
  value: z.number().nonnegative().nullable(),
  currency: z.enum(['KRW', 'JPY']).nullable(),
  rawText: z.string().min(1).max(60),
  evidenceIds: z.array(z.string().max(40)).max(5),
  confidence: z.number().min(0).max(1),
});
export type AmountItem = z.infer<typeof AmountItemSchema>;

export const ActionCardSchema = z.object({
  id: z.string().min(1).max(40),
  title: z.string().min(1).max(60),
  description: z.string().min(1).max(240),
  /** ISO date the action must happen by, when the document says so. */
  deadline: z.string().nullable(),
  requiredItems: z.array(z.string().min(1).max(80)).max(6),
  /** How to do it - official routes only. */
  method: z.array(z.string().min(1).max(160)).max(5),
  /** Explicit "do not do this" list. Phishing and automation traps live here. */
  doNotDo: z.array(z.string().min(1).max(160)).max(5),
  evidenceIds: z.array(z.string().max(40)).max(6),
  confidence: z.number().min(0).max(1),
});
export type ActionCard = z.infer<typeof ActionCardSchema>;

/** Hard cap from the deck: never more than three doors at once. */
export const MAX_ACTION_CARDS = 3;

export const WarningItemSchema = z.object({
  id: z.string().min(1).max(40),
  severity: z.enum(['info', 'caution', 'critical']),
  message: z.string().min(1).max(300),
  evidenceIds: z.array(z.string().max(40)).max(5).default([]),
});
export type WarningItem = z.infer<typeof WarningItemSchema>;

/**
 * Contact details are the most dangerous field to hallucinate - a wrong
 * "official" number is a phishing vector. `source` must be 'document' or the
 * UI hides everything dialable.
 */
export const ContactItemSchema = z.object({
  id: z.string().min(1).max(40),
  organization: z.string().min(1).max(120),
  department: z.string().max(120).nullable(),
  phone: z.string().max(40).nullable(),
  url: z.string().max(300).nullable(),
  hours: z.string().max(120).nullable(),
  evidenceIds: z.array(z.string().max(40)).max(5),
  source: z.enum(['document', 'not_found']),
});
export type ContactItem = z.infer<typeof ContactItemSchema>;

export const DocumentAnalysisSchema = z.object({
  language: LanguageSchema,
  country: CountrySchema,
  documentType: DocumentTypeSchema,
  /** Localised label, e.g. "지방세 납부 안내문". */
  documentTypeLabel: z.string().min(1).max(80),
  issuer: z.string().max(120).nullable(),
  title: z.string().min(1).max(120),
  /** One sentence. The first thing shown on the result screen. */
  summary: z.string().min(1).max(300),
  importantDates: z.array(ImportantDateSchema).max(8),
  amounts: z.array(AmountItemSchema).max(8),
  recipientActions: z.array(ActionCardSchema).max(MAX_ACTION_CARDS),
  warnings: z.array(WarningItemSchema).max(10),
  officialContacts: z.array(ContactItemSchema).max(5),
  evidence: z.array(EvidenceItemSchema).max(24),
  /** Plain-language list of what could not be confirmed. */
  uncertainty: z.array(z.string().min(1).max(200)).max(8),
  confidence: z.number().min(0).max(1),
  requiresHumanVerification: z.boolean(),
});
export type DocumentAnalysis = z.infer<typeof DocumentAnalysisSchema>;

/**
 * What the model is asked for. The server owns `warnings` and
 * `requiresHumanVerification`, so the model's self-report is a suggestion that
 * harden.ts can only escalate, never relax.
 */
export const ModelAnalysisSchema = DocumentAnalysisSchema.extend({
  warnings: z.array(WarningItemSchema).max(10).default([]),
  requiresHumanVerification: z.boolean().default(false),
  uncertainty: z.array(z.string().min(1).max(200)).max(8).default([]),
});
export type ModelAnalysis = z.infer<typeof ModelAnalysisSchema>;

// ---------------------------------------------------------------------------
// Provider plumbing
// ---------------------------------------------------------------------------

export const PROVIDER_IDS = ['openai', 'ollama', 'fixture'] as const;
export const ProviderIdSchema = z.enum(PROVIDER_IDS);
export type ProviderId = z.infer<typeof ProviderIdSchema>;

export const ANALYSIS_ERROR_CODES = [
  'missing_credentials',
  'upload_too_large',
  'unsupported_type',
  'timeout',
  'provider_unreachable',
  'provider_error',
  'invalid_json',
  'schema_violation',
  'unknown_document_type',
  'conflicting_values',
  'low_confidence',
  'no_evidence',
  'unknown',
] as const;
export type AnalysisErrorCode = (typeof ANALYSIS_ERROR_CODES)[number];

export interface AnalysisError {
  code: AnalysisErrorCode;
  /** Operator-facing. Never contains document text or base64. */
  detail: string;
  retryable: boolean;
}

export interface AnalysisAttempt {
  provider: ProviderId;
  model: string | null;
  /** 'primary' | 'fallback' | 'retry' - which slot in the chain this was. */
  role: 'primary' | 'retry' | 'fallback';
  ok: boolean;
  errorCode: AnalysisErrorCode | null;
  elapsedMs: number;
}

export interface AnalysisMeta {
  provider: ProviderId;
  requestedProvider: ProviderId;
  model: string | null;
  /** True when the analysed document is one of our synthetic demo documents. */
  synthetic: boolean;
  fixtureId: string | null;
  /** True when we degraded to fixtures. The UI must say so. */
  fellBack: boolean;
  fallbackReason: AnalysisErrorCode | null;
  /** Every attempt made, for the model-comparison record. */
  attempts: AnalysisAttempt[];
  totalElapsedMs: number;
  schemaVersion: typeof SCHEMA_VERSION;
}

export type AnalysisOutcome =
  | { ok: true; analysis: DocumentAnalysis; meta: AnalysisMeta }
  | { ok: false; error: AnalysisError; meta: AnalysisMeta };

// ---------------------------------------------------------------------------
// Lookup helpers used across screens
// ---------------------------------------------------------------------------

export function evidenceById(
  analysis: DocumentAnalysis,
  id: string,
): EvidenceItem | undefined {
  return analysis.evidence.find((item) => item.id === id);
}

export function evidenceFor(
  analysis: DocumentAnalysis,
  ids: string[],
): EvidenceItem[] {
  return ids
    .map((id) => evidenceById(analysis, id))
    .filter((item): item is EvidenceItem => item !== undefined);
}

/** The single most urgent date: the nearest deadline, else the first date. */
export function primaryDate(analysis: DocumentAnalysis): ImportantDate | null {
  const deadlines = analysis.importantDates.filter(
    (date) => date.kind === 'deadline' || date.kind === 'appointment',
  );
  const pool = deadlines.length > 0 ? deadlines : analysis.importantDates;
  if (pool.length === 0) return null;

  const dated = pool.filter((date) => date.isoDate !== null);
  if (dated.length === 0) return pool[0];

  return dated.reduce((earliest, candidate) =>
    (candidate.isoDate ?? '') < (earliest.isoDate ?? '') ? candidate : earliest,
  );
}

/** The amount the user actually has to pay, when there is one. */
export function primaryAmount(analysis: DocumentAnalysis): AmountItem | null {
  return analysis.amounts[0] ?? null;
}
