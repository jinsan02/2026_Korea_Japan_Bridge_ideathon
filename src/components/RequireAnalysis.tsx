'use client';

/**
 * Guard for screens that need an analysis.
 *
 * A refreshed tab or a deep link lands here instead of on a screen full of
 * blanks, and offers the one useful action: start over.
 *
 * It also owns the language mismatch. The header toggle re-reads the document
 * automatically, so this notice only appears when that failed - a dropped
 * request, or a live provider that errored - and offers the manual retry
 * rather than leaving a half-translated screen with no way forward.
 */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { AppShell } from '@/components/AppShell';
import { useSession } from '@/lib/session/SessionProvider';
import type { DocumentAnalysis } from '@/lib/analysis/schema';

export function RequireAnalysis({
  screen,
  children,
}: {
  screen: string;
  children: (analysis: DocumentAnalysis) => ReactNode;
}) {
  const router = useRouter();
  const { t, analysis, language, translating } = useSession();

  if (!analysis) {
    return (
      <AppShell screen={screen} showBadges={false}>
        <div className="stack stack--loose">
          <p className="notice notice--caution">
            <span className="notice__icon" aria-hidden="true">
              ⚠️
            </span>
            <span>{t.errors.noResult}</span>
          </p>
          <Link className="btn btn--primary" href="/">
            {t.errors.startOver}
          </Link>
        </div>
      </AppShell>
    );
  }

  // 'unknown' means the document's language could not be determined, which is
  // not a mismatch with the reader's choice.
  const mismatched =
    !translating && analysis.language !== 'unknown' && analysis.language !== language;

  return (
    <>
      {mismatched ? (
        <div className="reread-bar">
          <span>{t.common.rereadNotice}</span>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => router.push('/analyzing')}
          >
            <span aria-hidden="true">🌐</span>
            {t.common.rereadInLanguage}
          </button>
        </div>
      ) : null}
      {children(analysis)}
    </>
  );
}
