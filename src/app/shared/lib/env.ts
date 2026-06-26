/**
 * Environment configuration module.
 *
 * Centralizes access to environment variables with runtime validation.
 * Fails fast at module load time if required variables are missing,
 * preventing silent misconfiguration in production.
 */

function getEnvVar(key: string): string {
  const value = import.meta.env[key];

  if (!value) {
    throw new Error(
      `Missing environment variable: ${key}. ` +
        `Ensure it is defined in your .env file.`
    );
  }

  return value;
}

export const env = {
  supabase: {
    url: getEnvVar("VITE_SUPABASE_URL"),
    anonKey: getEnvVar("VITE_SUPABASE_ANON_KEY"),
  },
} as const;
