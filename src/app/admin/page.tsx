'use client';

/**
 * Settings and models - the operator screen, not a user screen.
 *
 * Three modes are offered by name. The opt-in 8B local model was removed: it
 * could not be the live-demo default on an 8GB card anyway, so its only real
 * effect was to put a mode on this screen that must not be clicked before a
 * demo.
 *
 * Also the export point for the de-identified event log and the model
 * comparison record. Reaching this route at all requires the shared code -
 * see middleware.ts.
 */
import { useEffect, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { CONDITION_IDS, CONDITIONS } from '@/lib/experiment/conditions';
import { clearProgress } from '@/lib/learning/progress';
import { useSession } from '@/lib/session/SessionProvider';

interface StatusPayload {
  defaultProvider: string;
  openai: { keyConfigured: boolean; model: string; fallbackModel: string };
  ollama: {
    baseUrl: string;
    model: string;
    numCtx: number;
    reachable: boolean;
    installedModels: string[];
  };
}

type ModeKey = 'openai' | 'ollamaFast' | 'fixture';

export default function LabScreen() {
  const { t, provider, setProvider, condition, setCondition, meta } = useSession();
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [eventCount, setEventCount] = useState<number | null>(null);

  useEffect(() => {
    void fetch('/api/status')
      .then((response) => response.json())
      .then((payload: StatusPayload) => setStatus(payload))
      .catch(() => setStatus(null));

    void fetch('/api/logs')
      .then((response) => response.json())
      .then((payload: { count?: number }) => setEventCount(payload.count ?? 0))
      .catch(() => setEventCount(null));
  }, []);

  const activeMode: ModeKey =
    provider === 'openai' ? 'openai' : provider === 'ollama' ? 'ollamaFast' : 'fixture';

  const chooseMode = (mode: ModeKey) => {
    if (mode === 'openai') setProvider('openai');
    else if (mode === 'ollamaFast') setProvider('ollama');
    else setProvider('fixture');
  };

  const modes: ModeKey[] = ['openai', 'ollamaFast', 'fixture'];

  return (
    <AppShell screen="admin" backHref="/" showBadges={false}>
      <div className="stack stack--loose">
        <div className="stack stack--tight">
          <h1 className="screen-title">{t.lab.title}</h1>
          <p className="screen-subtitle">{t.lab.subtitle}</p>
        </div>

        {/* --- provider selection ------------------------------------------ */}
        <section className="card">
          <h2 className="section-heading">{t.lab.providerLabel}</h2>
          <div className="stack stack--tight">
            {modes.map((mode) => (
              <label
                key={mode}
                className="radio-row"
                data-selected={activeMode === mode}
              >
                <input
                  type="radio"
                  name="mode"
                  checked={activeMode === mode}
                  onChange={() => chooseMode(mode)}
                />
                <span>
                  <strong>{t.lab.providers[mode]}</strong>
                  <br />
                  <span className="text-small">{t.lab.providerHelp[mode]}</span>
                </span>
              </label>
            ))}
          </div>

        </section>

        {/* --- environment readout ------------------------------------------ */}
        <section className="card">
          <h2 className="section-heading">{t.lab.keyStatus}</h2>
          {status ? (
            <>
              <p className={`notice notice--${status.openai.keyConfigured ? 'ok' : 'caution'}`}>
                <span className="notice__icon" aria-hidden="true">
                  {status.openai.keyConfigured ? '✅' : '❓'}
                </span>
                <span>
                  {status.openai.keyConfigured ? t.lab.keySet : t.lab.keyMissing}
                  <br />
                  <span className="text-small">
                    {status.openai.model} / {status.openai.fallbackModel}
                  </span>
                </span>
              </p>

              <div className="field">
                <p className="field__label">{t.lab.ollamaStatus}</p>
                <p className={status.ollama.reachable ? '' : 'field__value--missing'}>
                  <span aria-hidden="true">{status.ollama.reachable ? '✅ ' : '❌ '}</span>
                  {status.ollama.reachable
                    ? t.lab.ollamaReachable
                    : t.lab.ollamaUnreachable}
                </p>
                <p className="text-small">
                  {status.ollama.baseUrl} · {status.ollama.model} · num_ctx{' '}
                  {status.ollama.numCtx}
                </p>
              </div>

              {status.ollama.installedModels.length > 0 ? (
                <div className="field">
                  <p className="field__label">{t.lab.installedModels}</p>
                  <ul>
                    {status.ollama.installedModels.map((name) => (
                      <li key={name}>
                        <code>{name}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-small">—</p>
          )}
        </section>

        {/* --- last analysis, for the model comparison record --------------- */}
        {meta ? (
          <section className="card">
            <h2 className="section-heading">{t.lab.lastRun}</h2>
            <div className="table-scroll">
              <table className="data">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>provider</th>
                    <th>model</th>
                    <th>role</th>
                    <th>{t.lab.schemaOk}</th>
                    <th>{t.lab.elapsed}</th>
                  </tr>
                </thead>
                <tbody>
                  {meta.attempts.map((attempt, index) => (
                    <tr key={`${attempt.provider}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{attempt.provider}</td>
                      <td>{attempt.model ?? '—'}</td>
                      <td>{attempt.role}</td>
                      <td>{attempt.ok ? '✅' : `❌ ${attempt.errorCode ?? ''}`}</td>
                      <td>{attempt.elapsedMs} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-small">
              {t.lab.elapsed}: {meta.totalElapsedMs} ms
            </p>
          </section>
        ) : null}

        {/* --- experiment condition ---------------------------------------- */}
        <section className="card">
          <h2 className="section-heading">{t.lab.experimentTitle}</h2>
          <div className="stack stack--tight">
            {CONDITION_IDS.map((id) => (
              <label key={id} className="radio-row" data-selected={condition === id}>
                <input
                  type="radio"
                  name="condition"
                  checked={condition === id}
                  onChange={() => setCondition(id)}
                />
                <span>
                  <strong>
                    {id} · {CONDITIONS[id].label}
                  </strong>
                  <br />
                  <span className="text-small">{CONDITIONS[id].description}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* --- event log ---------------------------------------------------- */}
        <section className="card">
          <h2 className="section-heading">{t.lab.eventsTitle}</h2>
          <p className="field__value">
            {eventCount === null ? '—' : t.lab.eventCount(eventCount)}
          </p>
          <div className="stack stack--tight">
            <a className="btn btn--secondary" href="/api/logs?format=json" download>
              {t.lab.downloadJson}
            </a>
            <a className="btn btn--secondary" href="/api/logs?format=csv" download>
              {t.lab.downloadCsv}
            </a>
          </div>
          <p className="notice notice--ok">
            <span className="notice__icon" aria-hidden="true">
              🔐
            </span>
            <span>{t.lab.privacyNote}</span>
          </p>
        </section>

        <button
          type="button"
          className="btn btn--quiet"
          onClick={() => {
            if (window.confirm(t.lab.resetProgressConfirm)) clearProgress();
          }}
        >
          {t.lab.resetProgress}
        </button>
      </div>
    </AppShell>
  );
}
