import type { Invite } from "./types";

/**
 * The invite every template preview renders. Invented hosts, invented venue —
 * nothing here belongs to a real event, so it is safe to show publicly.
 *
 * Swapping `themeId` previews any theme against the same content, which is how
 * the gallery shows twenty templates without twenty sets of sample data.
 * It carries no gallery images: a preview should sell the template, not a
 * stranger's photographs.
 */
export const demoWedding: Invite = {
  slug: "demo",
  themeId: "dubai-silk",
  occasion: "wedding",

  hosts: { mode: "couple", person1: "Aarav", person2: "Anaya" },

  event: {
    typeLabel: "Wedding Ceremony",
    startIso: "2027-02-14T19:30:00+05:30",
    dateText: "14 February 2027",
    dayText: "Sunday",
    timeText: "7:30 PM onwards",
    venueName: "The Grand Pavilion",
  },

  subEvents: [
    { label: "Mehendi", dateText: "12 February", timeText: "6:00 PM" },
    { label: "Sangeet", dateText: "13 February", timeText: "7:30 PM" },
    { label: "Reception", dateText: "15 February", timeText: "8:00 PM" },
  ],

  story: {
    togetherSinceIso: "2023-06-18T00:00:00+05:30",
    togetherSinceText: "18 June 2023",
    quote: "Two families, one celebration,\nand a lifetime ahead.",
  },

  gallery: [],

  meta: {
    title: "Aarav & Anaya | Wedding Invitation",
    description:
      "A sample invitation showing how your own names, dates and venue will appear.",
  },
};
