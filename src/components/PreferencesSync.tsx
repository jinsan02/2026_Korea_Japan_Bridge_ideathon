'use client';

/**
 * Applies the reader's preferences to the document root.
 *
 * - `lang` follows the chosen language so a screen reader switches
 *   pronunciation when the demo moves from Korean to Japanese.
 * - Text size scales the root font-size, so every rem-based token in the design
 *   grows together instead of a few hand-picked headings.
 */
import { useEffect } from 'react';

import { LANGUAGE_TAGS } from '@/lib/i18n';
import { TEXT_SCALES, useSession } from '@/lib/session/SessionProvider';

const BASE_FONT_PX = 16;

export function PreferencesSync() {
  const { language, textScale } = useSession();

  useEffect(() => {
    document.documentElement.lang = LANGUAGE_TAGS[language];
  }, [language]);

  useEffect(() => {
    const scale = TEXT_SCALES[textScale] ?? 1;
    document.documentElement.style.fontSize = `${BASE_FONT_PX * scale}px`;
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [textScale]);

  return null;
}
