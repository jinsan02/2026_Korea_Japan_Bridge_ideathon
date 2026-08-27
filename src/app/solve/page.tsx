'use client';

/**
 * Step 1 of the learning loop - 지금 같이 해결하기.
 *
 * The result screen can show everything at once. This screen deliberately does
 * not: it walks one fact at a time, in the order that matters, and each step
 * names WHERE the fact was found. "기한은 9월 30일입니다" teaches nothing;
 * "표에서 '납부 기한'이라고 적힌 줄을 보세요" teaches the method that transfers
 * to the next envelope.
 *
 * "잘 모르겠어요" and "다시 설명해 주세요" are logged, because a step people
 * repeatedly get stuck on is a design problem worth seeing in the data.
 */
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/AppShell';
import { EvidenceLocation } from '@/components/EvidenceViewer';
import { RequireAnalysis } from '@/components/RequireAnalysis';
import { SpeakButton } from '@/components/SpeakButton';
import { HumanReviewNotice } from '@/components/WarningList';
import { evidenceFor } from '@/lib/analysis/schema';
import { buildGuidedSteps } from '@/lib/learning/guided';
import { markTypeLearned } from '@/lib/learning/progress';
import { buildUtterance } from '@/lib/speech';
import { useSession } from '@/lib/session/SessionProvider';

export default function SolveScreen() {
  const router = useRouter();
  const { t, analysis, logEvent, conditionDefinition } = useSession();
  const [index, setIndex] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);
  const [unclear, setUnclear] = useState(false);

  const steps = useMemo(
    () => (analysis ? buildGuidedSteps(analysis, t) : []),
    [analysis, t],
  );

  useEffect(() => {
    logEvent('guided_started', {
      screen: 'solve',
      documentType: analysis?.documentType,
    });
    // Once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RequireAnalysis screen="solve">
      {(analysis) => {
        const step = steps[index];
        if (!step) return null;

        const isLast = index === steps.length - 1;
        const evidence = evidenceFor(analysis, step.evidenceIds);
        const spoken = buildUtterance([step.title, step.body, step.whereToLook]);

        const advance = () => {
          logEvent('guided_step_completed', {
            screen: 'solve',
            stepKind: step.kind,
            stepIndex: index,
          });
          setShowOriginal(false);
          setUnclear(false);

          if (isLast) {
            markTypeLearned(analysis.documentType);
            logEvent('guided_completed', {
              screen: 'solve',
              documentType: analysis.documentType,
            });
            router.push('/solve/complete');
            return;
          }
          setIndex((current) => current + 1);
        };

        const declareUnclear = () => {
          setUnclear(true);
          setShowOriginal(true);
          logEvent('guided_step_unclear', {
            screen: 'solve',
            stepKind: step.kind,
            stepIndex: index,
          });
        };

        return (
          <AppShell
            screen="solve"
            backHref={index === 0 ? '/confirm' : undefined}
            onBack={index === 0 ? undefined : () => setIndex((c) => c - 1)}
            step={{ current: index + 1, total: steps.length }}
            footer={
              <>
                <button type="button" className="btn btn--primary" onClick={advance}>
                  <span aria-hidden="true">✓</span>
                  {isLast ? t.guided.finish : t.guided.understood}
                </button>
                {isLast ? null : (
                  <button
                    type="button"
                    className="btn btn--quiet"
                    onClick={declareUnclear}
                  >
                    {t.guided.dontKnow}
                  </button>
                )}
              </>
            }
          >
            <div className="stack stack--loose">
              <div className="stack stack--tight">
                <h1 className="screen-title">{t.guided.heading}</h1>
                <p className="text-small">{t.guided.intro}</p>
              </div>

              {index === 0 ? <HumanReviewNotice /> : null}

              <section className="card">
                <h2 className="section-heading">{step.title}</h2>
                <p style={{ fontSize: 'var(--fs-heading)' }}>{step.body}</p>

                {step.whereToLook ? (
                  <p className="notice notice--info">
                    <span className="notice__icon" aria-hidden="true">
                      👀
                    </span>
                    <span>
                      <strong>{t.guided.whereToLook}</strong>
                      <br />
                      {step.whereToLook}
                    </span>
                  </p>
                ) : null}

                {unclear ? (
                  <p className="notice notice--ok" role="status">
                    <span className="notice__icon" aria-hidden="true">
                      🙂
                    </span>
                    <span>{t.guided.intro}</span>
                  </p>
                ) : null}

                <div className="stack stack--tight">
                  {conditionDefinition.features.speech ? (
                    <SpeakButton screen="solve" text={spoken} />
                  ) : null}

                  {evidence.length > 0 ? (
                    <button
                      type="button"
                      className="btn btn--secondary"
                      aria-expanded={showOriginal}
                      onClick={() => {
                        const next = !showOriginal;
                        setShowOriginal(next);
                        if (next) {
                          logEvent('guided_evidence_opened', {
                            screen: 'solve',
                            stepKind: step.kind,
                            stepIndex: index,
                          });
                        }
                      }}
                    >
                      <span aria-hidden="true">🔍</span>
                      {showOriginal ? t.guided.hideOriginal : t.guided.showOriginal}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    className="btn btn--quiet"
                    onClick={() => {
                      logEvent('guided_step_repeated', {
                        screen: 'solve',
                        stepKind: step.kind,
                        stepIndex: index,
                      });
                      setShowOriginal(true);
                    }}
                  >
                    {t.guided.explainAgain}
                  </button>
                </div>
              </section>

              {showOriginal && evidence.length > 0 ? (
                <div className="stack stack--tight">
                  {evidence.map((item) => (
                    <div key={item.id} className="card card--flat">
                      <blockquote
                        style={{
                          margin: 0,
                          padding: 'var(--space-3)',
                          background: 'var(--surface-sunken)',
                          borderLeft: '6px solid var(--brand)',
                          borderRadius: '8px',
                          fontWeight: 700,
                        }}
                      >
                        {item.originalText}
                      </blockquote>
                      {item.translatedText ? (
                        <p className="text-small">{item.translatedText}</p>
                      ) : null}
                      <EvidenceLocation evidence={item} />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </AppShell>
        );
      }}
    </RequireAnalysis>
  );
}
