import { describe, expect, it } from "vitest";

import { blankConfig } from "@/lib/invites-api";
import type { InviteRow } from "@/lib/supabase";
import { publishedShareLinks } from "@/routes/order-success";

// Release Fix 8 (Agent C, C-1, HIGH): the order-success "Share on
// WhatsApp" button hardcoded https://wa.me/?text=Check%20out%20my%20
// invitation! — a bare text with NO invitation URL, on the very page
// whose job is to hand the customer their shareable link. The href
// is now built from the verified invite row via the same
// buildShareLinks helper the dashboard uses, and exists ONLY in the
// verified published state.
function row(overrides: Partial<InviteRow> = {}): InviteRow {
  const config = blankConfig();
  config.hosts = { mode: "couple", person1: "Asha", person2: "Vikram" };
  return {
    id: "invite-1",
    user_id: "user-1",
    slug: "asha-vikram-x1",
    preview_token: "preview-token",
    theme_id: "kesari-mandap",
    occasion: "wedding",
    config: config as unknown as Record<string, unknown>,
    status: "published",
    event_date: null,
    published_at: "2026-10-22T00:00:00Z",
    created_at: "2026-10-21T00:00:00Z",
    updated_at: "2026-10-21T00:00:00Z",
    ...overrides,
  };
}

describe("publishedShareLinks (Fix 8 / C-1)", () => {
  it("builds a wa.me href carrying the real /i/<slug> URL when published", () => {
    const links = publishedShareLinks(
      "published",
      row(),
      "https://site.example",
    );
    expect(links).not.toBeNull();
    expect(links?.publicUrl).toBe("https://site.example/i/asha-vikram-x1");
    expect(links?.whatsappUrl).toContain("https://wa.me/?text=");
    expect(decodeURIComponent(links?.whatsappUrl ?? "")).toContain(
      "https://site.example/i/asha-vikram-x1",
    );
  });

  it("is null in every non-published page state", () => {
    for (const state of ["pending", "failed", "unverified"] as const) {
      expect(
        publishedShareLinks(state, row(), "https://site.example"),
      ).toBeNull();
    }
  });

  it("is null when the invite row is missing or not itself published", () => {
    expect(
      publishedShareLinks("published", null, "https://site.example"),
    ).toBeNull();
    expect(
      publishedShareLinks(
        "published",
        row({ status: "draft" }),
        "https://site.example",
      ),
    ).toBeNull();
  });
});
