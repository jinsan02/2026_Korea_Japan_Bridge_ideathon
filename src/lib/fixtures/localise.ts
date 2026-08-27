/**
 * Builds the other-language version of a fixture analysis.
 *
 * The language toggle has to produce a Japanese reading of the Korean tax
 * notice and a Korean reading of the Japanese gas slip. Writing each one out
 * by hand twice invites the failure that matters most: two versions of the
 * same document quietly disagreeing about a number, or one of them losing an
 * evidence link and so losing its Evidence Lens highlight.
 *
 * So only the human-readable strings are overridden, keyed by the id they
 * belong to. Ids, values, dates, evidence links and confidences are copied
 * verbatim from the reference analysis and cannot drift. A key that names a
 * row which does not exist throws at module load - i.e. at build time, not on
 * stage.
 */
import type { Language, ModelAnalysis } from '@/lib/analysis/schema';

interface ActionText {
  title: string;
  description: string;
  requiredItems?: string[];
  method: string[];
}

interface PaymentText {
  label: string;
  note?: string | null;
}

export interface LocalisedText {
  language: Language;
  documentTypeLabel: string;
  /** Only when the title itself should read differently; usually it is the document's own words. */
  title?: string;
  summary: string;
  /** Keyed by importantDates[].id */
  dates?: Record<string, string>;
  /** Keyed by amounts[].id */
  amounts?: Record<string, string>;
  /** Keyed by recipientActions[].id */
  actions?: Record<string, ActionText>;
  /** Keyed by paymentOptions[].id */
  payments?: Record<string, PaymentText>;
  /** Keyed by warnings[].id */
  warnings?: Record<string, string>;
  /** Keyed by evidence[].id - the explanation only. originalText is never touched. */
  evidence?: Record<string, string>;
  /** Keyed by evidence[].id - drop the entry to remove a now-pointless translation. */
  translations?: Record<string, string | null>;
  uncertainty?: string[];
}

function take<T>(map: Record<string, T> | undefined, id: string, where: string): T {
  const value = map?.[id];
  if (value === undefined) {
    throw new Error(`localise: missing ${where} text for "${id}"`);
  }
  return value;
}

function assertNoStrays(
  map: Record<string, unknown> | undefined,
  ids: Set<string>,
  where: string,
): void {
  for (const key of Object.keys(map ?? {})) {
    if (!ids.has(key)) throw new Error(`localise: ${where} text for unknown id "${key}"`);
  }
}

export function localise(base: ModelAnalysis, text: LocalisedText): ModelAnalysis {
  assertNoStrays(text.dates, new Set(base.importantDates.map((d) => d.id)), 'date');
  assertNoStrays(text.amounts, new Set(base.amounts.map((a) => a.id)), 'amount');
  assertNoStrays(text.actions, new Set(base.recipientActions.map((a) => a.id)), 'action');
  assertNoStrays(text.payments, new Set(base.paymentOptions.map((p) => p.id)), 'payment');
  assertNoStrays(text.warnings, new Set(base.warnings.map((w) => w.id)), 'warning');
  const evidenceIds = new Set(base.evidence.map((e) => e.id));
  assertNoStrays(text.evidence, evidenceIds, 'evidence');
  assertNoStrays(text.translations, evidenceIds, 'translation');

  return {
    ...base,
    language: text.language,
    documentTypeLabel: text.documentTypeLabel,
    title: text.title ?? base.title,
    summary: text.summary,
    importantDates: base.importantDates.map((date) => ({
      ...date,
      label: take(text.dates, date.id, 'date'),
    })),
    amounts: base.amounts.map((amount) => ({
      ...amount,
      label: take(text.amounts, amount.id, 'amount'),
    })),
    recipientActions: base.recipientActions.map((action) => {
      const localised = take(text.actions, action.id, 'action');
      return {
        ...action,
        title: localised.title,
        description: localised.description,
        requiredItems: localised.requiredItems ?? action.requiredItems,
        method: localised.method,
      };
    }),
    paymentOptions: base.paymentOptions.map((option) => {
      const localised = take(text.payments, option.id, 'payment');
      return {
        ...option,
        label: localised.label,
        note: localised.note === undefined ? option.note : localised.note,
      };
    }),
    warnings: base.warnings.map((warning) => ({
      ...warning,
      message: take(text.warnings, warning.id, 'warning'),
    })),
    evidence: base.evidence.map((item) => {
      const translated =
        text.translations && item.id in text.translations
          ? text.translations[item.id]
          : item.translatedText;
      return {
        ...item,
        explanation: take(text.evidence, item.id, 'evidence'),
        // A translation into the language the quote is already written in is
        // noise, so a null here removes the row rather than duplicating it.
        ...(translated === null || translated === undefined
          ? { translatedText: undefined }
          : { translatedText: translated }),
      };
    }),
    uncertainty: text.uncertainty ?? base.uncertainty,
  };
}
