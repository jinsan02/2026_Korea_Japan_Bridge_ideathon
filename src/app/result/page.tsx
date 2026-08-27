'use client';

/**
 * Result screen.
 *
 * Information order is fixed by how a worried reader actually reads: one
 * sentence, then the date, then the money, then what to do, then the cautions,
 * then who to ask. Everything below the fold is detail.
 *
 * A field the document did not contain is rendered as "문서에 적혀 있지
 * 않습니다" - never filled in from elsewhere. Action cards carry their own
 * evidence, requiredItems and method.
 *
 * "낼 수 있는 방법" is the one list a reader acts on directly, so it is built
 * from two halves that are kept apart: which rails appear comes from the
 * document, and the explanation of each rail is our own fixed copy.
 */
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { RequireAnalysis } from '@/components/RequireAnalysis';
import { SpeakButton } from '@/components/SpeakButton';
import {
  HumanReviewNotice,
  UncertaintyList,
  WarningList,
} from '@/components/WarningList';
import {
  type PaymentMethodId,
  primaryAmount,
  primaryDate,
} from '@/lib/analysis/schema';
import { buildUtterance } from '@/lib/speech';
import { deadlineStatus } from '@/lib/util/date';
import { buildDeadlineIcs } from '@/lib/util/ics';
import { useSession } from '@/lib/session/SessionProvider';

/** Paired with the method name in text - never the only way to tell them apart. */
const PAYMENT_ICON: Record<PaymentMethodId, string> = {
  bank_counter: '🏦',
  post_office: '📮',
  convenience_store: '🏪',
  atm: '🏧',
  internet_banking: '💻',
  ars: '☎️',
  credit_card: '💳',
  online_portal: '🌐',
  barcode_app: '📱',
  account_transfer: '🔄',
  help_desk: '🧑‍💼',
};

function Missing({ note, help }: { note: string; help: string }) {
  return (
    <>
      <p className="field__value--missing">
        <span aria-hidden="true">❓ </span>
        {note}
      </p>
      <p className="text-small">{help}</p>
    </>
  );
}

/** Only our own screens; a path from the query string is untrusted input. */
const BACK_TARGETS = ['/solve', '/confirm'] as const;

