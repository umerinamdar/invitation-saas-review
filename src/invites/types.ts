import type { Occasion } from "@/themes/types";

export type GallerySlot = "ring" | "childhood" | "forever";

export type GalleryImage = {
  slot: GallerySlot;
  url: string;
  alt: string;
  width: number;
  height: number;
};

export type SubEvent = {
  label: string; // Mehendi, Sangeet, Reception
  dateText: string;
  timeText: string;
  venueName?: string;
};

/**
 * One host's invitation. Everything here is customer-supplied; nothing in it
 * decides how the page looks — that is the theme's job.
 */
export type Invite = {
  slug: string;
  themeId: string;
  occasion: Occasion;

  hosts: {
    mode: "couple" | "single";
    person1: string;
    person2?: string;
  };

  event: {
    typeLabel: string; // "Engagement Ceremony"
    startIso: string; // offset decides the countdown's anchor
    dateText: string; // "22 November 2026"
    dayText: string; // "Sunday"
    timeText: string; // "7:00 PM onwards"
    venueName: string;
    venueMapsUrl?: string;
  };

  subEvents?: SubEvent[];

  story?: {
    togetherSinceIso?: string;
    togetherSinceText?: string;
    quote?: string;
  };

  gallery: GalleryImage[];

  music?: { url: string }; // overrides the theme's default track

  /**
   * A finished seal image belonging to this host alone, lettering included.
   * Only for one-off invites — a template's seal comes from its theme.
   */
  sealImage?: string;

  meta: {
    title: string;
    description: string;
  };
};

export function hostNames(invite: Invite) {
  const { person1, person2 } = invite.hosts;
  return person2 ? `${person1} & ${person2}` : person1;
}

export function galleryImage(invite: Invite, slot: GallerySlot) {
  return invite.gallery.find((image) => image.slot === slot);
}

/** Initials pressed into the wax, e.g. Umer & Maimoona → "UM". */
export function monogram(invite: Invite) {
  const { person1, person2 } = invite.hosts;
  return [person1, person2]
    .filter(Boolean)
    .map((name) => name!.trim().charAt(0).toUpperCase())
    .join("");
}
