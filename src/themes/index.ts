import type { Theme } from "./types";
import { cathedralLight } from "./cathedral-light";
import { dubaiSilk } from "./dubai-silk";
import { goldenTemple } from "./golden-temple";
import { ivorySilkPearls } from "./ivory-silk-pearls";
import { noorInvitation } from "./noor-invitation";
import { ramMandir } from "./ram-mandir";

/**
 * Catalog reset (2026-10-25, owner decision): every theme except Dubai
 * Silk was taken OUT of the active catalog — not deleted, just
 * unregistered here — to be brought back one at a time, each rebuilt in
 * the owner's own Lovable project and then ported in faithfully (see
 * docs/ops/OPENING-STUDY-ivory-silk-pearls.md for the choreography this
 * is measured against: a held latch beat, a slow cover-only unfold with
 * the card never moving, then the frame revealed before the text fades
 * in last, plus a blur/zoom "emerge into focus" transition once the
 * cover clears).
 *
 * Ivory Silk & Pearls (2026-10-25) is the first one back — ported
 * literally from its own Lovable build, with its own mechanic
 * (`ivorySilkEnvelope` in reveals/index.tsx) and its own hardcoded CSS
 * timings, not generalized into the shared engine.
 *
 * Ram Mandir (2026-10-26) is the second — reworked from its old
 * lifting-casket ("box") opening to a bespoke temple-doors mechanic
 * (`ramMandirDoors`), built directly in this engine since no Lovable
 * component existed for it to port. Placed FIRST in the array at the
 * owner's request, so it's the first design shown in the gallery.
 *
 * Golden Temple (2026-10-27) is the third — same rework as Ram Mandir:
 * its old lifting-casket ("box") opening replaced with a bespoke
 * temple-doors mechanic (`goldenTempleDoors`), reusing Ram Mandir's
 * carved-doors contract directly since the artwork already on disk
 * (never regenerated — its gold doors were already a symmetric pair
 * with a near-centred seam) needed no new mechanic of its own, just a
 * different post-open beat: a forward camera dolly through the
 * doorway instead of a blur/zoom settle.
 *
 * Noor Invitation (2026-10-28) is the fifth — a new Lovable project,
 * neither a pre-existing theme nor one of the 20 conversions, ported
 * from the owner's "Noor Invitation" project: a bespoke noorBook
 * mechanic (right-spine book swing over an ivory first page, no seal
 * anywhere on the cover), a Quran verse blessing (Ar-Rum 30:21) as
 * the first thing after entering, and its own page-settle + verse
 * illumination inside animation. It joins as the fifth theme in the
 * active catalog.
 *
 * Cathedral Light (2026-10-28) joins as the sixth — reworked from
 * its generic fast doors (1.6s) to a bespoke cathedralDoors mechanic
 * (slow slide-apart from the artwork's 50% middle line, plain SVG
 * wax seal with no letters, no names on the cover, larger Tap to
 * open plus a You're Invited line, and a candlelight-bloom post-open
 * transition), following the Lovable "Cathedral Light Invitations"
 * cover the owner sent. Brought onto this branch at the owner's
 * request so the gallery shows all six together.
 *
 * Every other theme's file is untouched on disk — src/themes/*.ts for
 * the remaining 10 pre-existing designs and the 19 Lovable-20
 * conversions — and will be brought back the same way, one at a time.
 * Do not re-add a batch at once.
 */
export const themes: Theme[] = [
  ramMandir,
  dubaiSilk,
  ivorySilkPearls,
  goldenTemple,
  noorInvitation,
  cathedralLight,
];

export const themesById = new Map(themes.map((theme) => [theme.id, theme]));

export const DEFAULT_THEME_ID = dubaiSilk.id;

export function getTheme(id: string): Theme {
  return themesById.get(id) ?? dubaiSilk;
}

export * from "./types";
