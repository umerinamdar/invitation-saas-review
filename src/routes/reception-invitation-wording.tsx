import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { absoluteUrl, PUBLISH_PRICE_LABEL } from "@/config/site";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { faqJsonLd } from "@/components/site/occasion-landing";

const TITLE = `Reception Invitation Wording Examples — ${BRAND}`;
const DESCRIPTION = `How to word a reception invitation: what to include, short examples for the evening celebration after the wedding, and what guests need to know about timing, venue, dinner and dress code — wording you can adapt for your own invitation.`;
const OG_URL = absoluteUrl("/reception-invitation-wording");

const FAQS = [
  {
    q: "What must a reception invitation wording always include?",
    a: "Who is hosting, the couple's names, the date and time of the reception, the venue, and how guests should reply. A line about dinner or the celebration that follows helps too, since a reception is usually an evening event and guests plan around the meal.",
  },
  {
    q: "How is reception wording different from wedding wording?",
    a: "A reception invitation is for the celebration that follows the wedding, not the ceremony itself. It does not need the ceremony details — lead with the hosts and the reception date, name the couple being celebrated, and note the dinner or celebration that follows.",
  },
  {
    q: "Should the wording mention dinner, dress code or the wedding itself?",
    a: "One line about dinner or the celebration is worth including when it is part of the evening. A dress code is optional — mention it only if guests genuinely need it. If the wedding has already taken place, a short line such as 'following their wedding' is enough; the ceremony details belong on the wedding invitation, not here.",
  },
  {
    q: "Do I pay extra for a different wording?",
    a: `No. The wording is part of your invitation, and publishing it costs ${PUBLISH_PRICE_LABEL} one-time, no subscription, whatever wording you choose.`,
  },
];

export const Route = createFileRoute("/reception-invitation-wording")({
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
  component: ReceptionInvitationWording,
});

function ReceptionInvitationWording() {
  return (
    <div className="site">
      <SiteHeader />
      <main>
        <section className="page-head">
          <p className="eyebrow">Wording guide</p>
          <h1>
            Reception invitation wording, <em className="gold-foil">with examples</em>
          </h1>
          <p className="lede">
            Good reception wording answers four questions in order: who is
            hosting, who is being celebrated, when and where, and how
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
            1. The hosts — usually the couple&apos;s families, or the
            couple themselves. 2. The couple&apos;s names, exactly as
            you want guests to see them. 3. The date, day and time of
            the reception — receptions are usually evening events, so
            give the start time clearly rather than leaving guests to
            guess. 4. The venue, with enough detail for guests to find
            it. 5. How to reply — a phone number or a reply link on
            the invitation itself.
          </p>
          <p className="lede">
            Two things are worth deciding before you write: whether
            dinner or another celebration follows the reception, and
            whether there is a dress code worth mentioning — the
            wording stays the same shape either way, but the tone
            follows the occasion.
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
            Traditional, from the families: “Mr. and Mrs. Verma, together
            with Mr. and Mrs. Kapoor, request the pleasure of your
            company at the wedding reception of their children Ananya
            and Vikram, on Sunday, 13 December, at 7 in the evening,
            at the Grand Hall, Jaipur. Dinner to follow.”
          </p>
          <p className="lede">
            From the couple: “Ananya and Vikram invite you to celebrate
            their wedding reception with them on Sunday, 13 December,
            at 7 in the evening, at the Grand Hall, Jaipur. Dinner and
            music to follow.”
          </p>
          <p className="lede">
            Short, for a digital invitation: “Ananya and Vikram&apos;s
            wedding reception — Sunday, 13 December, 7 pm, Grand Hall,
            Jaipur. Please reply on this invitation.”
          </p>
          <p className="lede">
            Following a wedding already held: “Ananya and Vikram invite
            you to a reception following their wedding, on Sunday, 13
            December, at 7 in the evening, at the Grand Hall, Jaipur.
            Dinner to follow.”
          </p>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">One celebration, not the whole wedding</p>
            <h2>
              Keep the ceremony details <em>for the wedding invitation</em>
            </h2>
          </header>
          <p className="lede">
            A reception invitation is not a wedding invitation, and guests
            do not expect the ceremony details on it. When the wedding
            itself is being invited to, send a separate wedding invitation
            with its own wording — the site&apos;s{" "}
            <Link to="/wedding-invitation-wording">
              wedding invitation wording guide
            </Link>{" "}
            covers that, and the{" "}
            <Link to="/engagement-invitation-wording">
              engagement invitation wording guide
            </Link>
            ,{" "}
            <Link to="/haldi-invitation-wording">
              haldi invitation wording guide
            </Link>{" "}
            and{" "}
            <Link to="/mehendi-invitation-wording">
              mehendi invitation wording guide
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
