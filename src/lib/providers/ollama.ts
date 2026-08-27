/**
 * Ollama provider - the offline / on-device path.
 *
 * Default model is qwen3-vl:4b. On the demo laptop (RTX 5060 Laptop, 8GB VRAM)
 * a 4B vision model plus an 8192-token context and one image is the target
 * configuration for the demo laptop;
 * the 8B variant can spill into system RAM once an image and a long context are
 * resident, which is why it is opt-in and never the live-demo default.
 *
 * One image per request, temperature 0.1, and a fixed context length: this is
 * extraction, and the same document should give the same answer twice.
 */
import 'server-only';

import { ModelAnalysisSchema } from '@/lib/analysis/schema';
import { serverConfig } from './config';
import { describeIssues, parseModelJson } from './json';
import { ANALYSIS_JSON_SCHEMA, buildSystemPrompt, buildUserPrompt } from './prompt';
import type { DocumentAnalysisProvider, DocumentInput, ProviderResult } from './types';

interface OllamaChatResponse {
  message?: { content?: string; thinking?: string };
  error?: string;
}

export class OllamaProvider implements DocumentAnalysisProvider {
  readonly id = 'ollama' as const;

  constructor(readonly model: string = serverConfig.ollama.model) {}

  async analyzeDocument(input: DocumentInput): Promise<ProviderResult> {
    if (!input.imageBase64) {
      return {
        ok: false,
        model: this.model,
        error: {
          code: 'unsupported_type',
          detail: 'Ollama provider requires a document image.',
          retryable: false,
        },
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), serverConfig.ollama.timeoutMs);

    let payload: OllamaChatResponse;
    try {
      const response = await fetch(`${serverConfig.ollama.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          stream: false,
          // Qwen3 enables visible reasoning by default. Extraction needs only
          // the schema-constrained final answer, which is faster and safer to parse.
          think: false,
          // Avoid paying the initial model-load cost again during a live demo.
          keep_alive: serverConfig.ollama.keepAlive,
          // Ollama accepts a JSON Schema here and constrains decoding to it.
          format: ANALYSIS_JSON_SCHEMA,
          options: {
            temperature: serverConfig.ollama.temperature,
            num_ctx: serverConfig.ollama.numCtx,
          },
          messages: [
            { role: 'system', content: buildSystemPrompt(input.language) },
            {
              role: 'user',
              content: buildUserPrompt(input.userDeclaredType),
              // Exactly one image: more than one blows the VRAM budget.
              images: [input.imageBase64],
            },
          ],
        }),
      });

      if (!response.ok) {
        return {
          ok: false,
          model: this.model,
          error: {
            code: 'provider_error',
            detail: `Ollama responded ${response.status}. Is "${this.model}" pulled?`,
            retryable: response.status >= 500,
          },
        };
      }

      payload = (await response.json()) as OllamaChatResponse;
    } catch (error) {
      const aborted = error instanceof Error && error.name === 'AbortError';
      return {
        ok: false,
        model: this.model,
        error: aborted
          ? {
              code: 'timeout',
              detail: `Ollama request exceeded ${serverConfig.ollama.timeoutMs}ms.`,
              retryable: true,
            }
          : {
              code: 'provider_unreachable',
              detail: `Could not reach Ollama at ${serverConfig.ollama.baseUrl}. Is it running?`,
              retryable: true,
            },
      };
    } finally {
      clearTimeout(timer);
    }

    if (payload.error) {
      return {
        ok: false,
        model: this.model,
        error: {
          code: 'provider_error',
          detail: `Ollama error: ${payload.error.slice(0, 200)}`,
          retryable: false,
        },
      };
    }

    // Ollama 0.33 + Qwen3-VL can place a schema-constrained final JSON object
    // in `message.thinking` even when `think:false` is requested. Prefer the
    // normal final content, but accept that field when content is empty. Both
    // paths still pass through JSON parsing and the strict analysis schema.
    const normalContent = payload.message?.content?.trim() ?? '';
    const content = normalContent || payload.message?.thinking?.trim() || '';
    if (content.trim() === '') {
      return {
        ok: false,
        model: this.model,
        error: {
          code: 'invalid_json',
          detail: 'Ollama returned an empty message.',
          retryable: true,
        },
      };
    }

    const parsed = parseModelJson(content);
    if (!parsed.ok) {
      return { ok: false, model: this.model, error: parsed.error };
    }

    const validated = ModelAnalysisSchema.safeParse(parsed.value);
    if (!validated.success) {
      return {
        ok: false,
        model: this.model,
        error: {
          code: 'schema_violation',
          detail: describeIssues(validated.error.issues),
          retryable: true,
        },
      };
    }

    return { ok: true, model: this.model, analysis: validated.data };
  }
}

/** Whether the local runtime is up, for the settings screen. */
export async function probeOllama(): Promise<{
  reachable: boolean;
  models: string[];
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2_500);
  try {
    const response = await fetch(`${serverConfig.ollama.baseUrl}/api/tags`, {
      signal: controller.signal,
    });
    if (!response.ok) return { reachable: false, models: [] };
    const payload = (await response.json()) as { models?: { name?: string }[] };
    return {
      reachable: true,
      models: (payload.models ?? [])
        .map((entry) => entry.name)
        .filter((name): name is string => typeof name === 'string'),
    };
  } catch {
    return { reachable: false, models: [] };
  } finally {
    clearTimeout(timer);
  }
}
