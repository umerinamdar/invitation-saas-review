import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { absoluteUrl, PUBLISH_PRICE_LABEL } from "@/config/site";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { faqJsonLd } from "@/components/site/occasion-landing";

const TITLE = `Wedding Invitation Wording Examples — ${BRAND}`;
const DESCRIPTION = `How to word a wedding invitation: what to include, short examples for weddings, engagements, haldi, mehendi and receptions, and wording you can adapt for your own invitation.`;
const OG_URL = absoluteUrl("/wedding-invitation-wording");

const FAQS = [
  {
    q: "What must a wedding invitation wording always include?",
    a: "The hosts, the couple's names, the date and time, the venue, and how guests should reply. Everything else — dress code, a note about gifts, or a line about children — is optional, and only worth adding if your guests genuinely need it.",
  },
  {
    q: "How long should the wording be?",
    a: "Short enough to read on a phone screen without scrolling past the date. One line for who is inviting, one for the couple, one for when and where, and one for the reply is usually enough; the full schedule of functions can follow on the invitation's own pages.",
  },
  {
    q: "Can I write the invitation in my own language or script?",
    a: "Yes. The editor's text fields accept whatever you type, in any language or script your phone's keyboard supports.",
  },
  {
    q: "Do I pay extra for a different wording?",
    a: `No. The wording is part of your invitation, and publishing it costs ${PUBLISH_PRICE_LABEL} one-time, no subscription, whatever wording you choose.`,
  },
];

export const Route = createFileRoute("/wedding-invitation-wording")({
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
  component: WeddingInvitationWording,
});

function WeddingInvitationWording() {
  return (
    <div className="site">
      <SiteHeader />
      <main>
        <section className="page-head">
          <p className="eyebrow">Wording guide</p>
          <h1>
            Wedding invitation wording, <em className="gold-foil">with examples</em>
          </h1>
          <p className="lede">
            Good wording answers four questions in order: who is inviting,
            who is getting married, when and where, and how guests reply.
            Everything below is a starting point — swap in your own names,
            dates and venues, and keep the lines that fit your family.
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
            1. The hosts — usually the parents, or the couple themselves.
            2. The couple&apos;s names, exactly as you want guests to see
            them. 3. The date, day and time of the wedding. 4. The venue,
            with enough detail for guests to find it. 5. How to reply —
            a phone number or a reply link on the invitation itself.
          </p>
          <p className="lede">
            If you are holding haldi, mehendi or a
            reception as well, list each function with its own date and
            time rather than folding them into one line — guests miss
            details that are buried in a paragraph.
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
            Traditional, from the parents: “Mr. and Mrs. Sharma request the
            honour of your presence at the wedding of their daughter Asha
            to Rohan, on Saturday, 12 December, at 7 in the evening, at
            the Grand Hall, Jaipur. Dinner to follow.”
          </p>
          <p className="lede">
            From the couple: “Asha and Rohan invite you to celebrate their
            wedding with them on Saturday, 12 December, at 7 in the
            evening, at the Grand Hall, Jaipur.”
          </p>
          <p className="lede">
            Short, for a digital invitation: “Asha weds Rohan — Saturday,
            12 December, 7 pm, Grand Hall, Jaipur. Please reply on this
            invitation.”
          </p>
          <p className="lede">
            For haldi or mehendi, keep the same shape and change only the
            function: “Join us for Asha&apos;s mehendi on Thursday,
            10 December, at 4 in the afternoon, at the Sharma residence,
            Jaipur.”
          </p>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">By occasion</p>
            <h2>
              One shape, <em>every function</em>
            </h2>
          </header>
          <p className="lede">
            Engagement: lead with the couple and the engagement date, and
            say whether the wedding date will follow on the same
            invitation or a later one. Haldi and mehendi: name the person
            being celebrated, the day, and the home or venue — these are
            daytime, family functions, so the time matters more than
            formality. Reception: lead with the hosts and the reception
            date, and note the dinner or celebration that follows.
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
