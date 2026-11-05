import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { absoluteUrl, PUBLISH_PRICE_LABEL } from "@/config/site";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { faqJsonLd } from "@/components/site/occasion-landing";

const TITLE = `What to Include in a Digital Wedding Invitation — ${BRAND}`;
const DESCRIPTION = `A checklist for a digital wedding invitation: hosts, couple, date and time, venue with directions, how guests reply, every function from haldi to reception, plus the digital extras — photos, music, countdown and a link you can edit after sending.`;
const OG_URL = absoluteUrl("/what-to-include-in-a-digital-wedding-invitation");

const FAQS = [
  {
    q: "What must every digital wedding invitation include?",
    a: "The hosts, the couple's names, the date and time of the main ceremony, the venue with enough detail for guests to find it, and how guests should reply. Everything else on this checklist is useful, but those five are the ones guests cannot do without.",
  },
  {
    q: "Do I need a separate invitation for each function?",
    a: "No. One digital invitation can carry every function — haldi, mehendi, reception and the wedding itself — each with its own date, time, venue and dress code. Guests open one link and find the whole schedule in order, instead of keeping track of several invitations.",
  },
  {
    q: "Can I change details after I have shared the link?",
    a: "Yes. A published invitation stays editable, so you can correct a time, a venue or a spelling from your dashboard and the same link shows the updated version. Guests who open it afterwards see the latest details, and you do not need to send a new link.",
  },
  {
    q: "Do guests need an app or an account to open it?",
    a: "No. The invitation is a normal web page, so it opens in the phone's browser from a WhatsApp chat, SMS or email. Guests do not need to install anything or sign in.",
  },
  {
    q: "Does adding more functions or details change the price?",
    a: `No. Publishing costs ${PUBLISH_PRICE_LABEL} one-time per invitation, with no subscription, however many functions, photos or details you include. The price is for the published invitation and its shareable link, not for each item on it.`,
  },
];

export const Route = createFileRoute("/what-to-include-in-a-digital-wedding-invitation")({
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
  component: WhatToIncludeInADigitalWeddingInvitation,
});

function WhatToIncludeInADigitalWeddingInvitation() {
  return (
    <div className="site">
      <SiteHeader />
      <main>
        <section className="page-head">
          <p className="eyebrow">Checklist</p>
          <h1>
            What to include in a digital wedding invitation,{" "}
            <em className="gold-foil">checked off</em>
          </h1>
          <p className="lede">
            A digital invitation is one link your guests open on their
            phone, so it has to answer everything a paper card would —
            and a few things only a live page can. Work through this
            checklist before you share it, and nothing your guests
            need will be missing.
          </p>
          <Link to="/templates" className="btn btn-solid">
            See the designs <ArrowRight size={16} />
          </Link>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">Must-have</p>
            <h2>
              The five details guests <em>cannot do without</em>
            </h2>
          </header>
          <p className="lede">
            1. The hosts — usually the parents, or the couple
            themselves. Guests want to know whose invitation this is
            before they read anything else.
          </p>
          <p className="lede">
            2. The couple&apos;s names, exactly as you want guests to
            see them, including the spelling and order your families
            use.
          </p>
          <p className="lede">
            3. The date, day and time of the main ceremony. A date
            without a time leaves guests guessing, and a time without
            the day of the week is easy to misread.
          </p>
          <p className="lede">
            4. The venue, with enough detail for guests to find it —
            the venue name and the area, plus directions. A digital
            invitation can link straight to a map, so guests are not
            left typing an address into a search box.
          </p>
          <p className="lede">
            5. How to reply — a phone number or a reply link on the
            invitation itself, so guests know whether you expect a
            reply and where to send it.
          </p>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">Every function</p>
            <h2>
              One invitation, <em>the whole schedule</em>
            </h2>
          </header>
          <p className="lede">
            Most weddings are several occasions, not one, and guests
            miss details that are buried in a paragraph. Give each
            function its own entry, with its own date, time, venue and
            dress code: the wedding itself, plus the engagement, the
            haldi, the mehendi and the reception, as they apply to
            you. A function that only appears as a line inside the
            wedding wording is the one guests turn up late — or not
            at all — for.
          </p>
          <p className="lede">
            Wording for each occasion follows the same shape, with the
            function changed: the{" "}
            <Link to="/wedding-invitation-wording">
              wedding invitation wording guide
            </Link>
            , the{" "}
            <Link to="/engagement-invitation-wording">
              engagement invitation wording guide
            </Link>
            , the{" "}
            <Link to="/haldi-invitation-wording">
              haldi invitation wording guide
            </Link>
            , the{" "}
            <Link to="/mehendi-invitation-wording">
              mehendi invitation wording guide
            </Link>{" "}
            and the{" "}
            <Link to="/reception-invitation-wording">
              reception invitation wording guide
            </Link>
            . For community-specific invitations, see the{" "}
            <Link to="/hindu-wedding-invitations">Hindu</Link>,{" "}
            <Link to="/muslim-wedding-invitations">Muslim</Link>,{" "}
            <Link to="/sikh-wedding-invitations">Sikh</Link> and{" "}
            <Link to="/christian-wedding-invitations">Christian</Link>{" "}
            wedding invitation pages.
          </p>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">Digital-only extras</p>
            <h2>
              What a live page <em>adds</em>
            </h2>
          </header>
          <p className="lede">
            Photos: a gallery of the couple, so the invitation feels
            personal rather than generic. Music: a track of your
            choice, or one from the design&apos;s own library, played
            as guests open it. A live countdown to the day, so the
            date stays in front of guests rather than on a card pinned
            to a fridge.
          </p>
          <p className="lede">
            Directions for every venue, not just the main one — each
            function can carry its own map link. And because the
            invitation is a live page, not a printed card, you can
            correct it after sending: the link stays the same, so
            guests always open the latest version.
          </p>
          <p className="lede">
            Sharing itself belongs on the checklist too: the invitation
            is sent as one link, not as a file or a screenshot. The{" "}
            <Link to="/share-invitation-on-whatsapp">
              guide to sharing on WhatsApp
            </Link>{" "}
            covers how to send it — design it, publish it, copy the
            link, and paste it into a chat or group.
          </p>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">Worth adding, if guests need it</p>
            <h2>
              Optional, <em>not automatic</em>
            </h2>
          </header>
          <p className="lede">
            Dress code, where it genuinely helps guests decide what to
            wear — per function, since a daytime haldi and an evening
            reception rarely call for the same thing. A note about
            gifts, children, or photography, only if your guests
            genuinely need it; a line nobody asked for is clutter on
            a phone screen.
          </p>
          <p className="lede">
            Travel and stay notes for out-of-town guests, where the
            venue is away from home. And the wording itself: short
            enough to read on a phone without scrolling past the
            date — one line for who is inviting, one for the couple,
            one for when and where, and one for the reply, with the
            full schedule following on the invitation&apos;s own
            pages.
          </p>
          <p className="lede">
            What to leave out: anything guests do not need to act on.
            If a detail does not change when guests arrive, what they
            wear, or how they reply, it is decoration, not
            information — and on a phone screen, decoration that
            pushes the date down costs you the one thing guests came
            to find.
          </p>
        </section>

        <section className="faq" id="faq">
          <header className="section-head">
            <p className="eyebrow">Questions</p>
            <h2>
              Before you <em>share yours</em>
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
