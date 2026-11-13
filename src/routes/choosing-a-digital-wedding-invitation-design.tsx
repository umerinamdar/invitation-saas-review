import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { absoluteUrl, PUBLISH_PRICE_LABEL } from "@/config/site";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { faqJsonLd } from "@/components/site/occasion-landing";

const TITLE = `Choosing a Digital Wedding Invitation Design — ${BRAND}`;
const DESCRIPTION = `How to choose a digital wedding invitation design: the six EasyInviteMaker designs explained — what each one looks like, which occasion it suits, and how to preview it live before you choose.`;
const OG_URL = absoluteUrl("/choosing-a-digital-wedding-invitation-design");

const FAQS = [
  {
    q: "How many designs are there to choose from?",
    a: "Six. Each one is a complete animated invitation with its own opening, artwork and palette, and every design costs the same to publish. There is no large catalogue to scroll through — the six are the whole collection.",
  },
  {
    q: "Can I see a design before I choose it?",
    a: "Yes. Every design on the templates page opens as a live invitation: tap any design to open the real thing, with its opening animation and sections in order, not a picture of it. You can look through all six before deciding.",
  },
  {
    q: "Which design suits a Hindu, Muslim, Sikh or Christian wedding?",
    a: "Ayodhya Ram Mandir is the saffron-and-cream temple design for Hindu weddings; Noor Invitation is the emerald-and-gold keepsake book for Muslim weddings; Golden Temple is the gold-and-white design for Sikh weddings; and Cathedral Light is the ivory-and-stone cathedral design for Christian weddings. Dubai Silk and Ivory Silk & Pearls suit any wedding.",
  },
  {
    q: "Do all six designs cost the same?",
    a: `Yes. Whichever design you choose, publishing it costs ${PUBLISH_PRICE_LABEL} one-time, no subscription. The price is the same for every design, so choose the one that fits your wedding, not the one that fits a budget.`,
  },
];

export const Route = createFileRoute(
  "/choosing-a-digital-wedding-invitation-design",
)({
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
  component: ChoosingADigitalWeddingInvitationDesign,
});

