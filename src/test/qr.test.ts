import { afterEach, describe, expect, it, vi } from "vitest";
import QRCode from "qrcode";
import { qrDataUrlForInvite, qrSvgForInvite } from "@/lib/qr";
import { buildShareLinks } from "@/lib/share";
import { blankConfig } from "@/lib/invites-api";
import type { Invite } from "@/invites/types";

function invite(slug = "asha-vikram-x1"): Invite {
  const config = blankConfig();
  config.hosts = { mode: "couple", person1: "Asha", person2: "Vikram" };
  return { ...config, slug, themeId: "dubai-silk" };
}

const BASE = "https://invite.example.com";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("qrDataUrlForInvite — QR for a published invitation (§6.1)", () => {
  it("encodes exactly the share link's public URL", async () => {
    const spy = vi
      .spyOn(QRCode, "toDataURL")
      .mockImplementation(() => Promise.resolve("data:image/png;base64,STUB"));
    const inv = invite();
    const result = await qrDataUrlForInvite(inv, BASE);
    expect(result).toBe("data:image/png;base64,STUB");
    expect(spy).toHaveBeenCalledTimes(1);
    // The QR must encode the very URL the Share / Copy-link actions hand
    // out — one source of truth (buildShareLinks), no second URL builder.
    expect(spy.mock.calls[0]![0]).toBe(buildShareLinks(inv, BASE).publicUrl);
  });

  it("uses the agreed QR options (M correction, 512px, quiet-zone margin)", async () => {
    const spy = vi
      .spyOn(QRCode, "toDataURL")
      .mockImplementation(() => Promise.resolve("data:,"));
    await qrDataUrlForInvite(invite(), BASE);
    expect(spy.mock.calls[0]![1]).toMatchObject({
      errorCorrectionLevel: "M",
      width: 512,
      margin: 2,
    });
  });

  it("defaults the base URL the same way share links do", async () => {
    const spy = vi
      .spyOn(QRCode, "toDataURL")
      .mockImplementation(() => Promise.resolve("data:,"));
    const inv = invite();
    await qrDataUrlForInvite(inv);
    expect(spy.mock.calls[0]![0]).toBe(buildShareLinks(inv).publicUrl);
  });
});

describe("qrSvgForInvite — deterministic SVG rendering of the same code", () => {
  it("produces an SVG document", async () => {
    const svg = await qrSvgForInvite(invite(), BASE);
    expect(svg.startsWith("<svg")).toBe(true);
  });

  it("is stable for the same invitation", async () => {
    const a = await qrSvgForInvite(invite(), BASE);
    const b = await qrSvgForInvite(invite(), BASE);
    expect(a).toBe(b);
  });

  it("differs between different invitation slugs", async () => {
    const a = await qrSvgForInvite(invite("asha-vikram-x1"), BASE);
    const b = await qrSvgForInvite(invite("meera-arjun-z9"), BASE);
    expect(a).not.toBe(b);
  });

  it("passes exactly the public URL to the generator", async () => {
    const spy = vi
      .spyOn(QRCode, "toString")
      .mockImplementation(() => Promise.resolve("<svg/>"));
    const inv = invite();
    await qrSvgForInvite(inv, BASE);
    expect(spy.mock.calls[0]![0]).toBe(buildShareLinks(inv, BASE).publicUrl);
  });
});
