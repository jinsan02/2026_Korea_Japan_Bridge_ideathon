/**
 * Stub for the `server-only` package under vitest.
 *
 * The real module throws on import outside a server component, which is the
 * guarantee that no API key can reach the browser bundle. Next enforces that
 * at build time; here it would only stop the orchestration code from being
 * tested at all. Aliased in vitest.config.ts, nowhere else.
 */
export {};
