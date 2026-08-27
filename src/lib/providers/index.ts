/**
 * Provider selection and the on-stage fallback chain.
 *
 * The rule that matters for a live presentation: a live provider may fail, but
 * the demo must not stop. What we will NOT do is silently serve a fixture as
 * real analysis - `fellBack` is set, the UI says so out loud, and for a
 * user-supplied photo the fallback is offered rather than applied, because the
 * fixture is not an analysis of their document.
 *
 * Chains, per the spec:
 *
 *   openai : luna -> validate -> (only if unsafe) terra -> offer fixture
 *   ollama : qwen3-vl:4b -> validate -> one retry, same model -> offer fixture
 *   fixture: verified synthetic analysis
 */
import 'server-only';

import { hardenAnalysis, needsSecondOpinion } from '@/lib/analysis/harden';
import {
  type AnalysisAttempt,
  type AnalysisErrorCode,
  type AnalysisMeta,
  type AnalysisOutcome,
  type DocumentAnalysis,
  type ProviderId,
  SCHEMA_VERSION,
} from '@/lib/analysis/schema';
import { providerIsUsable, serverConfig } from './config';
import { FixtureProvider, resolveFixtureId } from './fixture';
import { OllamaProvider } from './ollama';
import { OpenAIProvider } from './openai';
import type { DocumentAnalysisProvider, DocumentInput } from './types';

export { FixtureProvider } from './fixture';
export { OllamaProvider, probeOllama } from './ollama';
export { OpenAIProvider } from './openai';
export type { DocumentAnalysisProvider, DocumentInput } from './types';

/** Registry. Adding a vendor is one case here plus one file. */
export function createProvider(provider: ProviderId): DocumentAnalysisProvider {
  switch (provider) {
    case 'openai':
      return new OpenAIProvider(serverConfig.openai.model);
    case 'ollama':
      return new OllamaProvider(serverConfig.ollama.model);
    case 'fixture':
    default:
      return new FixtureProvider();
  }
}

export function resolveRequestedProvider(clientValue: string | undefined): ProviderId {
  const configured = serverConfig.defaultProvider;
  if (!serverConfig.allowClientProviderOverride) return configured;
  if (clientValue === 'openai' || clientValue === 'ollama' || clientValue === 'fixture') {
    return clientValue;
  }
  return configured;
}

interface RunOptions {
  /** Opt-in Ollama 8B. Never the default. */
  /**
   * When true, a live-provider failure degrades to the fixture analysis. When
   * false the failure is returned so the UI can ask the user first - the spec
   * requires consent before substituting demo content.
   */
  autoFallbackToFixture?: boolean;
}

function baseMeta(requested: ProviderId): AnalysisMeta {
  return {
    provider: requested,
    requestedProvider: requested,
    model: null,
    synthetic: false,
    fixtureId: null,
    fellBack: false,
    fallbackReason: null,
    attempts: [],
    totalElapsedMs: 0,
    schemaVersion: SCHEMA_VERSION,
  };
}

async function runFixture(
  input: DocumentInput,
  meta: AnalysisMeta,
  fallbackReason: AnalysisErrorCode | null,
): Promise<AnalysisOutcome> {
  const startedAt = Date.now();
  const provider = new FixtureProvider();
  const result = await provider.analyzeDocument(input);

  meta.attempts.push({
    provider: 'fixture',
    model: null,
    role: fallbackReason ? 'fallback' : 'primary',
    ok: result.ok,
    errorCode: result.ok ? null : result.error.code,
    elapsedMs: Date.now() - startedAt,
  });
  meta.provider = 'fixture';
  meta.model = null;
  meta.synthetic = true;
  meta.fixtureId = resolveFixtureId(input);
  meta.fellBack = meta.requestedProvider !== 'fixture';
  meta.fallbackReason = fallbackReason;

  if (!result.ok) {
    return { ok: false, error: result.error, meta };
  }

  const analysis = hardenAnalysis(result.analysis, {
    language: input.language,
    isDemoMode: true,
  });
  return { ok: true, analysis, meta };
}

