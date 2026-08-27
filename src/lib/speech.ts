/**
 * Read-aloud engine.
 *
 * Uses the browser's built-in speech synthesis so there is no per-utterance API
 * cost and nothing leaves the device. The interface exists so a hosted TTS with
 * a warmer Korean voice can be dropped in without touching any screen.
 */

import { LANGUAGE_TAGS, type UiLanguage } from '@/lib/i18n';

export interface SpeechEngine {
  readonly available: boolean;
  speak(text: string, language: UiLanguage): void;
  stop(): void;
  onStateChange(listener: (speaking: boolean) => void): () => void;
}

class BrowserSpeechEngine implements SpeechEngine {
  private listeners = new Set<(speaking: boolean) => void>();

  get available(): boolean {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof window.SpeechSynthesisUtterance === 'function'
    );
  }

  speak(text: string, language: UiLanguage): void {
    if (!this.available) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANGUAGE_TAGS[language];
    // Slower than default: the target reader is 78 and hearing a long sentence
    // for the first time.
    utterance.rate = 0.9;
    utterance.pitch = 1;

    const preferred = synth
      .getVoices()
      .find((voice) => voice.lang.replace('_', '-') === LANGUAGE_TAGS[language]);
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => this.emit(false);
    utterance.onerror = () => this.emit(false);

    this.emit(true);
    synth.speak(utterance);
  }

  stop(): void {
    if (!this.available) return;
    window.speechSynthesis.cancel();
    this.emit(false);
  }

  onStateChange(listener: (speaking: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(speaking: boolean): void {
    for (const listener of this.listeners) listener(speaking);
  }
}

/** Inert engine used during server rendering. */
class NoopSpeechEngine implements SpeechEngine {
  readonly available = false;
  speak(): void {}
  stop(): void {}
  onStateChange(): () => void {
    return () => {};
  }
}

let engine: SpeechEngine | null = null;

export function getSpeechEngine(): SpeechEngine {
  if (engine) return engine;
  engine = typeof window === 'undefined' ? new NoopSpeechEngine() : new BrowserSpeechEngine();
  return engine;
}

/** Replaces the engine, e.g. with a hosted TTS provider. */
export function setSpeechEngine(next: SpeechEngine): void {
  engine = next;
}

/**
 * Joins the pieces of a screen into one utterance. Trailing punctuation is
 * added so the synthesiser pauses between sections instead of running them
 * together.
 */
export function buildUtterance(parts: (string | null | undefined)[]): string {
  return parts
    .filter((part): part is string => typeof part === 'string' && part.trim() !== '')
    .map((part) => (/[.!?。．]$/.test(part.trim()) ? part.trim() : `${part.trim()}.`))
    .join(' ');
}
