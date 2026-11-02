import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl, PUBLISH_PRICE_LABEL } from "@/config/site";
import { BRAND } from "@/components/site/chrome";
import {
  faqJsonLd,
  OccasionLandingPage,
} from "@/components/site/occasion-landing";
import { themesById } from "@/themes";

const TITLE = `Christian Wedding Invitations Online — ${BRAND}`;
const DESCRIPTION = `A digital Christian wedding invitation guests open on their phone — carved cathedral doors parting onto warm light, your names and date. ${PUBLISH_PRICE_LABEL} one-time, shared on WhatsApp.`;
const OG_URL = absoluteUrl("/christian-wedding-invitations");

const FAQS = [
  {
    q: "What does the Cathedral Light design actually look like?",
    a: "Carved oak doors that slide apart slowly, warm light spilling from the gap, settling onto your names, date and venue. It's a live web page, not a video file.",
  },
  {
    q: "Does it cover the ceremony and the reception?",
    a: "Cathedral Light is built for weddings, engagements and receptions, so both can be listed on the same invitation.",
  },
  {
    q: "Do my guests need to download anything?",
    a: "No — it's a normal link that opens in any phone's browser, usually sent as a WhatsApp message.",
  },
  {
    q: "Can I add a reading or a verse?",
    a: "Yes — the invitation has its own fields you can personalize with whatever text you'd like guests to see.",
  },
  {
    q: "Is there a subscription?",
    a: `No — ${PUBLISH_PRICE_LABEL} once to publish, nothing recurring.`,
  },
];

export const Route = createFileRoute("/christian-wedding-invitations")({
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
  component: ChristianWeddingInvitations,
});

function ChristianWeddingInvitations() {
  const cathedralLight = themesById.get("cathedral-light");
  return (
    <OccasionLandingPage
      eyebrow="Christian weddings"
      heading="A Christian wedding invitation"
      headingEm="that opens like cathedral doors"
      intro={[
        "The Cathedral Light design opens through carved oak doors, sliding slowly apart as warm light spills through — then your names, your date, and your venue. Built for weddings, engagements and receptions, so your ceremony and reception fit in one invitation.",
        "Share it the way you already share everything: a WhatsApp link, no app required.",
      ]}
      featuredThemes={cathedralLight ? [cathedralLight] : []}
      faqs={FAQS}
    />
  );
}
