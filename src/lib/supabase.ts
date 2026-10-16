import { createClient } from "@supabase/supabase-js";

const url = import.meta.env["VITE_SUPABASE_URL"];
const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

if (!url || !key) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.",
  );
}

/**
 * Browser client. It carries the publishable key, which is meant to be
 * public — row level security, not key secrecy, is what keeps one couple
 * from reading another's invite.
 */
export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export type InviteRow = {
  id: string;
  user_id: string;
  slug: string;
  preview_token: string;
  theme_id: string;
  occasion: string;
  config: Record<string, unknown>;
  status: "draft" | "published" | "archived";
  event_date: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};
