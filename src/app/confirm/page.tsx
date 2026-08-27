'use client';

/**
 * Document type confirmation.
 *
 * The AI's classification is a proposal, not a verdict. Nothing downstream
 * happens until the user says 네, and correcting it is a first-class option -
 * which is also the misclassification-recovery measure in the study.
 *
 * "잘 모르겠어요" is offered as its own answer. Forcing a yes/no on someone who
 * genuinely does not know is how wrong data gets confirmed.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/AppShell';
import { RequireAnalysis } from '@/components/RequireAnalysis';
import { ConfidenceNote } from '@/components/WarningList';
import { SpeakButton } from '@/components/SpeakButton';
import { DOCUMENT_TYPE_IDS, type DocumentTypeId } from '@/lib/analysis/schema';
import { buildUtterance } from '@/lib/speech';
import { useSession } from '@/lib/session/SessionProvider';

const SELECTABLE = DOCUMENT_TYPE_IDS.filter((id) => id !== 'unknown');

export default function ConfirmScreen() {
  const router = useRouter();
  const { t, analysis, meta, setAnalysis, logEvent, conditionDefinition } = useSession();
  const [choosing, setChoosing] = useState(false);

  const goNext = () =>
    router.push(conditionDefinition.features.guidedSolving ? '/solve' : '/result');

  const confirm = () => {
    logEvent('document_type_confirmed', {
      screen: 'confirm',
      documentType: analysis?.documentType,
    });
    goNext();
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

        return (
          <AppShell
            screen="confirm"
            backHref="/capture"
            step={{ current: 4, total: 4 }}
            footer={
              choosing ? undefined : (
                <>
                  <button type="button" className="btn btn--primary" onClick={confirm}>
                    <span aria-hidden="true">✓</span>
                    {t.confirm.yes}
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => setChoosing(true)}
                  >
                    {t.confirm.no}
                  </button>
                  <button
                    type="button"
                    className="btn btn--quiet"
                    onClick={() => setChoosing(true)}
                  >
                    {t.confirm.unsure}
                  </button>
                </>
              )
            }
          >
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
                  <p className="section-heading">{t.confirm.ask}</p>
                </div>

                <ConfidenceNote confidence={analysis.confidence} />

                {conditionDefinition.features.speech ? (
                  <SpeakButton
                    screen="confirm"
                    text={buildUtterance([question, from, t.confirm.ask])}
                  />
                ) : null}
              </div>
            )}
          </AppShell>
        );
      }}
    </RequireAnalysis>
  );
}
