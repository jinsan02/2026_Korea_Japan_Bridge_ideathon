'use client';

/**
 * Document type confirmation.
 *
 * The screen states what it found and then offers three things it can do
 * about it. It used to ask 맞나요? and wait for 네 / 아니요, which asked the
 * reader to audit a classification - the one judgement they came here because
 * they could not make - and gave them nothing to do next.
 *
 * Correcting the type is still reachable, as a quiet link. Choosing it flags
 * the analysis for re-verification, because the fields below were extracted
 * under the assumption the user just rejected.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/AppShell';
import { RequireAnalysis } from '@/components/RequireAnalysis';
import { ConfidenceNote } from '@/components/WarningList';
import { SpeakButton } from '@/components/SpeakButton';
import { DOCUMENT_TYPE_IDS, type DocumentTypeId } from '@/lib/analysis/schema';
import { buildEntryChoices } from '@/lib/learning/entry-choices';
import { getFixture } from '@/lib/fixtures/documents';
import { buildUtterance } from '@/lib/speech';
import { useSession } from '@/lib/session/SessionProvider';

const SELECTABLE = DOCUMENT_TYPE_IDS.filter((id) => id !== 'unknown');

export default function ConfirmScreen() {
  const router = useRouter();
  const { t, analysis, meta, setAnalysis, logEvent, conditionDefinition } = useSession();
  const [choosing, setChoosing] = useState(false);

  const goNext = () =>
    router.push(conditionDefinition.features.guidedSolving ? '/solve' : '/result');

  const choose = (href: string) => {
    logEvent('document_type_confirmed', {
      screen: 'confirm',
      documentType: analysis?.documentType,
    });
    router.push(href);
  };

  const correctTo = (documentType: DocumentTypeId) => {
    if (!analysis) return;
    logEvent('document_type_corrected', { screen: 'confirm', documentType });
    setAnalysis(
      {
        ...analysis,
        documentType,
        documentTypeLabel: t.confirm.types[documentType],
        // The downstream fields were extracted under the old assumption, so a
        // user correction is a reason to re-verify, not a reason to trust more.
        requiresHumanVerification: true,
      },
      meta,
    );
    setChoosing(false);
    goNext();
  };

  return (
    <RequireAnalysis screen="confirm">
      {(analysis) => {
        const question = t.confirm.question(analysis.documentTypeLabel);
        const from = analysis.issuer ? t.confirm.from(analysis.issuer) : null;
        const surface = (meta?.fixtureId && getFixture(meta.fixtureId)?.surface) || 'paper';
        const choices = buildEntryChoices(analysis, surface, t);

        return (
          // No step counter: this is where the intake sequence arrives, and
          // "4단계 중 4단계" immediately followed by the guided flow's
          // "6단계 중 1단계" reads as two unrelated progress bars.
          <AppShell screen="confirm" backHref="/capture">
            {choosing ? (
              <div className="stack stack--loose">
                <div className="stack stack--tight">
                  <h1 className="screen-title">{t.confirm.changeTitle}</h1>
                  <p className="screen-subtitle">{t.confirm.changeHelp}</p>
                </div>
                <div className="stack stack--tight">
                  {SELECTABLE.map((id) => (
                    <button
                      key={id}
                      type="button"
                      className="btn btn--secondary"
                      onClick={() => correctTo(id)}
                    >
                      {t.confirm.types[id]}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn--quiet"
                  onClick={() => setChoosing(false)}
                >
                  {t.common.cancel}
                </button>
              </div>
            ) : (
              <div className="stack stack--loose">
                <div className="stack stack--tight">
                  <h1 className="screen-title">{question}</h1>
                  {from ? <p className="screen-subtitle">{from}</p> : null}
                </div>

                <ConfidenceNote confidence={analysis.confidence} />

                <div className="stack stack--tight">
                  <h2 className="section-heading">{t.confirm.ask}</h2>
                  <p className="text-small">{t.confirm.askHelp}</p>
                </div>

                <div className="stack">
                  {choices.map((choice, index) => (
                    <button
                      key={choice.id}
                      type="button"
                      className={`action-card${index === 0 ? ' home-primary-card' : ''}`}
                      onClick={() => choose(choice.href)}
                    >
                      <span className="row">
                        <span className="action-card__index" aria-hidden="true">
                          {choice.icon}
                        </span>
                        <span className="action-card__label">{choice.title}</span>
                      </span>
                      <span className="action-card__description">{choice.body}</span>
                    </button>
                  ))}
                </div>

                {conditionDefinition.features.speech ? (
                  <SpeakButton
                    screen="confirm"
                    text={buildUtterance([question, from, t.confirm.ask])}
                  />
                ) : null}

                <button
                  type="button"
                  className="btn btn--quiet"
                  onClick={() => setChoosing(true)}
                >
                  {t.confirm.wrongType}
                </button>
              </div>
            )}
          </AppShell>
        );
      }}
    </RequireAnalysis>
  );
}
