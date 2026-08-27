/**
 * Experiment event log.
 *
 * POST  /api/logs              append a batch of de-identified events
 * GET   /api/logs?format=json  read them back (default)
 * GET   /api/logs?format=csv   download for analysis
 *
 * The strict schema is the privacy control: an event carrying document text or
 * personal data fails validation and is rejected with 400 rather than being
 * stripped and stored, so a logging mistake is loud instead of silent.
 */
import { NextResponse } from 'next/server';

import {
  EventBatchSchema,
  eventsToCsv,
  type StoredEvent,
} from '@/lib/experiment/events';
import { appendEvents, readEvents } from '@/lib/experiment/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const parsed = EventBatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'schema_violation',
        // Field paths only - never the rejected values.
        fields: parsed.error.issues.map((issue) => issue.path.join('.')),
      },
      { status: 400 },
    );
  }

  const serverTime = new Date().toISOString();
  const stored: StoredEvent[] = parsed.data.events.map((event) => ({
    ...event,
    serverTime,
  }));

  await appendEvents(stored);

  return NextResponse.json({ ok: true, stored: stored.length }, { status: 202 });
}

export async function GET(request: Request) {
  const format = new URL(request.url).searchParams.get('format') ?? 'json';
  const events = await readEvents();

  if (format === 'csv') {
    return new NextResponse(eventsToCsv(events), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="ai-door-events.csv"',
        'Cache-Control': 'no-store',
      },
    });
  }

  return NextResponse.json(
    { ok: true, count: events.length, events },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  );
}
