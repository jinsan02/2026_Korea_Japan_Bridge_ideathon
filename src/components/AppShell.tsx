'use client';

/**
 * Screen frame.
 *
 * Back and close sit in the same place on every screen - one of the explicit
 * accessibility requirements - and going back is counted here rather than in
 * each screen, so the experiment metric cannot be forgotten.
 */
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { ReactNode } from 'react';

import { useSession } from '@/lib/session/SessionProvider';
import { ModeBadges } from './ModeBadges';

interface AppShellProps {
  children: ReactNode;
  /** Route for the back button. Omit to hide it (start screen). */
  backHref?: string;
  /** Screen name recorded with the back event. */
  screen: string;
  /** Sticky bottom area for the screen's primary action. */
  footer?: ReactNode;
  /** Show the demo/live/synthetic badges. */
  showBadges?: boolean;
  step?: { current: number; total: number };
}

export function AppShell({
  children,
  backHref,
  screen,
  footer,
  showBadges = true,
  step,
}: AppShellProps) {
  const router = useRouter();
  const { t, countBack, logEvent } = useSession();

  const handleBack = () => {
    countBack();
    logEvent('back_pressed', { screen });
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        {backHref ? (
          <button
            type="button"
            className="btn btn--quiet btn--icon"
            onClick={handleBack}
          >
            <span aria-hidden="true">←</span>
            {t.common.back}
          </button>
        ) : (
          <div className="app-logo" aria-label={t.appName}>
            <Image
              className="app-logo__mark"
              src="/brand/ai-door-mark.png"
              alt=""
              width={240}
              height={165}
              priority
            />
            <span className="app-logo__copy">
              <span className="app-logo__name">AI DOOR</span>
              <span className="app-logo__tagline">AI Support</span>
            </span>
          </div>
        )}
        <span className="app-header__spacer" />
        {step ? (
          <span className="text-small">{t.common.step(step.current, step.total)}</span>
        ) : null}
      </header>

      <main className="app-main">
        {showBadges ? <ModeBadges /> : null}
        {children}
      </main>

      {footer ? <div className="app-footer">{footer}</div> : null}
    </div>
  );
}
