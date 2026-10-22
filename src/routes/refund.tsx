import { createFileRoute } from "@tanstack/react-router";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { PUBLISH_PRICE_LABEL } from "@/config/site";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [{ title: `Refund policy — ${BRAND}` }],
  }),
  component: Refund,
});

function Refund() {
  return (
    <div className="site">
      <SiteHeader />
      <section className="legal-page">
        <p className="eyebrow">Legal</p>
        <h1>Refund policy</h1>
        <p className="legal-updated">Last updated 18 October 2026</p>

        <h2>Try before you pay</h2>
        <p>
          Every design can be fully customised and previewed on your own
          phone for free. The {PUBLISH_PRICE_LABEL} charge only happens when you choose to
          publish — by that point you've already seen exactly what your
          guests will see, so we'd encourage you to preview carefully before
          publishing.
        </p>

        <h2>Refunds after publishing</h2>
        <p>
          Because publishing delivers the product immediately — a live,
          working invitation link — in full and instantly, we don't offer
          refunds once an invitation has been published, except where the
          invitation itself failed to work as described (for example, it
          didn't load correctly on a wedding guest's phone, or the opening
          animation genuinely failed to run).
        </p>

        <h2>If something is broken</h2>
        <p>
          If your published invitation isn't working — the link doesn't
          open, the page shows an error, or a core feature like the
          countdown or photo gallery is broken — tell us within 7 days of
          publishing. We'll fix it, or refund you if we can't.
        </p>

        <h2>Duplicate or accidental charges</h2>
        <p>
          If you were charged twice for the same invitation, or charged
          after a payment failure that you then retried, let us know and
          we'll refund the duplicate charge.
        </p>

        <h2>How to request a refund</h2>
        <p>
          Email us with your account email and, if you have it, the payment
          reference from your bank or payment app — see our{" "}
          <a href="/contact">contact page</a>. We aim to respond within 2
          business days and, where a refund is due, process it back to your
          original payment method within 5–7 business days.
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}
