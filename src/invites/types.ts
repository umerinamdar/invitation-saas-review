import type { Occasion } from "@/themes/types";

export type GallerySlot = "ring" | "childhood" | "forever";

export type GalleryImage = {
  slot: GallerySlot;
  url: string;
  alt: string;
  width: number;
  height: number;
};

/** One function in the programme. Indian weddings run several over days. */
export type SubEvent = {
  label: string; // Mehendi, Haldi, Sangeet, Muhurtham, Reception
  dateText: string;
  timeText: string;
  venueName?: string;
  venueMapsUrl?: string;
  dressCode?: string;
  note?: string;
};

/**
 * One side of the family. Indian invitations traditionally name the parents
 * and often the grandparents, and omitting them reads as a slight — every
 * competitor's templates carry them.
 */
export type Family = {
  /** "Son of", "Daughter of", "Grandson of" — the host writes their own. */
  relation?: string;
  parents?: string;
  grandparents?: string;
  /** Qualifications or profession, which many hosts include with pride. */
  credentials?: string;
};

export type Host = {
  name: string;
  family?: Family;
};

/** A named relative with a role in the day. */
export type FamilyMember = {
  name: string;
  role: string; // Brother of the bride, Maternal uncle
};

export type Invite = {
  slug: string;
  themeId: string;
  occasion: Occasion;

  hosts: {
    mode: "couple" | "single";
    person1: string;
    person2?: string;
    /** Parents, grandparents and credentials for each side. */
    family1?: Family;
    family2?: Family;
  };

  /** "With the blessings of our families…" above the names. */
  welcome?: string;

  event: {
    typeLabel: string;
    startIso: string;
    dateText: string;
    dayText: string;
    timeText: string;
    venueName: string;
    venueAddress?: string;
    venueMapsUrl?: string;
    /** Auspicious time, named separately from the start. */
    muhuratText?: string;
    dressCode?: string;
  };

  subEvents?: SubEvent[];

  story?: {
    togetherSinceIso?: string;
    togetherSinceText?: string;
    quote?: string;
    /** A longer "how we met" passage. */
    howWeMet?: string;
  };

  /** A shloka, dua or verse, which many hosts open the invitation with. */
  blessing?: {
    text: string;
    attribution?: string;
  };

  /** Relatives named with their role in the day. */
  familyMembers?: FamilyMember[];

  /** Travel and stay notes for guests coming from elsewhere. */
  logistics?: {
    transport?: string;
    accommodation?: string;
    note?: string;
  };

  rsvp?: {
    enabled: boolean;
    byDateText?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
  };

  /** The couple's wedding hashtag. */
  hashtag?: string;

  gallery: GalleryImage[];

  music?: { url: string };

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

/** True when a family block has anything worth printing. */
export function hasFamily(family?: Family) {
  return Boolean(
    family?.relation ||
    family?.parents ||
    family?.grandparents ||
    family?.credentials,
  );
}
