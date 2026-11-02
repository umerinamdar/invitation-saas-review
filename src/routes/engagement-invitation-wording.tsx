import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { absoluteUrl, PUBLISH_PRICE_LABEL } from "@/config/site";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { faqJsonLd } from "@/components/site/occasion-landing";

const TITLE = `Engagement Invitation Wording Examples — ${BRAND}`;
const DESCRIPTION = `How to word an engagement invitation: what to include, short examples for the ring ceremony, and whether to announce the wedding date — wording you can adapt for your own invitation.`;
const OG_URL = absoluteUrl("/engagement-invitation-wording");

const FAQS = [
  {
    q: "What must an engagement invitation wording always include?",
    a: "Who is hosting, the couple's names, the date and time of the engagement, the venue, and how guests should reply. If a wedding date is already fixed, you can add it as one line; if it is not, say nothing about it rather than guessing.",
  },
  {
    q: "How is engagement wording different from wedding wording?",
    a: "An engagement invitation announces the engagement and invites guests to the ceremony where the couple exchange rings. It does not need the full wedding schedule — that belongs on the wedding invitation, which you can send later.",
  },
  {
    q: "Should the wedding date appear on the engagement invitation?",
    a: "Only if it is fixed and you want guests to know it now. A single line such as 'The wedding will follow on a date to be announced' is fine when it is not fixed; leaving it out entirely is fine too.",
  },
  {
    q: "Do I pay extra for a different wording?",
    a: `No. The wording is part of your invitation, and publishing it costs ${PUBLISH_PRICE_LABEL} one-time, no subscription, whatever wording you choose.`,
  },
];

export const Route = createFileRoute("/engagement-invitation-wording")({
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
  component: EngagementInvitationWording,
});

function EngagementInvitationWording() {
  return (
    <div className="site">
      <SiteHeader />
      <main>
        <section className="page-head">
          <p className="eyebrow">Wording guide</p>
          <h1>
            Engagement invitation wording, <em className="gold-foil">with examples</em>
          </h1>
          <p className="lede">
            Good engagement wording answers four questions in order: who
            is hosting, who is getting engaged, when and where, and how
            guests reply. Everything below is a starting point — swap in
            your own names, dates and venues, and keep the lines that
            fit your family.
          </p>
          <Link to="/templates" className="btn btn-solid">
            See the designs <ArrowRight size={16} />
          </Link>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">The essentials</p>
            <h2>
              What to include, <em>in order</em>
            </h2>
          </header>
          <p className="lede">
            1. The hosts — usually the bride&apos;s family, or the
            couple themselves. 2. The couple&apos;s names, exactly as
            you want guests to see them. 3. The date, day and time of
            the engagement ceremony. 4. The venue, with enough detail
            for guests to find it. 5. How to reply — a phone number or
            a reply link on the invitation itself.
          </p>
          <p className="lede">
            Two things are worth deciding before you write: whether the
            wedding date will be announced on this invitation or later,
            and whether the engagement is a small family ceremony or a
            larger celebration — the wording stays the same shape
            either way, but the tone follows the occasion.
          </p>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">Examples</p>
            <h2>
              Wording you can <em>adapt</em>
            </h2>
          </header>
          <p className="lede">
            Traditional, from the parents: “Mr. and Mrs. Mehta request
            the honour of your presence at the engagement of their
            daughter Priya to Arjun, on Saturday, 12 December, at 7 in
            the evening, at the Grand Hall, Jaipur. Dinner to follow.”
          </p>
          <p className="lede">
            From the couple: “Priya and Arjun invite you to celebrate
            their engagement with them on Saturday, 12 December, at 7
            in the evening, at the Grand Hall, Jaipur.”
          </p>
          <p className="lede">
            Short, for a digital invitation: “Priya and Arjun are
            engaged — join us on Saturday, 12 December, 7 pm, Grand
            Hall, Jaipur. Please reply on this invitation.”
          </p>
          <p className="lede">
            With the wedding date announced: “Priya and Arjun invite you
            to their engagement on Saturday, 12 December, at 7 in the
            evening, at the Grand Hall, Jaipur. Their wedding will
            follow in the spring.”
          </p>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">After the engagement</p>
            <h2>
              One invitation, <em>then the next</em>
            </h2>
          </header>
          <p className="lede">
            An engagement invitation is not a wedding invitation, and
            guests do not expect the full wedding details on it. When
            the wedding is planned, send a separate wedding invitation
            with its own wording — the site&apos;s{" "}
            <Link to="/wedding-invitation-wording">
              wedding invitation wording guide
            </Link>{" "}
            covers that in the same shape as this page.
          </p>
          <p className="lede">
            For community-specific invitations, the site&apos;s occasion
            pages carry designs and wording notes of their own:{" "}
            <Link to="/hindu-wedding-invitations">Hindu</Link>,{" "}
            <Link to="/muslim-wedding-invitations">Muslim</Link>,{" "}
            <Link to="/sikh-wedding-invitations">Sikh</Link> and{" "}
            <Link to="/christian-wedding-invitations">Christian</Link>{" "}
            wedding invitations.
          </p>
        </section>

        <section className="faq" id="faq">
          <header className="section-head">
            <p className="eyebrow">Questions</p>
            <h2>
              Before you <em>write yours</em>
            </h2>
          </header>
          <div className="faq-list">
            {FAQS.map((item, i) => (
              <details key={i} className="faq-item">
                <summary>
                  {item.q}
                  <ChevronDown size={18} className="faq-chevron" />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="page-head" style={{ textAlign: "center" }}>
          <p className="lede">
            Choose a design, add your names and wording, and share a link
            your guests open on their phone — {PUBLISH_PRICE_LABEL}{" "}
            one-time, no subscription.
          </p>
          <Link to="/create" className="btn btn-solid">
            Start your invitation <ArrowRight size={16} />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
