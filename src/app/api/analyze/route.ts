/**
 * POST /api/analyze
 *
 * The only place an AI provider is ever called. The browser sends an image or a
 * fixture id; API keys stay in this process.
 *
 * PRIVACY: the image lives in a local variable for the duration of the request.
 * It is never written to disk, never logged, and never echoed back in an error.
 * Error details carry provider status codes and zod field paths only.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { DocumentTypeSchema, LanguageSchema } from '@/lib/analysis/schema';
import { serverConfig } from '@/lib/providers/config';
import {
  analyzeDocument,
  analyzeWithFixture,
  resolveRequestedProvider,
} from '@/lib/providers';

export const runtime = 'nodejs';
/** Never cached: every request is a different document. */
export const dynamic = 'force-dynamic';

const RequestSchema = z
  .object({
    /** Base64 image bytes without the data: prefix. */
    imageBase64: z.string().min(1).optional(),
    mimeType: z.string().max(100).optional(),
    fixtureId: z.string().max(60).optional(),
    language: LanguageSchema.default('ko'),
    provider: z.enum(['openai', 'ollama', 'fixture']).optional(),
    /** Opt-in Ollama 8B. */
    qualityMode: z.boolean().optional(),
    /** Document type the user chose on the confirm screen. */
    userDeclaredType: DocumentTypeSchema.optional(),
    /**
     * Set only after the user has agreed to continue with demo content. The
     * spec requires consent before substituting a fixture for their document.
     */
    acceptFixtureFallback: z.boolean().optional(),
  })
  .strict();

/** Byte count of a base64 payload without allocating a Buffer. */
function base64Bytes(value: string): number {
  const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0;
  return Math.floor((value.length * 3) / 4) - padding;
}

function badRequest(code: string, detail: string, status: number) {
  return NextResponse.json(
    { ok: false, error: { code, detail, retryable: false } },
    { status },
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('unknown', 'Malformed request body.', 400);
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(
      'unknown',
      parsed.error.issues.map((issue) => issue.path.join('.')).join(', '),
      400,
    );
  }

  const input = parsed.data;

  if (input.imageBase64) {
    if (base64Bytes(input.imageBase64) > serverConfig.upload.maxBytes) {
      return badRequest(
        'upload_too_large',
        `Maximum upload size is ${serverConfig.upload.maxBytes} bytes.`,
        413,
      );
    }
    if (!input.mimeType || !serverConfig.upload.allowedTypes.includes(input.mimeType)) {
      return badRequest(
        'unsupported_type',
        `Allowed types: ${serverConfig.upload.allowedTypes.join(', ')}`,
        415,
      );
    }
  }

  const requested = resolveRequestedProvider(input.provider);
  const documentInput = {
    imageBase64: input.imageBase64,
    mimeType: input.mimeType,
    fixtureId: input.fixtureId,
    language: input.language,
    userDeclaredType: input.userDeclaredType,
  };

  // The client asked to switch to demo content after a failure.
  if (input.acceptFixtureFallback) {
    const outcome = await analyzeWithFixture(requested, documentInput, 'provider_error');
    return NextResponse.json(outcome, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  const outcome = await analyzeDocument(requested, documentInput, {
    qualityMode: input.qualityMode,
    // A missing key or an unusable provider still degrades silently to the
    // fixture - that is a configuration problem, not a failed analysis of the
    // user's document. A genuine provider failure comes back as ok:false so the
    // UI can ask before substituting demo content.
    autoFallbackToFixture: false,
  });

  // 200 even for a failed analysis: the client renders the retry / demo choice.
  return NextResponse.json(outcome, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}
