import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "@/i18n/locale-context";
import { signOut, useAuth } from "@/lib/auth";
import { LanguageSwitcher } from "./language-switcher";

export const BRAND = "EasyInviteMaker";

function useNavLinks() {
  const { t } = useLocale();
  return [
    { href: "/templates", label: t("nav.designs"), isRoute: true },
    { href: "/#how", label: t("nav.howItWorks"), isRoute: false },
    { href: "/#pricing", label: t("nav.pricing"), isRoute: false },
    { href: "/#faq", label: t("nav.faq"), isRoute: false },
  ] as const;
}

/**
 * `overlay` lets the header sit on top of a full-bleed hero.
 *
 * Below 860px the inline nav links hide (see site.css), so this carries its
 * own menu button and dropdown — without it, mobile guests had no way to
 * reach Designs/How it works/Pricing at all.
 */
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const { t } = useLocale();
  const NAV_LINKS = useNavLinks();
  // Release Fix 1 (D1): the header is the only chrome every page
  // shares, and it carried no auth UI at all — a signed-in customer
  // had no path to their dashboard and no way to sign out (auth's
  // signOut() had zero callers). Render nothing auth-related until
  // the stored session resolves, so neither state flashes wrongly.
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    void navigate({ to: "/" });
  }

  // Escape closes the sheet, matching how any other dismissible menu works.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`site-header ${overlay ? "is-overlay" : ""}`}>
      <Link to="/" className="brand">
        {BRAND}
      </Link>
      <nav aria-label={t("nav.primaryLabel")}>
        {NAV_LINKS.map((link) =>
          link.isRoute ? (
            <Link key={link.href} to={link.href}>
              {link.label}
            </Link>
          ) : (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ),
        )}
      </nav>
      <LanguageSwitcher />
      {!authLoading &&
        (session ? (
          <span className="nav-auth">
            <Link to="/dashboard">{t("nav.dashboard")}</Link>
            <button type="button" onClick={() => void handleSignOut()}>
              {t("nav.signOut")}
            </button>
          </span>
        ) : (
          <span className="nav-auth">
            <Link to="/login">{t("nav.signIn")}</Link>
          </span>
        ))}
      <Link to="/create" className="btn btn-solid btn-sm nav-cta">
        {t("nav.createYours")}
      </Link>
      <button
        type="button"
        className="nav-toggle"
        aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open && (
        <div className="nav-sheet">
          {NAV_LINKS.map((link) =>
            link.isRoute ? (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ),
          )}
          {!authLoading &&
            (session ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)}>
                  {t("nav.dashboard")}
                </Link>
                <button
                  type="button"
                  className="nav-sheet-action"
                  onClick={() => void handleSignOut()}
                >
                  {t("nav.signOut")}
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)}>
                {t("nav.signIn")}
              </Link>
            ))}
          <Link
            to="/create"
            className="btn btn-solid"
            onClick={() => setOpen(false)}
          >
            {t("nav.createYours")}
          </Link>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  const { t } = useLocale();
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <p className="brand">{BRAND}</p>
        <p className="footer-note">{t("footer.tagline")}</p>
      </div>
      <nav aria-label={t("footer.explore")}>
        <p className="eyebrow" style={{ marginBottom: 2 }}>
          {t("footer.explore")}
        </p>
        <Link to="/templates">{t("nav.designs")}</Link>
        <a href="/#how">{t("nav.howItWorks")}</a>
        <a href="/#pricing">{t("nav.pricing")}</a>
        <a href="/#faq">{t("nav.faq")}</a>
      </nav>
      <nav aria-label={t("footer.policies")}>
        <p className="eyebrow" style={{ marginBottom: 2 }}>
          {t("footer.policies")}
        </p>
        {/* Payment gateways require these before they approve a merchant. */}
        <a href="/terms">{t("footer.terms")}</a>
        <a href="/privacy">{t("footer.privacy")}</a>
        <a href="/refund">{t("footer.refunds")}</a>
        <a href="/contact">{t("footer.contact")}</a>
      </nav>
      <p className="footer-copy">
        © {new Date().getFullYear()} {BRAND}. {t("footer.copy")}
      </p>
    </footer>
  );
}
