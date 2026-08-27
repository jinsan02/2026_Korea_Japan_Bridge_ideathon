'use client';

/**
 * Step 2 handoff - the completion screen.
 *
 * The line that matters is "오늘은 AI와 함께 해결했습니다": the user solved it,
 * with help. From here the loop turns - practise now, practise later, or just
 * read the method.
 *
 * The reminder is honest about what it is: a localStorage entry that surfaces a
 * card the next time this browser opens the app. There is no push notification
 * in this MVP and the screen says so. The 시연용 button is labelled as such.
 *
 * Some documents do not end on paper. A Japanese payment slip hands the reader
 * to an app screen that nobody explained either, so when the solved fixture
 * declares a continuation this screen offers it before the loop turns.
 */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { RequireAnalysis } from '@/components/RequireAnalysis';
import { practiceFor } from '@/lib/fixtures/learning-content';
import { nextFixture } from '@/lib/fixtures/documents';
import { fastForwardReminder, setReminder } from '@/lib/learning/progress';
import { useSession } from '@/lib/session/SessionProvider';

/** Evening today, or 09:00 tomorrow. */
function reminderTime(when: 'tonight' | 'tomorrow'): string {
  const date = new Date();
  if (when === 'tonight') {
    date.setHours(19, 0, 0, 0);
    // Already past 19:00: an hour from now is more useful than yesterday.
    if (date.getTime() <= Date.now()) {
      return new Date(Date.now() + 60 * 60 * 1000).toISOString();
    }
    return date.toISOString();
  }
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date.toISOString();
}

export default function SolveCompleteScreen() {
  const router = useRouter();
  const { t, language, meta, setFixtureId, setImage, logEvent } = useSession();
  const [scheduled, setScheduled] = useState<string | null>(null);

  return (
    <RequireAnalysis screen="solve_complete">
      {(analysis) => {
        const scenario = practiceFor(analysis.documentType, language);
        const continuation = meta?.fixtureId ? nextFixture(meta.fixtureId) : undefined;

        const openContinuation = () => {
          if (!continuation) return;
          // The next screen is a new document, so the photo of the old one goes.
          setImage(null);
          setFixtureId(continuation.id);
          logEvent('document_selected', {
            screen: 'solve_complete',
            fixtureId: continuation.id,
          });
          router.push('/analyzing');
        };

        const schedule = (when: 'tonight' | 'tomorrow') => {
          const label = when === 'tonight' ? t.complete.tonight : t.complete.tomorrow;
          if (scenario) {
            setReminder({
              documentType: analysis.documentType,
              scenarioId: scenario.id,
              dueAt: reminderTime(when),
              label: scenario.topic,
            });
          }
          setScheduled(label);
          logEvent('review_scheduled', {
            screen: 'solve_complete',
            documentType: analysis.documentType,
          });
        };

        const practiceNow = () => {
          if (!scenario) {
            router.push('/practice');
            return;
          }
          router.push(`/practice?scenario=${encodeURIComponent(scenario.id)}`);
        };

        return (
          <AppShell screen="solve_complete" backHref="/result">
            <div className="stack stack--loose">
              <div className="notice notice--ok" role="status">
                <span className="notice__icon" aria-hidden="true">
                  ✅
                </span>
                <span>
                  <strong>{t.complete.title}</strong>
                </span>
              </div>

              <p style={{ fontSize: 'var(--fs-heading)' }}>{t.complete.body}</p>

              {continuation ? (
                <section className="card" style={{ borderColor: 'var(--brand)' }}>
                  <h2 className="section-heading">{t.complete.continueTitle}</h2>
                  <p>{t.complete.continueBody}</p>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={openContinuation}
                  >
                    <span aria-hidden="true">📱</span>
                    {t.complete.continueAction}
                  </button>
                </section>
              ) : null}

              <div className="stack">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={practiceNow}
                  disabled={!scenario}
                >
                  <span aria-hidden="true">✏️</span>
                  {t.complete.practiceNow}
                </button>

                <Link className="btn btn--secondary" href="/tutorial">
                  <span aria-hidden="true">📘</span>
                  {t.complete.tutorialOnly}
                </Link>
              </div>

              <section className="card">
                <h2 className="section-heading">{t.complete.scheduleTitle}</h2>
                <div className="stack stack--tight">
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => schedule('tonight')}
                  >
                    <span aria-hidden="true">🌙</span>
                    {t.complete.tonight}
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => schedule('tomorrow')}
                  >
                    <span aria-hidden="true">☀️</span>
                    {t.complete.tomorrow}
                  </button>
                </div>

                {scheduled ? (
                  <div className="notice notice--ok" role="status">
                    <span className="notice__icon" aria-hidden="true">
                      ✅
                    </span>
                    <span>
                      {t.complete.scheduled(scheduled)}
                      <br />
                      <span className="text-small">{t.complete.scheduleHelp}</span>
                    </span>
                  </div>
                ) : null}

                {scheduled ? (
                  <button
                    type="button"
                    className="btn btn--quiet"
                    onClick={() => {
                      fastForwardReminder();
                      router.push('/');
                    }}
                  >
                    <span aria-hidden="true">⏩</span>
                    {t.complete.fastForward}
                  </button>
                ) : null}
              </section>

            </div>
          </AppShell>
        );
      }}
    </RequireAnalysis>
  );
}
