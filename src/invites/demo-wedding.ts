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

  hosts: {
    mode: "couple",
    person1: "Aarav",
    person2: "Anaya",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Rajeev Mehra",
      grandparents: "Late Shri Mohanlal Mehra",
      credentials: "B.Arch, Partner at Studio Mehra",
    },
    family2: {
      relation: "Daughter of",
      parents: "Dr. & Mrs. Suresh Iyer",
      grandparents: "Shri & Smt. Ramanathan Iyer",
      credentials: "MBBS, MD — Consultant Paediatrician",
    },
  },

  welcome:
    "With the blessings of our families, we invite you to share in the joy of our wedding.",

  blessing: {
    text: "May this union be blessed with harmony, understanding and a lifetime of shared joy.",
    attribution: "A blessing for the couple",
  },

  event: {
    typeLabel: "Wedding Ceremony",
    startIso: "2027-02-14T19:30:00+05:30",
    dateText: "14 February 2027",
    dayText: "Sunday",
    timeText: "7:30 PM onwards",
    venueName: "The Grand Pavilion",
    venueAddress: "Lake Road, Udaipur, Rajasthan 313001",
    muhuratText: "Shubh Muhurat · 7:42 PM to 8:26 PM",
    dressCode: "Traditional Indian formal",
  },

  subEvents: [
    {
      label: "Mehendi",
      dateText: "12 February",
      timeText: "6:00 PM onwards",
      venueName: "Courtyard Lawn",
      dressCode: "Yellows and greens",
    },
    {
      label: "Sangeet",
      dateText: "13 February",
      timeText: "7:30 PM onwards",
      venueName: "The Durbar Hall",
      dressCode: "Indian festive",
      note: "Dancing shoes encouraged",
    },
    {
      label: "Reception",
      dateText: "15 February",
      timeText: "8:00 PM onwards",
      venueName: "Terrace Gardens",
      dressCode: "Black tie or Indian formal",
    },
  ],

  familyMembers: [
    { name: "Ishaan Mehra", role: "Brother of the groom" },
    { name: "Meera Iyer", role: "Sister of the bride" },
    { name: "Kavita Mehra", role: "Aunt of the groom" },
    { name: "Arjun Iyer", role: "Maternal uncle of the bride" },
  ],

  logistics: {
    transport:
      "Udaipur airport is 40 minutes away. Cars will run from the Lake Road hotels from 6:00 PM on each day.",
    accommodation:
      "Rooms are held at The Lakeview and Hotel Chandni under the Mehra-Iyer wedding until 20 January.",
    note: "February evenings are cool by the lake — a shawl is a good idea.",
  },

  rsvp: {
    enabled: true,
    byDateText: "20 January 2027",
    whatsapp: "+91 98200 00000",
    email: "aarav.anaya@example.com",
  },

  hashtag: "#AaravFoundHisAnaya",

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
