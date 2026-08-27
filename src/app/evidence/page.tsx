'use client';

/**
 * Evidence Lens.
 *
 * Every claim on the result screen traces to a verbatim quote and, where
 * geometry exists, to the exact region of the page. This is the answer to
 * "정말 9월 30일까지 맞아?" - and it ends with a route to the official source
 * rather than asking anyone to trust the model.
 *
 * `?ids=` narrows the list to one action card's evidence; with no query it
 * shows everything the analysis was built on.
 */
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { EvidenceCard } from '@/components/EvidenceViewer';
import { RequireAnalysis } from '@/components/RequireAnalysis';
import { ConfidenceNote } from '@/components/WarningList';
import { useSession } from '@/lib/session/SessionProvider';

function EvidenceContent() {
  const { t, logEvent } = useSession();
  const params = useSearchParams();
  const [openId, setOpenId] = useState<string | null>(null);

  const filter = params.get('ids')?.split(',').filter(Boolean) ?? null;

  return (
    <RequireAnalysis screen="evidence">
      {(analysis) => {
        const items =
          filter && filter.length > 0
            ? analysis.evidence.filter((item) => filter.includes(item.id))
            : analysis.evidence;

        return (
          <AppShell
            screen="evidence"
            backHref="/result"
            footer={
              <Link className="btn btn--primary" href="/contact">
                <span aria-hidden="true">🏛️</span>
                {t.evidence.verifyOfficial}
              </Link>
            }
          >
            <div className="stack stack--loose">
              <div className="stack stack--tight">
                <h1 className="screen-title">{t.evidence.title}</h1>
                <p className="screen-subtitle">{t.evidence.subtitle}</p>
              </div>

              <ConfidenceNote confidence={analysis.confidence} />

              {items.length === 0 ? (
                <p className="notice notice--caution">
                  <span className="notice__icon" aria-hidden="true">
                    ❓
                  </span>
                  <span>{t.evidence.none}</span>
                </p>
              ) : null}

              {items.map((item) => (
                <EvidenceCard
                  key={item.id}
                  evidence={item}
                  open={openId === item.id}
                  onToggle={() => {
                    const next = openId === item.id ? null : item.id;
                    setOpenId(next);
                    if (next) {
                      logEvent('evidence_opened', { screen: 'evidence' });
                    }
                  }}
                />
              ))}

              <p className="text-small">{t.evidence.unverifiedNote}</p>
            </div>
          </AppShell>
        );
      }}
    </RequireAnalysis>
  );
}

export default function EvidenceScreen() {
  // useSearchParams needs a Suspense boundary in the app router.
  return (
    <Suspense fallback={null}>
      <EvidenceContent />
    </Suspense>
  );
}
