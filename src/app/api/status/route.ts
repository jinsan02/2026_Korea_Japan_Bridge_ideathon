/**
 * GET /api/status
 *
 * Configuration readout for the settings screen: which providers are usable,
 * which models are configured, and whether the local Ollama server is up.
 *
 * Returns booleans and model names only - never the API key, not even masked.
 */
import { NextResponse } from 'next/server';

import { serverConfig } from '@/lib/providers/config';
import { probeOllama } from '@/lib/providers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const ollama = await probeOllama();

  return NextResponse.json(
    {
      defaultProvider: serverConfig.defaultProvider,
      allowClientProviderOverride: serverConfig.allowClientProviderOverride,
      openai: {
        // Presence only. The key itself never leaves the server.
        keyConfigured: serverConfig.openai.apiKey.length > 0,
        model: serverConfig.openai.model,
        fallbackModel: serverConfig.openai.fallbackModel,
      },
      ollama: {
        baseUrl: serverConfig.ollama.baseUrl,
        model: serverConfig.ollama.model,
        numCtx: serverConfig.ollama.numCtx,
        reachable: ollama.reachable,
        installedModels: ollama.models,
      },
      upload: {
        maxBytes: serverConfig.upload.maxBytes,
        maxEdgePx: serverConfig.upload.maxEdgePx,
        allowedTypes: serverConfig.upload.allowedTypes,
      },
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
