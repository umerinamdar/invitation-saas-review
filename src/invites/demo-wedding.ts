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
    meta: {
      title: `${person1} & ${person2} | Wedding Invitation`,
      description: demoWedding.meta.description,
    },
  };
}
