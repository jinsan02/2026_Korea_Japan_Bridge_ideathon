'use client';

/**
 * Consent and privacy.
 *
 * Three things this screen refuses to do: bury the "your photo goes to an
 * external AI service" line, imply on-device masking exists, and make consent
 * the only way forward. Declining leads to the example documents, which is a
 * complete experience rather than a dead end.
 */
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/AppShell';
import { useSession } from '@/lib/session/SessionProvider';

export default function ConsentScreen() {
  const router = useRouter();
  const { t, image, provider, setImage, logEvent } = useSession();
  const usingOwnPhoto = image !== null;
  const isLocal = provider === 'ollama';

  const accept = () => {
    logEvent('consent_accepted', { screen: 'consent', provider });
    router.push('/analyzing');
  };

  const declineToDemo = () => {
    logEvent('consent_declined', { screen: 'consent' });
    // Drop the photo and continue with a synthetic document instead.
    setImage(null);
    router.push('/analyzing');
  };

  return (
    <AppShell
      screen="consent"
      backHref="/capture"
      step={{ current: 2, total: 4 }}
      showBadges={false}
      footer={
        <>
          <button type="button" className="btn btn--primary" onClick={accept}>
            {t.consent.agree}
          </button>
          <button type="button" className="btn btn--quiet" onClick={declineToDemo}>
            {t.consent.declineToDemo}
          </button>
        </>
      }
    >
      <div className="stack stack--loose">
        <h1 className="screen-title">{t.consent.title}</h1>

        {usingOwnPhoto ? (
          isLocal ? (
            <div className="notice notice--ok">
              <span className="notice__icon" aria-hidden="true">
                💻
              </span>
              <span>
                <strong>{t.consent.localTitle}</strong>
                <br />
                {t.consent.localBody}
              </span>
            </div>
          ) : (
            <div className="notice notice--caution">
              <span className="notice__icon" aria-hidden="true">
                ⚠️
              </span>
              <span>
                <strong>{t.consent.uploadTitle}</strong>
                <br />
                {t.consent.uploadBody}
              </span>
            </div>
          )
        ) : (
          <div className="notice notice--info">
            <span className="notice__icon" aria-hidden="true">
              📄
            </span>
            <span>
              <strong>{t.consent.syntheticTitle}</strong>
              <br />
              {t.consent.syntheticBody}
            </span>
          </div>
        )}

        <div className="notice notice--ok">
          <span className="notice__icon" aria-hidden="true">
            🗑️
          </span>
          <span>
            <strong>{t.consent.storageTitle}</strong>
            <br />
            {t.consent.storageBody}
          </span>
        </div>

        <div className="notice notice--info">
          <span className="notice__icon" aria-hidden="true">
            🚧
          </span>
          <span>
            <strong>{t.consent.maskingTitle}</strong>
            <br />
            {t.consent.maskingBody}
          </span>
        </div>
      </div>
    </AppShell>
  );
}
