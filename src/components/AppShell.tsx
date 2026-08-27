'use client';

/**
 * Screen frame.
 *
 * Back and close sit in the same place on every screen - one of the explicit
 * accessibility requirements - and going back is counted here rather than in
 * each screen, so the experiment metric cannot be forgotten.
 *
 * The header is two rows, and the split is by kind. The first row is where you
 * are and how to leave it: back, the step count, the logo. The second is how
 * you would like to read, set smaller and quieter beneath it.
 *
 * They were one row and it read as nonsense - "글자 크기 / 언어 / 뒤로 /
 * 4단계 중 1단계" is four unrelated things in a sentence. Reading preferences
 * still must not be buried in a settings page a struggling reader cannot
 * navigate to, so they stay on every screen; they just stop competing with
 * navigation for the top line.
 */
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { ReactNode } from 'react';

import { useSession } from '@/lib/session/SessionProvider';
import { ModeBadges } from './ModeBadges';
import { ViewControls } from './ViewControls';

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
  /**
   * Hide the language toggle where switching mid-task would strand the user -
   * a half-finished practice run has no other-language version to move to.
   */
  showLanguageToggle?: boolean;
}

export function AppShell({
  children,
  backHref,
  screen,
  footer,
  showBadges = true,
  step,
  showLanguageToggle = true,
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
        <div className="app-header__nav">
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
            <span className="app-header__step">
              {t.common.step(step.current, step.total)}
            </span>
          ) : null}
        </div>

        <ViewControls showLanguage={showLanguageToggle} />
      </header>

      <main className="app-main">
        {showBadges ? <ModeBadges /> : null}
        {children}
      </main>

      {footer ? <div className="app-footer">{footer}</div> : null}
    </div>
  );
}
