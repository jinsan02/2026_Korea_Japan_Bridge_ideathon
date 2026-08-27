'use client';

/**
 * Camera / upload.
 *
 * `capture="environment"` opens the rear camera directly on a phone, which is
 * the real on-stage path. The photo is downscaled and stripped of EXIF here in
 * the browser before it goes anywhere - see lib/util/image.ts.
 */
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/AppShell';
import { DocumentPageView } from '@/components/DocumentPageView';
import { DOCUMENT_FIXTURES } from '@/lib/fixtures/documents';
import { prepareImage } from '@/lib/util/image';
import { useSession } from '@/lib/session/SessionProvider';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 6_000_000;
const MAX_EDGE_PX = 1_600;

export default function CaptureScreen() {
  const router = useRouter();
  const { t, fixtureId, setFixtureId, setImage, image, logEvent } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const selected =
    DOCUMENT_FIXTURES.find((fixture) => fixture.id === fixtureId) ?? DOCUMENT_FIXTURES[0];

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);

    if (!ALLOWED.includes(file.type)) {
      setError(t.capture.errorType);
      return;
    }
    if (file.size > MAX_BYTES * 4) {
      // Generous pre-check: the downscale below usually brings a large phone
      // photo well under the limit, so only refuse the truly enormous.
      setError(t.capture.errorTooLarge(Math.floor(MAX_BYTES / 1_000_000)));
      return;
    }

    setBusy(true);
    try {
      const prepared = await prepareImage(file, { maxEdgePx: MAX_EDGE_PX });
      if (prepared.bytes > MAX_BYTES) {
        setError(t.capture.errorTooLarge(Math.floor(MAX_BYTES / 1_000_000)));
        return;
      }
      setImage({
        base64: prepared.base64,
        mimeType: prepared.mimeType,
        previewUrl: prepared.previewUrl,
      });
      logEvent('document_selected', { screen: 'capture' });
      router.push('/consent');
    } catch {
      setError(t.capture.errorReadFailed);
    } finally {
      setBusy(false);
    }
  };

  const useFixture = (id: string) => {
    setFixtureId(id);
    setImage(null);
    logEvent('document_selected', { screen: 'capture', fixtureId: id });
  };

  return (
    <AppShell
      screen="capture"
      backHref="/"
      step={{ current: 1, total: 4 }}
      showBadges={false}
      footer={
        <button
          type="button"
          className="btn btn--primary"
          disabled={busy}
          onClick={() => router.push('/consent')}
        >
          {busy ? t.capture.preparing : t.capture.analyze}
        </button>
      }
    >
      <div className="stack stack--loose">
        <div className="stack stack--tight">
          <h1 className="screen-title">{t.capture.title}</h1>
          <p className="screen-subtitle">{t.capture.help}</p>
        </div>

        {error ? (
          <p className="notice notice--critical" role="alert">
            <span className="notice__icon" aria-hidden="true">
              🛑
            </span>
            <span>{error}</span>
          </p>
        ) : null}

        <div className="stack">
          <button
            type="button"
            className="btn btn--primary"
            disabled={busy}
            onClick={() => cameraInput.current?.click()}
          >
            <span aria-hidden="true">📷</span>
            {t.capture.takePhoto}
          </button>
          <p className="text-small">{t.capture.cameraHint}</p>

          <button
            type="button"
            className="btn btn--secondary"
            disabled={busy}
            onClick={() => fileInput.current?.click()}
          >
            <span aria-hidden="true">🖼️</span>
            {t.capture.chooseFile}
          </button>
          <p className="text-small">
            <span aria-hidden="true">🔒 </span>
            {t.capture.privacyHint}
          </p>
        </div>

        <input
          ref={cameraInput}
          className="visually-hidden"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
        <input
          ref={fileInput}
          className="visually-hidden"
          type="file"
          accept={ALLOWED.join(',')}
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />

        {image ? (
          <div className="card card--flat">
            <p className="field__label">{t.capture.selected}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="doc-thumb" src={image.previewUrl} alt={t.capture.selected} />
          </div>
        ) : null}

        <div className="card">
          <div className="stack stack--tight">
            <h2 className="section-heading">
              <span aria-hidden="true">🧪 </span>
              {t.capture.demoTitle}
            </h2>
            <p className="text-small">{t.capture.demoHelp}</p>
          </div>

          <div className="stack stack--tight">
            {DOCUMENT_FIXTURES.map((fixture) => (
              <label
                key={fixture.id}
                className="radio-row"
                data-selected={!image && fixture.id === selected?.id}
              >
                <input
                  type="radio"
                  name="fixture"
                  value={fixture.id}
                  checked={!image && fixture.id === selected?.id}
                  onChange={() => useFixture(fixture.id)}
                />
                <span>
                  <span aria-hidden="true">{fixture.icon} </span>
                  <strong>{fixture.title}</strong>
                  <br />
                  <span className="text-small">{fixture.description}</span>
                </span>
              </label>
            ))}
          </div>

          {!image && selected ? (
            <div className="doc-scroll">
              <DocumentPageView page={selected.page} label={selected.title} />
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
