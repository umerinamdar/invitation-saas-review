import { describe, expect, it } from "vitest";
import { buildShareLinks } from "@/lib/share";
import { blankConfig } from "@/lib/invites-api";
import type { Invite } from "@/invites/types";

function invite(
  person1: string,
  person2: string,
  slug = "asha-vikram-x1",
): Invite {
  const config = blankConfig();
  config.hosts = { mode: "couple", person1, person2 };
  return { ...config, slug, themeId: "dubai-silk" };
}

const BASE = "https://invite.example.com";

function whatsappText(links: { whatsappUrl: string }): string {
  const param = links.whatsappUrl.slice("https://wa.me/?text=".length);
  return decodeURIComponent(param);
}

describe("buildShareLinks — published-invitation sharing (§6.1)", () => {
  it("builds the public URL from the given base and the invite slug", () => {
    const links = buildShareLinks(invite("Asha", "Vikram"), BASE);
    expect(links.publicUrl).toBe(`${BASE}/i/asha-vikram-x1`);
  });

  it("tolerates a trailing slash on the base URL", () => {
    const links = buildShareLinks(invite("Asha", "Vikram"), `${BASE}/`);
    expect(links.publicUrl).toBe(`${BASE}/i/asha-vikram-x1`);
  });

  it("copyText is exactly the public URL", () => {
    const links = buildShareLinks(invite("Asha", "Vikram"), BASE);
    expect(links.copyText).toBe(links.publicUrl);
  });

  it("builds a wa.me URL whose text is fully percent-encoded", () => {
    const links = buildShareLinks(invite("Asha", "Vikram"), BASE);
    expect(links.whatsappUrl.startsWith("https://wa.me/?text=")).toBe(true);
    // The couple's "&" and the spaces must not survive unencoded — a raw
    // "&" would truncate the message at the query-string boundary.
    expect(links.whatsappUrl).not.toContain("Asha & Vikram");
    expect(links.whatsappUrl).not.toContain(" ");
    const text = whatsappText(links);
    expect(text).toContain("Asha & Vikram");
    expect(text).toContain(`${BASE}/i/asha-vikram-x1`);
  });

  it("round-trips unicode names through the encoding", () => {
    const links = buildShareLinks(
      invite("अंशु", "मीरा", "anshu-meera-y2"),
      BASE,
    );
    const text = whatsappText(links);
    expect(text).toContain("अंशु & मीरा");
    expect(text).toContain(`${BASE}/i/anshu-meera-y2`);
  });

  it("uses a single host's name without a dangling ampersand", () => {
    const text = whatsappText(buildShareLinks(invite("Asha", ""), BASE));
    expect(text).toContain("Asha");
    expect(text).not.toContain("Asha &");
  });

  it("falls back to a generic message when no names are set", () => {
    const text = whatsappText(buildShareLinks(invite("", ""), BASE));
    expect(text).toContain("You're invited");
    expect(text).toContain(`${BASE}/i/asha-vikram-x1`);
  });
});
