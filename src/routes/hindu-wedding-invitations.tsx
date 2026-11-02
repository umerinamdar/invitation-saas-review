import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl, PUBLISH_PRICE_LABEL } from "@/config/site";
import { BRAND } from "@/components/site/chrome";
import {
  faqJsonLd,
  OccasionLandingPage,
} from "@/components/site/occasion-landing";
import { themesById } from "@/themes";

const TITLE = `Hindu Wedding Invitations Online — ${BRAND}`;
const DESCRIPTION = `A digital Hindu wedding invitation your guests open on their phone — doors that part like a mandir's, your names and date, shared on WhatsApp. ${PUBLISH_PRICE_LABEL} one-time.`;
const OG_URL = absoluteUrl("/hindu-wedding-invitations");

const FAQS = [
  {
    q: "Is this a real invitation or just a video?",
    a: "A real, live web page at its own link — not a video file. Guests tap the link, the doors open, and they can scroll through your event details any time, not just watch once.",
  },
  {
    q: "Can I add multiple functions — haldi, mehendi, the wedding itself?",
    a: "Yes. One invitation can list your event's own schedule and venue; if you're running haldi and mehendi as separate functions, the Ayodhya Ram Mandir design supports those occasions directly.",
  },
  {
    q: "Will it work for guests who aren't on Instagram or a particular app?",
    a: "It's a normal web link — it opens in any phone's browser. No app to install, nothing for your guests to sign up for.",
  },
  {
    q: "Can I use Hindi or another Indian language for names and text?",
    a: "The text fields accept whatever you type, in any language or script your phone's keyboard supports.",
  },
  {
    q: "Is it really a one-time payment?",
    a: `Yes — ${PUBLISH_PRICE_LABEL} once to publish and share your invitation. No subscription, no recurring charge.`,
  },
];

export const Route = createFileRoute("/hindu-wedding-invitations")({
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
  component: HinduWeddingInvitations,
});

function HinduWeddingInvitations() {
  const ramMandir = themesById.get("ram-mandir");
  return (
    <OccasionLandingPage
      eyebrow="Hindu weddings"
      heading="A Hindu wedding invitation"
      headingEm="your guests actually open"
      intro={[
        "The Ayodhya Ram Mandir design opens like a temple's own carved doors — your guests tap once, watch them part, and arrive at your names, your date, and your venue. It's built for weddings, haldi and mehendi, so one invitation can carry your whole set of functions.",
        "Share it the way your family already shares everything else: a WhatsApp link. No app to download, no account for guests to create.",
      ]}
      featuredThemes={ramMandir ? [ramMandir] : []}
      faqs={FAQS}
    />
  );
}