/** One provider call, recorded as an attempt. */
async function attempt(
  provider: DocumentAnalysisProvider,
  input: DocumentInput,
  role: AnalysisAttempt['role'],
  meta: AnalysisMeta,
): Promise<
  | { ok: true; analysis: DocumentAnalysis }
  | { ok: false; code: AnalysisErrorCode; detail: string; retryable: boolean }
> {
  const startedAt = Date.now();
  const result = await provider.analyzeDocument(input);
  const elapsedMs = Date.now() - startedAt;

  meta.attempts.push({
    provider: provider.id,
    model: provider.model,
    role,
    ok: result.ok,
    errorCode: result.ok ? null : result.error.code,
    elapsedMs,
  });

  if (!result.ok) {
    return {
      ok: false,
      code: result.error.code,
      detail: result.error.detail,
      retryable: result.error.retryable,
    };
  }

  meta.provider = provider.id;
  meta.model = provider.model;
  return {
    ok: true,
    analysis: hardenAnalysis(result.analysis, {
      language: input.language,
      isDemoMode: false,
    }),
  };
}

export async function analyzeDocument(
  requested: ProviderId,
  input: DocumentInput,
  options: RunOptions = {},
): Promise<AnalysisOutcome> {
  const startedAt = Date.now();
  const meta = baseMeta(requested);
  const finish = (outcome: AnalysisOutcome): AnalysisOutcome => {
    outcome.meta.totalElapsedMs = Date.now() - startedAt;
    return outcome;
  };

  if (requested === 'fixture') {
    return finish(await runFixture(input, meta, null));
  }

  if (!providerIsUsable(requested)) {
    return finish(await runFixture(input, meta, 'missing_credentials'));
  }

  // --- first attempt ------------------------------------------------------
  const primary = createProvider(requested);
  const first = await attempt(primary, input, 'primary', meta);

  if (first.ok) {
    const second = needsSecondOpinion(first.analysis);
    if (!second.needed) {
      return finish({ ok: true, analysis: first.analysis, meta });
    }

    // --- one re-analysis, and only because the first result is unsafe -----
    if (requested === 'openai') {
      const stronger = new OpenAIProvider(serverConfig.openai.fallbackModel);
      const retry = await attempt(stronger, input, 'retry', meta);
      if (retry.ok) {
        return finish({ ok: true, analysis: retry.analysis, meta });
      }
      // The stronger model failed outright; the first answer is still the best
      // we have, and its warnings already tell the reader to verify it.
      return finish({ ok: true, analysis: first.analysis, meta });
    }

    const retry = await attempt(primary, input, 'retry', meta);
    return finish({
      ok: true,
      analysis: retry.ok ? retry.analysis : first.analysis,
      meta,
    });
  }

  // --- first attempt failed: retry once when that could plausibly help ----
  let lastCode: AnalysisErrorCode = first.code;
  let lastDetail = first.detail;

  const worthRetrying =
    first.retryable &&
    serverConfig.maxSchemaRetries > 0 &&
    first.code !== 'missing_credentials' &&
    first.code !== 'unsupported_type';

  if (worthRetrying) {
    const retryProvider =
      requested === 'openai'
        ? new OpenAIProvider(serverConfig.openai.fallbackModel)
        : primary;
    const retry = await attempt(retryProvider, input, 'retry', meta);
    if (retry.ok) {
      return finish({ ok: true, analysis: retry.analysis, meta });
    }
    lastCode = retry.code;
    lastDetail = retry.detail;
  }

  // --- everything failed --------------------------------------------------
  if (options.autoFallbackToFixture) {
    return finish(await runFixture(input, meta, lastCode));
  }

  return finish({
    ok: false,
    error: { code: lastCode, detail: lastDetail, retryable: true },
    meta,
  });
}

/** Explicit fixture switch, used after the user agrees to continue in demo mode. */
export async function analyzeWithFixture(
  requested: ProviderId,
  input: DocumentInput,
  reason: AnalysisErrorCode | null,
): Promise<AnalysisOutcome> {
  const startedAt = Date.now();
  const meta = baseMeta(requested);
  const outcome = await runFixture(input, meta, reason);
  outcome.meta.totalElapsedMs = Date.now() - startedAt;
  return outcome;
}
