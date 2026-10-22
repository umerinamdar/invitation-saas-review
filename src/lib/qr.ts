import QRCode from "qrcode";
import { buildShareLinks } from "@/lib/share";
import type { Invite } from "@/invites/types";

/**
 * QR code for a published invitation (mission §6.1).
 *
 * The code encodes exactly the public URL from `buildShareLinks` — the
 * same string the Share and Copy-link actions hand out — so a guest who
 * scans the code and a guest who taps the link land in the same place.
 * Generation is entirely client-side (the `qrcode` package renders in
 * the browser); no invitation data leaves the device.
 */
const QR_OPTIONS = {
  errorCorrectionLevel: "M",
  margin: 2,
  width: 512,
} as const;

/** PNG data URL of the invitation's QR code, ready for <img> / download. */
export async function qrDataUrlForInvite(
  invite: Invite,
  baseUrl?: string,
): Promise<string> {
  const { publicUrl } = buildShareLinks(invite, baseUrl);
  return QRCode.toDataURL(publicUrl, { ...QR_OPTIONS, type: "image/png" });
}

/** SVG string of the same QR code (handy for tests and crisp previews). */
export async function qrSvgForInvite(
  invite: Invite,
  baseUrl?: string,
): Promise<string> {
  const { publicUrl } = buildShareLinks(invite, baseUrl);
  return QRCode.toString(publicUrl, { ...QR_OPTIONS, type: "svg" });
}
