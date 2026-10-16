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
 * keeps two Aarav-and-Anaya weddings from colliding without making the link
 * ugly.
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

export async function listInvites() {
  const { data, error } = await supabase
    .from("invites")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as InviteRow[];
}

export async function getInviteById(id: string) {
  const { data, error } = await supabase
    .from("invites")
    .select("*")
    .eq("id", id)
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

export async function createInvite(userId: string, themeId: string) {
  const { data, error } = await supabase
    .from("invites")
    .insert({
      user_id: userId,
      theme_id: themeId,
      slug: makeSlug("invitation"),
      config: blankConfig(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as InviteRow;
}

export async function saveInvite(
  id: string,
  patch: { config?: InviteConfig; theme_id?: string; slug?: string },
) {
  const update: Record<string, unknown> = { ...patch };
  if (patch.config?.event.startIso) {
    update["event_date"] = patch.config.event.startIso;
  }
  const { data, error } = await supabase
    .from("invites")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as InviteRow;
}

export async function deleteInvite(id: string) {
  const { error } = await supabase.from("invites").delete().eq("id", id);
  if (error) throw error;
}
