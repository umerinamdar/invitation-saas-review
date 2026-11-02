import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl, PUBLISH_PRICE_LABEL } from "@/config/site";
import { BRAND } from "@/components/site/chrome";
import {
  faqJsonLd,
  OccasionLandingPage,
} from "@/components/site/occasion-landing";
import { themesById } from "@/themes";

const TITLE = `Sikh Wedding Invitations Online (Anand Karaj) — ${BRAND}`;
const DESCRIPTION = `A digital Sikh wedding invitation guests open on their phone — gurdwara-style doors parting onto your names and date. ${PUBLISH_PRICE_LABEL} one-time, shared on WhatsApp.`;
const OG_URL = absoluteUrl("/sikh-wedding-invitations");

const FAQS = [
  {
    q: "What does the Golden Temple design actually look like?",
    a: "Its own pair of golden doors, carved in the same style as a gurdwara's, that part on tap to reveal your invitation. It's a live web page, not a video.",
  },
  {
    q: "Can I list the Anand Karaj alongside a reception?",
    a: "Yes — the Golden Temple design covers wedding and reception, so your ceremony and your reception details can both live in the same invitation.",
  },
  {
    q: "Do guests need an app to open it?",
    a: "No. It's a normal link that opens in any phone's browser — the easiest way to send it is the WhatsApp link you already use for everything else.",
  },
  {
    q: "Can I write the invitation in Punjabi?",
    a: "Yes — every text field accepts whatever your keyboard types, in any script.",
  },
  {
    q: "Is there a recurring fee?",
    a: `No — ${PUBLISH_PRICE_LABEL} once publishes your invitation for good. No subscription.`,
  },
];

export const Route = createFileRoute("/sikh-wedding-invitations")({
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
  component: SikhWeddingInvitations,
});

function SikhWeddingInvitations() {
  const goldenTemple = themesById.get("golden-temple");
  return (
    <OccasionLandingPage
      eyebrow="Sikh weddings"
      heading="A Sikh wedding invitation"
      headingEm="built around the Anand Karaj"
      intro={[
        "The Golden Temple design opens with its own carved golden doors — a tap, a parting, then your names, your date, and your venue. Built for the wedding and the reception, so your full celebration fits in one link.",
        "Send it the way your guest list already shares everything: a WhatsApp link, no app, no sign-up.",
      ]}
      featuredThemes={goldenTemple ? [goldenTemple] : []}
      faqs={FAQS}
    />
  );
}
