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
 * evidence, requiredItems, method and doNotDo.
 */
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { RequireAnalysis } from '@/components/RequireAnalysis';
import { SpeakButton } from '@/components/SpeakButton';
import {
  HumanReviewNotice,
  UncertaintyList,
  WarningList,
} from '@/components/WarningList';
import { primaryAmount, primaryDate } from '@/lib/analysis/schema';
import { buildUtterance } from '@/lib/speech';
import { deadlineStatus } from '@/lib/util/date';
import { buildDeadlineIcs } from '@/lib/util/ics';
import { useSession } from '@/lib/session/SessionProvider';

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

export default function ResultScreen() {
  const { t, logEvent, conditionDefinition } = useSession();
  const [saved, setSaved] = useState(false);
  const [openAction, setOpenAction] = useState<string | null>(null);

  useEffect(() => {
    logEvent('result_viewed', { screen: 'result' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            backHref="/solve"
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

                            {action.doNotDo.length > 0 ? (
                              <div className="notice notice--critical">
                                <span className="notice__icon" aria-hidden="true">
                                  🚫
                                </span>
                                <span>
                                  <strong>{t.result.doNotDo}</strong>
                                  <ul>
                                    {action.doNotDo.map((item) => (
                                      <li key={item}>{item}</li>
                                    ))}
                                  </ul>
                                </span>
                              </div>
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

              {/* 5. cautions */}
              <WarningList warnings={analysis.warnings} />
              <UncertaintyList items={analysis.uncertainty} />

              {/* 6-8. contact, evidence, review */}
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
