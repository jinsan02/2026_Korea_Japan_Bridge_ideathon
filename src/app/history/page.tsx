'use client';

/**
 * 지난 연습 보기.
 *
 * Shows what was solved alone and where hints were needed - and says plainly
 * that this is not a score or a grade. Nothing on this screen may read as an
 * assessment of the person's abilities.
 *
 * Independent Completion Rate and Hint Reduction are shown as what they are:
 * design targets measured on synthetic practice, not evidence that real
 * dependence has fallen.
 */
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { getPracticeScenario } from '@/lib/fixtures/practice';
import { clearProgress, readProgress } from '@/lib/learning/progress';
import {
  hintReduction,
  independentCompletionRate,
  summarise,
  type PracticeRecord,
} from '@/lib/learning/types';
import { useSession } from '@/lib/session/SessionProvider';

function formatWhen(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

export default function HistoryScreen() {
  const { t } = useSession();
  const [records, setRecords] = useState<PracticeRecord[]>([]);

  useEffect(() => {
    setRecords(readProgress().records);
  }, []);

  const rate = independentCompletionRate(records);
  const reduction = hintReduction(records);

  return (
    <AppShell screen="history" backHref="/" showBadges={false}>
      <div className="stack stack--loose">
        <div className="stack stack--tight">
          <h1 className="screen-title">{t.history.title}</h1>
          <p className="screen-subtitle">{t.history.subtitle}</p>
        </div>

        <p className="notice notice--info">
          <span className="notice__icon" aria-hidden="true">
            ℹ️
          </span>
          <span>{t.history.noScoreNotice}</span>
        </p>

        {records.length === 0 ? (
          <div className="card">
            <p>{t.history.empty}</p>
            <Link className="btn btn--primary" href="/practice">
              {t.practice.title}
            </Link>
          </div>
        ) : (
          <>
            <section className="card">
              <div className="field">
                <p className="field__label">{t.history.independentRate}</p>
                <p className="field__value">
                  {rate === null ? '—' : `${Math.round(rate * 100)}%`}
                </p>
              </div>
              <div className="field">
                <p className="field__label">{t.history.hintReduction}</p>
                <p className="field__value">
                  {reduction === null ? t.history.notEnough : `${reduction}`}
                </p>
              </div>
            </section>

            <div className="table-scroll">
              <table className="data">
                <thead>
                  <tr>
                    <th>{t.history.when}</th>
                    <th>{t.history.documentType}</th>
                    <th>{t.practiceResult.independent}</th>
                    <th>{t.history.hintsUsed}</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => {
                    const stats = summarise(record);
                    const scenario = getPracticeScenario(record.scenarioId);
                    return (
                      <tr key={record.id}>
                        <td>{formatWhen(record.completedAt)}</td>
                        <td>{scenario?.title ?? record.documentType}</td>
                        <td>
                          {stats.independent} / {stats.total}
                        </td>
                        <td>{stats.hintsUsed}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              className="btn btn--quiet"
              onClick={() => {
                if (window.confirm(t.history.clearConfirm)) {
                  clearProgress();
                  setRecords([]);
                }
              }}
            >
              {t.history.clear}
            </button>
          </>
        )}
      </div>
    </AppShell>
  );
}
