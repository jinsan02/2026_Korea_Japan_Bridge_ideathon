'use client';

/**
 * Practice result.
 *
 * Three things, per the spec: what was solved alone, where a hint was needed,
 * and what to remember next time. Deliberately NOT a score, a grade, a
 * percentage badge or anything that could read as an assessment of the person.
 *
 * "다음에 확인할 핵심 표현" is built from the questions that needed hints, so
 * the takeaway is a place to look rather than a mark.
 */
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { practiceById, tutorialFor } from '@/lib/fixtures/learning-content';
import { readProgress } from '@/lib/learning/progress';
import { summarise, type PracticeRecord } from '@/lib/learning/types';
import { useSession } from '@/lib/session/SessionProvider';

export default function PracticeResultScreen() {
  const { t, language } = useSession();
  const [record, setRecord] = useState<PracticeRecord | null>(null);

  useEffect(() => {
    setRecord(readProgress().records[0] ?? null);
  }, []);

  if (!record) {
    return (
      <AppShell screen="practice_result" backHref="/" showBadges={false}>
        <div className="stack stack--loose">
          <p className="notice notice--caution">
            <span className="notice__icon" aria-hidden="true">
              ⚠️
            </span>
            <span>{t.history.empty}</span>
          </p>
          <Link className="btn btn--primary" href="/practice">
            {t.practice.title}
          </Link>
        </div>
      </AppShell>
    );
  }

  const scenario = practiceById(record.scenarioId, language);
  const tutorial = tutorialFor(record.documentType, language);
  const stats = summarise(record);

  const independentQuestions = record.outcomes.filter((outcome) => outcome.independent);
  const helpedQuestions = record.outcomes.filter((outcome) => !outcome.independent);

  const questionLabel = (questionId: string) =>
    scenario?.questions.find((question) => question.id === questionId)?.prompt ??
    questionId;

  return (
    <AppShell
      screen="practice_result"
      backHref="/"
      showBadges={false}
      footer={
        <Link className="btn btn--primary" href="/">
          {t.practiceResult.backHome}
        </Link>
      }
    >
      <div className="stack stack--loose">
        <h1 className="screen-title">{t.practiceResult.title}</h1>

        <div className="notice notice--ok" role="status">
          <span className="notice__icon" aria-hidden="true">
            {stats.independent === stats.total ? '🎉' : '🙂'}
          </span>
          <span>
            {stats.independent === stats.total
              ? t.practiceResult.allIndependent
              : t.practiceResult.noneIndependent}
          </span>
        </div>

        <section className="card">
          <h2 className="section-heading">
            <span aria-hidden="true">✅ </span>
            {t.practiceResult.independent} ·{' '}
            {t.practiceResult.itemCount(independentQuestions.length)}
          </h2>
          {independentQuestions.length === 0 ? (
            <p className="text-small">—</p>
          ) : (
            <ul>
              {independentQuestions.map((outcome) => (
                <li key={outcome.questionId}>{questionLabel(outcome.questionId)}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="section-heading">
            <span aria-hidden="true">💡 </span>
            {t.practiceResult.withHints} ·{' '}
            {t.practiceResult.itemCount(helpedQuestions.length)}
          </h2>
          {helpedQuestions.length === 0 ? (
            <p className="text-small">—</p>
          ) : (
            <ul>
              {helpedQuestions.map((outcome) => (
                <li key={outcome.questionId}>{questionLabel(outcome.questionId)}</li>
              ))}
            </ul>
          )}
        </section>

        {tutorial ? (
          <section className="card">
            <h2 className="section-heading">
              <span aria-hidden="true">📌 </span>
              {t.practiceResult.remember}
            </h2>
            <ul>
              {tutorial.keyTerms.slice(0, 3).map((term) => (
                <li key={term.term}>
                  <strong>{term.term}</strong> — {term.easyExplanation}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p>{t.practiceResult.closing}</p>

        <div className="stack stack--tight">
          {scenario ? (
            <Link
              className="btn btn--secondary"
              href={`/practice?scenario=${encodeURIComponent(scenario.id)}`}
            >
              <span aria-hidden="true">🔁</span>
              {t.practiceResult.againLater}
            </Link>
          ) : null}
          <Link
            className="btn btn--secondary"
            href={`/tutorial?type=${record.documentType}`}
          >
            <span aria-hidden="true">📘</span>
            {t.practiceResult.seeTutorial}
          </Link>
        </div>

        <p className="text-small">{t.history.noScoreNotice}</p>
      </div>
    </AppShell>
  );
}
