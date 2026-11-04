import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { absoluteUrl, PUBLISH_PRICE_LABEL } from "@/config/site";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { faqJsonLd } from "@/components/site/occasion-landing";

const TITLE = `How to Share a Digital Invitation on WhatsApp — ${BRAND}`;
const DESCRIPTION = `How to share a digital wedding invitation on WhatsApp: design it, publish it, copy your own link and send it in a chat or group. Guests open the invitation on their phone with no app to install, and the same link stays live if you edit it later.`;
const OG_URL = absoluteUrl("/share-invitation-on-whatsapp");

const FAQS = [
  {
    q: "Do guests need an app or an account to open the invitation?",
    a: "No. The invitation is a normal web page, so it opens in the phone's browser from the WhatsApp chat. Guests do not need to install anything or sign in, and the same link also works if you send it by SMS or email instead.",
  },
  {
    q: "Is the invitation a PDF or a video file?",
    a: "No. You send a link to a live invitation page, not a file. That is why there is nothing for guests to download, and why a screenshot of the invitation is not a substitute — a screenshot does not open.",
  },
  {
    q: "What if I spot a typo or a venue changes after I have sent the link?",
    a: "A published invitation stays editable, so you can correct it from your dashboard and the same link shows the updated version. You do not need to send a new link, because guests always open the live page.",
  },
  {
    q: "Do I pay each time I share the invitation?",
    a: `No. Publishing creates your shareable link and costs ${PUBLISH_PRICE_LABEL} one-time per invitation, with no subscription. Sharing that link on WhatsApp — to one person, a group, or as many guests as you like — costs nothing extra.`,
  },
];

export const Route = createFileRoute("/share-invitation-on-whatsapp")({
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
  component: ShareInvitationOnWhatsapp,
});

function ShareInvitationOnWhatsapp() {
  return (
    <div className="site">
      <SiteHeader />
      <main>
        <section className="page-head">
          <p className="eyebrow">Step-by-step guide</p>
          <h1>
            Share your invitation on WhatsApp, <em className="gold-foil">in one link</em>
          </h1>
          <p className="lede">
            A digital invitation from EasyInviteMaker is shared as a
            single link, not as a file to download. Design it, publish
            it, copy the link, and paste it into a WhatsApp chat or
            group — your guests tap it and the invitation opens on
            their phone.
          </p>
          <Link to="/templates" className="btn btn-solid">
            See the designs <ArrowRight size={16} />
          </Link>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">The steps</p>
            <h2>
              From design to <em>sent</em>, in five steps
            </h2>
          </header>
          <p className="lede">
            1. Choose a design and add your details. Designing is free:
            pick one of the designs, enter your names, families, date
            and venue, and preview the result on your own phone before
            you spend anything.
          </p>
          <p className="lede">
            2. Publish it. Publishing creates your own shareable link
            and removes any preview limitations, and costs{" "}
            {PUBLISH_PRICE_LABEL} one-time per invitation, with no
            subscription.
          </p>
          <p className="lede">
            3. Copy the link. This is the link you send — keep it as
            one link, rather than sending screenshots or separate
            files for each part of the invitation.
          </p>
          <p className="lede">
            4. Paste it into WhatsApp. Send it to a guest directly, to
            a family group, or to several chats one at a time. Add one
            short line of your own above the link — the couple&apos;s
            names and the date are enough — so guests know what they
            are opening before they tap it.
          </p>
          <p className="lede">
            5. Guests tap and open it. The invitation opens in their
            phone&apos;s browser, with the full invitation in order:
            the opening, the day, the functions, and how to reply. No
            app to install, no account to create.
          </p>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">Sending it well</p>
            <h2>
              A few habits that <em>help guests</em>
            </h2>
          </header>
          <p className="lede">
            Send the link itself, not a picture of it. A screenshot
            looks like the invitation but does not open, and a
            forwarded photo cannot carry the date, venue and reply
            details the way the live page does.
          </p>
          <p className="lede">
            Check the details before you send to the big group. Open
            the link on your own phone first and read the names, date
            and venue the way a guest will see them — it is easier to
            fix a typo before the group chat sees it than after.
          </p>
          <p className="lede">
            For guests who are less comfortable with links, say so in
            your message: one line such as “tap the link below, it
            opens in your browser, nothing to install” removes the
            most common hesitation. Guests who are not on WhatsApp can
            still receive the same link by SMS or email.
          </p>
          <p className="lede">
            If a detail changes after you have sent it — a venue, a
            time, a spelling — correct the published invitation from
            your dashboard. The link stays the same, so guests who
            open it afterwards see the updated version, and you do
            not have to chase every chat with a correction.
          </p>
        </section>

        <section className="faq">
          <header className="section-head">
            <p className="eyebrow">What to write first</p>
            <h2>
              Wording for the <em>invitation itself</em>
            </h2>
          </header>
          <p className="lede">
            The WhatsApp message is only the delivery — the wording
            guests read lives on the invitation page. The site&apos;s
            guides cover that wording for each occasion: the{" "}
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

        <section className="faq" id="faq">
          <header className="section-head">
            <p className="eyebrow">Questions</p>
            <h2>
              Before you <em>send yours</em>
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
