/**
 * Model output parsing.
 *
 * Providers are asked for bare JSON. Small local models in particular still
 * wrap it in a markdown fence or prepend a sentence, so recover from those two
 * common shapes before declaring failure - a retry costs seconds of stage time.
 */
import type { AnalysisError } from '@/lib/analysis/schema';

export type ParseResult =
  | { ok: true; value: unknown }
  | { ok: false; error: AnalysisError };

/** Extracts the outermost {...} span, ignoring braces inside strings. */
function extractJsonObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }
  return null;
}

export function parseModelJson(raw: string): ParseResult {
  const unfenced = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  try {
    return { ok: true, value: JSON.parse(unfenced) };
  } catch {
    // Fall through to the brace scan.
  }

  const extracted = extractJsonObject(unfenced);
  if (extracted) {
    try {
      return { ok: true, value: JSON.parse(extracted) };
    } catch {
      // Genuinely malformed.
    }
  }

  return {
    ok: false,
    error: {
      code: 'invalid_json',
      detail: 'Model output was not valid JSON.',
      retryable: true,
    },
  };
}

/**
 * Formats zod issues for an operator.
 *
 * Field paths and issue codes only - never the values, which are document
 * content and must not reach a log.
 */
export function describeIssues(
  issues: { path: (string | number)[]; code: string }[],
): string {
  return issues
    .slice(0, 6)
    .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.code}`)
    .join('; ');
}
