import { createFileRoute } from "@tanstack/react-router";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { absoluteUrl } from "@/config/site";

/** This page's absolute URL — null until the canonical origin is set. */
const OG_URL = absoluteUrl("/privacy");

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [{ title: `Privacy policy — ${BRAND}` }],
    links: [
      // Canonical — only once VITE_SITE_URL is configured, never a
      // guessed or localhost URL (same guard as the public routes).
      ...(OG_URL ? [{ rel: "canonical", href: OG_URL }] : []),
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="site">
      <SiteHeader />
      <section className="legal-page">
        <p className="eyebrow">Legal</p>
        <h1>Privacy policy</h1>
        <p className="legal-updated">Last updated 22 October 2026</p>

        <h2>What we collect</h2>
        <p>
          To create your account and your invitation, we collect the email
          address you sign up with, and whatever you choose to enter into
          the editor: names, dates, venues, family details, RSVP contact
          details, and any photographs or music you upload. Guests who open
          your published invitation link don't need an account and we don't
          collect anything from them beyond standard, anonymous web traffic
          logs (like any website).
        </p>

        <h2>Photos and music you upload</h2>
        <p>
          Uploading needs a free account. When you add a photo or a song
          in the editor, it is stored on our servers straight away, under
          your account — that's what saves your work and means the files
          are ready for your guests the moment you publish. Your design
          draft itself (names, dates and other text) stays in your own
          browser until you publish it as an invitation.
        </p>

        <h2>How we use it</h2>
        <p>
          We use your information to run the product: saving your draft,
          rendering your published invitation, processing your payment, and
          contacting you about your account if needed. We don't sell your
          data, and we don't use your guests' or your photographs for
          marketing without asking first.
        </p>

        <h2>Payments</h2>
        <p>
          Payment is handled by a third-party payment gateway. We receive
          confirmation that a payment succeeded, not your full card or bank
          details.
        </p>

        <h2>Sharing</h2>
        <p>
          We don't share your personal information with third parties
          except the service providers that make {BRAND} work — hosting,
          storage, and payment processing — each bound to protect it.
        </p>

        <h2>Your invitation's visibility</h2>
        <p>
          A published invitation link is visible to anyone who has the
          link, the same way any unlisted web page works. It is not indexed
          for search or listed publicly anywhere on {BRAND}.
        </p>

        <h2>Your choices</h2>
        <p>
          You can edit or delete the content of your invitation at any time
          before your event. To delete your account and associated data,
          contact us using the details on our <a href="/contact">contact
          page</a>.
        </p>

        <h2>Changes</h2>
        <p>
          We may update this policy as the product changes, and will post
          the revised version here.
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}
