'use client';

/**
 * Honesty banner.
 *
 * Demo mode is announced with a badge AND a sentence, never hidden, never
 * dressed up as live analysis. When a live provider failed and we degraded to
 * fixtures, the reason is stated too - "AI 서버에 연결하지 못해 데모 모드로
 * 보여드립니다" is a better thing to say on stage than a silent fake.
 */
import { useSession } from '@/lib/session/SessionProvider';

export function ModeBadges() {
  const { t, meta } = useSession();
  if (!meta) return null;

  const isDemo = meta.provider === 'fixture';

  return (
    <div className="stack stack--tight">
      <div className="badge-row">
        <span className={`badge ${isDemo ? 'badge--demo' : 'badge--live'}`}>
          <span aria-hidden="true">{isDemo ? '🧪' : '🤖'}</span>
          {isDemo ? t.badge.demoMode : t.badge.liveMode}
        </span>
        <span className="badge badge--synthetic">
          <span aria-hidden="true">
            {meta.provider === 'ollama' ? '💻' : meta.provider === 'openai' ? '☁️' : '📄'}
          </span>
          {t.badge.provider[meta.provider]}
          {meta.model ? ` · ${meta.model}` : ''}
        </span>
        {meta.synthetic ? (
          <span className="badge badge--synthetic">
            <span aria-hidden="true">📄</span>
            {t.badge.synthetic}
          </span>
        ) : null}
      </div>

      {meta.fellBack ? (
        <p className="notice notice--caution" role="status">
          <span className="notice__icon" aria-hidden="true">
            ⚠️
          </span>
          <span>
            <strong>{t.badge.fellBack}</strong>
            <br />
            {t.badge.reason[meta.fallbackReason ?? 'unknown']}
          </span>
        </p>
      ) : (
        <p className="text-small">
          {isDemo ? t.badge.demoModeHelp : t.badge.liveModeHelp}
        </p>
      )}
    </div>
  );
}
