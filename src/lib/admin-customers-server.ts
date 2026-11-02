import { supabaseServer } from "./supabase-server";

/**
 * id → email for every registered account, so /admin can show the real
 * customer behind an invite instead of a truncated uuid. Email lives
 * in auth.users, which RLS (and the browser client) can never read —
 * same boundary as getUserEmail in email-server.ts — so this runs
 * server-side with the service-role client's admin API.
 */
export interface AdminUserEmail {
  id: string;
  email: string;
}

export async function listAdminUserEmails(): Promise<AdminUserEmail[]> {
  // perPage: 1000 — comfortably above today's user count in one page.
  // Revisit with real pagination if the business ever needs page 2.
  const { data, error } = await supabaseServer.auth.admin.listUsers({
    perPage: 1000,
  });
  if (error) throw error;
  return data.users
    .filter((user) => !!user.email)
    .map((user) => ({ id: user.id, email: user.email as string }));
}
