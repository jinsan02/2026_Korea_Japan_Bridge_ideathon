'use client';

/**
 * Guard for screens that need an analysis.
 *
 * A refreshed tab or a deep link lands here instead of on a screen full of
 * blanks, and offers the one useful action: start over.
 */
import Link from 'next/link';
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
  const { t, analysis } = useSession();

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

  return <>{children(analysis)}</>;
}
