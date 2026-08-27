/**
 * End-to-end shape of the demo flow, without a browser: the fixture provider
 * produces a schema-valid analysis, hardening keeps it usable, and the guided
 * sequence built from it is the six steps the script walks through.
 */
import { describe, expect, it } from 'vitest';

import { hardenAnalysis } from '@/lib/analysis/harden';
import {
  DocumentAnalysisSchema,
  ModelAnalysisSchema,
  primaryAmount,
  primaryDate,
} from '@/lib/analysis/schema';
import { FixtureProvider } from '@/lib/providers/fixture';
import {
  DEFAULT_FIXTURE_ID,
  DOCUMENT_FIXTURES,
  fixtureAnalysis,
  getFixture,
} from '@/lib/fixtures/documents';
import { buildGuidedSteps } from '@/lib/learning/guided';
import { ko } from '@/lib/i18n/ko';
import { parseModelJson } from '@/lib/providers/json';
import { deadlineStatus } from '@/lib/util/date';
import { buildDeadlineIcs } from '@/lib/util/ics';

const provider = new FixtureProvider({ simulateLatency: false });

describe('fixture provider', () => {
  it('returns a schema-valid analysis for every demo document', async () => {
    for (const fixture of DOCUMENT_FIXTURES) {
      const result = await provider.analyzeDocument({
        fixtureId: fixture.id,
        language: 'ko',
      });
      expect(result.ok, fixture.id).toBe(true);
      if (!result.ok) continue;
      expect(ModelAnalysisSchema.safeParse(result.analysis).success).toBe(true);
    }
  });

  it('produces a hardened analysis that still passes the full schema', async () => {
    const result = await provider.analyzeDocument({
      fixtureId: DEFAULT_FIXTURE_ID,
      language: 'ko',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const hardened = hardenAnalysis(result.analysis, {
      language: 'ko',
      isDemoMode: true,
    });
    expect(DocumentAnalysisSchema.safeParse(hardened).success).toBe(true);
  });

  it('falls back to the default document when the id is unknown', async () => {
    const result = await provider.analyzeDocument({
      fixtureId: 'no-such-document',
      language: 'ko',
    });
    expect(result.ok).toBe(true);
  });

  it('serves a Japanese explanation when one exists, and Korean otherwise', () => {
    const health = getFixture('jp-health-checkup')!;
    expect(fixtureAnalysis(health, 'ja').language).toBe('ja');

    // Both demo documents carry both languages, because the toggle is on the
    // demo path and must never land on an empty screen.
    const tax = getFixture('kr-local-tax')!;
    expect(fixtureAnalysis(tax, 'ja').language).toBe('ja');
    expect(fixtureAnalysis(tax, 'ko').language).toBe('ko');

    const gas = getFixture('jp-gas-bill')!;
    expect(fixtureAnalysis(gas, 'ja').language).toBe('ja');
    expect(fixtureAnalysis(gas, 'ko').language).toBe('ko');

    // A hidden fixture with no Japanese variant falls back rather than blanking.
    const welfare = getFixture('kr-welfare')!;
    expect(fixtureAnalysis(welfare, 'ja').language).toBe('ko');
  });
});

describe('evidence integrity', () => {
  it('every evidence id referenced by a fact actually exists', () => {
    for (const fixture of DOCUMENT_FIXTURES) {
      for (const analysis of Object.values(fixture.analysisByLanguage)) {
        if (!analysis) continue;
        const ids = new Set(analysis.evidence.map((item) => item.id));
        const referenced = [
          ...analysis.importantDates.flatMap((item) => item.evidenceIds),
          ...analysis.amounts.flatMap((item) => item.evidenceIds),
          ...analysis.recipientActions.flatMap((item) => item.evidenceIds),
          ...analysis.officialContacts.flatMap((item) => item.evidenceIds),
        ];
        for (const id of referenced) {
          expect(ids.has(id), `${fixture.id} references missing evidence ${id}`).toBe(
            true,
          );
        }
      }
    }
  });

  it('every action card is backed by at least one quote', () => {
    for (const fixture of DOCUMENT_FIXTURES) {
      const analysis = fixture.analysisByLanguage.ko;
      if (!analysis) continue;
      for (const action of analysis.recipientActions) {
        expect(action.evidenceIds.length, `${fixture.id}/${action.id}`).toBeGreaterThan(
          0,
        );
      }
    }
  });

  it('never offers more than three action cards', () => {
    for (const fixture of DOCUMENT_FIXTURES) {
      for (const analysis of Object.values(fixture.analysisByLanguage)) {
        expect(analysis?.recipientActions.length ?? 0).toBeLessThanOrEqual(3);
      }
    }
  });

  it('states no amount for the welfare notice, which prints none', () => {
    const welfare = getFixture('kr-welfare')!;
    const analysis = welfare.analysisByLanguage.ko!;
    expect(analysis.amounts).toHaveLength(0);
    // ...and says so in words rather than leaving the reader guessing.
    expect(analysis.uncertainty.join(' ')).toContain('금액');
  });
});

describe('guided sequence', () => {
  it('walks the six steps of the script, in order', async () => {
    const result = await provider.analyzeDocument({
      fixtureId: DEFAULT_FIXTURE_ID,
      language: 'ko',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const analysis = hardenAnalysis(result.analysis, {
      language: 'ko',
      isDemoMode: true,
    });
    const steps = buildGuidedSteps(analysis, ko);

    expect(steps.map((step) => step.kind)).toEqual([
      'document_type',
      'important_date',
      'amount_or_items',
      'actions',
      'official_contact',
      'completion',
    ]);
  });

  it('tells the user where to look, not just what the answer is', async () => {
    const result = await provider.analyzeDocument({
      fixtureId: DEFAULT_FIXTURE_ID,
      language: 'ko',
    });
    if (!result.ok) throw new Error('fixture failed');

    const analysis = hardenAnalysis(result.analysis, {
      language: 'ko',
      isDemoMode: true,
    });
    const steps = buildGuidedSteps(analysis, ko);
    const dateStep = steps.find((step) => step.kind === 'important_date')!;

    expect(dateStep.whereToLook).toBeTruthy();
    expect(dateStep.evidenceIds.length).toBeGreaterThan(0);
  });
});

describe('helpers', () => {
  it('reads the nearest deadline as the primary date', async () => {
    const health = getFixture('jp-health-checkup')!;
    const analysis = health.analysisByLanguage.ko!;
    // The reservation deadline comes before the appointment.
    expect(primaryDate(analysis)?.id).toBe('d-reserve');
  });

  it('has no primary amount when the document names none', () => {
    const welfare = getFixture('kr-welfare')!;
    expect(primaryAmount(welfare.analysisByLanguage.ko!)).toBeNull();
  });

  it('counts days to a deadline at local midnight', () => {
    const now = new Date(2026, 8, 18); // 2026-09-18
    expect(deadlineStatus('2026-09-30', now)).toEqual({ kind: 'future', days: 12 });
    expect(deadlineStatus('2026-09-18', now)).toEqual({ kind: 'today' });
    expect(deadlineStatus('2026-09-10', now)).toEqual({ kind: 'past', days: 8 });
    expect(deadlineStatus(null, now)).toEqual({ kind: 'none' });
  });

  it('rejects an impossible date rather than rolling it over', () => {
    expect(deadlineStatus('2026-02-31')).toEqual({ kind: 'none' });
  });

  it('builds a calendar file with an all-day event and an alarm', () => {
    const ics = buildDeadlineIcs({
      isoDate: '2026-09-30',
      title: '지방세 납부',
      description: '재산세 납부 기한',
      now: new Date('2026-08-27T00:00:00Z'),
      uid: 'test-uid',
    });

    expect(ics).toContain('DTSTART;VALUE=DATE:20260930');
    expect(ics).toContain('DTEND;VALUE=DATE:20261001');
    expect(ics).toContain('TRIGGER:-P3D');
  });

  it('recovers JSON from a fenced or chatty model reply', () => {
    expect(parseModelJson('```json\n{"a":1}\n```')).toEqual({
      ok: true,
      value: { a: 1 },
    });
    expect(parseModelJson('Sure! Here it is: {"a":1} Hope that helps.')).toEqual({
      ok: true,
      value: { a: 1 },
    });
    expect(parseModelJson('not json at all').ok).toBe(false);
  });

  it('does not mistake a brace inside a string for structure', () => {
    const parsed = parseModelJson('{"text":"a } b","n":2}');
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.value).toEqual({ text: 'a } b', n: 2 });
  });
});
