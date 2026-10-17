import { Link } from "@tanstack/react-router";

/** Placeholder until the business has a name. */
export const BRAND = "Aarzoo";

/** `overlay` lets the header sit on top of a full-bleed hero. */
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={`site-header ${overlay ? "is-overlay" : ""}`}>
      <Link to="/" className="brand">
        {BRAND}
      </Link>
      <nav>
        <Link to="/templates">Designs</Link>
        <a href="/#how">How it works</a>
        <a href="/#pricing">Pricing</a>
      </nav>
      <Link to="/create" className="btn btn-solid btn-sm">
        Create yours
      </Link>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <p className="brand">{BRAND}</p>
        <p className="footer-note">
          Digital invitations. No physical products are shipped.
        </p>
      </div>
      <nav>
        {/* Payment gateways require these before they approve a merchant. */}
        <a href="/terms">Terms</a>
        <a href="/privacy">Privacy</a>
        <a href="/refund">Refunds</a>
        <a href="/contact">Contact</a>
      </nav>
      <p className="footer-copy">
        © {new Date().getFullYear()} {BRAND}
      </p>
    </footer>
  );
}
