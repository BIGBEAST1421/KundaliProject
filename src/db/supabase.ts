import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/src/lib/env";

let client: SupabaseClient | null = null;

/** Service-role client — server only. Never import from client components. */
export function supabase(): SupabaseClient {
  client ??= createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