function ChoosingADigitalWeddingInvitationDesign() {
  return (
    <div className="site">
      <SiteHeader />
      <main>
        <section className="page-head">
          <p className="eyebrow">Design guide</p>
          <h1>
            Choosing a digital wedding invitation{" "}
            <em className="gold-foil">design</em>
          </h1>
          <p className="lede">
            A digital invitation is not a card your guests glance at
            once — it is a short experience they open on their phone,
            from a sealed cover through to the RSVP. So the design
            matters more than the paper ever did, and the choice is
            simpler than it looks: there are six designs, each one a
            complete animated invitation with its own opening,
            artwork and palette. This page explains what each one is,
            which occasion it suits, and how to pick between them.
          </p>
          <Link to="/templates" className="btn btn-solid">
            See the six designs <ArrowRight size={16} />
          </Link>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">First, the occasion</p>
            <h2>
              Start with <em>what you are inviting people to</em>
            </h2>
          </header>
          <p className="lede">
            Every design suits a wedding, and every design suits a
            reception. The differences show up at the edges: for an
            engagement, the choice is Dubai Silk, Ivory Silk &amp;
            Pearls, Noor Invitation or Cathedral Light. For haldi and
            mehendi, the choice is Ayodhya Ram Mandir — it is the one
            design built for those ceremonies as well as the wedding
            itself. If your wedding spans several days, pick the
            design that fits the main ceremony and let the wording
            carry the rest: the{" "}
            <Link to="/wedding-invitation-wording">
              wedding invitation wording guide
            </Link>{" "}
            covers how to list every function in order.
          </p>
          <p className="lede">
            Tradition is the other shortcut. A Hindu wedding, a
            Muslim wedding, a Sikh wedding and a Christian wedding
            each have a design made for them — Ram Mandir, Noor,
            Golden Temple and Cathedral Light, in that order — and
            each has its own page:{" "}
            <Link to="/hindu-wedding-invitations">
              Hindu wedding invitations
            </Link>
            ,{" "}
            <Link to="/muslim-wedding-invitations">
              Muslim wedding invitations
            </Link>
            ,{" "}
            <Link to="/sikh-wedding-invitations">
              Sikh wedding invitations
            </Link>{" "}
            and{" "}
            <Link to="/christian-wedding-invitations">
              Christian wedding invitations
            </Link>
            . If none of those applies, the remaining two designs —
            Dubai Silk and Ivory Silk &amp; Pearls — are made to suit
            any wedding.
          </p>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">The six designs</p>
            <h2>
              Each design, <em>explained</em>
            </h2>
          </header>
          <p className="lede">
            Open each one before you decide — every design below links
            to its live preview, so you can watch its opening and
            scroll through it exactly as your guests will.
          </p>

          <h3>Ayodhya Ram Mandir</h3>
          <p className="lede">
            Saffron and cream, with carved temple doors that swing
            open onto the Ram Mandir&apos;s sandstone spires at golden
            hour, strung with marigold garlands. Suits a wedding,
            haldi, mehendi or reception — the only design that covers
            all four. Best for a Hindu wedding, especially one that
            spans several days.{" "}
            <Link
              to="/preview/$themeId"
              params={{ themeId: "ram-mandir" }}
            >
              Preview Ayodhya Ram Mandir
            </Link>
            .
          </p>

          <h3>Dubai Silk</h3>
          <p className="lede">
            Powder-blue silk and gold, with a Dubai skyline. It opens
            through a wax-sealed envelope, with a cinematic arch
            reveal and a scratch-to-reveal muhurat. Suits a wedding,
            engagement or reception. Best for a modern city wedding
            or an engagement.{" "}
            <Link
              to="/preview/$themeId"
              params={{ themeId: "dubai-silk" }}
            >
              Preview Dubai Silk
            </Link>
            .
          </p>

          <h3>Ivory Silk &amp; Pearls</h3>
          <p className="lede">
            A pearl-trimmed silk envelope with an unhurried,
            three-beat opening — the cover clears fully before the
            names ever appear. Suits a wedding, engagement or
            reception. Best for a quiet, elegant wedding where the
            invitation should feel unhurried rather than grand.{" "}
            <Link
              to="/preview/$themeId"
              params={{ themeId: "ivory-silk-pearls" }}
            >
              Preview Ivory Silk &amp; Pearls
            </Link>
            .
          </p>

          <h3>Golden Temple</h3>
          <p className="lede">
            Gold and white, with gilded temple doors that swing open
            onto the Harmandir Sahib reflected in the Amrit Sarovar
            at dusk. Suits a wedding or reception. Best for a Sikh
            wedding.{" "}
            <Link
              to="/preview/$themeId"
              params={{ themeId: "golden-temple" }}
            >
              Preview Golden Temple
            </Link>
            .
          </p>

          <h3>Noor Invitation</h3>
          <p className="lede">
            Deep emerald and antique gold, a keepsake book that opens
            onto a moonlit mosque courtyard, greeted by a Quran verse
            (Ar-Rum 30:21). Suits a wedding, engagement or reception.
            Best for a Muslim wedding.{" "}
            <Link
              to="/preview/$themeId"
              params={{ themeId: "noor-invitation" }}
            >
              Preview Noor Invitation
            </Link>
            .
          </p>

          <h3>Cathedral Light</h3>
          <p className="lede">
            Ivory and warm stone, with carved oak doors that glide
            apart on a cathedral lit by its rose window and candles.
            Suits a wedding, engagement or reception. Best for a
            Christian wedding.{" "}
            <Link
              to="/preview/$themeId"
              params={{ themeId: "cathedral-light" }}
            >
              Preview Cathedral Light
            </Link>
            .
          </p>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">What does not change</p>
            <h2>
              What every design <em>includes</em>
            </h2>
          </header>
          <p className="lede">
            The design is the look and the opening; everything else is
            the same whichever of the six you choose. Every invitation
            is one live link your guests open on their phone, with the
            same order inside: the sealed cover, the couple&apos;s
            names, the date and venue, the functions in order, and
            the RSVP last. You write your own wording — the{" "}
            <Link to="/what-to-include-in-a-digital-wedding-invitation">
              checklist of what to include
            </Link>{" "}
            covers each part — and because the invitation is a live
            page, not a printed card, you can correct a time or a
            venue after sending: the link stays the same, so guests
            always open the latest version. The{" "}
            <Link to="/share-invitation-on-whatsapp">
              guide to sharing on WhatsApp
            </Link>{" "}
            covers how to send it.
          </p>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">Price</p>
            <h2>
              One price, <em>whichever design you choose</em>
            </h2>
          </header>
          <p className="lede">
            Publishing any of the six designs costs{" "}
            {PUBLISH_PRICE_LABEL} one-time, no subscription. The price
            is the same for every design, so choose the one that fits
            your wedding, not the one that fits a budget — and if two
            designs both fit, preview both and pick the opening you
            like watching more.
          </p>
        </section>

        <section className="faq" id="faq">
          <header className="section-head">
            <p className="eyebrow">Questions</p>
            <h2>
              Before you <em>choose</em>
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
