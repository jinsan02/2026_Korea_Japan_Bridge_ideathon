'use client';

/**
 * Read-aloud control.
 *
 * Every screen that carries a decision has one. When the device has no speech
 * synthesis the button is not silently broken - it says so.
 */
import { useEffect, useState } from 'react';

import { getSpeechEngine } from '@/lib/speech';
import { useSession } from '@/lib/session/SessionProvider';

interface SpeakButtonProps {
  /** Text to read. Build it with buildUtterance() so pauses land correctly. */
  text: string;
  /** Screen name, recorded with the speech_played event. */
  screen: string;
  variant?: 'primary' | 'secondary';
}

export function SpeakButton({ text, screen, variant = 'secondary' }: SpeakButtonProps) {
  const { t, language, logEvent } = useSession();
  const [speaking, setSpeaking] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const engine = getSpeechEngine();
    setAvailable(engine.available);
    const unsubscribe = engine.onStateChange(setSpeaking);
    return () => {
      unsubscribe();
      engine.stop();
    };
  }, []);

  if (!available) {
    return (
      <p className="notice notice--info">
        <span className="notice__icon" aria-hidden="true">
          🔇
        </span>
        <span>{t.common.ttsUnavailable}</span>
      </p>
    );
  }

  const toggle = () => {
    const engine = getSpeechEngine();
    if (speaking) {
      engine.stop();
      return;
    }
    logEvent('speech_played', { screen });
    engine.speak(text, language);
  };

  return (
    <button
      type="button"
      className={`btn btn--${variant}`}
      onClick={toggle}
      aria-pressed={speaking}
    >
      <span aria-hidden="true">{speaking ? '⏹' : '🔊'}</span>
      {speaking ? t.common.stopReading : t.common.readAloud}
    </button>
  );
}
