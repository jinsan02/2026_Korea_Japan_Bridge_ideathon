/**
 * Provider contract.
 *
 * Three implementations satisfy it - OpenAI, Ollama, Fixture - and the rest of
 * the app never learns which one ran. Swapping an AI vendor means adding a file
 * in this directory, not touching a screen.
 *
 * Planned extensions that fit the same interface without changing it:
 *   PaddleOCRProvider  - OCR only, feeding text to an LLM
 *   HybridProvider     - PaddleOCR text + OpenAI/Qwen structuring
 */
import type {
  AnalysisError,
  DocumentTypeId,
  Language,
  ModelAnalysis,
  ProviderId,
} from '@/lib/analysis/schema';

export interface DocumentInput {
  /**
   * Base64 image bytes, no data: prefix. Held in memory for the request only -
   * never written to disk, never logged.
   */
  imageBase64?: string;
  mimeType?: string;
  /** Which synthetic document the user picked, when they picked one. */
  fixtureId?: string;
  /** UI language, which is also the language the explanation is written in. */
  language: Language;
  /** Set when the user corrected the type on the confirm screen. */
  userDeclaredType?: DocumentTypeId;
}

export type ProviderResult =
  | { ok: true; analysis: ModelAnalysis; model: string | null }
  | { ok: false; error: AnalysisError; model: string | null };

export interface DocumentAnalysisProvider {
  readonly id: ProviderId;
  /** Model identifier for the comparison log. Null for fixtures. */
  readonly model: string | null;
  /**
   * Never throws for expected failures. Unreachable hosts, timeouts, malformed
   * JSON and schema violations all come back as `{ ok: false }` so the UI can
   * offer retry or Fixture Demo rather than showing a stack trace on stage.
   */
  analyzeDocument(input: DocumentInput): Promise<ProviderResult>;
}
