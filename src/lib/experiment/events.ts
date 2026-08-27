/**
 * De-identified event log.
 *
 * The privacy guarantee is structural, not a promise: the schema is `.strict()`
 * and contains no free-text field, so document content, OCR output and personal
 * data have nowhere to be written even if a caller tried. Anything unexpected
 * is rejected by the API route before it reaches disk.
 *
 * The learning-loop events are the ones the deck's KPI is built from:
 * guided_step_completed, practice_answer, practice_hint, practice_completed.
 */
import { z } from 'zod';

export const EVENT_TYPES = [
  // session and analysis
  'session_start',
  'document_selected',
  'consent_accepted',
  'consent_declined',
  'analysis_started',
  'analysis_succeeded',
  'analysis_failed',
  'analysis_fell_back',
  'analysis_cancelled',
  'document_type_confirmed',
  'document_type_corrected',

  // step 1 - solving together
  'guided_started',
  'guided_step_completed',
  'guided_step_unclear',
  'guided_step_repeated',
  'guided_evidence_opened',
  'guided_completed',
  'guided_abandoned',

  // result screen
  'result_viewed',
  'action_card_opened',
  'evidence_opened',
  'official_contact_viewed',
  'call_confirm_shown',
  'deadline_saved',
  'speech_played',
  'back_pressed',

  // step 2 - the manual
  'tutorial_saved',
  'tutorial_viewed',

  // steps 3-4 - practice
  'review_scheduled',
  'review_reminder_shown',
  'practice_started',
  'practice_answer',
  'practice_hint',
  'practice_answer_revealed',
  'practice_completed',
  'assistance_level_changed',

  // experiment extras
  'survey_submitted',
  'task_completed',
  'task_abandoned',
] as const;

export const EventTypeSchema = z.enum(EVENT_TYPES);
export type EventType = z.infer<typeof EventTypeSchema>;

/**
 * Payload fields.
 *
 * Every field is an enum, a bounded number, or an identifier we generated
 * ourselves. There is deliberately no `text`, `note`, `content` or `query`
 * field - see the module comment.
 */
export const EventPayloadSchema = z
  .object({
    /** Fixture or practice scenario id. Never document content. */
    fixtureId: z.string().max(60).optional(),
    scenarioId: z.string().max(60).optional(),
    screen: z.string().max(40).optional(),
    /** Controlled document-type vocabulary only. */
    documentType: z.string().max(40).optional(),
    provider: z.enum(['openai', 'ollama', 'fixture']).optional(),
    /** Model id, e.g. "qwen3-vl:4b". Configuration, not personal data. */
    model: z.string().max(60).optional(),
    /** Error code only. Never an error message. */
    errorCode: z.string().max(40).optional(),
    /** How many provider calls the analysis took. */
    attemptCount: z.number().int().min(0).max(10).optional(),

    /** Guided-solving step kind. */
    stepKind: z.string().max(40).optional(),
    stepIndex: z.number().int().min(0).max(20).optional(),

    /** Practice. */
    questionId: z.string().max(60).optional(),
    optionIndex: z.number().int().min(0).max(9).optional(),
    isCorrect: z.boolean().optional(),
    /** 0-3. 3 means the answer itself was shown. */
    hintStep: z.number().int().min(0).max(3).optional(),
    hintsUsed: z.number().int().min(0).max(60).optional(),
    /** Correct with zero hints. */
    independent: z.boolean().optional(),
    independentCount: z.number().int().min(0).max(60).optional(),
    questionCount: z.number().int().min(0).max(60).optional(),
    assistanceLevel: z
      .enum(['guided', 'hinted', 'solo', 'final_check'])
      .optional(),

    /** Timing. */
    elapsedMs: z.number().int().min(0).max(86_400_000).optional(),
    durationMs: z.number().int().min(0).max(600_000).optional(),

    /** Post-task Likert answers, 1-5. */
    confidenceRating: z.number().int().min(1).max(5).optional(),
    cognitiveLoadRating: z.number().int().min(1).max(5).optional(),
    askedForHelp: z.boolean().optional(),
    success: z.boolean().optional(),
  })
  .strict();

export type EventPayload = z.infer<typeof EventPayloadSchema>;

export const ExperimentEventSchema = z
  .object({
    /** Random per-session id generated in the browser. Not a user identifier. */
    sessionId: z.string().regex(/^s-[a-z0-9]{8,24}$/),
    condition: z.enum(['A', 'B', 'C']),
    language: z.enum(['ko', 'ja']),
    type: EventTypeSchema,
    /** Client clock, ISO 8601. Used only for ordering within a session. */
    clientTime: z.string().datetime(),
    payload: EventPayloadSchema.default({}),
  })
  .strict();

export type ExperimentEvent = z.infer<typeof ExperimentEventSchema>;

/** What is persisted: the client event plus a server timestamp. */
export const StoredEventSchema = ExperimentEventSchema.extend({
  serverTime: z.string().datetime(),
});
export type StoredEvent = z.infer<typeof StoredEventSchema>;

export const EventBatchSchema = z
  .object({
    events: z.array(ExperimentEventSchema).min(1).max(50),
  })
  .strict();

/** Column order for the CSV export. */
export const CSV_COLUMNS = [
  'serverTime',
  'clientTime',
  'sessionId',
  'condition',
  'language',
  'type',
  'fixtureId',
  'scenarioId',
  'screen',
  'documentType',
  'provider',
  'model',
  'errorCode',
  'attemptCount',
  'stepKind',
  'stepIndex',
  'questionId',
  'optionIndex',
  'isCorrect',
  'hintStep',
  'hintsUsed',
  'independent',
  'independentCount',
  'questionCount',
  'assistanceLevel',
  'elapsedMs',
  'durationMs',
  'confidenceRating',
  'cognitiveLoadRating',
  'askedForHelp',
  'success',
] as const;

function csvCell(value: unknown): string {
  if (value === undefined || value === null) return '';
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function eventsToCsv(events: StoredEvent[]): string {
  const header = CSV_COLUMNS.join(',');
  const rows = events.map((event) => {
    const flat: Record<string, unknown> = {
      serverTime: event.serverTime,
      clientTime: event.clientTime,
      sessionId: event.sessionId,
      condition: event.condition,
      language: event.language,
      type: event.type,
      ...event.payload,
    };
    return CSV_COLUMNS.map((column) => csvCell(flat[column])).join(',');
  });
  return [header, ...rows].join('\n');
}
