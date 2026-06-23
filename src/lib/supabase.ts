/**
 * Supabase client singleton.
 *
 * Uses the validated environment config to create a single
 * SupabaseClient instance shared across the entire application.
 * This avoids creating multiple GoTrue/Realtime connections.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";
import type { Database } from "@/types/database.types";

/**
 * Typed Supabase client instance.
 * The generic parameter enables autocomplete for table/column names
 * once `Database` types are generated via `supabase gen types`.
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  env.supabase.url,
  env.supabase.anonKey
);