function ResultContent() {
  const { t, logEvent, conditionDefinition } = useSession();
  const params = useSearchParams();
  const [saved, setSaved] = useState(false);
  const [openAction, setOpenAction] = useState<string | null>(null);
  const scrolled = useRef(false);

  const backHref = (BACK_TARGETS as readonly string[]).includes(
    params.get('back') ?? '',
  )
    ? (params.get('back') as string)
    : '/solve';
  const focus = params.get('focus');

  useEffect(() => {
    logEvent('result_viewed', { screen: 'result' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * "낼 수 있는 방법" is one of the three doors on the confirm screen, so
   * arriving from it must land on that section rather than at the top of a
   * long page the reader has to scroll past first.
   *
   * A callback ref rather than an effect: the section lives inside
   * RequireAnalysis, so on the first render there is nothing to scroll to and
   * an effect keyed on the query would give up before the node ever existed.
   */
  const paymentRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node || focus !== 'payment' || scrolled.current) return;
      scrolled.current = true;
      // Two frames: the router resets scroll position of its own accord after
      // the node mounts, so scrolling immediately gets undone.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          node.scrollIntoView({ block: 'start' });
          node.focus({ preventScroll: true });
        });
      });
    },
    [focus],
  );

  return (
    <RequireAnalysis screen="result">
      {(analysis) => {
        const date = primaryDate(analysis);
        const amount = primaryAmount(analysis);
        const status = deadlineStatus(date?.isoDate ?? null);

        const countdown =
          status.kind === 'future'
            ? t.result.daysLeft(status.days)
            : status.kind === 'today'
              ? t.result.dueToday
              : status.kind === 'past'
                ? t.result.overdue(status.days)
                : null;

        const saveDeadline = () => {
          if (!date?.isoDate) return;
          const ics = buildDeadlineIcs({
            isoDate: date.isoDate,
            title: `${analysis.documentTypeLabel} · ${date.label}`,
            description: analysis.summary,
          });
          const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'ai-door-deadline.ics';
          link.click();
          URL.revokeObjectURL(url);
          setSaved(true);
          logEvent('deadline_saved', { screen: 'result' });
        };

        const spoken = buildUtterance([
          analysis.summary,
          date ? `${date.label}, ${date.rawText}` : null,
          countdown,
          amount ? `${amount.label}, ${amount.rawText}` : null,
          t.result.actions,
          ...analysis.recipientActions.map((action) => action.title),
        ]);

        return (
          <AppShell
            screen="result"
            backHref={backHref}
            footer={
              conditionDefinition.features.learningLoop ? (
                <Link className="btn btn--primary" href="/solve/complete">
                  <span aria-hidden="true">✏️</span>
                  {t.result.practiceSimilar}
                </Link>
              ) : undefined
            }
          >
            <div className="stack stack--loose">
              <h1 className="screen-title">{t.result.title}</h1>

              <HumanReviewNotice />

              {/* 1. one-sentence summary */}
              <section className="card">
                <p className="field__label">{t.result.summary}</p>
                <p style={{ fontSize: 'var(--fs-heading)', fontWeight: 700 }}>
                  {analysis.summary}
                </p>
                {conditionDefinition.features.speech ? (
                  <SpeakButton screen="result" text={spoken} variant="primary" />
                ) : null}
              </section>

              {/* 2. the most important date */}
              <section className="card">
                <h2 className="section-heading">{t.result.dates}</h2>
                {analysis.importantDates.length === 0 ? (
                  <Missing
                    note={t.result.notInDocument}
                    help={t.result.notInDocumentHelp}
                  />
                ) : (
                  analysis.importantDates.map((item) => (
                    <div key={item.id} className="field">
                      <p className="field__label">{item.label}</p>
                      <p className="field__value">{item.rawText}</p>
                      {item.id === date?.id && countdown ? (
                        <p
                          className={
                            status.kind === 'past' ? 'field__value--missing' : 'text-small'
                          }
                        >
                          {status.kind === 'past' ? '⚠️ ' : ''}
                          {countdown}
                        </p>
                      ) : null}
                    </div>
                  ))
                )}

                {date?.isoDate ? (
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={saveDeadline}
                  >
                    <span aria-hidden="true">📅</span>
                    {t.result.saveDeadline}
                  </button>
                ) : null}
                {saved ? (
                  <p className="notice notice--ok" role="status">
                    <span className="notice__icon" aria-hidden="true">
                      ✅
                    </span>
                    <span>{t.result.saveDeadlineDone}</span>
                  </p>
                ) : null}
              </section>

              {/* 3. money */}
              <section className="card">
                <h2 className="section-heading">{t.result.amounts}</h2>
                {analysis.amounts.length === 0 ? (
                  <Missing
                    note={t.result.notInDocument}
                    help={t.result.notInDocumentHelp}
                  />
                ) : (
                  analysis.amounts.map((item) => (
                    <div key={item.id} className="field">
                      <p className="field__label">{item.label}</p>
                      <p className="field__value">{item.rawText}</p>
                    </div>
                  ))
                )}
              </section>

              {/* 4. what to do - at most three */}
              {conditionDefinition.features.actionCards ? (
                <section className="stack">
                  <h2 className="section-heading">{t.result.actions}</h2>
                  {analysis.recipientActions.map((action, index) => {
                    const open = openAction === action.id;
                    return (
                      <div key={action.id} className="card">
                        <button
                          type="button"
                          className="action-card"
                          aria-expanded={open}
                          onClick={() => {
                            const next = open ? null : action.id;
                            setOpenAction(next);
                            if (next) {
                              logEvent('action_card_opened', {
                                screen: 'result',
                                questionId: action.id,
                              });
                            }
                          }}
                        >
                          <span className="row">
                            <span className="action-card__index" aria-hidden="true">
                              {index + 1}
                            </span>
                            <span className="action-card__label">{action.title}</span>
                          </span>
                          <span className="action-card__description">
                            {action.description}
                          </span>
                        </button>

                        {open ? (
                          <div className="stack stack--tight">
                            {action.requiredItems.length > 0 ? (
                              <>
                                <p className="field__label">{t.result.requiredItems}</p>
                                <ul>
                                  {action.requiredItems.map((item) => (
                                    <li key={item}>{item}</li>
                                  ))}
                                </ul>
                              </>
                            ) : null}

                            {action.method.length > 0 ? (
                              <>
                                <p className="field__label">{t.result.method}</p>
                                <ol>
                                  {action.method.map((item) => (
                                    <li key={item}>{item}</li>
                                  ))}
                                </ol>
                              </>
                            ) : null}

                            {conditionDefinition.features.evidenceLens &&
                            action.evidenceIds.length > 0 ? (
                              <Link
                                className="btn btn--secondary"
                                href={`/evidence?ids=${action.evidenceIds.join(',')}`}
                                onClick={() =>
                                  logEvent('evidence_opened', { screen: 'result' })
                                }
                              >
                                <span aria-hidden="true">🔍</span>
                                {t.result.seeEvidence}
                              </Link>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </section>
              ) : null}

              {/* 5. how it can be paid - document-stated rails only */}
              {analysis.amounts.length > 0 ? (
                <section
                  className="stack stack--tight"
                  ref={paymentRef}
                  tabIndex={-1}
                  aria-labelledby="payment-heading"
                >
                  <h2 className="section-heading" id="payment-heading">
                    {t.payment.title}
                  </h2>
                  <p className="text-small">{t.payment.subtitle}</p>
                  {analysis.paymentOptions.length === 0 ? (
                    <Missing note={t.payment.none} help={t.payment.noneHelp} />
                  ) : (
                    <ul className="payment-list">
                      {analysis.paymentOptions.map((option) => (
                        <li key={option.id} className="payment-row">
                          <span className="payment-row__icon" aria-hidden="true">
                            {PAYMENT_ICON[option.method]}
                          </span>
                          <span className="payment-row__body">
                            <strong>{t.payment.methods[option.method]}</strong>
                            <span className="text-small">
                              {t.payment.help[option.method]}
                            </span>
                            <span className="text-small payment-row__quote">
                              {t.payment.documentSays}: 「{option.label}」
                              {option.note ? ` · ${option.note}` : ''}
                            </span>
                            {conditionDefinition.features.evidenceLens &&
                            option.evidenceIds.length > 0 ? (
                              <Link
                                className="link-quiet"
                                href={`/evidence?ids=${option.evidenceIds.join(',')}`}
                                onClick={() =>
                                  logEvent('evidence_opened', { screen: 'result' })
                                }
                              >
                                <span aria-hidden="true">🔍 </span>
                                {t.result.seeEvidence}
                              </Link>
                            ) : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ) : null}

              {/* 6. cautions */}
              <WarningList warnings={analysis.warnings} />
              <UncertaintyList items={analysis.uncertainty} />

              {/* 7-9. contact, evidence, review */}
              <div className="stack stack--tight">
                {conditionDefinition.features.officialContact ? (
                  <Link className="btn btn--secondary" href="/contact">
                    <span aria-hidden="true">☎</span>
                    {t.result.contacts}
                  </Link>
                ) : null}
                {conditionDefinition.features.evidenceLens ? (
                  <Link className="btn btn--secondary" href="/evidence">
                    <span aria-hidden="true">🔍</span>
                    {t.result.evidence}
                  </Link>
                ) : null}
                {conditionDefinition.features.learningLoop ? (
                  <>
                    <Link className="btn btn--secondary" href="/solve">
                      <span aria-hidden="true">🤝</span>
                      {t.result.solveTogether}
                    </Link>
                    <Link className="btn btn--secondary" href="/tutorial">
                      <span aria-hidden="true">📘</span>
                      {t.result.seeTutorial}
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          </AppShell>
        );
      }}
    </RequireAnalysis>
  );
}

export default function ResultScreen() {
  // useSearchParams needs a Suspense boundary in the app router.
  return (
    <Suspense fallback={null}>
      <ResultContent />
    </Suspense>
  );
}
