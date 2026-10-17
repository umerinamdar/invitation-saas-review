import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { readDraft } from "@/lib/local-draft";
import { getTheme } from "@/themes";
import { hostNames } from "@/invites/types";
import type { LocalDraft } from "@/lib/local-draft";

export const Route = createFileRoute("/publish")({
  head: () => ({
    meta: [
      { title: `Publish your invitation — ${BRAND}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Publish,
});

function Publish() {
  const [draft, setDraft] = useState<LocalDraft | null | undefined>(undefined);
  useEffect(() => setDraft(readDraft()), []);

  if (draft === undefined) return null;

  if (!draft) {
    return (
      <div className="site">
        <SiteHeader />
        <section className="auth">
          <h1>Nothing to publish yet</h1>
          <p className="auth-sub">Design your invitation first.</p>
          <Link to="/templates" className="btn btn-solid">
            Choose a design
          </Link>
        </section>
        <SiteFooter />
      </div>
    );
  }

  const theme = getTheme(draft.themeId);
  const names = hostNames({ ...draft.config, slug: "", themeId: theme.id });

  return (
    <div className="site">
      <SiteHeader />
      <section className="auth publish">
        <p className="eyebrow">Almost there</p>
        <h1>Publish your invitation</h1>

        <dl className="publish-summary">
          <div>
            <dt>Names</dt>
            <dd>{names || "Not filled in yet"}</dd>
          </div>
          <div>
            <dt>Design</dt>
            <dd>{theme.name}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{draft.config.event.dateText || "Not filled in yet"}</dd>
          </div>
          <div>
            <dt>Venue</dt>
            <dd>{draft.config.event.venueName || "Not filled in yet"}</dd>
          </div>
        </dl>

        <ul className="publish-gets">
          {[
            "Your own link to share on WhatsApp",
            "Edit anytime before the wedding",
            "No watermark",
          ].map((item) => (
            <li key={item}>
              <Check size={15} /> {item}
            </li>
          ))}
        </ul>

        <p className="price">
          ₹599 <span>once</span>
        </p>

        <button className="btn btn-solid" disabled>
          Payment coming soon
        </button>
        <p className="price-note">
          Checkout is not connected yet. Your design is saved on this device —
          nothing is lost.
        </p>

        <p className="auth-back">
          <Link to="/create">
            <ArrowLeft size={14} /> Back to editing
          </Link>
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}
