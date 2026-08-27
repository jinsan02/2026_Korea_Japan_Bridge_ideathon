/**
 * Fixture provider - the presentation's safety net.
 *
 * Returns the verified analysis for a synthetic document with no network call,
 * so the demo survives dead venue Wi-Fi, an expired key, or a provider outage.
 * The result still goes through hardenAnalysis, so demo mode and live mode
 * cannot diverge in their safety behaviour.
 *
 * This mode is always announced in the UI. It is never disguised as real
 * analysis.
 */
import type { ModelAnalysis } from '@/lib/analysis/schema';
import {
  DEFAULT_FIXTURE_ID,
  fixtureAnalysis,
  getFixture,
} from '@/lib/fixtures/documents';
import type { DocumentAnalysisProvider, DocumentInput, ProviderResult } from './types';

/** Short pause so the 분석 중 screen is seen rather than flashing past. */
const SIMULATED_LATENCY_MS = 900;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export class FixtureProvider implements DocumentAnalysisProvider {
  readonly id = 'fixture' as const;
  readonly model = null;

  constructor(private readonly options: { simulateLatency?: boolean } = {}) {}

  async analyzeDocument(input: DocumentInput): Promise<ProviderResult> {
    if (this.options.simulateLatency !== false) {
      await delay(SIMULATED_LATENCY_MS);
    }

    const fixture =
      (input.fixtureId ? getFixture(input.fixtureId) : undefined) ??
      getFixture(DEFAULT_FIXTURE_ID);

    if (!fixture) {
      return {
        ok: false,
        model: null,
        error: {
          code: 'unknown',
          detail: 'No synthetic document matched this request.',
          retryable: false,
        },
      };
    }

    const language = input.language === 'unknown' ? 'ko' : input.language;
    const analysis: ModelAnalysis = fixtureAnalysis(fixture, language);

    return { ok: true, model: null, analysis };
  }
}

/** The fixture id a given request resolves to, for the meta record. */
export function resolveFixtureId(input: DocumentInput): string {
  return input.fixtureId && getFixture(input.fixtureId)
    ? input.fixtureId
    : DEFAULT_FIXTURE_ID;
}
