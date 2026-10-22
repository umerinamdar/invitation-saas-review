import { describe, expect, it } from "vitest";
import { resolvePublishSubject } from "@/routes/publish";
import { blankConfig } from "@/lib/invites-api";
import type { InviteRow } from "@/lib/supabase";

// NF-2: the DB editor (/editor/$id) had no path to pay or publish, so a
// dashboard-created invitation could be edited but never published.
// /publish?invite=<id> resolves the publish subject from the database
// row instead of the localStorage draft. resolvePublishSubject is the
// pure decision at its centre: whose invite is it, and what state is
// it in? These tests pin ownership and state handling.
function row(overrides: Partial<InviteRow> = {}): InviteRow {
  const config = blankConfig();
  config.hosts = { mode: "couple", person1: "Asha", person2: "Vikram" };
  config.event = {
    ...config.event,
    startIso: "2027-02-12T10:00:00+05:30",
    dateText: "12 February 2027",
    venueName: "Palm Grove",
  };
  return {
    id: "invite-1",
    user_id: "user-1",
    slug: "asha-vikram-x1",
    preview_token: "token-1",
    theme_id: "kesari-mandap",
    occasion: "wedding",
    config: config as unknown as Record<string, unknown>,
    status: "draft",
    event_date: null,
    published_at: null,
    created_at: "2026-10-21T00:00:00Z",
    updated_at: "2026-10-21T00:00:00Z",
    ...overrides,
  };
}

describe("resolvePublishSubject — /publish?invite=<id> (NF-2)", () => {
  it("resolves the owner's draft with its saved config as the subject", () => {
    const subject = resolvePublishSubject(row(), "user-1");
    expect(subject.kind).toBe("draft");
    if (subject.kind !== "draft") return;
    expect(subject.inviteId).toBe("invite-1");
    expect(subject.themeId).toBe("kesari-mandap");
    // The exact saved invitation is the publish subject — names, date
    // and venue survive from the database row, not a blank config.
    expect(subject.config.hosts.person1).toBe("Asha");
    expect(subject.config.hosts.person2).toBe("Vikram");
    expect(subject.config.event.dateText).toBe("12 February 2027");
    expect(subject.config.event.venueName).toBe("Palm Grove");
  });

  it("refuses an invite owned by someone else", () => {
    expect(resolvePublishSubject(row(), "user-2").kind).toBe("forbidden");
    expect(
      resolvePublishSubject(row({ user_id: "user-2" }), "user-1").kind,
    ).toBe("forbidden");
  });

  it("reports an already-published invite with its slug, never a pay subject", () => {
    const subject = resolvePublishSubject(
      row({ status: "published" }),
      "user-1",
    );
    expect(subject).toEqual({ kind: "published", slug: "asha-vikram-x1" });
  });

  it("does not offer an archived invite for payment", () => {
    expect(
      resolvePublishSubject(row({ status: "archived" }), "user-1").kind,
    ).toBe("unavailable");
  });
});
