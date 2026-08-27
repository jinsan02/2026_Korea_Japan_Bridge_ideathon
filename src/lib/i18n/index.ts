import { type Dictionary, ko } from './ko';
import { ja } from './ja';

export type { Dictionary };

/**
 * The UI languages. Narrower than the schema's `Language`, which also allows
 * 'unknown' for a document whose language could not be determined - the
 * interface itself is always in a language someone chose.
 */
export type UiLanguage = 'ko' | 'ja';

const DICTIONARIES: Record<UiLanguage, Dictionary> = { ko, ja };

export const UI_LANGUAGES: readonly UiLanguage[] = ['ko', 'ja'];

export const LANGUAGE_NAMES: Record<UiLanguage, string> = {
  ko: '한국어',
  ja: '日本語',
};

/** BCP-47 tags for speech synthesis and the `lang` attribute. */
export const LANGUAGE_TAGS: Record<UiLanguage, string> = {
  ko: 'ko-KR',
  ja: 'ja-JP',
};

export const DEFAULT_LANGUAGE: UiLanguage = 'ko';

export function getDictionary(language: UiLanguage): Dictionary {
  return DICTIONARIES[language] ?? ko;
}

export function isUiLanguage(value: unknown): value is UiLanguage {
  return value === 'ko' || value === 'ja';
}
