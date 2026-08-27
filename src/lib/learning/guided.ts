/**
 * Builds the "지금 같이 해결하기" sequence from an analysis.
 *
 * The whole point is NOT to show everything at once. The result screen already
 * does that; this walks the user through the same facts one at a time, in the
 * order that matters, so that the sequence itself is what they remember.
 *
 * Each step names where to look, because "the deadline is 9월 30일" teaches
 * nothing but "the deadline is in the table, fourth row" teaches the method.
 */
import {
  type DocumentAnalysis,
  primaryAmount,
  primaryDate,
} from '@/lib/analysis/schema';
import type { Dictionary } from '@/lib/i18n';
import type { GuidedStep } from './types';

export function buildGuidedSteps(
  analysis: DocumentAnalysis,
  t: Dictionary,
): GuidedStep[] {
  const steps: GuidedStep[] = [];
  const typeEvidence = analysis.evidence[0]?.id;

  // 1. What kind of document is this?
  steps.push({
    kind: 'document_type',
    title: t.guided.typeTitle,
    body: t.guided.typeBody(analysis.documentTypeLabel, analysis.issuer),
    whereToLook: t.guided.typeWhere,
    evidenceIds: typeEvidence ? [typeEvidence] : [],
    value: analysis.documentTypeLabel,
  });

  // 2. The most important date.
  const date = primaryDate(analysis);
  steps.push({
    kind: 'important_date',
    title: t.guided.dateTitle,
    body: date ? t.guided.dateBody(date.label, date.rawText) : t.guided.dateMissing,
    whereToLook: date ? t.guided.dateWhere(date.label) : null,
    evidenceIds: date?.evidenceIds ?? [],
    value: date?.rawText ?? null,
  });

  // 3. The amount, or - when the document names none - what to bring instead.
  const amount = primaryAmount(analysis);
  const requiredItems = Array.from(
    new Set(analysis.recipientActions.flatMap((action) => action.requiredItems)),
  );
  steps.push({
    kind: 'amount_or_items',
    title: amount ? t.guided.amountTitle : t.guided.itemsTitle,
    body: amount
      ? t.guided.amountBody(amount.label, amount.rawText)
      : requiredItems.length > 0
        ? t.guided.itemsBody(requiredItems)
        : t.guided.amountMissing,
    whereToLook: amount ? t.guided.amountWhere(amount.label) : t.guided.itemsWhere,
    evidenceIds:
      amount?.evidenceIds ??
      analysis.recipientActions.flatMap((action) => action.evidenceIds).slice(0, 2),
    value: amount?.rawText ?? (requiredItems.join(', ') || null),
  });

  // 4. What to actually do.
  steps.push({
    kind: 'actions',
    title: t.guided.actionsTitle,
    body: t.guided.actionsBody(analysis.recipientActions.map((a) => a.title)),
    whereToLook: null,
    evidenceIds: analysis.recipientActions
      .flatMap((action) => action.evidenceIds)
      .slice(0, 3),
    value: null,
  });

  // 5. Who to ask - only if the document actually named someone.
  const contact = analysis.officialContacts.find(
    (item) => item.source === 'document',
  );
  steps.push({
    kind: 'official_contact',
    title: t.guided.contactTitle,
    body: contact
      ? t.guided.contactBody(contact.organization, contact.department, contact.phone)
      : t.guided.contactMissing,
    whereToLook: contact ? t.guided.contactWhere : null,
    evidenceIds: contact?.evidenceIds ?? [],
    value: contact?.phone ?? null,
  });

  // 6. Confirm it is done. Not "AI completed it" - the user did.
  steps.push({
    kind: 'completion',
    title: t.guided.doneTitle,
    body: t.guided.doneBody,
    whereToLook: null,
    evidenceIds: [],
    value: null,
  });

  return steps;
}
