import { createClient } from "@supabase/supabase-js";

const url = process.env["VITE_SUPABASE_URL"];
const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

if (!url || !serviceRoleKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server environment"
  );
}

/**
 * Server-side Supabase client with service_role key.
 * Bypasses RLS for privileged operations like order writes and webhook processing.
 * NEVER expose this key to the client.
 */
export const supabaseServer = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
