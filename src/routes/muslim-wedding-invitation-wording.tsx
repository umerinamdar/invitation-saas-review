import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { absoluteUrl, PUBLISH_PRICE_LABEL } from "@/config/site";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { faqJsonLd } from "@/components/site/occasion-landing";

const TITLE = `Muslim Wedding Invitation Wording Explained — ${BRAND}`;
const DESCRIPTION = `What each part of a Muslim wedding invitation means — the Bismillah opening, the hosts, the couple, and every function from mehendi to Nikah and Walima — and how it works as one digital invitation you can share on WhatsApp.`;
const OG_URL = absoluteUrl("/muslim-wedding-invitation-wording");

const FAQS = [
  {
    q: "What must Muslim wedding invitation wording always include?",
    a: "The Bismillah opening, the hosts, the bride and groom's names, the date and time of the Nikah, the venue, and how guests should reply. If there is a Walima, it needs its own date, time and venue too.",
  },
  {
    q: "Does the wording have to name every function?",
    a: "Only the ones guests are invited to. A wedding with mehendi, Nikah and Walima lists each as its own entry; a smaller wedding with just the Nikah and a Walima lists those two. Naming a function guests are not invited to causes confusion, not completeness.",
  },
  {
    q: "Can the invitation be in Urdu or Arabic?",
    a: "Yes. The wording is yours to write, in whatever language or script your family uses, and the invitation accepts it as typed. Many families keep the Bismillah in Arabic and write the details in English, or the other way round.",
  },
  {
    q: "Do I pay extra for a longer invitation with more functions?",
    a: `No. The wording and the number of functions are part of your invitation, and publishing it costs ${PUBLISH_PRICE_LABEL} one-time, no subscription, whatever wording you choose.`,
  },
];

export const Route = createFileRoute("/muslim-wedding-invitation-wording")({
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
  component: MuslimWeddingInvitationWording,
});

