/**
 * The three doors offered once a document has been read.
 *
 * The screen used to ask "이 문서는 X로 보입니다. 맞나요?" and wait for 네 or
 * 아니요. That puts the burden the wrong way round: someone who could judge
 * whether the classification is right does not need this app, and a yes/no
 * prompt gives the reader nothing to do next. So the screen states what it
 * found and then offers three things it can actually do, in the words of the
 * task rather than the words of the system.
 *
 * Correcting the document type is still reachable, but as a quiet link rather
 * than as one of the two buttons the whole screen hangs on.
 *
 * The choices are derived from the analysis, not hardcoded per demo, so a live
 * result gets the same treatment: a document with payment routes offers to
 * find them, a screen with buttons offers to point at them, and every document
 * offers the step-by-step. Exactly three, always, because the deck promises
 * "at most three doors at once" and this is the first place that promise is
 * visible.
 */
import type { DocumentAnalysis } from '@/lib/analysis/schema';
import type { Dictionary } from '@/lib/i18n';

/** Whether the reader is looking at paper or at a phone screen. */
export type Surface = 'paper' | 'screen';

export type EntryChoiceId = 'facts' | 'payment' | 'where' | 'steps';

export interface EntryChoice {
  id: EntryChoiceId;
  icon: string;
  title: string;
  body: string;
  href: string;
}

/**
 * Evidence ids for the controls a reader has to press on an app screen.
 *
 * An action whose title is about choosing gathers the quotes for the buttons;
 * pointing at those is the whole of "버튼 위치 안내받기".
 */
function interactiveEvidenceIds(analysis: DocumentAnalysis): string[] {
  const withRegion = new Set(
    analysis.evidence.filter((item) => item.region).map((item) => item.id),
  );
  const ids = analysis.recipientActions
    .flatMap((action) => action.evidenceIds)
    .filter((id) => withRegion.has(id));
  return Array.from(new Set(ids)).slice(0, 6);
}

export function buildEntryChoices(
  analysis: DocumentAnalysis,
  surface: Surface,
  t: Dictionary,
): EntryChoice[] {
  const choices: EntryChoice[] = [];
  const copy = t.entry;

  if (analysis.paymentOptions.length > 0) {
    choices.push({
      id: 'payment',
      icon: '💳',
      title: copy.payment.title,
      body: copy.payment.body(analysis.paymentOptions.length),
      href: '/result?focus=payment',
    });
  }

  const pointable = interactiveEvidenceIds(analysis);
  if (pointable.length > 0 && (surface === 'screen' || choices.length < 2)) {
    const where = surface === 'screen' ? copy.buttons : copy.where;
    choices.push({
      id: 'where',
      icon: surface === 'screen' ? '👆' : '🔍',
      title: where.title,
      body: where.body,
      href: `/evidence?ids=${pointable.join(',')}`,
    });
  }

  // Fills the third slot when a document has neither payment routes nor
  // anything with a position on the page.
  if (choices.length < 2) {
    choices.push({
      id: 'facts',
      icon: '📌',
      title: copy.facts.title,
      body: copy.facts.body,
      href: '/result',
    });
  }

  choices.push({
    id: 'steps',
    icon: '🤝',
    title: surface === 'screen' ? copy.stepsScreen.title : copy.steps.title,
    body: surface === 'screen' ? copy.stepsScreen.body : copy.steps.body,
    href: '/solve',
  });

  return choices.slice(0, 3);
}
