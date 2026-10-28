import type { Family, FamilyMember, Invite, SubEvent } from "./types";

/** One invented RSVP number shared by every demo couple. */
const DEMO_WHATSAPP = "+91 98200 00000";

/**
 * The invite every template preview renders. Every couple here is invented —
 * names, families, venues and dates belong to no real event or real people,
 * so the previews are safe to show publicly. (An earlier version used a
 * celebrity couple's names as filler; that was never acceptable sample
 * data and is gone.)
 *
 * Each theme gets its OWN demo couple, matched to the theme's tradition,
 * via DEMO_OVERRIDES below: `getDemoInvite(themeId)` merges a theme's
 * override over the base invite (which is Dubai Silk's demo). Swapping
 * couples per theme is deliberate — when every card showed the same two
 * names, shoppers couldn't tell the designs apart, and the previews read
 * as one template restyled 14 times.
 * The two gallery photos are AI-generated — no real couple, so nothing
 * here is a stranger's photograph — included so a shopper can see what
 * the photo sections actually look like before uploading their own.
 */
export const demoWedding: Invite = {
  slug: "demo",
  themeId: "dubai-silk",
  occasion: "wedding",

  hosts: {
    mode: "couple",
    person1: "Aarav",
    person2: "Diya",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Sanjay Khanna",
      grandparents: "Late Shri Om Prakash Khanna",
    },
    family2: {
      relation: "Daughter of",
      parents: "Dr. & Mrs. Vikram Sharma",
      grandparents: "Shri & Smt. Ramesh Chandra Sharma",
    },
  },

  // No welcome line, blessing quote, or professional credentials here on
  // purpose: the real invite this theme is drawn from (the founder's own
  // engagement page) goes straight from the hero image to the names, with
  // no extra text in between. Adding them made every template preview read
  // as more text-heavy than the actual product. They're still optional
  // Invite fields — a couple can fill them in during editing if they want
  // the extra lines.

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
    { name: "Kabir Khanna", role: "Brother of the groom" },
    { name: "Ananya Sharma", role: "Sister of the bride" },
    { name: "Kavita Khanna", role: "Aunt of the groom" },
    { name: "Nikhil Sharma", role: "Maternal uncle of the bride" },
  ],

  logistics: {
    transport:
      "Udaipur airport is 40 minutes away. Cars will run from the Lake Road hotels from 6:00 PM on each day.",
    accommodation:
      "Rooms are held at The Lakeview and Hotel Chandni under the Khanna–Sharma wedding until 20 January.",
    note: "February evenings are cool by the lake — a shawl is a good idea.",
  },

  rsvp: {
    enabled: true,
    byDateText: "20 January 2027",
    whatsapp: DEMO_WHATSAPP,
    email: "aarav.diya@example.com",
  },

  hashtag: "#AaravWedsDiya",

  story: {
    togetherSinceIso: "2023-06-18T00:00:00+05:30",
    togetherSinceText: "18 June 2023",
    quote: "Two families, one celebration,\nand a lifetime ahead.",
  },

  gallery: [
    {
      slot: "childhood",
      url: "/demo/sample-couple/together.jpg",
      alt: "AI-generated photo of a couple in festive Indian wedding attire",
      width: 900,
      height: 900,
    },
    {
      slot: "forever",
      url: "/demo/sample-couple/forever.jpg",
      alt: "AI-generated photo of a couple walking together outdoors at golden hour",
      width: 900,
      height: 900,
    },
  ],

  meta: {
    title: "Aarav & Diya | Wedding Invitation",
    description:
      "A sample invitation showing how your own names, dates and venue will appear.",
  },
};

/** Everything that changes when the same demo is restyled for one theme. */
type DemoOverride = {
  person1: string;
  person2: string;
  family1: Family;
  family2: Family;
  familyMembers: FamilyMember[];
  event: Invite["event"];
  subEvents: SubEvent[];
  logistics: NonNullable<Invite["logistics"]>;
  rsvpByDateText: string;
  email: string;
  hashtag: string;
  /** A shloka, dua or verse the invitation opens with (renders first after entering). */
  blessing?: Invite["blessing"];
};

/**
 * One invented couple per theme (Dubai Silk's is the base invite above).
 * Surnames, family names, venues and sub-event labels follow each theme's
 * own tradition, and no date repeats — a gallery of 14 previews should
 * read as 14 different weddings.
 */
