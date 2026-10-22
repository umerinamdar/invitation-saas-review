import type { Invite } from "@/invites/types";
import { supabase, type InviteRow } from "./supabase";

/** The parts of an Invite the customer edits; slug and theme are columns. */
export type InviteConfig = Omit<Invite, "slug" | "themeId">;

export function blankConfig(): InviteConfig {
  return {
    occasion: "wedding",
    hosts: { mode: "couple", person1: "", person2: "" },
    event: {
      typeLabel: "Wedding Ceremony",
      startIso: "",
      dateText: "",
      dayText: "",
      timeText: "",
      venueName: "",
    },
    gallery: [],
    meta: { title: "", description: "" },
  };
}

/** Reassembles the row and its config into what the engine renders. */
export function toInvite(row: InviteRow): Invite {
  const config = row.config as Partial<InviteConfig>;
  const blank = blankConfig();
  return {
    ...blank,
    ...config,
    hosts: { ...blank.hosts, ...config.hosts },
    event: { ...blank.event, ...config.event },
    gallery: config.gallery ?? [],
    meta: { ...blank.meta, ...config.meta },
    slug: row.slug,
    themeId: row.theme_id,
  };
}

/**
 * A readable, URL-safe slug from the hosts' names. A short random suffix
 * keeps two weddings for same-named couples from colliding without making
 * the link ugly.
 */
export function makeSlug(person1: string, person2?: string) {
  const base = [person1, person2]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "invitation"}-${suffix}`;
}

/**
 * DB-2 defence-in-depth: RLS is the primary ownership barrier, but the
 * owner-surface functions below also scope every query to the session
 * user in code, so a missing or loosened policy cannot silently turn
 * them into cross-user reads/writes. Returns null when signed out;
 * callers then fail closed ([] / null / throw) rather than issuing an
 * unscoped query.
 */
async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function listInvites() {
  const userId = await currentUserId();
  if (!userId) return [] as InviteRow[];
  const { data, error } = await supabase
    .from("invites")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as InviteRow[];
}

export async function getInviteById(id: string) {
  const userId = await currentUserId();
  if (!userId) return null;
  const { data, error } = await supabase
    .from("invites")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data as InviteRow;
}

/** Published invites are readable by anonymous guests via RLS. */
export async function getPublishedBySlug(slug: string) {
  const { data, error } = await supabase
    .from("invites")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data as InviteRow | null;
}

export async function getByPreviewToken(token: string) {
  const { data, error } = await supabase
    .from("invites")
    .select("*")
    .eq("preview_token", token)
    .maybeSingle();
  if (error) throw error;
  return data as InviteRow | null;
}

/**
 * The row createInvite inserts. Pure so it can be unit-tested without a
 * live Supabase client. The slug comes from the hosts' names and the
 * event_date column mirrors saveInvite's behaviour, so an invite created
 * from a finished draft carries the draft — previously this inserted
 * blankConfig() under a generic slug and the customer's names, date and
 * venue were silently lost at exactly the step they paid for.
 */
export function buildInviteInsert(
  userId: string,
  themeId: string,
  config: InviteConfig = blankConfig(),
  id?: string,
) {
  const insert: {
    id?: string;
    user_id: string;
    theme_id: string;
    slug: string;
    config: InviteConfig;
    event_date?: string;
  } = {
    user_id: userId,
    theme_id: themeId,
    slug: makeSlug(config.hosts.person1, config.hosts.person2),
    config,
  };
  // Impl round 2 (Agent C, C-3): a caller-generated id makes invite
  // creation idempotent — the publish flow records the id on the
  // local draft BEFORE inserting, so if the insert's response is
  // lost, a retry finds its own row via the reuse lookup instead of
  // inserting a duplicate.
  if (id) insert.id = id;
  if (config.event.startIso) {
    insert.event_date = config.event.startIso;
  }
  return insert;
}

export async function createInvite(
  userId: string,
  themeId: string,
  config?: InviteConfig,
  id?: string,
) {
  const { data, error } = await supabase
    .from("invites")
    .insert(buildInviteInsert(userId, themeId, config, id))
    .select()
    .single();
  if (error) throw error;
  return data as InviteRow;
}

export async function saveInvite(
  id: string,
  patch: { config?: InviteConfig; theme_id?: string; slug?: string },
) {
  const userId = await currentUserId();
  if (!userId) {
    throw new Error("You need to be signed in to save an invitation.");
  }
  const update: Record<string, unknown> = { ...patch };
  // Impl round 2 (Agent C, C-8): whenever a config is saved, the
  // event_date column mirrors it — including a CLEARED date, which
  // must null the column. Previously the column was only written
  // when startIso was truthy, so a cleared date stayed in the
  // column (and in date-ordered surfaces) forever.
  if (patch.config) {
    update["event_date"] = patch.config.event.startIso || null;
  }
  const { data, error } = await supabase
    .from("invites")
    .update(update)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data as InviteRow;
}

export async function deleteInvite(id: string) {
  const userId = await currentUserId();
  if (!userId) {
    throw new Error("You need to be signed in to delete an invitation.");
  }
  const { error } = await supabase
    .from("invites")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}
