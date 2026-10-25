import { createFileRoute } from "@tanstack/react-router";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { absoluteUrl, PUBLISH_PRICE_LABEL } from "@/config/site";

/** This page's absolute URL — null until the canonical origin is set. */
const OG_URL = absoluteUrl("/terms");

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [{ title: `Terms of service — ${BRAND}` }],
    links: [
      // Canonical — only once VITE_SITE_URL is configured, never a
      // guessed or localhost URL (same guard as the public routes).
      ...(OG_URL ? [{ rel: "canonical", href: OG_URL }] : []),
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <div className="site">
      <SiteHeader />
      <section className="legal-page">
        <p className="eyebrow">Legal</p>
        <h1>Terms of service</h1>
        <p className="legal-updated">Last updated 25 October 2026</p>

        <h2>1. What {BRAND} is</h2>
        <p>
          {BRAND} is a digital product: you choose an animated invitation
          design, customise it with your own names, dates, venues and
          photographs, and publish it for a one-time fee. The result is a
          web page at a link you share with your guests, typically over
          WhatsApp. {BRAND} does not print, post, or courier anything — there
          is no physical product at any point in this service.
        </p>

        <h2>2. Your account and content</h2>
        <p>
          You're responsible for the accuracy of what you enter — names,
          dates, venues, family details and any photographs or music you
          upload. You confirm that you have the right to use any photograph
          or audio file you upload, and that none of the content you submit
          is unlawful, defamatory, or infringes someone else's rights.
        </p>

        <h2>3. Customising and publishing</h2>
        <p>
          Designing an invitation is free: you can try any design, enter
          your details, and preview the result on your own phone at no
          cost. Publishing — which creates your shareable link and removes
          any preview limitations — costs a one-time {PUBLISH_PRICE_LABEL} per invitation,
          charged at the time you publish. There is no subscription and no
          recurring charge.
        </p>

        <h2>4. After you publish</h2>
        <p>
          A published invitation stays live indefinitely — we don't delete
          it for inactivity or take it down after your event has passed.
          It also stays editable at any time, so you can correct a typo or
          update a venue even years later. You can delete your own
          invitation at any time from your dashboard if you no longer want
          it online.
        </p>

        <h2>5. Payments</h2>
        <p>
          Payments are processed by a third-party payment gateway. We do
          not store your card or bank details ourselves. See our{" "}
          <a href="/refund">refund policy</a> for cancellations and refunds.
        </p>

        <h2>6. Acceptable use</h2>
        <p>
          Don't use {BRAND} to publish content that is hateful, obscene, or
          intended to impersonate or harass another person. We may suspend
          or remove an invitation that breaches this without notice.
        </p>

        <h2>7. Changes</h2>
        <p>
          We may update these terms as the product changes. Continuing to
          use {BRAND} after an update means you accept the revised terms.
        </p>

        <h2>8. Contact</h2>
        <p>
          Questions about these terms? Reach us at the details on our{" "}
          <a href="/contact">contact page</a>.
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}