const DEMO_OVERRIDES: Record<string, DemoOverride> = {
  "ram-mandir": {
    person1: "Aditya",
    person2: "Shreya",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Dinesh Mishra",
      grandparents: "Late Shri Ramakant Mishra",
    },
    family2: {
      relation: "Daughter of",
      parents: "Mr. & Mrs. Alok Pandey",
      grandparents: "Shri & Smt. Keshav Prasad Pandey",
    },
    familyMembers: [
      { name: "Rohan Mishra", role: "Brother of the groom" },
      { name: "Kavya Pandey", role: "Sister of the bride" },
    ],
    event: {
      typeLabel: "Vivah Ceremony",
      startIso: "2027-11-26T19:00:00+05:30",
      dateText: "26 November 2027",
      dayText: "Friday",
      timeText: "7:00 PM onwards",
      venueName: "Kanak Mahal Lawns",
      venueAddress: "Ring Road, Ayodhya, Uttar Pradesh 224123",
      muhuratText: "Shubh Muhurat · 7:18 PM to 8:04 PM",
      dressCode: "Traditional Indian formal",
    },
    subEvents: [
      {
        label: "Haldi",
        dateText: "24 November",
        timeText: "10:00 AM onwards",
        venueName: "Courtyard Lawn",
        dressCode: "Yellows",
      },
      {
        label: "Mehendi",
        dateText: "25 November",
        timeText: "5:00 PM onwards",
        venueName: "Courtyard Lawn",
        dressCode: "Greens and yellows",
      },
      {
        label: "Reception",
        dateText: "27 November",
        timeText: "7:30 PM onwards",
        venueName: "Terrace Gardens",
        dressCode: "Indian formal",
      },
    ],
    logistics: {
      transport:
        "Ayodhya airport is about 30 minutes away. Cars will run from the Ring Road hotels from 5:30 PM on each day.",
      accommodation:
        "Rooms are held at Hotel Ramayana and The Ayodhya Palace under the Mishra–Pandey wedding until 29 October.",
      note: "November evenings are pleasant — a light shawl is enough.",
    },
    rsvpByDateText: "29 October 2027",
    email: "aditya.shreya@example.com",
    hashtag: "#AdityaWedsShreya",
  },

  "kesari-mandap": {
    person1: "Rohan",
    person2: "Sneha",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Sunil Deshmukh",
      grandparents: "Late Shri Vasantrao Deshmukh",
    },
    family2: {
      relation: "Daughter of",
      parents: "Mr. & Mrs. Prakash Patil",
      grandparents: "Shri & Smt. Bhausaheb Patil",
    },
    familyMembers: [
      { name: "Nikhil Deshmukh", role: "Brother of the groom" },
      { name: "Priya Patil", role: "Sister of the bride" },
    ],
    event: {
      typeLabel: "Wedding Ceremony",
      startIso: "2027-05-09T10:30:00+05:30",
      dateText: "9 May 2027",
      dayText: "Sunday",
      timeText: "10:30 AM onwards",
      venueName: "Kesari Lawns",
      venueAddress: "Baner Road, Pune, Maharashtra 411045",
      muhuratText: "Shubh Muhurat · 10:42 AM to 11:20 AM",
      dressCode: "Traditional Maharashtrian formal",
    },
    subEvents: [
      {
        label: "Haldi",
        dateText: "7 May",
        timeText: "9:00 AM onwards",
        venueName: "Courtyard Lawn",
        dressCode: "Yellows",
      },
      {
        label: "Mehendi",
        dateText: "8 May",
        timeText: "5:00 PM onwards",
        venueName: "Courtyard Lawn",
        dressCode: "Greens and yellows",
      },
      {
        label: "Reception",
        dateText: "10 May",
        timeText: "7:00 PM onwards",
        venueName: "Terrace Gardens",
        dressCode: "Indian formal",
      },
    ],
    logistics: {
      transport:
        "Pune airport is about 45 minutes away. Cars will run from the Baner Road hotels from 9:00 AM on each day.",
      accommodation:
        "Rooms are held at The Fern Residency and Hotel Shreyas under the Deshmukh–Patil wedding until 11 April.",
      note: "May in Pune is warm — the morning ceremony is in the shaded mandap.",
    },
    rsvpByDateText: "11 April 2027",
    email: "rohan.sneha@example.com",
    hashtag: "#RohanWedsSneha",
  },

  kanjeevaram: {
    person1: "Karthik",
    person2: "Divya",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Raman Subramaniam",
      grandparents: "Late Shri Swaminatha Subramaniam",
    },
    family2: {
      relation: "Daughter of",
      parents: "Mr. & Mrs. Hariharan Narayanan",
      grandparents: "Shri & Smt. Venkataraman Narayanan",
    },
    familyMembers: [
      { name: "Deepak Subramaniam", role: "Brother of the groom" },
      { name: "Lakshmi Narayanan", role: "Sister of the bride" },
    ],
    event: {
      typeLabel: "Muhurtham",
      startIso: "2027-06-11T09:30:00+05:30",
      dateText: "11 June 2027",
      dayText: "Friday",
      timeText: "9:30 AM onwards",
      venueName: "Sri Lakshmi Kalyana Mandapam",
      venueAddress: "Gandhi Road, Kanchipuram, Tamil Nadu 631501",
      muhuratText: "Muhurtham · 9:30 AM to 10:15 AM",
      dressCode: "Traditional Tamil formal — silk preferred",
    },
    subEvents: [
      {
        label: "Nichayathartham",
        dateText: "9 June",
        timeText: "6:00 PM onwards",
        venueName: "Courtyard Lawn",
        dressCode: "Traditional festive",
      },
      {
        label: "Mehendi",
        dateText: "10 June",
        timeText: "5:00 PM onwards",
        venueName: "Courtyard Lawn",
        dressCode: "Bright festive",
      },
      {
        label: "Reception",
        dateText: "12 June",
        timeText: "6:30 PM onwards",
        venueName: "Terrace Gardens",
        dressCode: "Indian formal",
      },
    ],
    logistics: {
      transport:
        "Chennai airport is about two hours away. Cars will run from the Gandhi Road hotels from 8:00 AM on each day.",
      accommodation:
        "Rooms are held at Hotel Sri Bala and The Kanchi Residency under the Subramaniam–Narayanan wedding until 14 May.",
      note: "June mornings are warm — the mandapam is air-conditioned.",
    },
    rsvpByDateText: "14 May 2027",
    email: "karthik.divya@example.com",
    hashtag: "#KarthikWedsDivya",
  },

  madina: {
    person1: "Bilal",
    person2: "Fatima",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Imran Ahmed",
      grandparents: "Late Mr. Abdul Rasheed Ahmed",
    },
    family2: {
      relation: "Daughter of",
      parents: "Mr. & Mrs. Salim Khan",
      grandparents: "Late Haji Yusuf Khan",
    },
    familyMembers: [
      { name: "Omar Ahmed", role: "Brother of the groom" },
      { name: "Zainab Khan", role: "Sister of the bride" },
    ],
    event: {
      typeLabel: "Nikah Ceremony",
      startIso: "2027-04-17T19:30:00+05:30",
      dateText: "17 April 2027",
      dayText: "Saturday",
      timeText: "7:30 PM onwards",
      venueName: "Al Noor Convention Centre",
      venueAddress: "Banjara Hills, Hyderabad, Telangana 500034",
      dressCode: "Traditional formal",
    },
    subEvents: [
      {
        label: "Mehndi",
        dateText: "15 April",
        timeText: "6:00 PM onwards",
        venueName: "Courtyard Lawn",
        dressCode: "Yellows and greens",
      },
      {
        label: "Dholki",
        dateText: "16 April",
        timeText: "7:00 PM onwards",
        venueName: "The Durbar Hall",
        dressCode: "Festive",
      },
      {
        label: "Walima",
        dateText: "18 April",
        timeText: "8:00 PM onwards",
        venueName: "Terrace Gardens",
        dressCode: "Formal",
      },
    ],
    logistics: {
      transport:
        "Hyderabad airport is about 40 minutes away. Cars will run from the Banjara Hills hotels from 6:00 PM on each day.",
      accommodation:
        "Rooms are held at The Park Hyderabad and Hotel Minar under the Ahmed–Khan wedding until 20 March.",
      note: "April evenings in Hyderabad are warm and dry.",
    },
    rsvpByDateText: "20 March 2027",
    email: "bilal.fatima@example.com",
    hashtag: "#BilalWedsFatima",
  },

  makkah: {
    person1: "Yusuf",
    person2: "Maryam",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Abdullah Sheikh",
      grandparents: "Late Haji Mohammed Sheikh",
    },
    family2: {
      relation: "Daughter of",
      parents: "Mr. & Mrs. Imran Ali",
      grandparents: "Late Mr. Nasiruddin Ali",
    },
    familyMembers: [
      { name: "Hamza Sheikh", role: "Brother of the groom" },
      { name: "Aisha Ali", role: "Sister of the bride" },
    ],
    event: {
      typeLabel: "Nikah Ceremony",
      startIso: "2027-09-18T19:00:00+05:30",
      dateText: "18 September 2027",
      dayText: "Saturday",
      timeText: "7:00 PM onwards",
      venueName: "Emerald Marriage Hall",
      venueAddress: "Hazratganj, Lucknow, Uttar Pradesh 226001",
      dressCode: "Modest traditional formal",
    },
    subEvents: [
      {
        label: "Mehndi",
        dateText: "16 September",
        timeText: "6:00 PM onwards",
        venueName: "Courtyard Lawn",
        dressCode: "Yellows and greens",
      },
      {
        label: "Dholki",
        dateText: "17 September",
        timeText: "7:00 PM onwards",
        venueName: "The Durbar Hall",
        dressCode: "Festive",
      },
      {
        label: "Walima",
        dateText: "19 September",
        timeText: "8:00 PM onwards",
        venueName: "Terrace Gardens",
        dressCode: "Formal",
      },
    ],
    logistics: {
      transport:
        "Lucknow airport is about 30 minutes away. Cars will run from the Hazratganj hotels from 5:30 PM on each day.",
      accommodation:
        "Rooms are held at Hotel Clarks Avadh and The Piccadily under the Sheikh–Ali wedding until 21 August.",
      note: "September in Lucknow is humid — the hall is fully air-conditioned.",
    },
    rsvpByDateText: "21 August 2027",
    email: "yusuf.maryam@example.com",
    hashtag: "#YusufWedsMaryam",
  },

  "golden-temple": {
    person1: "Harpreet",
    person2: "Simran",
    family1: {
      relation: "Son of",
      parents: "Sardar Balwinder Singh & Sardarni Kuldeep Kaur",
      grandparents: "Late Sardar Harbhajan Singh",
    },
    family2: {
      relation: "Daughter of",
      parents: "Sardar Manpreet Singh & Sardarni Jaspreet Kaur",
      grandparents: "Late Sardar Gurcharan Singh",
    },
    familyMembers: [
      { name: "Arshdeep Singh", role: "Brother of the groom" },
      { name: "Harleen Kaur", role: "Sister of the bride" },
    ],
    event: {
      typeLabel: "Anand Karaj",
      startIso: "2027-03-06T09:00:00+05:30",
      dateText: "6 March 2027",
      dayText: "Saturday",
      timeText: "9:00 AM onwards",
      venueName: "Guru Nanak Community Lawns",
      venueAddress: "GT Road, Amritsar, Punjab 143001",
      dressCode: "Traditional Punjabi formal",
    },
    subEvents: [
      {
        label: "Mehndi",
        dateText: "4 March",
        timeText: "5:00 PM onwards",
        venueName: "Courtyard Lawn",
        dressCode: "Bright festive",
      },
      {
        label: "Jaggo & Sangeet",
        dateText: "5 March",
        timeText: "7:00 PM onwards",
        venueName: "The Durbar Hall",
        dressCode: "Punjabi festive",
      },
      {
        label: "Reception",
        dateText: "7 March",
        timeText: "7:00 PM onwards",
        venueName: "Terrace Gardens",
        dressCode: "Indian formal",
      },
    ],
    logistics: {
      transport:
        "Amritsar airport is about 25 minutes away. Cars will run from the GT Road hotels from 7:30 AM on each day.",
      accommodation:
        "Rooms are held at Hotel Le Golden and Hyatt Regency Amritsar under the Singh–Kaur wedding until 6 February.",
      note: "The Anand Karaj begins at 9 AM sharp — please be seated by 8:45 AM.",
    },
    rsvpByDateText: "6 February 2027",
    email: "harpreet.simran@example.com",
    hashtag: "#HarpreetWedsSimran",
  },

  "phulkari-anand": {
    person1: "Gurpreet",
    person2: "Navdeep",
    family1: {
      relation: "Son of",
      parents: "Sardar Sukhdev Singh & Sardarni Baljit Kaur",
      grandparents: "Late Sardar Kartar Singh",
    },
    family2: {
      relation: "Daughter of",
      parents: "Sardar Harjit Singh & Sardarni Manjit Kaur",
      grandparents: "Late Sardar Bachan Singh",
    },
    familyMembers: [
      { name: "Simranjeet Singh", role: "Brother of the groom" },
      { name: "Prabhleen Kaur", role: "Sister of the bride" },
    ],
    event: {
      typeLabel: "Anand Karaj",
      startIso: "2027-01-30T10:00:00+05:30",
      dateText: "30 January 2027",
      dayText: "Saturday",
      timeText: "10:00 AM onwards",
      venueName: "Phulkari Gardens",
      venueAddress: "Ferozepur Road, Ludhiana, Punjab 141001",
      dressCode: "Bright Punjabi formal",
    },
    subEvents: [
      {
        label: "Mehndi",
        dateText: "28 January",
        timeText: "5:00 PM onwards",
        venueName: "Courtyard Lawn",
        dressCode: "Bright festive",
      },
      {
        label: "Jaggo & Sangeet",
        dateText: "29 January",
        timeText: "7:00 PM onwards",
        venueName: "The Durbar Hall",
        dressCode: "Punjabi festive",
      },
      {
        label: "Reception",
        dateText: "31 January",
        timeText: "7:00 PM onwards",
        venueName: "Terrace Gardens",
        dressCode: "Indian formal",
      },
    ],
    logistics: {
      transport:
        "Chandigarh airport is about two hours away. Cars will run from the Ferozepur Road hotels from 8:30 AM on each day.",
      accommodation:
        "Rooms are held at Radisson Blu Ludhiana and Hotel Maharaja Regency under the Singh–Kaur wedding until 2 January.",
      note: "January mornings in Ludhiana are cold — bring a warm layer.",
    },
    rsvpByDateText: "2 January 2027",
    email: "gurpreet.navdeep@example.com",
    hashtag: "#GurpreetWedsNavdeep",
  },

  "vesper-chapel": {
    person1: "Daniel",
    person2: "Sarah",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. George Thomas",
      grandparents: "Late Mr. Mathew Thomas",
    },
    family2: {
      relation: "Daughter of",
      parents: "Mr. & Mrs. Joseph George",
      grandparents: "Late Mr. George Varghese",
    },
    familyMembers: [
      { name: "Joshua Thomas", role: "Brother of the groom" },
      { name: "Anna George", role: "Sister of the bride" },
    ],
    event: {
      typeLabel: "Wedding Mass",
      startIso: "2027-08-21T16:00:00+05:30",
      dateText: "21 August 2027",
      dayText: "Saturday",
      timeText: "4:00 PM onwards",
      venueName: "St. Mary's Chapel",
      venueAddress: "Fort Kochi, Kerala 682001",
      dressCode: "Western or Indian formal",
    },
    subEvents: [
      {
        label: "Rehearsal Dinner",
        dateText: "20 August",
        timeText: "7:00 PM onwards",
        venueName: "Chapel Courtyard",
        dressCode: "Smart casual",
      },
      {
        label: "Reception",
        dateText: "21 August",
        timeText: "6:30 PM onwards",
        venueName: "Terrace Gardens",
        dressCode: "Formal",
      },
      {
        label: "Farewell Brunch",
        dateText: "22 August",
        timeText: "10:00 AM onwards",
        venueName: "The Pavilion",
        dressCode: "Casual",
      },
    ],
    logistics: {
      transport:
        "Kochi airport is about an hour away. Cars will run from the Fort Kochi hotels from 2:30 PM on each day.",
      accommodation:
        "Rooms are held at Forte Kochi and The Old Harbour Hotel under the Thomas–George wedding until 24 July.",
      note: "August is monsoon in Kochi — carry an umbrella; the chapel porch is covered.",
    },
    rsvpByDateText: "24 July 2027",
    email: "daniel.sarah@example.com",
    hashtag: "#DanielWedsSarah",
  },

  "cathedral-light": {
    person1: "Jonathan",
    person2: "Rachel",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Anthony D'Souza",
      grandparents: "Late Mr. Francis D'Souza",
    },
    family2: {
      relation: "Daughter of",
      parents: "Mr. & Mrs. Peter Fernandes",
      grandparents: "Late Mrs. Maria Fernandes",
    },
    familyMembers: [
      { name: "Ryan D'Souza", role: "Brother of the groom" },
      { name: "Nicole Fernandes", role: "Sister of the bride" },
    ],
    event: {
      typeLabel: "Nuptial Mass",
      startIso: "2027-12-11T16:30:00+05:30",
      dateText: "11 December 2027",
      dayText: "Saturday",
      timeText: "4:30 PM onwards",
      venueName: "Se Cathedral Lawns",
      venueAddress: "Old Goa, Goa 403402",
      dressCode: "Formal",
    },
    subEvents: [
      {
        label: "Roce Ceremony",
        dateText: "10 December",
        timeText: "11:00 AM onwards",
        venueName: "Family Courtyard",
        dressCode: "Traditional festive",
      },
      {
        label: "Reception",
        dateText: "11 December",
        timeText: "7:00 PM onwards",
        venueName: "Cathedral Lawns",
        dressCode: "Formal",
      },
      {
        label: "Farewell Brunch",
        dateText: "12 December",
        timeText: "10:30 AM onwards",
        venueName: "The Pavilion",
        dressCode: "Casual",
      },
    ],
    logistics: {
      transport:
        "Goa airport is about 45 minutes away. Cars will run from the Old Goa hotels from 3:00 PM on each day.",
      accommodation:
        "Rooms are held at The Postcard Old Goa and Hotel Mandovi under the D'Souza–Fernandes wedding until 13 November.",
      note: "December evenings in Goa are mild — the reception is outdoors on the lawns.",
    },
    rsvpByDateText: "13 November 2027",
    email: "jonathan.rachel@example.com",
    hashtag: "#JonathanWedsRachel",
  },

  "noor-invitation": {
    person1: "Aarav",
    person2: "Anaya",
    family1: {
      relation: "Son of",
      parents: "Mr. Rehan & Mrs. Sana Kapoor",
      grandparents:
        "Late Mr. Iqbal & Mrs. Zarina Kapoor · Mr. Farhan & Mrs. Noor Malik",
    },
    family2: {
      relation: "Daughter of",
      parents: "Mr. Imran & Mrs. Ayesha Mehta",
      grandparents:
        "Mr. Salim & Mrs. Rukhsana Mehta · Late Mr. Javed & Mrs. Shirin Khan",
    },
    familyMembers: [
      { name: "Zoya Kapoor", role: "Sister of the groom" },
      { name: "Ayaan Mehta", role: "Brother of the bride" },
    ],
    event: {
      typeLabel: "Nikah",
      startIso: "2027-02-14T19:00:00+05:30",
      dateText: "14 February 2027",
      dayText: "Sunday",
      timeText: "7:00 PM onwards",
      venueName: "The Grand Pavilion, Marine Drive",
      venueAddress: "Marine Drive, Mumbai, Maharashtra",
      dressCode: "Ivory & gold, traditional formal",
    },
    subEvents: [
      {
        label: "Mehendi",
        dateText: "12 February",
        timeText: "4:00 PM onwards",
        venueName: "The Rose Garden",
        dressCode: "Emerald & marigold, festive casual",
      },
      {
        label: "Walima",
        dateText: "15 February",
        timeText: "1:00 PM onwards",
        venueName: "The Lantern Hall",
        dressCode: "Pastels, elegant daywear",
      },
      {
        label: "Reception",
        dateText: "15 February",
        timeText: "8:00 PM onwards",
        venueName: "The Grand Pavilion",
        dressCode: "Black tie, jewel tones",
      },
    ],
    logistics: {
      transport:
        "Chhatrapati Shivaji Maharaj International Airport is 40 minutes away. Shuttles run from Terminal 2 on 12–15 February.",
      accommodation:
        "A block of rooms is held at The Pavilion Residences. Mention “Aarav & Anaya” when booking before 10 January 2027.",
      note: "Valet parking is available at the main gate. Please arrive 30 minutes before each ceremony.",
    },
    rsvpByDateText: "10 January 2027",
    email: "aarav.anaya@example.com",
    hashtag: "#AaravWedsAnaya",
    blessing: {
      text: "And among His signs is that He created for you spouses from among yourselves, that you may find tranquillity in them; and He placed between you affection and mercy.",
      attribution: "Surah Ar-Rum · 30:21",
    },
  },

  "mughal-zamarrud": {
    person1: "Armaan",
    person2: "Inaya",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Farhan Mirza",
      grandparents: "Late Mr. Akbar Mirza",
    },
    family2: {
      relation: "Daughter of",
      parents: "Mr. & Mrs. Salman Sheikh",
      grandparents: "Late Mr. Rahim Sheikh",
    },
    familyMembers: [
      { name: "Zaid Mirza", role: "Brother of the groom" },
      { name: "Hiba Sheikh", role: "Sister of the bride" },
    ],
    event: {
      typeLabel: "Nikah Ceremony",
      startIso: "2027-10-15T19:30:00+05:30",
      dateText: "15 October 2027",
      dayText: "Friday",
      timeText: "7:30 PM onwards",
      venueName: "Zamarrud Bagh",
      venueAddress: "Tajganj, Agra, Uttar Pradesh 282001",
      dressCode: "Regal traditional formal",
    },
    subEvents: [
      {
        label: "Mehndi",
        dateText: "13 October",
        timeText: "6:00 PM onwards",
        venueName: "Courtyard Lawn",
        dressCode: "Yellows and greens",
      },
      {
        label: "Dholki",
        dateText: "14 October",
        timeText: "7:00 PM onwards",
        venueName: "The Durbar Hall",
        dressCode: "Festive",
      },
      {
        label: "Walima",
        dateText: "16 October",
        timeText: "8:00 PM onwards",
        venueName: "Terrace Gardens",
        dressCode: "Formal",
      },
    ],
    logistics: {
      transport:
        "Delhi airport is about three and a half hours away by expressway. Cars will run from the Tajganj hotels from 6:00 PM on each day.",
      accommodation:
        "Rooms are held at Hotel Taj Resorts and The Grand Imperial under the Mirza–Sheikh wedding until 17 September.",
      note: "October evenings in Agra are pleasant — the bagh is outdoors.",
    },
    rsvpByDateText: "17 September 2027",
    email: "armaan.inaya@example.com",
    hashtag: "#ArmaanWedsInaya",
  },

  "sarayu-ghat": {
    person1: "Vikram",
    person2: "Anjali",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Rajendra Singh",
      grandparents: "Late Shri Bhanu Pratap Singh",
    },
    family2: {
      relation: "Daughter of",
      parents: "Mr. & Mrs. Santosh Verma",
      grandparents: "Shri & Smt. Radheshyam Verma",
    },
    familyMembers: [
      { name: "Rahul Singh", role: "Brother of the groom" },
      { name: "Pooja Verma", role: "Sister of the bride" },
    ],
    event: {
      typeLabel: "Wedding Ceremony",
      startIso: "2027-11-21T18:30:00+05:30",
      dateText: "21 November 2027",
      dayText: "Sunday",
      timeText: "6:30 PM onwards",
      venueName: "Sarayu Riverfront Lawns",
      venueAddress: "Naya Ghat, Ayodhya, Uttar Pradesh 224123",
      muhuratText: "Shubh Muhurat · 6:48 PM to 7:30 PM",
      dressCode: "Traditional Indian formal",
    },
    subEvents: [
      {
        label: "Haldi",
        dateText: "19 November",
        timeText: "10:00 AM onwards",
        venueName: "Courtyard Lawn",
        dressCode: "Yellows",
      },
      {
        label: "Mehendi",
        dateText: "20 November",
        timeText: "5:00 PM onwards",
        venueName: "Courtyard Lawn",
        dressCode: "Greens and yellows",
      },
      {
        label: "Reception",
        dateText: "22 November",
        timeText: "7:30 PM onwards",
        venueName: "Terrace Gardens",
        dressCode: "Indian formal",
      },
    ],
    logistics: {
      transport:
        "Ayodhya airport is about 30 minutes away. Cars will run from the Naya Ghat hotels from 5:00 PM on each day.",
      accommodation:
        "Rooms are held at Hotel Krishna Palace and The Saket under the Singh–Verma wedding until 24 October.",
      note: "The lawns sit on the riverfront — November evenings by the Sarayu are cool.",
    },
    rsvpByDateText: "24 October 2027",
    email: "vikram.anjali@example.com",
    hashtag: "#VikramWedsAnjali",
  },

  "mayura-mahal": {
    person1: "Yuvraj",
    person2: "Ishita",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Vikram Chauhan",
      grandparents: "Late Shri Narendra Chauhan",
    },
    family2: {
      relation: "Daughter of",
      parents: "Mr. & Mrs. Ajay Rathore",
      grandparents: "Shri & Smt. Bhanwar Singh Rathore",
    },
    familyMembers: [
      { name: "Dev Chauhan", role: "Brother of the groom" },
      { name: "Kritika Rathore", role: "Sister of the bride" },
    ],
    event: {
      typeLabel: "Wedding Ceremony",
      startIso: "2027-02-20T19:30:00+05:30",
      dateText: "20 February 2027",
      dayText: "Saturday",
      timeText: "7:30 PM onwards",
      venueName: "Mayura Mahal Palace",
      venueAddress: "C-Scheme, Jaipur, Rajasthan 302001",
      muhuratText: "Shubh Muhurat · 7:52 PM to 8:36 PM",
      dressCode: "Royal traditional formal",
    },
    subEvents: [
      {
        label: "Haldi",
        dateText: "18 February",
        timeText: "10:00 AM onwards",
        venueName: "Courtyard Lawn",
        dressCode: "Yellows",
      },
      {
        label: "Mehendi & Sangeet",
        dateText: "19 February",
        timeText: "6:00 PM onwards",
        venueName: "The Durbar Hall",
        dressCode: "Indian festive",
      },
      {
        label: "Reception",
        dateText: "21 February",
        timeText: "8:00 PM onwards",
        venueName: "Terrace Gardens",
        dressCode: "Indian formal",
      },
    ],
    logistics: {
      transport:
        "Jaipur airport is about 25 minutes away. Cars will run from the C-Scheme hotels from 6:00 PM on each day.",
      accommodation:
        "Rooms are held at Hotel Pearl Palace and The Fern Jaipur under the Chauhan–Rathore wedding until 23 January.",
      note: "February evenings in Jaipur are cool — a shawl is a good idea.",
    },
    rsvpByDateText: "23 January 2027",
    email: "yuvraj.ishita@example.com",
    hashtag: "#YuvrajWedsIshita",
  },

  "monochrome-vow": {
    person1: "Arjun",
    person2: "Tara",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Nikhil Mehta",
      grandparents: "Late Shri Kishore Mehta",
    },
    family2: {
      relation: "Daughter of",
      parents: "Mr. & Mrs. Paresh Bhatt",
      grandparents: "Shri & Smt. Jayant Bhatt",
    },
    familyMembers: [
      { name: "Kabir Mehta", role: "Brother of the groom" },
      { name: "Meera Bhatt", role: "Sister of the bride" },
    ],
    event: {
      typeLabel: "The Ceremony",
      startIso: "2027-07-03T11:00:00+05:30",
      dateText: "3 July 2027",
      dayText: "Saturday",
      timeText: "11:00 AM onwards",
      venueName: "The White Box",
      venueAddress: "Indiranagar, Bengaluru, Karnataka 560038",
      dressCode: "Smart formal — black and white encouraged",
    },
    subEvents: [
      {
        label: "Welcome Drinks",
        dateText: "2 July",
        timeText: "7:00 PM onwards",
        venueName: "The Terrace",
        dressCode: "Smart casual",
      },
      {
        label: "After Party",
        dateText: "3 July",
        timeText: "9:00 PM onwards",
        venueName: "The Loft",
        dressCode: "Party wear",
      },
      {
        label: "Brunch",
        dateText: "4 July",
        timeText: "11:00 AM onwards",
        venueName: "The Courtyard",
        dressCode: "Casual",
      },
    ],
    logistics: {
      transport:
        "Bengaluru airport is about an hour away. Cars will run from the Indiranagar hotels from 10:00 AM on each day.",
      accommodation:
        "Rooms are held at The Paul Bengaluru and Hotel Shilton Suites under the Mehta–Bhatt wedding until 5 June.",
      note: "July in Bengaluru is mild with passing showers — most of the day is indoors.",
    },
    rsvpByDateText: "5 June 2027",
    email: "arjun.tara@example.com",
    hashtag: "#ArjunWedsTara",
  },

  // ---------------------------------------------------------------------
  // Lovable-20 conversion (2026-10-25). Couples, venues, dates and dress
  // codes below are ported from each source project's own invitation.ts.
  // Parents'/grandparents' names, sibling family members, and the two
  // sub-event entries per theme are invented in this file's existing
  // house style (the source designs give a same-day run of show, not
  // separate pre-/post-wedding days) — the same kind of filled-in detail
  // every other theme in this file already carries.
  // ---------------------------------------------------------------------

  "ivory-silk-pearls": {
    person1: "Charlotte",
    person2: "Henry",
    family1: {
      relation: "Daughter of",
      parents: "Mr. & Mrs. Edward Bennett",
      grandparents: "Late Mr. George Bennett",
    },
    family2: {
      relation: "Son of",
      parents: "Dr. & Mrs. William Ashford",
      grandparents: "Mr. & Mrs. Arthur Ashford",
    },
    familyMembers: [
      { name: "Sophie Bennett", role: "Sister of the bride" },
      { name: "James Ashford", role: "Brother of the groom" },
    ],
    event: {
      typeLabel: "Wedding Ceremony",
      startIso: "2027-06-12T16:00:00+02:00",
      dateText: "12 June 2027",
      dayText: "Saturday",
      timeText: "4:00 PM onwards",
      venueName: "Villa del Balbianello",
      venueAddress: "Via Comoedia 5, Lenno, Lake Como, Italy",
      dressCode: "Black tie — garden elegance",
    },
    subEvents: [
      {
        label: "Welcome Aperitivo",
        dateText: "11 June",
        timeText: "7:00 PM onwards",
        venueName: "Lenno Lakefront",
        dressCode: "Smart casual",
      },
      {
        label: "Farewell Brunch",
        dateText: "13 June",
        timeText: "11:00 AM onwards",
        venueName: "Villa Terrace",
        dressCode: "Casual",
      },
    ],
    logistics: {
      transport:
        "Private boats depart Lenno pier from 2:45 PM. Return boats run until 1 AM.",
      accommodation:
        "Rooms are held at Grand Hotel Tremezzo and Hotel Villa Cipressi under the Bennett–Ashford wedding.",
      note: "June evenings on the lake are mild — a light wrap is enough.",
    },
    rsvpByDateText: "1 May 2027",
    email: "charlotte.henry@example.com",
    hashtag: "#CharlotteWedsHenry",
  },

  "chateau-de-fleurs": {
    person1: "Amélie",
    person2: "Louis",
    family1: {
      relation: "Daughter of",
      parents: "Mr. & Mrs. Philippe Rousseau",
      grandparents: "Late M. Henri Rousseau",
    },
    family2: {
      relation: "Son of",
      parents: "Dr. & Mrs. Bernard Marchand",
      grandparents: "M. & Mme Claude Marchand",
    },
    familyMembers: [
      { name: "Camille Rousseau", role: "Sister of the bride" },
      { name: "Antoine Marchand", role: "Brother of the groom" },
    ],
    event: {
      typeLabel: "Wedding Ceremony",
      startIso: "2027-05-22T17:00:00+02:00",
      dateText: "22 May 2027",
      dayText: "Saturday",
      timeText: "5:00 PM onwards",
      venueName: "Château de Chantilly Gardens",
      venueAddress: "Route de la Reine, Provence, France",
      dressCode: "Formal — pastel garden tones welcome",
    },
    subEvents: [
      {
        label: "Welcome Drinks",
        dateText: "21 May",
        timeText: "7:00 PM onwards",
        venueName: "The Orangerie",
        dressCode: "Smart casual",
      },
      {
        label: "Farewell Brunch",
        dateText: "23 May",
        timeText: "11:00 AM onwards",
        venueName: "Château Courtyard",
        dressCode: "Casual",
      },
    ],
    logistics: {
      transport:
        "Private coaches depart from Aix-en-Provence station at 3:45 PM. Return coaches run until midnight.",
      accommodation:
        "Rooms are held at Auberge du Jeu de Paume and Château de la Messardière under the Rousseau–Marchand wedding.",
      note: "May evenings in the gardens are gentle — gravel paths favour low heels.",
    },
    rsvpByDateText: "1 April 2027",
    email: "amelie.louis@example.com",
    hashtag: "#AmélieWedsLouis",
  },

  "heirloom-lace-curtains": {
    person1: "Eleanor",
    person2: "Thomas",
    family1: {
      relation: "Daughter of",
      parents: "Mr. & Mrs. Charles Whitcombe",
      grandparents: "Late Mr. Reginald Whitcombe",
    },
    family2: {
      relation: "Son of",
      parents: "Dr. & Mrs. Edmund Hale",
      grandparents: "Mr. & Mrs. Albert Hale",
    },
    familyMembers: [
      { name: "Imogen Whitcombe", role: "Sister of the bride" },
      { name: "Oliver Hale", role: "Brother of the groom" },
    ],
    event: {
      typeLabel: "Wedding Ceremony",
      startIso: "2027-09-18T15:00:00+01:00",
      dateText: "18 September 2027",
      dayText: "Saturday",
      timeText: "3:00 PM onwards",
      venueName: "Avington Park Manor",
      venueAddress: "Itchen Abbas, Hampshire, England",
      dressCode: "Formal — vintage touches welcome",
    },
    subEvents: [
      {
        label: "Welcome Tea",
        dateText: "17 September",
        timeText: "4:00 PM onwards",
        venueName: "The Orangery",
        dressCode: "Smart casual",
      },
      {
        label: "Farewell Brunch",
        dateText: "19 September",
        timeText: "11:00 AM onwards",
        venueName: "Manor Lawn",
        dressCode: "Casual",
      },
    ],
    logistics: {
      transport:
        "Complimentary coaches depart Winchester station at 1:45 PM and return at the close of the evening.",
      accommodation:
        "Rooms are held at The Wykeham Arms and Lainston House under the Whitcombe–Hale wedding.",
      note: "September evenings can turn cool on the lawn — a shawl is a good idea.",
    },
    rsvpByDateText: "1 August 2027",
    email: "eleanor.thomas@example.com",
    hashtag: "#EleanorWedsThomas",
  },

  "barcelona-rosette": {
    person1: "Alba",
    person2: "Felipe",
    family1: {
      relation: "Daughter of",
      parents: "Sr. & Sra. Joan Ferrer",
      grandparents: "Late Sr. Miquel Ferrer",
    },
    family2: {
      relation: "Son of",
      parents: "Dr. & Sra. Rafael Navarro",
      grandparents: "Sr. & Sra. Esteban Navarro",
    },
    familyMembers: [
      { name: "Marta Ferrer", role: "Sister of the bride" },
      { name: "Pau Navarro", role: "Brother of the groom" },
    ],
    event: {
      typeLabel: "Wedding Mass",
      startIso: "2027-04-17T17:30:00+02:00",
      dateText: "17 April 2027",
      dayText: "Saturday",
      timeText: "5:30 PM onwards",
      venueName: "Basilica of Santa Maria del Mar",
      venueAddress: "Plaça de Santa Maria, Barcelona, Spain",
      dressCode: "Formal attire — shoulders covered within the basilica",
    },
    subEvents: [
      {
        label: "Welcome Tapas",
        dateText: "16 April",
        timeText: "8:00 PM onwards",
        venueName: "Gothic Quarter Terrace",
        dressCode: "Smart casual",
      },
      {
        label: "Farewell Brunch",
        dateText: "18 April",
        timeText: "11:00 AM onwards",
        venueName: "La Baronia Courtyard",
        dressCode: "Casual",
      },
    ],
    logistics: {
      transport:
        "Coaches depart Plaça de Catalunya at 4:15 PM for the basilica, continuing to La Baronia after Mass.",
      accommodation:
        "Rooms are held at Hotel Arts Barcelona and Mercer Hotel under the Ferrer–Navarro wedding.",
      note: "April evenings in Barcelona are mild — a light jacket is enough.",
    },
    rsvpByDateText: "1 March 2027",
    email: "alba.felipe@example.com",
    hashtag: "#AlbaWedsFelipe",
  },

  "marigold-mandap": {
    person1: "Aarav",
    person2: "Priya",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Rakesh Mehta",
      grandparents: "Late Shri Govind Mehta",
    },
    family2: {
      relation: "Daughter of",
      parents: "Dr. & Mrs. Suresh Nair",
      grandparents: "Shri & Smt. Krishnan Nair",
    },
    familyMembers: [
      { name: "Rhea Mehta", role: "Sister of the groom" },
      { name: "Arjun Nair", role: "Brother of the bride" },
    ],
    event: {
      typeLabel: "Wedding Ceremony",
      startIso: "2027-11-20T09:00:00+05:30",
      dateText: "20 November 2027",
      dayText: "Saturday",
      timeText: "9:00 AM onwards",
      venueName: "The City Palace Lawns",
      venueAddress: "City Palace Road, Jaipur, Rajasthan 302002",
      muhuratText: "Shubh Muhurat · 9:12 AM to 9:58 AM",
      dressCode: "Traditional Indian festive — bright colours welcome",
    },
    subEvents: [
      {
        label: "Mehendi",
        dateText: "18 November",
        timeText: "4:00 PM onwards",
        venueName: "Courtyard Lawn",
        dressCode: "Yellows and greens",
      },
      {
        label: "Sangeet",
        dateText: "19 November",
        timeText: "7:00 PM onwards",
        venueName: "The Durbar Hall",
        dressCode: "Indian festive",
      },
    ],
    logistics: {
      transport:
        "Complimentary coaches will depart from Jaipur city hotels from 7:00 AM and return after the festivities.",
      accommodation:
        "Rooms are held at Rambagh Palace and ITC Rajputana under the Mehta–Nair wedding.",
      note: "November mornings in Jaipur are pleasant — a light shawl suits the evening.",
    },
    rsvpByDateText: "20 October 2027",
    email: "aarav.priya@example.com",
    hashtag: "#AaravWedsPriya",
  },

  "emerald-mihrab": {
    person1: "Yusuf",
    person2: "Zainab",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Imran Rahman",
      grandparents: "Late Haji Abdul Rahman",
    },
    family2: {
      relation: "Daughter of",
      parents: "Dr. & Mrs. Tariq Qureshi",
      grandparents: "Mr. & Mrs. Nasir Qureshi",
    },
    familyMembers: [
      { name: "Hana Rahman", role: "Sister of the groom" },
      { name: "Bilal Qureshi", role: "Brother of the bride" },
    ],
    event: {
      typeLabel: "Nikah Ceremony",
      startIso: "2027-03-06T16:00:00+04:00",
      dateText: "6 March 2027",
      dayText: "Saturday",
      timeText: "4:00 PM onwards",
      venueName: "The Palm Garden, Atlantis The Palm",
      venueAddress: "Crescent Road, The Palm Jumeirah, Dubai, UAE",
      dressCode: "Formal — modest elegance",
    },
    subEvents: [
      {
        label: "Mehndi Night",
        dateText: "4 March",
        timeText: "7:00 PM onwards",
        venueName: "Garden Terrace",
        dressCode: "Festive colours",
      },
      {
        label: "Walima",
        dateText: "6 March",
        timeText: "7:00 PM onwards",
        venueName: "The Palm Garden",
        dressCode: "Formal — modest elegance",
      },
    ],
    logistics: {
      transport:
        "Complimentary coaches depart from Dubai Marina and Deira at 2:45 PM. An alcohol-free celebration with halal catering throughout.",
      accommodation:
        "Rooms are held at Atlantis The Palm and Sofitel Dubai The Palm under the Rahman–Qureshi wedding.",
      note: "Evenings by the Palm are warm — light fabrics are recommended.",
    },
    rsvpByDateText: "1 February 2027",
    email: "yusuf.zainab@example.com",
    hashtag: "#YusufWedsZainab",
  },

  "golden-darbar": {
    // Full given first+middle name, not just "Harpreet"/"Simran": the
    // unrelated existing Golden Temple theme's demo couple already uses
    // those exact first names (a real coincidence, both Sikh designs) —
    // this stays the couple's own actual name, just not truncated as
    // far, so the two theme cards read as different weddings.
    person1: "Harpreet Singh",
    person2: "Simran Kaur",
    family1: {
      relation: "Son of",
      parents: "S. & Mrs. Jagtar Singh Gill",
      grandparents: "Late S. Mohan Singh Gill",
    },
    family2: {
      relation: "Daughter of",
      parents: "S. & Mrs. Baldev Kaur Bains",
      grandparents: "S. & Mrs. Ranjit Singh Bains",
    },
    familyMembers: [
      { name: "Amrit Gill", role: "Sister of the groom" },
      { name: "Manpreet Bains", role: "Brother of the bride" },
    ],
    event: {
      typeLabel: "Anand Karaj",
      startIso: "2027-10-09T10:00:00+01:00",
      dateText: "9 October 2027",
      dayText: "Saturday",
      timeText: "10:00 AM onwards",
      venueName: "The Grand Gurdwara Hall & Lawns",
      venueAddress: "Western Road, Southall, London, UK",
      dressCode: "Traditional or formal — heads covered in the Darbar Hall",
    },
    subEvents: [
      {
        label: "Milni",
        dateText: "9 October",
        timeText: "9:00 AM onwards",
        venueName: "Gurdwara Entrance",
        dressCode: "Traditional",
      },
      {
        label: "Reception",
        dateText: "9 October",
        timeText: "6:00 PM onwards",
        venueName: "The Grand Hall",
        dressCode: "Festive",
      },
    ],
    logistics: {
      transport:
        "Complimentary coaches run from Southall station throughout the morning. An alcohol-free and meat-free celebration.",
      accommodation:
        "Rooms are held at Premier Inn Southall and Radisson Red Heathrow under the Gill–Bains wedding.",
      note: "Scarves are provided at the entrance for the Darbar Hall.",
    },
    rsvpByDateText: "1 September 2027",
    email: "harpreet.simran@example.com",
    hashtag: "#Harpreet Singh Weds Simran Kaur",
  },

  "amalfi-fresco-wrap": {
    person1: "Giulia",
    person2: "Marco",
    family1: {
      relation: "Daughter of",
      parents: "Sig. & Sig.ra Antonio Romano",
      grandparents: "Late Sig. Vincenzo Romano",
    },
    family2: {
      relation: "Son of",
      parents: "Dott. & Sig.ra Paolo De Luca",
      grandparents: "Sig. & Sig.ra Franco De Luca",
    },
    familyMembers: [
      { name: "Chiara Romano", role: "Sister of the bride" },
      { name: "Luca De Luca", role: "Brother of the groom" },
    ],
    event: {
      typeLabel: "Wedding Ceremony",
      startIso: "2027-07-24T17:30:00+02:00",
      dateText: "24 July 2027",
      dayText: "Saturday",
      timeText: "5:30 PM onwards",
      venueName: "Villa Cimbrone",
      venueAddress: "Via Santa Chiara 26, Ravello, Amalfi Coast, Italy",
      dressCode: "Summer formal — Mediterranean colours",
    },
    subEvents: [
      {
        label: "Welcome Limonata",
        dateText: "23 July",
        timeText: "7:00 PM onwards",
        venueName: "Piazza Duomo",
        dressCode: "Smart casual",
      },
      {
        label: "Farewell Brunch",
        dateText: "25 July",
        timeText: "11:00 AM onwards",
        venueName: "Villa Terrace",
        dressCode: "Casual",
      },
    ],
    logistics: {
      transport:
        "Shuttle buses depart from Amalfi town from 3:45 PM, carrying guests up the coast to Ravello.",
      accommodation:
        "Rooms are held at Belmond Caruso and Palazzo Avino under the Romano–De Luca wedding.",
      note: "July evenings on the coast are warm — light linens are recommended.",
    },
    rsvpByDateText: "1 May 2027",
    email: "giulia.marco@example.com",
    hashtag: "#GiuliaWedsMarco",
  },

  "monochrome-loft": {
    person1: "Noah",
    person2: "Ava",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Erik Lindqvist",
      grandparents: "Late Mr. Lars Lindqvist",
    },
    family2: {
      relation: "Daughter of",
      parents: "Dr. & Mrs. Wei Chen",
      grandparents: "Mr. & Mrs. Jun Chen",
    },
    familyMembers: [
      { name: "Elsa Lindqvist", role: "Sister of the groom" },
      { name: "Mia Chen", role: "Sister of the bride" },
    ],
    event: {
      typeLabel: "Wedding Ceremony",
      startIso: "2027-08-14T18:00:00-04:00",
      dateText: "14 August 2027",
      dayText: "Saturday",
      timeText: "6:00 PM onwards",
      venueName: "The Glasshouse Loft",
      venueAddress: "25 Kent Avenue, Brooklyn, New York",
      dressCode: "Black & white — strictly monochrome",
    },
    subEvents: [
      {
        label: "Welcome Drinks",
        dateText: "13 August",
        timeText: "7:00 PM onwards",
        venueName: "Rooftop Bar",
        dressCode: "Smart casual, monochrome",
      },
      {
        label: "Farewell Brunch",
        dateText: "15 August",
        timeText: "11:00 AM onwards",
        venueName: "The Glasshouse Loft",
        dressCode: "Casual",
      },
    ],
    logistics: {
      transport:
        "Take the L train to Bedford Avenue — the loft is a short walk away. A shuttle departs the venue at the end of the night.",
      accommodation:
        "Rooms are held at The William Vale and Wythe Hotel under the Lindqvist–Chen wedding.",
      note: "August evenings in Brooklyn are warm — the ceremony is held indoors.",
    },
    rsvpByDateText: "1 July 2027",
    email: "noah.ava@example.com",
    hashtag: "#NoahWedsAva",
  },

  "udaipur-royal-scroll": {
    person1: "Vikramaditya",
    person2: "Kanika",
    family1: {
      relation: "Son of",
      parents: "Thakur & Thakurani Pratap Singh Rathore",
      grandparents: "Late Thakur Bhairon Singh Rathore",
    },
    family2: {
      relation: "Daughter of",
      parents: "Mr. & Mrs. Vijendra Shekhawat",
      grandparents: "Shri & Smt. Devendra Shekhawat",
    },
    familyMembers: [
      { name: "Padmini Rathore", role: "Sister of the groom" },
      { name: "Yuvraj Shekhawat", role: "Brother of the bride" },
    ],
    event: {
      typeLabel: "Wedding Ceremony",
      startIso: "2027-12-04T16:30:00+05:30",
      dateText: "4 December 2027",
      dayText: "Saturday",
      timeText: "4:30 PM onwards",
      venueName: "The City Palace",
      venueAddress: "Palace Road, Udaipur, Rajasthan 313001",
      muhuratText: "Shubh Muhurat · 4:42 PM to 5:30 PM",
      dressCode: "Regal traditional — sherwanis, lehengas & bandhgalas",
    },
    subEvents: [
      {
        label: "Royal Welcome",
        dateText: "2 December",
        timeText: "3:30 PM onwards",
        venueName: "Palace Courtyard",
        dressCode: "Festive",
      },
      {
        label: "Sangeet",
        dateText: "3 December",
        timeText: "7:30 PM onwards",
        venueName: "Lakeview Terrace",
        dressCode: "Indian festive",
      },
    ],
    logistics: {
      transport:
        "Vintage cars and coaches depart from the city hotels from 2:45 PM, carrying guests to the palace gates.",
      accommodation:
        "Rooms are held at Taj Lake Palace and The Leela Palace Udaipur under the Rathore–Shekhawat wedding.",
      note: "December evenings by the lake are cool — a shawl is recommended.",
    },
    rsvpByDateText: "1 November 2027",
    email: "vikramaditya.kanika@example.com",
    hashtag: "#VikramadityaWedsKanika",
  },

  "rajputana-heritage": {
    person1: "Aditya",
    person2: "Divya",
    family1: {
      relation: "Son of",
      parents: "Thakur & Thakurani Vijay Singh Chauhan",
      grandparents: "Late Thakur Udai Singh Chauhan",
    },
    family2: {
      relation: "Daughter of",
      parents: "Mr. & Mrs. Hemant Rathore",
      grandparents: "Shri & Smt. Narendra Rathore",
    },
    familyMembers: [
      { name: "Kavya Chauhan", role: "Sister of the groom" },
      { name: "Dev Rathore", role: "Brother of the bride" },
    ],
    event: {
      typeLabel: "Shubh Vivah",
      startIso: "2027-01-16T10:00:00+05:30",
      dateText: "16 January 2027",
      dayText: "Saturday",
      timeText: "10:00 AM onwards",
      venueName: "Samode Palace",
      venueAddress: "Samode, Jaipur, Rajasthan 303806",
      muhuratText: "Shubh Vivah · 10:12 AM to 11:00 AM",
      dressCode: "Regal traditional — bandhgala, sherwani, lehenga & saree",
    },
    subEvents: [
      {
        label: "Baraat",
        dateText: "16 January",
        timeText: "8:30 AM onwards",
        venueName: "Palace Gates",
        dressCode: "Regal traditional",
      },
      {
        label: "Reception Under the Stars",
        dateText: "16 January",
        timeText: "7:30 PM onwards",
        venueName: "Palace Lawns",
        dressCode: "Festive",
      },
    ],
    logistics: {
      transport:
        "Complimentary coaches depart from Jaipur city hotels from 7:30 AM and return after the reception.",
      accommodation:
        "Rooms are held at Samode Haveli and Rambagh Palace under the Chauhan–Rathore wedding.",
      note: "January mornings in Jaipur are cool — a shawl is welcome at the Baraat.",
    },
    rsvpByDateText: "16 December 2026",
    email: "aditya.divya@example.com",
    hashtag: "#AdityaWedsDivya",
  },

  "taj-mughal": {
    person1: "Farhan",
    person2: "Ayesha",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Zafar Sheikh",
      grandparents: "Late Haji Rafiq Sheikh",
    },
    family2: {
      relation: "Daughter of",
      parents: "Dr. & Mrs. Naveed Khan",
      grandparents: "Mr. & Mrs. Iqbal Khan",
    },
    familyMembers: [
      { name: "Sana Sheikh", role: "Sister of the groom" },
      { name: "Hamza Khan", role: "Brother of the bride" },
    ],
    event: {
      typeLabel: "Nikah Ceremony",
      startIso: "2027-02-06T16:30:00+05:30",
      dateText: "6 February 2027",
      dayText: "Saturday",
      timeText: "4:30 PM onwards",
      venueName: "The Oberoi Amarvilas Lawns",
      venueAddress: "Taj East Gate Road, Agra, Uttar Pradesh 282001",
      dressCode: "Formal — modest elegance",
    },
    subEvents: [
      {
        label: "Mehndi",
        dateText: "4 February",
        timeText: "6:00 PM onwards",
        venueName: "Hotel Lawns",
        dressCode: "Festive colours",
      },
      {
        label: "Walima",
        dateText: "7 February",
        timeText: "7:30 PM onwards",
        venueName: "The Oberoi Amarvilas Lawns",
        dressCode: "Formal — modest elegance",
      },
    ],
    logistics: {
      transport:
        "Coaches depart from Agra hotels at 2:45 PM and return after the farewell. An alcohol-free celebration with halal catering.",
      accommodation:
        "Rooms are held at The Oberoi Amarvilas and ITC Mughal under the Sheikh–Khan wedding.",
      note: "February evenings in Agra are cool — a shawl suits the Taj-view lawns.",
    },
    rsvpByDateText: "6 January 2027",
    email: "farhan.ayesha@example.com",
    hashtag: "#FarhanWedsAyesha",
  },

  "banarasi-silk": {
    person1: "Rohan",
    person2: "Shreya",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Vinod Mishra",
      grandparents: "Late Pandit Ramkishore Mishra",
    },
    family2: {
      relation: "Daughter of",
      parents: "Dr. & Mrs. Anand Tiwari",
      grandparents: "Shri & Smt. Madhav Tiwari",
    },
    familyMembers: [
      { name: "Aditi Mishra", role: "Sister of the groom" },
      { name: "Siddharth Tiwari", role: "Brother of the bride" },
    ],
    event: {
      typeLabel: "Wedding Ceremony",
      startIso: "2027-03-20T09:30:00+05:30",
      dateText: "20 March 2027",
      dayText: "Saturday",
      timeText: "9:30 AM onwards",
      venueName: "Brijrama Palace Lawns",
      venueAddress: "Darbhanga Ghat, Varanasi, Uttar Pradesh 221001",
      muhuratText: "Shubh Muhurat · 9:30 AM to 10:18 AM",
      dressCode: "Traditional — Banarasi silk welcome",
    },
    subEvents: [
      {
        label: "Baraat & Swagat",
        dateText: "20 March",
        timeText: "8:00 AM onwards",
        venueName: "Palace Ghat",
        dressCode: "Traditional",
      },
      {
        label: "Ganga Aarti Reception",
        dateText: "20 March",
        timeText: "6:30 PM onwards",
        venueName: "Brijrama Palace Lawns",
        dressCode: "Festive",
      },
    ],
    logistics: {
      transport:
        "Boats and coaches depart from city hotels from 7:00 AM, bringing guests to the palace ghat in time for the Baraat.",
      accommodation:
        "Rooms are held at Brijrama Palace and Taj Ganges under the Mishra–Tiwari wedding.",
      note: "March mornings on the ghats are pleasant — comfortable footwear for the steps.",
    },
    rsvpByDateText: "20 February 2027",
    email: "rohan.shreya@example.com",
    hashtag: "#RohanWedsShreya",
  },

  "kerala-kasavu": {
    person1: "Arun",
    person2: "Lakshmi",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Mohandas Menon",
      grandparents: "Late Shri Krishnan Menon",
    },
    family2: {
      relation: "Daughter of",
      parents: "Dr. & Mrs. Gopalakrishnan Nair",
      grandparents: "Shri & Smt. Raghavan Nair",
    },
    familyMembers: [
      { name: "Anjali Menon", role: "Sister of the groom" },
      { name: "Vivek Nair", role: "Brother of the bride" },
    ],
    event: {
      typeLabel: "Muhurtham",
      startIso: "2027-05-08T09:00:00+05:30",
      dateText: "8 May 2027",
      dayText: "Saturday",
      timeText: "9:00 AM onwards",
      venueName: "The Leela Ashtamudi Lawns",
      venueAddress: "Ashtamudi Lake Road, Kollam, Kerala 691001",
      muhuratText: "Muhurtham · 9:00 AM to 9:40 AM",
      dressCode: "Traditional — kasavu & mundu welcome",
    },
    subEvents: [
      {
        label: "Nadaswaram Welcome",
        dateText: "8 May",
        timeText: "8:00 AM onwards",
        venueName: "Lawn Entrance",
        dressCode: "Traditional",
      },
      {
        label: "Reception & Mohiniyattam",
        dateText: "8 May",
        timeText: "5:00 PM onwards",
        venueName: "Backwater Lawns",
        dressCode: "Festive Indian",
      },
    ],
    logistics: {
      transport:
        "Coaches depart from Kollam hotels from 7:15 AM, bringing guests to the lawns in good time for the Nadaswaram.",
      accommodation:
        "Rooms are held at The Leela Ashtamudi and Fragrant Nature Kollam under the Menon–Nair wedding.",
      note: "May mornings by the backwaters are warm — light cottons are recommended.",
    },
    rsvpByDateText: "1 April 2027",
    email: "arun.lakshmi@example.com",
    hashtag: "#ArunWedsLakshmi",
  },

  "bengali-jamdani": {
    person1: "Arjun",
    person2: "Debjani",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Subrata Banerjee",
      grandparents: "Late Shri Amitava Banerjee",
    },
    family2: {
      relation: "Daughter of",
      parents: "Dr. & Mrs. Partha Chatterjee",
      grandparents: "Shri & Smt. Debashish Chatterjee",
    },
    familyMembers: [
      { name: "Payel Banerjee", role: "Sister of the groom" },
      { name: "Souvik Chatterjee", role: "Brother of the bride" },
    ],
    event: {
      typeLabel: "Biye",
      startIso: "2027-06-26T10:00:00+05:30",
      dateText: "26 June 2027",
      dayText: "Saturday",
      timeText: "10:00 AM onwards",
      venueName: "The Rajbari Bawali Lawns",
      venueAddress: "Bawali, Kolkata, West Bengal 743502",
      dressCode:
        "Traditional Bengali festive — Dhakai, Jamdani & dhoti-panjabi",
    },
    subEvents: [
      {
        label: "Gaye Holud",
        dateText: "25 June",
        timeText: "8:30 AM onwards",
        venueName: "Rajbari Courtyard",
        dressCode: "Yellows",
      },
      {
        label: "Reception & Music",
        dateText: "26 June",
        timeText: "7:00 PM onwards",
        venueName: "The Rajbari Bawali Lawns",
        dressCode: "Festive",
      },
    ],
    logistics: {
      transport:
        "Coaches depart from Park Street hotels from 7:30 AM and return after the reception.",
      accommodation:
        "Rooms are held at The Oberoi Grand and Taj Bengal under the Banerjee–Chatterjee wedding.",
      note: "June evenings in Kolkata can bring showers — an umbrella is a good idea.",
    },
    rsvpByDateText: "26 May 2027",
    email: "arjun.debjani@example.com",
    hashtag: "#ArjunWedsDebjani",
  },

  "punjabi-phulkari": {
    person1: "Gurpreet",
    person2: "Jasleen",
    family1: {
      relation: "Son of",
      parents: "S. & Mrs. Harvinder Singh Sandhu",
      grandparents: "Late S. Kuldeep Singh Sandhu",
    },
    family2: {
      relation: "Daughter of",
      parents: "S. & Mrs. Amarjit Kaur Dhillon",
      grandparents: "S. & Mrs. Gurdial Singh Dhillon",
    },
    familyMembers: [
      { name: "Navjot Sandhu", role: "Sister of the groom" },
      { name: "Ravneet Dhillon", role: "Brother of the bride" },
    ],
    event: {
      typeLabel: "Anand Karaj",
      startIso: "2027-08-28T10:00:00+05:30",
      dateText: "28 August 2027",
      dayText: "Saturday",
      timeText: "10:00 AM onwards",
      venueName: "The Umrao Lawns",
      venueAddress: "Majitha Road, Amritsar, Punjab 143001",
      dressCode: "Punjabi festive — colourful & joyful",
    },
    subEvents: [
      {
        label: "Milni & Breakfast",
        dateText: "28 August",
        timeText: "9:00 AM onwards",
        venueName: "Haveli Entrance",
        dressCode: "Traditional",
      },
      {
        label: "Reception, Dhol & Bhangra",
        dateText: "28 August",
        timeText: "7:00 PM onwards",
        venueName: "The Umrao Lawns",
        dressCode: "Festive",
      },
    ],
    logistics: {
      transport:
        "Coaches run from Amritsar hotels from 8:00 AM, bringing guests directly to the venue. An alcohol-free and meat-free celebration.",
      accommodation:
        "Rooms are held at Hyatt Regency Amritsar and Taj Swarna under the Sandhu–Dhillon wedding.",
      note: "Heads are covered in the Darbar Hall — scarves are provided.",
    },
    rsvpByDateText: "31 July 2027",
    email: "gurpreet.jasleen@example.com",
    hashtag: "#GurpreetWedsJasleen",
  },

  "kashmiri-garden": {
    person1: "Danish",
    person2: "Saima",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Ghulam Bhat",
      grandparents: "Late Haji Mushtaq Bhat",
    },
    family2: {
      relation: "Daughter of",
      parents: "Dr. & Mrs. Fayaz Wani",
      grandparents: "Mr. & Mrs. Abdul Wani",
    },
    familyMembers: [
      { name: "Insha Bhat", role: "Sister of the groom" },
      { name: "Owais Wani", role: "Brother of the bride" },
    ],
    event: {
      typeLabel: "Nikah Ceremony",
      startIso: "2027-09-04T17:00:00+05:30",
      dateText: "4 September 2027",
      dayText: "Saturday",
      timeText: "5:00 PM onwards",
      venueName: "The Lalit Grand Palace Lawns",
      venueAddress: "Gupkar Road, Srinagar, Kashmir 190001",
      dressCode: "Formal — Kashmiri elegance",
    },
    subEvents: [
      {
        label: "Henditt (Mehndi)",
        dateText: "2 September",
        timeText: "6:00 PM onwards",
        venueName: "Palace Gardens",
        dressCode: "Festive colours",
      },
      {
        label: "Wazwan Feast",
        dateText: "4 September",
        timeText: "8:00 PM onwards",
        venueName: "The Lalit Grand Palace Lawns",
        dressCode: "Formal — Kashmiri elegance",
      },
    ],
    logistics: {
      transport:
        "Coaches and shikaras depart from partner Srinagar hotels from 3:15 PM, bringing guests to the palace lawns. An alcohol-free celebration.",
      accommodation:
        "Rooms are held at The Lalit Grand Palace and Vivanta Dal View under the Bhat–Wani wedding.",
      note: "September evenings by Dal Lake are cool — a shawl is recommended.",
    },
    rsvpByDateText: "1 August 2027",
    email: "danish.saima@example.com",
    hashtag: "#DanishWedsSaima",
  },

  "goan-azulejos": {
    person1: "Ryan",
    person2: "Maria",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Francis D'Souza",
      grandparents: "Late Mr. Joaquim D'Souza",
    },
    family2: {
      relation: "Daughter of",
      parents: "Dr. & Mrs. Lawrence Fernandes",
      grandparents: "Mr. & Mrs. Caetano Fernandes",
    },
    familyMembers: [
      { name: "Priya D'Souza", role: "Sister of the groom" },
      { name: "Clive Fernandes", role: "Brother of the bride" },
    ],
    event: {
      typeLabel: "Nuptial Mass",
      startIso: "2027-10-23T16:00:00+05:30",
      dateText: "23 October 2027",
      dayText: "Saturday",
      timeText: "4:00 PM onwards",
      venueName: "Sé Cathedral & Assagao Villa Lawn",
      venueAddress: "Assagao, Bardez, Goa 403507",
      dressCode: "Formal — tropical elegance",
    },
    subEvents: [
      {
        label: "Welcome Serenade",
        dateText: "22 October",
        timeText: "7:00 PM onwards",
        venueName: "Villa Lawn",
        dressCode: "Smart casual",
      },
      {
        label: "Dinner Under the Palms",
        dateText: "23 October",
        timeText: "7:30 PM onwards",
        venueName: "Assagao Villa Lawn",
        dressCode: "Formal — tropical elegance",
      },
    ],
    logistics: {
      transport:
        "Coaches depart from Panjim and Mapusa at 2:00 PM and return after the celebrations.",
      accommodation:
        "Rooms are held at Taj Fort Aguada and W Goa under the D'Souza–Fernandes wedding.",
      note: "October evenings in Goa are balmy — light linens are welcome.",
    },
    rsvpByDateText: "1 September 2027",
    email: "ryan.maria@example.com",
    hashtag: "#RyanWedsMaria",
  },

  "gujarati-patola": {
    person1: "Jay",
    person2: "Riya",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Kiran Shah",
      grandparents: "Late Shri Chimanlal Shah",
    },
    family2: {
      relation: "Daughter of",
      parents: "Dr. & Mrs. Mahesh Desai",
      grandparents: "Shri & Smt. Jayantilal Desai",
    },
    familyMembers: [
      { name: "Nisha Shah", role: "Sister of the groom" },
      { name: "Kunal Desai", role: "Brother of the bride" },
    ],
    event: {
      typeLabel: "Wedding Ceremony",
      startIso: "2027-11-06T09:30:00+05:30",
      dateText: "6 November 2027",
      dayText: "Saturday",
      timeText: "9:30 AM onwards",
      venueName: "The Green Acre Lawns",
      venueAddress: "SG Highway, Ahmedabad, Gujarat 380054",
      muhuratText: "Shubh Muhurat · 9:30 AM to 10:12 AM",
      dressCode: "Traditional Gujarati festive — Chaniya Choli & Kediyu",
    },
    subEvents: [
      {
        label: "Garba Night",
        dateText: "4 November",
        timeText: "8:00 PM onwards",
        venueName: "Lawn Pavilion",
        dressCode: "Chaniya choli & kediyu",
      },
      {
        label: "Garba & Reception Evening",
        dateText: "6 November",
        timeText: "7:00 PM onwards",
        venueName: "The Green Acre Lawns",
        dressCode: "Festive",
      },
    ],
    logistics: {
      transport:
        "Coaches run from the city hotels to the venue from 7:15 AM. A vegetarian celebration — Jain options available on request.",
      accommodation:
        "Rooms are held at ITC Narmada and Hyatt Ahmedabad under the Shah–Desai wedding.",
      note: "November mornings in Ahmedabad are pleasant — light layers are enough.",
    },
    rsvpByDateText: "1 October 2027",
    email: "jay.riya@example.com",
    hashtag: "#JayWedsRiya",
  },

  "kanchipuram-temple": {
    person1: "Karthik",
    person2: "Deepa",
    family1: {
      relation: "Son of",
      parents: "Mr. & Mrs. Ramaswamy Subramaniam",
      grandparents: "Late Shri Krishnaswamy Subramaniam",
    },
    family2: {
      relation: "Daughter of",
      parents: "Dr. & Mrs. Venkataraman Venkatesh",
      grandparents: "Shri & Smt. Natarajan Venkatesh",
    },
    familyMembers: [
      { name: "Meenakshi Subramaniam", role: "Sister of the groom" },
      { name: "Ashwin Venkatesh", role: "Brother of the bride" },
    ],
    event: {
      typeLabel: "Muhurtham",
      startIso: "2027-12-18T09:00:00+05:30",
      dateText: "18 December 2027",
      dayText: "Saturday",
      timeText: "9:00 AM onwards",
      venueName: "A Heritage Kalyana Mandapam",
      venueAddress: "Kanchipuram, Tamil Nadu 631502",
      muhuratText: "Auspicious Muhurtham · 9:00 AM to 9:45 AM",
      dressCode: "Traditional — Kanjivaram silk & veshti welcome",
    },
    subEvents: [
      {
        label: "Nadaswaram & Welcome",
        dateText: "18 December",
        timeText: "7:30 AM onwards",
        venueName: "Mandapam Entrance",
        dressCode: "Traditional",
      },
      {
        label: "Reception & Carnatic Evening",
        dateText: "18 December",
        timeText: "5:30 PM onwards",
        venueName: "Mandapam Lawns",
        dressCode: "Festive Indian",
      },
    ],
    logistics: {
      transport:
        "Coaches depart from partner hotels in Chennai from 6:00 AM, arriving in good time for the Nadaswaram.",
      accommodation:
        "Rooms are held at ITC Grand Chola, Chennai, and Radisson Blu Temple Bay, Mahabalipuram, under the Subramaniam–Venkatesh wedding.",
      note: "December mornings are pleasant — traditional silks suit the mandapam.",
    },
    rsvpByDateText: "15 November 2027",
    email: "karthik.deepa@example.com",
    hashtag: "#KarthikWedsDeepa",
  },
};

/**
 * The demo invite for one theme: the base invite with that theme's own
 * couple, families, date, venue and programme merged over it. Themes with
 * no override (only the base theme itself) get the base couple unchanged.
 */
export function getDemoInvite(themeId: string): Invite {
  const override = DEMO_OVERRIDES[themeId];
  if (!override) return { ...demoWedding, themeId };
  const { person1, person2 } = override;
  return {
    ...demoWedding,
    themeId,
    hosts: {
      mode: "couple",
      person1,
      person2,
      family1: override.family1,
      family2: override.family2,
    },
    event: override.event,
    subEvents: override.subEvents,
    familyMembers: override.familyMembers,
    logistics: override.logistics,
    rsvp: {
      enabled: true,
      byDateText: override.rsvpByDateText,
      whatsapp: DEMO_WHATSAPP,
      email: override.email,
    },
    hashtag: override.hashtag,
    ...(override.blessing ? { blessing: override.blessing } : {}),
    meta: {
      title: `${person1} & ${person2} | Wedding Invitation`,
      description: demoWedding.meta.description,
    },
  };
}
