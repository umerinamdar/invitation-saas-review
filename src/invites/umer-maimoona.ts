import type { Invite } from "./types";

/**
 * Umer and Maimoona's own invitation — personal content, not a template.
 * The artwork, the quote and the monogrammed seal belong to them, so this
 * never appears in the public gallery. See `demo-wedding.ts` for the
 * neutral invite the Dubai Silk listing previews.
 */
export const umerMaimoona: Invite = {
  slug: "umer-maimoona-2026",
  themeId: "dubai-silk",
  occasion: "engagement",

  hosts: { mode: "couple", person1: "Umer", person2: "Maimoona" },

  sealImage: "/demo/umer-maimoona/seal.png",

  event: {
    typeLabel: "Engagement Ceremony",
    startIso: "2026-11-22T19:00:00+05:30",
    dateText: "22 November 2026",
    dayText: "Sunday",
    timeText: "7:00 PM onwards",
    venueName: "Iris Banquet and Lawn",
    venueMapsUrl: "https://maps.app.goo.gl/ZvBLCsdqbGWogDo98",
  },

  story: {
    togetherSinceIso: "2024-08-11T00:00:00+05:30",
    togetherSinceText: "11 August 2024",
    quote: "Two traditions, one faith,\nunited by endless love.",
  },

  gallery: [
    {
      slot: "ring",
      url: "/demo/umer-maimoona/ring.jpg",
      alt: "Cartoon illustration of Umer and Maimoona's ring exchange overlooking Palm Jumeirah's turquoise waterfront",
      width: 1264,
      height: 848,
    },
    {
      slot: "childhood",
      url: "/demo/umer-maimoona/childhood.jpg",
      alt: "Illustration of Umer and Maimoona as little children holding hands beneath a silhouette of their engagement",
      width: 928,
      height: 1152,
    },
    {
      slot: "forever",
      url: "/demo/umer-maimoona/forever.jpg",
      alt: "Illustration of Umer and Maimoona holding hands, seen from behind in a navy suit and embroidered ivory bridal dress",
      width: 928,
      height: 1152,
    },
  ],

  meta: {
    title: "Umer & Maimoona | Engagement Invitation",
    description:
      "Celebrate Umer and Maimoona’s engagement on 22 November 2026, 7 PM onwards at Iris Banquet and Lawn.",
  },
};
