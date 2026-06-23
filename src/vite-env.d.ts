/// <reference types="vite/client" />

/**
 * Type-safe environment variables for Vite.
 * All custom env vars must be prefixed with VITE_ to be exposed to client code.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
