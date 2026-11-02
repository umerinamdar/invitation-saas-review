import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { absoluteUrl, PUBLISH_PRICE_LABEL } from "@/config/site";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { faqJsonLd } from "@/components/site/occasion-landing";

const TITLE = `Mehendi Invitation Wording Examples — ${BRAND}`;
const DESCRIPTION = `How to word a mehendi invitation: what to include, short examples for the henna ceremony, and what guests need to know about timing, venue, dress code and music — wording you can adapt for your own invitation.`;
const OG_URL = absoluteUrl("/mehendi-invitation-wording");

const FAQS = [
  {
    q: "What must a mehendi invitation wording always include?",
    a: "Who is hosting, who the mehendi is for, the date and time of the ceremony, the venue, and how guests should reply. A note about dress code or music helps too, since mehendi is usually a relaxed, musical gathering and guests often wear bright colours.",
  },
  {
    q: "How is mehendi wording different from wedding wording?",
    a: "A mehendi invitation is for one pre-wedding ceremony, not the wedding itself. It does not need the full wedding schedule — name the person being celebrated, the mehendi day and time, and the home or venue, and keep the wedding details for the wedding invitation.",
  },
  {
    q: "Should the wording mention henna, dress code or music?",
    a: "It is worth one line if it matters to your celebration — for example that guests are welcome to wear bright colours, or that music and dancing will follow the henna. These are optional — if there is no dress code or music plan, leave them out rather than inventing one.",
  },
  {
    q: "Do I pay extra for a different wording?",
    a: `No. The wording is part of your invitation, and publishing it costs ${PUBLISH_PRICE_LABEL} one-time, no subscription, whatever wording you choose.`,
  },
];

export const Route = createFileRoute("/mehendi-invitation-wording")({
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
  component: MehendiInvitationWording,
});

function MehendiInvitationWording() {
  return (
    <div className="site">
      <SiteHeader />
      <main>
        <section className="page-head">
          <p className="eyebrow">Wording guide</p>
          <h1>
            Mehendi invitation wording, <em className="gold-foil">with examples</em>
          </h1>
          <p className="lede">
            Good mehendi wording answers four questions in order: who is
            hosting, who the mehendi is for, when and where, and how
            guests reply. Everything below is a starting point — swap
            in your own names, dates and venues, and keep the lines
            that fit your family.
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
            1. The hosts — usually the family, or the couple
            themselves. 2. Who the mehendi is for, by name, exactly as
            you want guests to see it. 3. The date, day and time of
            the mehendi ceremony — mehendi is often an afternoon or
            early-evening gathering, so give the start time clearly
            rather than leaving guests to guess. 4. The venue, with
            enough detail for guests to find it — often a home, so
            give the address clearly. 5. How to reply — a phone
            number or a reply link on the invitation itself.
          </p>
          <p className="lede">
            Two things are worth deciding before you write: whether
            the mehendi is a small family gathering or a larger
            celebration with music and dancing, and whether you want
            to mention a dress code — the wording stays the same
            shape either way, but the tone follows the occasion.
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
            Traditional, from the family: “Mr. and Mrs. Kapoor request
            the pleasure of your company at the mehendi ceremony of
            their daughter Riya, on Friday, 11 December, at 4 in the
            afternoon, at the Kapoor residence, Delhi.”
          </p>
          <p className="lede">
            From the family, with music and dress code: “Join us for
            Riya&apos;s mehendi on Friday, 11 December, at 4 in the
            afternoon, at the Kapoor residence, Delhi. Music and
            dancing to follow — guests are welcome to wear bright
            colours.”
          </p>
          <p className="lede">
            Short, for a digital invitation: “Riya&apos;s mehendi —
            Friday, 11 December, 4 pm, Kapoor residence, Delhi.
            Please reply on this invitation.”
          </p>
          <p className="lede">
            For a couple&apos;s mehendi: “Riya and Aman invite you
            to celebrate their mehendi with them on Friday, 11
            December, at 4 in the afternoon, at the Kapoor residence,
            Delhi.”
          </p>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">One ceremony, not the whole wedding</p>
            <h2>
              Keep the wedding details <em>for later</em>
            </h2>
          </header>
          <p className="lede">
            A mehendi invitation is not a wedding invitation, and guests
            do not expect the full wedding details on it. When the
            wedding is planned, send a separate wedding invitation
            with its own wording — the site&apos;s{" "}
            <Link to="/wedding-invitation-wording">
              wedding invitation wording guide
            </Link>{" "}
            covers that, and the{" "}
            <Link to="/engagement-invitation-wording">
              engagement invitation wording guide
            </Link>{" "}
            and{" "}
            <Link to="/haldi-invitation-wording">
              haldi invitation wording guide
            </Link>{" "}
            cover those ceremonies in the same shape as this page.
          </p>
          <p className="lede">
            For community-specific invitations, the site&apos;s
            occasion pages carry designs and wording notes of their
            own:{" "}
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
