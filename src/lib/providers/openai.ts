/**
 * OpenAI provider - the default for the live demo.
 *
 * Uses the official SDK and the Responses API with a JSON Schema response
 * format. `store: false` on every request: the document image is a stranger's
 * official mail, so it must not be retained on the vendor side for logging or
 * training.
 *
 * Model ids come from config (env), never from this file, so switching model is
 * an env edit. The class takes the model as a constructor argument so the
 * orchestrator can run the same code for the primary and the fallback model.
 */
import 'server-only';

import OpenAI from 'openai';

import { ModelAnalysisSchema, type AnalysisError } from '@/lib/analysis/schema';
import { serverConfig } from './config';
import { describeIssues, parseModelJson } from './json';
import { ANALYSIS_JSON_SCHEMA, buildSystemPrompt, buildUserPrompt } from './prompt';
import type { DocumentAnalysisProvider, DocumentInput, ProviderResult } from './types';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: serverConfig.openai.apiKey,
      baseURL: serverConfig.openai.baseUrl,
      timeout: serverConfig.openai.timeoutMs,
      // The orchestrator owns retries so that every attempt is recorded in the
      // comparison log rather than disappearing inside the SDK.
      maxRetries: 0,
    });
  }
  return client;
}

/** Maps SDK failures to our error codes without leaking request content. */
function toAnalysisError(error: unknown): AnalysisError {
  if (error instanceof OpenAI.APIConnectionTimeoutError) {
    return {
      code: 'timeout',
      detail: `OpenAI request exceeded ${serverConfig.openai.timeoutMs}ms.`,
      retryable: true,
    };
  }
  if (error instanceof OpenAI.APIConnectionError) {
    return {
      code: 'provider_unreachable',
      detail: 'Could not reach the OpenAI API.',
      retryable: true,
    };
  }
  if (error instanceof OpenAI.APIError) {
    return {
      code: error.status === 401 || error.status === 403 ? 'missing_credentials' : 'provider_error',
      detail: `OpenAI responded ${error.status ?? 'error'}: ${String(error.code ?? error.type ?? '')}`,
      retryable: error.status === 429 || (error.status ?? 0) >= 500,
    };
  }
  return { code: 'provider_error', detail: 'OpenAI request failed.', retryable: true };
}

export class OpenAIProvider implements DocumentAnalysisProvider {
  readonly id = 'openai' as const;

  constructor(readonly model: string = serverConfig.openai.model) {}

  async analyzeDocument(input: DocumentInput): Promise<ProviderResult> {
    if (!serverConfig.openai.apiKey) {
      return {
        ok: false,
        model: this.model,
        error: {
          code: 'missing_credentials',
          detail: 'OPENAI_API_KEY is not set.',
          retryable: false,
        },
      };
    }
    if (!input.imageBase64 || !input.mimeType) {
      return {
        ok: false,
        model: this.model,
        error: {
          code: 'unsupported_type',
          detail: 'OpenAI provider requires a document image.',
          retryable: false,
        },
      };
    }

    let rawText: string;
    try {
      const response = await getClient().responses.create({
        model: this.model,
        // Do not retain the request on the vendor side.
        store: false,
        max_output_tokens: serverConfig.openai.maxOutputTokens,
        // Structured Outputs already carries the complete schema. Keep the
        // OpenAI prompt lean; few-shot examples remain enabled for Ollama.
        instructions: buildSystemPrompt(input.language, { includeFewShots: false }),
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: buildUserPrompt(input.userDeclaredType) },
              {
                type: 'input_image',
                detail: 'high',
                // Inline data URL: the image is never persisted anywhere.
                image_url: `data:${input.mimeType};base64,${input.imageBase64}`,
              },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'document_analysis',
            strict: false,
            schema: ANALYSIS_JSON_SCHEMA as unknown as Record<string, unknown>,
          },
        },
      });

      rawText = response.output_text ?? '';
    } catch (error) {
      return { ok: false, model: this.model, error: toAnalysisError(error) };
    }

    if (rawText.trim() === '') {
      return {
        ok: false,
        model: this.model,
        error: {
          code: 'invalid_json',
          detail: 'OpenAI returned an empty response.',
          retryable: true,
        },
      };
    }

    const parsed = parseModelJson(rawText);
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
