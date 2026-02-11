/**
 * Centralized application configuration.
 *
 * Values are read from Vite env variables (VITE_*) at build time,
 * falling back to sensible defaults. To override locally, create a
 * `.env.local` file at the frontend root (git-ignored by default).
 *
 * Adding a new setting:
 *   1. Add a VITE_* key to `.env` (or `.env.local`) if needed.
 *   2. Add a typed entry below with its default.
 *   3. Import `config` wherever you need it.
 */

function env(key: string): string | undefined {
  return import.meta.env[key] as string | undefined
}

function envInt(key: string, fallback: number): number {
  const v = env(key)
  if (v === undefined) return fallback
  const parsed = parseInt(v, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}


export const config = {
  /** ------ FIRE Calculator ------ */

  /** Years to display after FIRE age in the projection chart. */
  fire: {
    yearsAfterFire: envInt('VITE_FIRE_YEARS_AFTER_FIRE', 5),
  },

  /** ------ General UI ------ */
  ui: {
    currency: env('VITE_CURRENCY') ?? 'EUR',
    locale: env('VITE_LOCALE') ?? 'en-EU',
  },
} as const
