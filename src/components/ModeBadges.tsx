'use client';

/**
 * Degradation notice.
 *
 * This used to be a permanent three-chip banner - 데모 모드 / 예시 문서 /
 * 합성문서 - on top of every screen. It has been cut back to the one case that
 * is actually news: a live provider failed and the app quietly served a
 * prepared result instead. Announcing that on stage is better than a silent
 * fake; announcing "this is a demo" on a screen the presenter just introduced
 * as a demo is noise that pushes the content down.
 *
 * Choosing the example documents deliberately is therefore silent. What keeps
 * that honest is the documents themselves: every synthetic page carries a
 * printed "합성문서입니다 / 合成文書です" line, and a test fails if one does
 * not. The disclosure lives on the artefact, where it cannot be styled away.
 */
import { useSession } from '@/lib/session/SessionProvider';

export function ModeBadges() {
  const { t, meta } = useSession();
  if (!meta?.fellBack) return null;

  return (
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
  );
}
