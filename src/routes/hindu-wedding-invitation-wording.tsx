import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { absoluteUrl, PUBLISH_PRICE_LABEL } from "@/config/site";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { faqJsonLd } from "@/components/site/occasion-landing";

const TITLE = `Hindu Wedding Invitation Wording Explained — ${BRAND}`;
const DESCRIPTION = `What each part of a Hindu wedding invitation means — the blessing line, the hosts, the couple, and every ceremony from haldi to reception — and how it works as one digital invitation you can share on WhatsApp.`;
const OG_URL = absoluteUrl("/hindu-wedding-invitation-wording");

const FAQS = [
  {
    q: "What must Hindu wedding invitation wording always include?",
    a: "The blessing line, the hosts, the bride and groom's names, the date and time of the main ceremony, the venue, and how guests should reply. If there are several functions, each one needs its own date, time and venue too.",
  },
  {
    q: "Does the wording have to name every ceremony?",
    a: "Only the ones guests are invited to. A wedding with haldi, mehendi, sangeet and a reception lists each as its own entry; a smaller wedding with just the pheras and a reception lists those two. Naming a ceremony guests are not invited to causes confusion, not completeness.",
  },
  {
    q: "Can the invitation be in Hindi or another language?",
    a: "Yes. The wording is yours to write, in whatever language or script your family uses, and the invitation accepts it as typed. Many families keep the blessing line in Sanskrit or Hindi and write the details in English, or the other way round.",
  },
  {
    q: "Do I pay extra for a longer invitation with more functions?",
    a: `No. The wording and the number of functions are part of your invitation, and publishing it costs ${PUBLISH_PRICE_LABEL} one-time, no subscription, whatever wording you choose.`,
  },
];

export const Route = createFileRoute("/hindu-wedding-invitation-wording")({
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
  component: HinduWeddingInvitationWording,
});

function HinduWeddingInvitationWording() {
  return (
    <div className="site">
      <SiteHeader />
      <main>
        <section className="page-head">
          <p className="eyebrow">Wording guide</p>
          <h1>
            Hindu wedding invitation wording,{" "}
            <em className="gold-foil">explained</em>
          </h1>
          <p className="lede">
            A Hindu wedding invitation follows a familiar order: a
            blessing, the hosts, the couple, then the ceremonies one
            by one. This page explains what each part means, so you
            can write yours with confidence — and how the same wording
            works on a digital invitation your guests open from one
            link.
          </p>
          <Link to="/templates" className="btn btn-solid">
            See the designs <ArrowRight size={16} />
          </Link>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">First line</p>
            <h2>
              The blessing, <em>at the top</em>
            </h2>
          </header>
          <p className="lede">
            Most Hindu invitations open with an invocation to Lord
            Ganesha — “Shri Ganeshaya Namah”, or a short line asking
            for his blessing on the occasion. Ganesha is honoured
            first because he is the remover of obstacles, so the
            blessing is a wish that the wedding goes smoothly. It sits
            above everything else on the invitation, before any names
            or dates, and on a digital invitation it is usually the
            first thing guests see when the cover opens.
          </p>
          <p className="lede">
            Some families use a different opening — a line from
            scripture, a verse, or a simple “With the blessings of”
            followed by the names of grandparents or elders. The shape
            is the same either way: one short blessing line, then the
            invitation itself. Keep it to a line or two; a long verse
            pushes the couple&apos;s names and the date down the
            screen on a phone.
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
            After the blessing come the hosts — usually the parents of
            the bride and the groom, named together. Their names lead
            because, traditionally, it is the parents who invite the
            guests to their children&apos;s wedding, and guests look
            for a familiar family name before they read anything else.
            “Mr. and Mrs. Sharma, together with Mr. and Mrs. Verma,
            request the pleasure of your company at the wedding of
            their children” is the classic shape.
          </p>
          <p className="lede">
            Some couples host the wedding themselves, in which case
            the wording says so plainly — “Ananya and Vikram invite
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
              Every ceremony, <em>in order</em>
            </h2>
          </header>
          <p className="lede">
            A Hindu wedding is usually several occasions, not one, and
            each needs its own entry with its own date, time and
            venue. In the order guests usually attend them:
          </p>
          <p className="lede">
            Haldi — the turmeric ceremony, usually a daytime family
            gathering at home, where turmeric paste is applied to the
            bride and groom for good luck. Mehendi — the henna
            ceremony, where the bride&apos;s hands and feet are
            decorated with henna, often with music and dancing.
            Sangeet — an evening of music and dance, usually the
            liveliest function, where both families perform. Baraat —
            the groom&apos;s procession to the venue, with music and
            dancing, which guests are welcome to join. Pheras — the
            wedding ceremony itself, the vows around the sacred fire.
            Vidai — the bride&apos;s farewell from her family home,
            a short and emotional moment at the end of the wedding.
            Reception — the evening celebration after the wedding,
            where guests meet the couple and dine together.
          </p>
          <p className="lede">
            Only list the ceremonies your guests are invited to, and
            give each its own date, time and venue — a function that
            appears only as a line inside the wedding wording is the
            one guests turn up late, or not at all, for. Wording for
            individual functions follows the same shape as this page:
            the{" "}
            <Link to="/haldi-invitation-wording">
              haldi invitation wording guide
            </Link>{" "}
            and the{" "}
            <Link to="/mehendi-invitation-wording">
              mehendi invitation wording guide
            </Link>{" "}
            cover those two ceremonies, and the{" "}
            <Link to="/reception-invitation-wording">
              reception invitation wording guide
            </Link>{" "}
            covers the reception.
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
            happen at different places — haldi at home, the wedding at
            a hall — so do not assume one venue covers them all.
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
            Traditional, from the parents: “With the blessings of Shri
            Ganesh, Mr. and Mrs. Sharma, together with Mr. and Mrs.
            Verma, request the pleasure of your company at the wedding
            of their children, Ananya and Vikram, on Saturday, 12
            December, at 7 in the evening, at the Rosewood Banquet,
            Jaipur.”
          </p>
          <p className="lede">
            With the functions listed: “Shri Ganeshaya Namah. Mr. and
            Mrs. Sharma invite you to celebrate the wedding of their
            daughter Ananya with Vikram. Haldi — Thursday, 10
            December, 11 am, Sharma residence. Sangeet — Friday, 11
            December, 7 pm, Rosewood Banquet. Wedding and pheras —
            Saturday, 12 December, 7 pm, Rosewood Banquet.”
          </p>
          <p className="lede">
            Short, for a digital invitation: “Ananya weds Vikram —
            Saturday, 12 December, 7 pm, Rosewood Banquet, Jaipur.
            Haldi Thursday 11 am, sangeet Friday 7 pm. Please reply on
            this invitation.”
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
            On paper, a Hindu wedding often needs several cards — one
            for the wedding, one for the sangeet, one for the
            reception. A digital invitation carries the whole schedule
            in one link: the blessing and the hosts first, the couple,
            then each ceremony in order, with its own date, time and
            venue. Guests open one link and scroll through the wedding
            in the order it happens, instead of keeping track of
            several cards.
          </p>
          <p className="lede">
            The designs built for Hindu weddings carry the same order
            in their opening: the Ayodhya Ram Mandir design opens like
            a temple&apos;s carved doors, and the Golden Temple design
            opens the same way, with the blessing and the couple&apos;s
            names following. See the{" "}
            <Link to="/hindu-wedding-invitations">
              Hindu wedding invitations page
            </Link>{" "}
            for those designs, and the{" "}
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
