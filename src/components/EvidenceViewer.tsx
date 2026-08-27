'use client';

/**
 * Shows a quote and, when geometry exists, where it sits on the page.
 *
 * Two sources of page imagery:
 *   - a synthetic fixture, drawn as SVG from the same coordinates the evidence
 *     region was computed from, so the highlight can never drift
 *   - the user's own photo, with the region overlaid as a percentage box
 *
 * When there is no region at all the quote is still shown, and the screen says
 * why there is no highlight rather than leaving an empty frame.
 */
import { DocumentPageView } from '@/components/DocumentPageView';
import type { EvidenceItem } from '@/lib/analysis/schema';
import { getFixture } from '@/lib/fixtures/documents';
import { useSession } from '@/lib/session/SessionProvider';

export function EvidenceCard({
  evidence,
  open,
  onToggle,
}: {
  evidence: EvidenceItem;
  open: boolean;
  onToggle: () => void;
}) {
  const { t, meta, image } = useSession();
  const fixture = meta?.fixtureId ? getFixture(meta.fixtureId) : undefined;
  const canLocate = evidence.region !== undefined && (fixture || image);

  return (
    <section className="card">
      <div className="stack stack--tight">
        <p className="field__label">{t.evidence.original}</p>
        <blockquote
          style={{
            margin: 0,
            padding: 'var(--space-3)',
            background: 'var(--surface-sunken)',
            borderLeft: '6px solid var(--brand)',
            borderRadius: '8px',
            fontWeight: 700,
          }}
        >
          {evidence.originalText}
        </blockquote>

        {evidence.translatedText ? (
          <>
            <p className="field__label">{t.evidence.translated}</p>
            <p>{evidence.translatedText}</p>
          </>
        ) : null}

        <p className="field__label">{t.evidence.explanation}</p>
        <p>{evidence.explanation}</p>

        {evidence.page ? (
          <p className="text-small">
            <span aria-hidden="true">📍 </span>
            {t.evidence.location}: {t.evidence.page(evidence.page)}
          </p>
        ) : null}
      </div>

      {canLocate ? (
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onToggle}
          aria-expanded={open}
        >
          <span aria-hidden="true">{open ? '🙈' : '🔍'}</span>
          {open ? t.evidence.hide : t.evidence.show}
        </button>
      ) : (
        <p className="text-small">{t.evidence.noRegion}</p>
      )}

      {open ? <EvidenceLocation evidence={evidence} /> : null}
    </section>
  );
}

/** The page image with the region highlighted. */
export function EvidenceLocation({ evidence }: { evidence: EvidenceItem }) {
  const { meta, image, t } = useSession();
  const fixture = meta?.fixtureId ? getFixture(meta.fixtureId) : undefined;

  if (fixture) {
    return (
      <div className="doc-scroll">
        <DocumentPageView
          page={fixture.page}
          highlight={evidence.region ?? null}
          label={`${fixture.title} - ${t.evidence.location}`}
        />
      </div>
    );
  }

  if (!image) return null;

  return (
    <div className="doc-frame" style={{ position: 'relative' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.previewUrl}
        alt={t.evidence.location}
        style={{ display: 'block', width: '100%' }}
      />
      {evidence.region ? (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `${evidence.region.x * 100}%`,
            top: `${evidence.region.y * 100}%`,
            width: `${evidence.region.width * 100}%`,
            height: `${evidence.region.height * 100}%`,
            border: '4px solid #a01b1b',
            background: 'rgba(255, 230, 128, 0.45)',
            borderRadius: '6px',
          }}
        />
      ) : null}
    </div>
  );
}
