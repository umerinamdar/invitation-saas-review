import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl, PUBLISH_PRICE_LABEL } from "@/config/site";
import { BRAND } from "@/components/site/chrome";
import {
  faqJsonLd,
  OccasionLandingPage,
} from "@/components/site/occasion-landing";
import { themesById } from "@/themes";

const TITLE = `Muslim Wedding & Nikah Invitations Online — ${BRAND}`;
const DESCRIPTION = `A digital Nikah invitation guests open on their phone — a lacquered book opening onto a moonlit courtyard, your own blessing, your names and date. ${PUBLISH_PRICE_LABEL} one-time.`;
const OG_URL = absoluteUrl("/muslim-wedding-invitations");

const FAQS = [
  {
    q: "What does the Noor Invitation design actually look like?",
    a: "An emerald and gold lacquered book that opens like a keepsake, settling onto a moonlit courtyard scene with your names, date and venue. It's a real, live web page — not a video.",
  },
  {
    q: "Can I add my own blessing or verse?",
    a: "Yes — the invitation has its own blessing field you can personalize with whatever words, verse or dua you'd like your guests to see.",
  },
  {
    q: "Does it cover the Nikah and the reception?",
    a: "The Noor Invitation design is built for weddings, engagements and receptions, so your Nikah and any reception can both be listed on the same invitation.",
  },
  {
    q: "How do guests open it — do they need an app?",
    a: "No app. It's a normal link, opened the way your family already shares things — most people send it over WhatsApp.",
  },
  {
    q: "Is it a one-time payment?",
    a: `Yes — ${PUBLISH_PRICE_LABEL} once, no subscription.`,
  },
];

export const Route = createFileRoute("/muslim-wedding-invitations")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      ...(OG_URL ? [{ property: "og:url", content: OG_URL }] : []),
    ],
    links: [...(OG_URL ? [{ rel: "canonical", href: OG_URL }] : [])],
    scripts: [{ type: "application/ld+json", children: faqJsonLd(FAQS) }],
  }),
  component: MuslimWeddingInvitations,
});

function MuslimWeddingInvitations() {
  const noor = themesById.get("noor-invitation");
  return (
    <OccasionLandingPage
      eyebrow="Muslim weddings"
      heading="A Nikah invitation"
      headingEm="guests open like a keepsake"
      intro={[
        "The Noor Invitation design opens like a lacquered book — a cover lifts to reveal your own blessing, then settles onto a moonlit courtyard with your names, date and venue. Built for weddings, engagements and receptions, so your Nikah and your reception fit in one link.",
        "Share it the way you already share everything else: a WhatsApp link, no app for your guests to install.",
      ]}
      featuredThemes={noor ? [noor] : []}
      faqs={FAQS}
    />
  );
}
