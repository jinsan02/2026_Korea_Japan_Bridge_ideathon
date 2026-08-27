'use client';

/**
 * Reading preferences: text size and interface language.
 *
 * A quiet second row under the navigation. Small on purpose - these are
 * settings, not the task - but present on every screen, because someone who
 * cannot read the screen cannot navigate to a settings page to fix that.
 *
 * Both are cycles rather than pickers. A three-button size group and a
 * language dropdown filled the whole header; more importantly, a row of
 * near-identical 가 buttons asks the reader to compare three things when what
 * they want is "bigger". So the size button steps up one notch per press and
 * wraps back to the smallest at the end, and the language button shows the
 * language it will switch TO.
 *
 * Pressing language re-reads the document too, not just the interface.
 * Translating the chrome alone left the document's own words behind and
 * produced sentences like "この 書類は 가스요금 납부용지の ようです", which
 * reads as a bug rather than as two languages.
 */
import { LANGUAGE_NAMES, UI_LANGUAGES } from '@/lib/i18n';
import { TEXT_SCALES, useSession } from '@/lib/session/SessionProvider';
import type { TextScale } from '@/lib/session/SessionProvider';

const SCALES = Object.keys(TEXT_SCALES) as TextScale[];

/** Rendered size of the sample glyph, so the button shows its own effect. */
const SAMPLE_SIZE: Record<TextScale, string> = {
  normal: '0.9rem',
  large: '1.1rem',
  huge: '1.3rem',
};

/** Short glyph for the language the button switches to. */
const LANGUAGE_GLYPH: Record<string, string> = { ko: '한', ja: '日' };

export function ViewControls({ showLanguage = true }: { showLanguage?: boolean }) {
  const { t, textScale, setTextScale, language, switchLanguage, translating, logEvent } =
    useSession();

  const index = Math.max(0, SCALES.indexOf(textScale));
  const next = SCALES[(index + 1) % SCALES.length]!;
  const scaleName = (scale: TextScale) =>
    scale === 'normal'
      ? t.common.textSizeNormal
      : scale === 'large'
        ? t.common.textSizeLarge
        : t.common.textSizeHuge;

  const other = UI_LANGUAGES.find((code) => code !== language) ?? language;

  return (
    <div className="view-controls">
      <span className="view-controls__pair">
        <span className="view-controls__caption">{t.common.textSize}</span>
        <button
          type="button"
          className="view-controls__btn"
          // The visible label is a glyph and three dots; a screen reader needs
          // to hear where it is now and what pressing will do.
          aria-label={`${t.common.textSize}: ${scaleName(textScale)}. ${scaleName(next)}`}
          onClick={() => {
            setTextScale(next);
            logEvent('text_scale_changed', { screen: 'chrome' });
          }}
        >
          <span aria-hidden="true" style={{ fontSize: SAMPLE_SIZE[textScale] }}>
            {t.common.textSizeGlyph}
          </span>
          <span className="view-controls__dots" aria-hidden="true">
            {SCALES.map((scale) => (
              <span
                key={scale}
                className="view-controls__dot"
                data-on={scale === textScale}
              />
            ))}
          </span>
        </button>
      </span>

      {showLanguage ? (
        <span className="view-controls__pair">
          <span className="view-controls__caption">{t.common.language}</span>
          <button
            type="button"
            className="view-controls__btn view-controls__btn--lang"
            aria-label={`${t.common.switchLanguage}: ${LANGUAGE_NAMES[other]}`}
            aria-busy={translating}
            disabled={translating}
            onClick={() => {
              switchLanguage(other);
              logEvent('language_changed', { screen: 'chrome' });
            }}
          >
            <span aria-hidden="true">{translating ? '⏳' : '🌐'}</span>
            <span aria-hidden="true">{LANGUAGE_GLYPH[other] ?? LANGUAGE_NAMES[other]}</span>
          </button>
        </span>
      ) : null}
    </div>
  );
}
