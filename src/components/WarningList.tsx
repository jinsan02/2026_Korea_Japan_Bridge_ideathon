'use client';

/**
 * Warnings, uncertainty, and the human-review gate.
 *
 * Severity is shown with an icon and a border, never colour alone. Critical
 * warnings sort first, because when the app is unsure that has to be the first
 * thing read - not a footnote under a confident-looking answer.
 */
import type { WarningItem } from '@/lib/analysis/schema';
import { useSession } from '@/lib/session/SessionProvider';

const ICONS: Record<WarningItem['severity'], string> = {
  info: 'ℹ️',
  caution: '⚠️',
  critical: '🛑',
};

const ORDER: Record<WarningItem['severity'], number> = {
  critical: 0,
  caution: 1,
  info: 2,
};

export function WarningList({ warnings }: { warnings: WarningItem[] }) {
  if (warnings.length === 0) return null;

  const sorted = [...warnings].sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);

  return (
    <div className="stack stack--tight">
      {sorted.map((warning) => (
        <p key={warning.id} className={`notice notice--${warning.severity}`}>
          <span className="notice__icon" aria-hidden="true">
            {ICONS[warning.severity]}
          </span>
          <span>{warning.message}</span>
        </p>
      ))}
    </div>
  );
}

/** Plain-language list of what could not be confirmed. */
export function UncertaintyList({ items }: { items: string[] }) {
  const { t } = useSession();
  if (items.length === 0) return null;

  return (
    <section className="card card--flat">
      <h2 className="section-heading">
        <span aria-hidden="true">❓ </span>
        {t.result.uncertainty}
      </h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

/** The explicit stop shown when the app is not confident enough to advise. */
export function HumanReviewNotice() {
  const { t, analysis } = useSession();
  if (!analysis?.requiresHumanVerification) return null;

  return (
    <div className="notice notice--critical" role="alert">
      <span className="notice__icon" aria-hidden="true">
        🛑
      </span>
      <span>
        <strong>{t.humanReview.title}</strong>
        <br />
        {t.humanReview.body}
      </span>
    </div>
  );
}

/** Confidence in words rather than a percentage. */
export function ConfidenceNote({ confidence }: { confidence: number }) {
  const { t } = useSession();
  const level = confidence >= 0.85 ? 'high' : confidence > 0.55 ? 'medium' : 'low';
  const tone = level === 'high' ? 'ok' : level === 'medium' ? 'info' : 'caution';
  const icon = level === 'high' ? '✅' : level === 'medium' ? '🔍' : '❓';

  return (
    <p className={`notice notice--${tone}`}>
      <span className="notice__icon" aria-hidden="true">
        {icon}
      </span>
      <span>
        <strong>{t.confidence.label}</strong>
        <br />
        {t.confidence[level]}
      </span>
    </p>
  );
}
