import { dubaiSilk } from "./dubai-silk";
import type { Theme } from "./types";

/**
 * Set A, second template. Shares every pixel of Dubai Silk's artwork and
 * differs only in how it opens — carved doors instead of an envelope — plus a
 * cooler palette and a longer, slower entrance.
 *
 * This is the catalog's economics in one file: a template that costs no new
 * photography, no new backdrop and no new music.
 */
export const azureVows: Theme = {
  ...dubaiSilk,
  id: "azure-vows",
  name: "Azure Vows",
  occasions: ["wedding", "reception"],

  palette: {
    ...dubaiSilk.palette,
    accent: "oklch(0.62 0.075 236)", // silver-blue rather than gold
    accentSoft: "oklch(0.82 0.05 236)",
    surface: "oklch(0.955 0.012 242)",
  },

  motion: {
    ...dubaiSilk.motion,
    reveal: "doors",
    openMs: 1600, // doors travel further than a flap
    petals: "rose",
  },

  copy: {
    scratchTitle: "The day we begin",
    scratchHint: "Scratch to reveal",
  },

  ornament: "❖",
};
