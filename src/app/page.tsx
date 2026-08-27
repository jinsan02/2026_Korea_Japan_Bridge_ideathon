'use client';

/**
 * Home.
 *
 * Four doors, in the order the learning loop runs: solve one together, practise
 * alone, re-read the method, look back at progress. No text box anywhere - the
 * whole premise is that the user should not have to know what to ask.
 *
 * When a review reminder has come due it appears at the top, because that is
 * the moment the loop closes.
 */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { practiceForDocumentType } from '@/lib/fixtures/practice';
import {
  dueReminder,

  setReminder,
  type ReviewReminder,
} from '@/lib/learning/progress';
import { useSession } from '@/lib/session/SessionProvider';

export default function HomeScreen() {
  const router = useRouter();
  const { t, logEvent, resetRun } = useSession();
  const [reminder, setPendingReminder] = useState<ReviewReminder | null>(null);

  useEffect(() => {
    logEvent('session_start', { screen: 'home' });
    const due = dueReminder();
    if (due) {
      setPendingReminder(due);
      logEvent('review_reminder_shown', {
        screen: 'home',
        documentType: due.documentType,
      });
    }
    // Once per mount is intended.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSolving = () => {
    resetRun();
    router.push('/capture');
  };

  const startReview = () => {
    if (!reminder) return;
    const scenario =
      practiceForDocumentType(reminder.documentType)?.id ?? reminder.scenarioId;
    router.push(`/practice?scenario=${encodeURIComponent(scenario)}`);
  };

  const dismissReminder = () => {
    setReminder(null);
    setPendingReminder(null);
  };

  return (
    <AppShell screen="home" showBadges={false}>
      <div className="stack stack--loose">
        <section className="home-hero">
          <p className="home-eyebrow">{t.home.eyebrow}</p>
          <h1 className="screen-title home-title">{t.home.title}</h1>
          <p className="screen-subtitle home-subtitle">{t.home.subtitle}</p>
          <div className="learning-journey" aria-label={t.home.journeyLabel}>
            <span className="learning-journey__step">
              <span className="learning-journey__icon" aria-hidden="true">🤝</span>
              {t.home.journeySolve}
            </span>
            <span className="learning-journey__step">
              <span className="learning-journey__icon" aria-hidden="true">✏️</span>
              {t.home.journeyPractice}
            </span>
            <span className="learning-journey__step">
              <span className="learning-journey__icon" aria-hidden="true">✓</span>
              {t.home.journeyIndependent}
            </span>
          </div>
        </section>

        {reminder ? (
          <section className="card" style={{ borderColor: 'var(--brand)' }}>
            <h2 className="section-heading">
              <span aria-hidden="true">🕘 </span>
              {t.home.reviewDue}
            </h2>
            <p>{t.home.reviewDueBody(reminder.label)}</p>
            <button type="button" className="btn btn--primary" onClick={startReview}>
              {t.home.reviewStart}
            </button>
            <button type="button" className="btn btn--quiet" onClick={dismissReminder}>
              {t.home.reviewDismiss}
            </button>
          </section>
        ) : null}

        <div className="stack">
          <button
            type="button"
            className="action-card home-primary-card"
            onClick={startSolving}
          >
            <span className="row">
              <span className="action-card__index" aria-hidden="true">
                📷
              </span>
              <span className="action-card__label">{t.home.solveTitle}</span>
            </span>
            <span className="action-card__description">{t.home.solveBody}</span>
          </button>

          <div className="home-secondary-grid">
            <Link className="action-card" href="/practice">
              <span className="row">
                <span className="action-card__index" aria-hidden="true">
                  ✏️
                </span>
                <span className="action-card__label">{t.home.practiceTitle}</span>
              </span>
              <span className="action-card__description">{t.home.practiceBody}</span>
            </Link>

            <Link className="action-card" href="/tutorial">
              <span className="row">
                <span className="action-card__index" aria-hidden="true">
                  📘
                </span>
                <span className="action-card__label">{t.home.tutorialTitle}</span>
              </span>
              <span className="action-card__description">{t.home.tutorialBody}</span>
            </Link>
          </div>

          <Link className="btn btn--quiet home-history-link" href="/history">
            <span aria-hidden="true">↺</span>
            <strong>{t.home.historyTitle}</strong>
          </Link>
        </div>

        <p className="notice notice--caution">
          <span className="notice__icon" aria-hidden="true">
            ⚠️
          </span>
          <span>
            <strong>{t.home.noticeTitle}</strong>
            <br />
            {t.home.noticeBody}
          </span>
        </p>

      </div>
    </AppShell>
  );
}
