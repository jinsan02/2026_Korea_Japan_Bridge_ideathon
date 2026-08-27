/**
 * Event store.
 *
 * NDJSON appended to a gitignored directory, plus an in-memory mirror so the
 * /admin download works even when the filesystem is read-only (some serverless
 * hosts). Good enough for a pilot with a few dozen participants; a real study
 * would point this at a database.
 */
import 'server-only';

import { appendFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { serverConfig } from '@/lib/providers/config';
import { StoredEventSchema, type StoredEvent } from './events';

const MAX_MEMORY_EVENTS = 5_000;

/** Survives hot reloads in dev, where module state is otherwise discarded. */
const globalStore = globalThis as unknown as {
  __aiDoorEvents?: StoredEvent[];
};

function memory(): StoredEvent[] {
  if (!globalStore.__aiDoorEvents) {
    globalStore.__aiDoorEvents = [];
  }
  return globalStore.__aiDoorEvents;
}

function logFilePath(): string {
  return path.join(process.cwd(), serverConfig.experimentLog.dir, 'events.ndjson');
}

export async function appendEvents(events: StoredEvent[]): Promise<void> {
  if (!serverConfig.experimentLog.enabled || events.length === 0) return;

  const buffer = memory();
  buffer.push(...events);
  if (buffer.length > MAX_MEMORY_EVENTS) {
    buffer.splice(0, buffer.length - MAX_MEMORY_EVENTS);
  }

  const file = logFilePath();
  try {
    await mkdir(path.dirname(file), { recursive: true });
    await appendFile(
      file,
      `${events.map((event) => JSON.stringify(event)).join('\n')}\n`,
      'utf8',
    );
  } catch {
    // A read-only filesystem must not break the demo. The in-memory mirror
    // still backs the /admin export for the current process.
  }
}

export async function readEvents(): Promise<StoredEvent[]> {
  const fromMemory = memory();

  let fromDisk: StoredEvent[] = [];
  try {
    const raw = await readFile(logFilePath(), 'utf8');
    fromDisk = raw
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => {
        try {
          return StoredEventSchema.safeParse(JSON.parse(line));
        } catch {
          return { success: false } as const;
        }
      })
      .filter(
        (parsed): parsed is { success: true; data: StoredEvent } =>
          parsed.success === true,
      )
      .map((parsed) => parsed.data);
  } catch {
    // No file yet, or unreadable. Memory is the source of truth then.
  }

  if (fromDisk.length === 0) return [...fromMemory];

  // Disk wins, with any memory-only events (write failed) appended.
  const onDisk = new Set(
    fromDisk.map((event) => `${event.sessionId}|${event.clientTime}|${event.type}`),
  );
  const extras = fromMemory.filter(
    (event) => !onDisk.has(`${event.sessionId}|${event.clientTime}|${event.type}`),
  );
  return [...fromDisk, ...extras];
}

export function clearMemoryEvents(): void {
  globalStore.__aiDoorEvents = [];
}
