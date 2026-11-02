/**
 * Quick-pick content for the editor's Occasion, Welcome line and
 * Blessing/verse fields — suggestions the user can select instead of
 * typing from scratch, never a replacement for free typing (every
 * field stays editable after picking one).
 *
 * The blessing presets with a scripture attribution are deliberately
 * short, widely-known lines rather than full scholarly translations —
 * the Sikh one is phrased as "inspired by" rather than a precise
 * quote, since exact transliteration/attribution wasn't verified to
 * the precision a direct citation implies.
 */

export const OCCASION_PRESETS: readonly string[] = [
  "Wedding Ceremony",
  "Engagement Ceremony",
  "Nikah Ceremony",
  "Walima",
  "Reception",
  "Sangeet",
  "Haldi Ceremony",
  "Mehendi Ceremony",
  "Roka Ceremony",
  "Wedding & Reception",
  "Engagement & Wedding",
  "Nikah & Walima",
  "Wedding, Haldi & Mehendi",
];

export const WELCOME_PRESETS: readonly string[] = [
  "With the blessings of our families, we invite you to share in the joy of our wedding.",
  "Together with our families, we joyfully invite you to celebrate our wedding.",
  "With hearts full of joy, we invite you to witness the beginning of our forever.",
];

export type BlessingPreset = {
  group: string;
  label: string;
  text: string;
  attribution: string;
};

export const BLESSING_PRESETS: readonly BlessingPreset[] = [
  {
    group: "Hindu",
    label: "Shanti Mantra",
    text: "May all be happy, may all be free from illness.",
    attribution: "Shanti Mantra",
  },
  {
    group: "Muslim",
    label: "Surah Ar-Rum 30:21",
    text: "And among His signs is that He created for you mates from among yourselves, that you may find tranquility in them, and He placed between you affection and mercy.",
    attribution: "Qur'an 30:21",
  },
  {
    group: "Christian",
    label: "1 Corinthians 13",
    text: "Love is patient, love is kind. It always protects, always trusts, always hopes, always perseveres. Love never fails.",
    attribution: "1 Corinthians 13",
  },
  {
    group: "Sikh",
    label: "Anand Karaj blessing",
    text: "Blessed is that moment when we were destined to meet.",
    attribution: "Inspired by the Anand Karaj hymns",
  },
  {
    group: "General",
    label: "A blessing for the couple",
    text: "May this union be blessed with harmony, understanding and a lifetime of shared joy.",
    attribution: "A blessing for the couple",
  },
  {
    group: "General",
    label: "Two souls, one journey",
    text: "Two souls, one journey — may your life together be filled with love, laughter and endless adventure.",
    attribution: "",
  },
];
