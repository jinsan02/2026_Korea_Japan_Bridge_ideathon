/**
 * Deadline arithmetic.
 *
 * "9월 30일까지입니다" is not actionable on its own - "12일 남았습니다" is. All
 * comparisons happen at local midnight so a deadline never appears to expire
 * part-way through its final day.
 */

export type DeadlineStatus =
  | { kind: 'none' }
  | { kind: 'future'; days: number }
  | { kind: 'today' }
  | { kind: 'past'; days: number };

const MS_PER_DAY = 86_400_000;

function atMidnight(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function parseIsoDate(isoDate: string | null): Date | null {
  if (!isoDate) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  // Reject impossible dates like 2026-02-31, which Date silently rolls over.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function deadlineStatus(
  isoDate: string | null,
  now: Date = new Date(),
): DeadlineStatus {
  const target = parseIsoDate(isoDate);
  if (!target) return { kind: 'none' };

  const diffDays = Math.round((atMidnight(target) - atMidnight(now)) / MS_PER_DAY);
  if (diffDays === 0) return { kind: 'today' };
  if (diffDays > 0) return { kind: 'future', days: diffDays };
  return { kind: 'past', days: Math.abs(diffDays) };
}
