import { describe, expect, it } from "vitest";
import { buildSitemapXml, SITEMAP_PATHS } from "@/lib/sitemap";

// Wave 4 / Stage D: the sitemap is generated per-request so its <loc>
// origins match the served domain — no production domain is baked in.
describe("sitemap", () => {
  it("lists only public, indexable pages", () => {
    expect(SITEMAP_PATHS).toEqual([
      "/",
      "/templates",
      "/contact",
      "/privacy",
      "/terms",
      "/refund",
    ]);
    for (const privatePath of [
      "/dashboard",
      "/create",
      "/publish",
      "/login",
      "/order-success",
      "/order-failed",
    ]) {
      expect(SITEMAP_PATHS).not.toContain(privatePath);
    }
  });

  it("builds absolute URLs from the given origin", () => {
    const xml = buildSitemapXml("https://easyinvitemaker.com");
    expect(xml).toContain("<loc>https://easyinvitemaker.com/</loc>");
    expect(xml).toContain("<loc>https://easyinvitemaker.com/templates</loc>");
    expect(xml).toContain("<loc>https://easyinvitemaker.com/refund</loc>");
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  });

  it("tolerates a trailing slash on the origin", () => {
    const xml = buildSitemapXml("https://example.com/");
    expect(xml).toContain("<loc>https://example.com/templates</loc>");
    expect(xml).not.toContain("example.com//");
  });
});
