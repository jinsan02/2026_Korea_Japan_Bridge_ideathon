/**
 * Calendar reminder file.
 *
 * Generated client-side and handed to the browser as a download. AI Door does
 * not connect to the user's calendar account or write anything on their behalf;
 * saving the file is the user's action.
 */

/** RFC 5545 escaping for text values. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function toIcsDate(isoDate: string): string {
  return isoDate.replace(/-/g, '');
}

/**
 * Shifts a calendar date by whole days.
 *
 * Done on local date parts rather than via toISOString(): east of UTC, a local
 * midnight converts back to the *previous* calendar day, which silently made
 * DTEND equal DTSTART and produced a zero-length all-day event.
 */
function shiftIcsDate(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const shifted = new Date(year, month - 1, day + days);
  return [
    String(shifted.getFullYear()),
    String(shifted.getMonth() + 1).padStart(2, '0'),
    String(shifted.getDate()).padStart(2, '0'),
  ].join('');
}

function stamp(now: Date): string {
  return `${now.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

export interface ReminderOptions {
  isoDate: string;
  title: string;
  description: string;
  /** Days before the deadline to alarm. */
  alarmDaysBefore?: number;
  now?: Date;
  uid?: string;
}

export function buildDeadlineIcs(options: ReminderOptions): string {
  const {
    isoDate,
    title,
    description,
    alarmDaysBefore = 3,
    now = new Date(),
    uid = `ai-door-${isoDate}-${Math.random().toString(36).slice(2, 10)}`,
  } = options;

  const start = toIcsDate(isoDate);
  // All-day events end the following day: RFC 5545 DTEND is exclusive.
  const end = shiftIcsDate(isoDate, 1);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AI Door//Deadline Reminder//KO',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeText(title)}`,
    `DESCRIPTION:${escapeText(description)}`,
    'BEGIN:VALARM',
    `TRIGGER:-P${alarmDaysBefore}D`,
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