function MuslimWeddingInvitationWording() {
  return (
    <div className="site">
      <SiteHeader />
      <main>
        <section className="page-head">
          <p className="eyebrow">Wording guide</p>
          <h1>
            Muslim wedding invitation wording,{" "}
            <em className="gold-foil">explained</em>
          </h1>
          <p className="lede">
            A Muslim wedding invitation follows a familiar order: an
            opening in the name of Allah, the hosts, the couple, then
            the functions one by one. This page explains what each
            part means, so you can write yours with confidence — and
            how the same wording works on a digital invitation your
            guests open from one link.
          </p>
          <Link to="/templates" className="btn btn-solid">
            See the designs <ArrowRight size={16} />
          </Link>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">First line</p>
            <h2>
              The Bismillah, <em>at the top</em>
            </h2>
          </header>
          <p className="lede">
            Most Muslim invitations open with “Bismillah-ir-Rahman-ir-Rahim”
            — “In the name of Allah, the Most Gracious, the Most
            Merciful”. It sits above everything else on the
            invitation, before any names or dates, and on a digital
            invitation it is usually the first thing guests see when
            the cover opens.
          </p>
          <p className="lede">
            Some families follow it with a short verse, such as the one
            from Surah Ar-Rum (30:21) about the love and mercy placed
            between spouses. The shape is the same either way: one
            short opening line, then the invitation itself. Keep it to
            a line or two; a long passage pushes the couple&apos;s
            names and the date down the screen on a phone.
          </p>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">Who is inviting</p>
            <h2>
              The hosts, <em>first</em>
            </h2>
          </header>
          <p className="lede">
            After the opening come the hosts — usually the parents of
            the bride and the groom, named together. Their names lead
            because, traditionally, it is the parents who invite the
            guests to their children&apos;s wedding, and guests look
            for a familiar family name before they read anything else.
            “Mr. and Mrs. Khan, together with Mr. and Mrs. Ahmed,
            request the honour of your presence at the Nikah of their
            children” is the classic shape.
          </p>
          <p className="lede">
            Some couples host the wedding themselves, in which case
            the wording says so plainly — “Ayesha and Imran invite
            you to celebrate their wedding” — and the parents&apos;
            names appear as a blessing line instead. Either way, say
            who is doing the inviting in the first lines; guests
            should never have to guess whose wedding this is.
          </p>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">The couple</p>
            <h2>
              Bride and groom, <em>by name</em>
            </h2>
          </header>
          <p className="lede">
            The couple&apos;s names are the centre of the invitation,
            and they deserve their own space — full names, spelled
            exactly as your families use them, with the bride&apos;s
            name usually first in the families&apos; own order. On a
            digital invitation the names are also the part guests see
            largest, so check the spelling twice before you share the
            link: a name is the one detail guests notice at once and
            remember.
          </p>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">The schedule</p>
            <h2>
              Every function, <em>in order</em>
            </h2>
          </header>
          <p className="lede">
            A Muslim wedding is usually several occasions, not one, and
            each needs its own entry with its own date, time and
            venue. In the order guests usually attend them:
          </p>
          <p className="lede">
            Mehendi — the henna ceremony, where the bride&apos;s hands
            and feet are decorated with henna, often with music and
            family gathered around her. Nikah — the wedding ceremony
            itself, where the marriage contract is agreed and
            announced before witnesses, and the couple are married.
            It is often held at a mosque or at home, and sometimes at
            the same venue as the Walima. Rukhsati — the bride&apos;s
            farewell from her family home, a short and emotional
            moment after the Nikah. Walima — the reception feast
            hosted by the groom&apos;s family, usually the largest
            gathering of the wedding, where guests meet the couple
            and dine together.
          </p>
          <p className="lede">
            Only list the functions your guests are invited to, and
            give each its own date, time and venue — a function that
            appears only as a line inside the Nikah wording is the
            one guests turn up late, or not at all, for. Wording for
            individual functions follows the same shape as this page:
            the{" "}
            <Link to="/mehendi-invitation-wording">
              mehendi invitation wording guide
            </Link>{" "}
            covers the mehendi, and the{" "}
            <Link to="/reception-invitation-wording">
              reception invitation wording guide
            </Link>{" "}
            covers the Walima.
          </p>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">When and where</p>
            <h2>
              Venue, date and time, <em>for each function</em>
            </h2>
          </header>
          <p className="lede">
            Every function needs three details: the day and date, the
            time, and the venue with enough detail for guests to find
            it — the venue name and the area, plus directions. A date
            without a time leaves guests guessing, and a time without
            the day of the week is easy to misread. Functions often
            happen at different places — mehendi at home, the Nikah
            at the mosque, the Walima at a hall — so do not assume one
            venue covers them all.
          </p>
          <p className="lede">
            On a digital invitation each function can carry its own
            map link, so guests tap straight to directions instead of
            typing an address into a search box.
          </p>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">How guests reply</p>
            <h2>
              The RSVP, <em>on the invitation</em>
            </h2>
          </header>
          <p className="lede">
            End with how guests should reply — a phone number, or a
            reply link on the invitation itself — and by when, if you
            need numbers for catering or seating. Guests reply from
            the same page they read, so the reply is one tap away
            rather than a separate message to find later.
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
            Traditional, from the parents: “In the name of Allah, the
            Most Gracious, the Most Merciful. Mr. and Mrs. Khan,
            together with Mr. and Mrs. Ahmed, request the honour of
            your presence at the Nikah of their daughter Ayesha to
            Imran, on Friday, 11 December, at 7 in the evening, at
            the Rosewood Banquet, Jaipur. Walima to follow on
            Saturday, 12 December.”
          </p>
          <p className="lede">
            With the functions listed: “Bismillah-ir-Rahman-ir-Rahim.
            Mr. and Mrs. Khan invite you to celebrate the wedding of
            their daughter Ayesha with Imran. Mehendi — Thursday, 10
            December, 4 pm, Khan residence. Nikah — Friday, 11
            December, 7 pm, Rosewood Banquet. Walima — Saturday, 12
            December, 7 pm, Rosewood Banquet.”
          </p>
          <p className="lede">
            Short, for a digital invitation: “Ayesha weds Imran —
            Nikah Friday, 11 December, 7 pm, Rosewood Banquet,
            Jaipur. Walima Saturday 7 pm. Please reply on this
            invitation.”
          </p>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">As a digital invitation</p>
            <h2>
              One link, <em>the whole wedding</em>
            </h2>
          </header>
          <p className="lede">
            On paper, a Muslim wedding often needs several cards — one
            for the Nikah, one for the Walima, sometimes one for the
            mehendi. A digital invitation carries the whole schedule
            in one link: the Bismillah and the hosts first, the
            couple, then each function in order, with its own date,
            time and venue. Guests open one link and scroll through
            the wedding in the order it happens, instead of keeping
            track of several cards.
          </p>
          <p className="lede">
            The design built for Muslim weddings carries the same order
            in its opening: the Noor Invitation is a deep emerald and
            antique gold keepsake book that opens onto a moonlit
            mosque courtyard, greeted by a Quran verse, with the
            blessing and the couple&apos;s names following. See the{" "}
            <Link to="/muslim-wedding-invitations">
              Muslim wedding invitations page
            </Link>{" "}
            for that design, and the{" "}
            <Link to="/templates">full list of designs</Link>. Because
            the invitation is a live page, not a printed card, you can
            correct a time or a venue after sending — the link stays
            the same, so guests always open the latest version. The{" "}
            <Link to="/share-invitation-on-whatsapp">
              guide to sharing on WhatsApp
            </Link>{" "}
            covers how to send it, and the{" "}
            <Link to="/wedding-invitation-wording">
              wedding invitation wording guide
            </Link>{" "}
            covers the general wording shape this page follows.
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
