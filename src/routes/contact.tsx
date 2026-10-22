import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [{ title: `Contact — ${BRAND}` }],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="site">
      <SiteHeader />
      <main>
        <section className="legal-page legal-page-narrow">
          <p className="eyebrow">Get in touch</p>
          <h1>Contact {BRAND}</h1>
          <p className="lede">
            Questions about a design, a payment, or your published invitation
            — we're happy to help.
          </p>

          <div className="contact-cards">
            <a className="contact-card" href="mailto:hello@easyinvitemaker.com">
              <Mail size={20} />
              <div>
                <p className="contact-card-label">Email</p>
                <p className="contact-card-value">hello@easyinvitemaker.com</p>
              </div>
            </a>
          </div>

          <p className="legal-note">
            We usually reply within a business day. For payment or refund
            questions, include your account email and, if you have it, the
            payment reference from your bank or payment app.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
