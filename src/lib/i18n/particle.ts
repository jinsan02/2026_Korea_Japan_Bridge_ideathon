/**
 * Korean particle selection.
 *
 * Document type labels come from the model and from fixtures, so a sentence
 * that glues a particle onto one cannot hardcode the choice: "안내문으로" is
 * right and "고지서으로" is wrong, and which one applies depends on the last
 * syllable of a string we do not control.
 *
 * Hangul syllables are laid out so the final consonant is recoverable by
 * arithmetic: each initial spans 588 code points and each vowel 28, leaving the
 * remainder as the index of the final consonant (0 = none).
 */
const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
const FINALS = 28;
/** Index of ㄹ in the final-consonant table - it behaves like "no final" here. */
const RIEUL = 8;

/**
 * The trailing consonant of the last Hangul syllable: 0 when there is none,
 * or when the string does not end in a Hangul syllable at all.
 */
function finalConsonant(word: string): number | null {
  // Labels often end in a qualifier - "결제앱 화면 (일본)" - and the particle
  // agrees with the word, not with the bracket.
  const base = word.replace(/\s*[([（【][^)\]）】]*[)\]）】]\s*$/, '').trimEnd();
  const last = (base || word.trimEnd()).at(-1);
  if (last === undefined) return null;
  const code = last.codePointAt(0)!;
  if (code < HANGUL_START || code > HANGUL_END) return null;
  return (code - HANGUL_START) % FINALS;
}

/** "…로" after a vowel or ㄹ, "…으로" otherwise. */
export function euro(word: string): string {
  const final = finalConsonant(word);
  // A non-Hangul ending (a number, Latin, kana) gets the safer bare form.
  if (final === null) return `${word}로`;
  return final === 0 || final === RIEUL ? `${word}로` : `${word}으로`;
}

/** "…은" after a final consonant, "…는" otherwise. */
export function eunNeun(word: string): string {
  const final = finalConsonant(word);
  if (final === null) return `${word}는`;
  return final === 0 ? `${word}는` : `${word}은`;
}

/** "…이" after a final consonant, "…가" otherwise. */
export function iGa(word: string): string {
  const final = finalConsonant(word);
  if (final === null) return `${word}가`;
  return final === 0 ? `${word}가` : `${word}이`;
}
