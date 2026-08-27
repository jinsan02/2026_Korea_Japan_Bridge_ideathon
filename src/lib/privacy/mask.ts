/**
 * Text masking for the review screen.
 *
 * Scope note, so this is not oversold: this is a pattern-based mask applied to
 * text that is already about to be shown in the practice screen. It is NOT
 * on-device PII redaction of the uploaded photo - that does not exist in this
 * MVP and the consent screen says so.
 *
 * What it is for: making sure that if a practice document ever gains a
 * number-shaped string, it is starred out before it reaches the screen.
 */

export const MASK = '●●●';

interface MaskRule {
  name: string;
  pattern: RegExp;
  replace: (match: string) => string;
}

/** Keeps the shape of the value visible without revealing it. */
function starOut(match: string): string {
  return MASK;
}

/** Korean resident registration number: 000000-0000000. */
const KR_RRN = /\b\d{6}\s*-\s*\d{7}\b/g;

/** Japanese My Number: 12 digits, often spaced in groups of four. */
const JP_MYNUMBER = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;

/** Phone numbers, Korean and Japanese shapes. */
const PHONE = /\b0\d{1,3}[-\s]\d{3,4}[-\s]\d{4}\b/g;

/**
 * Bank account / card / payment numbers.
 *
 * Group sizes vary by bank (1002-345-678901, 0000-0000-0000-0000), so match any
 * separated run of digits and decide by the TOTAL digit count. Ten is the
 * threshold: it clears an ISO date (8 digits) but catches every account and
 * card format.
 */
const GROUPED_DIGITS = /\b\d{2,6}(?:[-\s]\d{2,7}){1,5}\b/g;
const MIN_SENSITIVE_DIGITS = 10;
const BARE_LONG_DIGITS = /\b\d{10,}\b/g;

function digitCount(text: string): number {
  return (text.match(/\d/g) ?? []).length;
}

const EMAIL = /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g;

/**
 * Korean personal names in the "홍길동 귀하 / 님" address form. Matching bare
 * names is not attempted: it would hit place names and agency names. The
 * practice documents are written without names in the first place.
 */
const KR_NAME_HONORIFIC = /[가-힣]{2,4}(?=\s*(?:귀하|님께|님\b|씨\b))/g;

/** Japanese addressee form: 山田太郎 様. */
const JP_NAME_HONORIFIC = /[一-鿿぀-ヿ]{2,6}(?=\s*(?:様|さま))/g;

const RULES: MaskRule[] = [
  { name: 'kr_rrn', pattern: KR_RRN, replace: starOut },
  { name: 'email', pattern: EMAIL, replace: starOut },
  { name: 'phone', pattern: PHONE, replace: starOut },
  {
    name: 'grouped_digits',
    pattern: GROUPED_DIGITS,
    // Only mask when the run is long enough to be an account or card number;
    // a date like 2026-09-30 must stay readable on the practice sheet.
    replace: (match) => (digitCount(match) >= MIN_SENSITIVE_DIGITS ? MASK : match),
  },
  { name: 'jp_mynumber', pattern: JP_MYNUMBER, replace: starOut },
  { name: 'long_digits', pattern: BARE_LONG_DIGITS, replace: starOut },
  { name: 'kr_name', pattern: KR_NAME_HONORIFIC, replace: starOut },
  { name: 'jp_name', pattern: JP_NAME_HONORIFIC, replace: starOut },
];

export function maskText(input: string): string {
  let output = input;
  for (const rule of RULES) {
    // Fresh lastIndex each pass: the patterns are global.
    rule.pattern.lastIndex = 0;
    output = output.replace(rule.pattern, rule.replace);
  }
  return output;
}

/**
 * True when the text contains something that looks like personal data.
 *
 * Defined as "masking would change it" rather than "a pattern matches", because
 * some rules match broadly and then decline - a date matches the grouped-digit
 * pattern but is not sensitive.
 */
export function containsMaskablePii(input: string): boolean {
  return maskText(input) !== input;
}
