import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import siteCss from "../site.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../lib/auth";
import { BRAND, SiteHeader } from "../components/site/chrome";
import { absoluteUrl, PUBLISH_PRICE_LABEL } from "../config/site";
import { LocaleProvider } from "../i18n/locale-context";

/** Absolute URL of the default share image — null until the owner has
 * configured the canonical origin (VITE_SITE_URL), so link unfurls never
 * point at a guessed or localhost URL. */
const OG_IMAGE = absoluteUrl("/og-default.jpg");

/** The site's own absolute URL and logo, for the Organization schema —
 * null under the same configured-origin guard as OG_IMAGE. */
const SITE_ROOT_URL = absoluteUrl("/");
const OG_LOGO = absoluteUrl("/favicon.svg");

/**
 * Minimal Organization JSON-LD. Built only from site config, and only
 * when the canonical origin is configured — omitted entirely otherwise.
 * No `sameAs`: the brand has no social profiles to point at.
 */
const ORGANIZATION_JSON_LD =
  SITE_ROOT_URL && OG_LOGO
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: BRAND,
        url: SITE_ROOT_URL,
        logo: OG_LOGO,
      })
    : null;

function NotFoundComponent() {
  return (
    <div className="site">
      <SiteHeader />
      <main className="status-page">
        <p className="eyebrow">404</p>
        <h1>This invitation isn't here.</h1>
        <p className="lede">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-solid">
          Go home
        </Link>
      </main>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="site">
      <SiteHeader />
      <main className="status-page">
        <p className="eyebrow">Something went wrong</p>
        <h1>This page didn't load.</h1>
        <p className="lede">
          Something went wrong on our end. You can try refreshing or head
          back home.
        </p>
        <div className="status-page-actions">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn btn-solid"
          >
            Try again
          </button>
          <a href="/" className="btn btn-quiet">
            Go home
          </a>
        </div>
      </main>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, viewport-fit=cover",
        },
        { name: "theme-color", content: "#f4ede1" },
        { title: `${BRAND} — Digital wedding invitations` },
        {
          name: "description",
          content:
            `Animated wedding invitations for the phone in every guest's hand. Customise free, publish for ${PUBLISH_PRICE_LABEL}.`,
        },
        { property: "og:title", content: BRAND },
        {
          property: "og:description",
          content:
            "Animated wedding invitations for the phone in every guest's hand.",
        },
        { property: "og:type", content: "website" },
        // Default share image — only with a configured canonical
        // origin, like og:url on the page routes.
        ...(OG_IMAGE
          ? [
              { property: "og:image", content: OG_IMAGE },
              { name: "twitter:image", content: OG_IMAGE },
            ]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      scripts: [
        ...(ORGANIZATION_JSON_LD
          ? [
              {
                type: "application/ld+json",
                children: ORGANIZATION_JSON_LD,
              },
            ]
          : []),
      ],
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
        { rel: "stylesheet", href: siteCss },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <AuthProvider>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </AuthProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}
