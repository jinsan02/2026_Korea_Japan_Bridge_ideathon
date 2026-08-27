/**
 * Server-only configuration.
 *
 * Importing this from a client component is a build error by design: every
 * value comes from process.env without a NEXT_PUBLIC_ prefix, so no key can
 * reach the browser bundle.
 *
 * Model identifiers live here and nowhere else - never hardcoded in a screen or
 * a provider - so changing model is an env edit.
 */
import 'server-only';

import type { ProviderId } from '@/lib/analysis/schema';

function str(name: string, fallback = ''): string {
  const value = process.env[name];
  return value === undefined || value.trim() === '' ? fallback : value.trim();
}

function int(name: string, fallback: number): number {
  const parsed = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function bool(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value === undefined || value === '') return fallback;
  return value.toLowerCase() === 'true' || value === '1';
}

function list(name: string, fallback: string[]): string[] {
  const value = str(name);
  if (!value) return fallback;
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseProvider(value: string): ProviderId {
  return value === 'openai' || value === 'ollama' || value === 'fixture'
    ? value
    : 'fixture';
}

export const serverConfig = {
  /** Provider used when the client does not ask for one. */
  defaultProvider: parseProvider(str('AI_PROVIDER', 'fixture')),
  /**
   * Whether the browser may request a provider. Handy on stage, risky in
   * production, so it is a switch rather than an assumption.
   */
  allowClientProviderOverride: bool('ALLOW_CLIENT_PROVIDER_OVERRIDE', true),

  openai: {
    apiKey: str('OPENAI_API_KEY'),
    baseUrl: str('OPENAI_BASE_URL', 'https://api.openai.com/v1').replace(/\/+$/, ''),
    /** Primary model for every first request. */
    model: str('OPENAI_MODEL', 'gpt-5.6-luna'),
    /** Used for ONE re-analysis, only when validation says the first is unsafe. */
    fallbackModel: str('OPENAI_FALLBACK_MODEL', 'gpt-5.6-terra'),
    timeoutMs: int('OPENAI_TIMEOUT_MS', 60_000),
    maxOutputTokens: int('OPENAI_MAX_OUTPUT_TOKENS', 3_000),
  },

  ollama: {
    baseUrl: str('OLLAMA_BASE_URL', 'http://127.0.0.1:11434').replace(/\/+$/, ''),
    /** 4B is the live-demo default: it fits comfortably in 8GB VRAM. */
    model: str('OLLAMA_MODEL', 'qwen3-vl:4b'),
    /**
     * 8B is opt-in only. On an 8GB card, image plus long context can spill to
     * system RAM, so it must never be the live-demo default.
     */
    qualityModel: str('OLLAMA_QUALITY_MODEL', 'qwen3-vl:8b'),
    // The bilingual extraction prompt + full JSON schema exceeds a practical
    // 4K budget. Qwen3-VL 4B still fits this 8K context on the 8GB demo GPU.
    numCtx: int('OLLAMA_NUM_CTX', 8_192),
    keepAlive: str('OLLAMA_KEEP_ALIVE', '30m'),
    timeoutMs: int('OLLAMA_TIMEOUT_MS', 180_000),
    temperature: 0.1,
  },

  upload: {
    maxBytes: int('MAX_UPLOAD_BYTES', 6_000_000),
    allowedTypes: list('ALLOWED_UPLOAD_TYPES', [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]),
    /** Longest edge after client-side downscale. Also re-checked server-side. */
    maxEdgePx: int('MAX_IMAGE_EDGE_PX', 1_600),
  },

  /** One retry on schema failure, then Fixture Demo. Never an infinite loop. */
  maxSchemaRetries: int('MAX_SCHEMA_RETRIES', 1),

  experimentLog: {
    enabled: bool('EXPERIMENT_LOG_ENABLED', true),
    dir: str('EXPERIMENT_LOG_DIR', '.data'),
  },
} as const;

/** True when the provider has everything it needs to actually run. */
export function providerIsUsable(provider: ProviderId): boolean {
  if (provider === 'fixture') return true;
  if (provider === 'openai') return serverConfig.openai.apiKey.length > 0;
  // Ollama needs no key; reachability is discovered at call time.
  return true;
}
