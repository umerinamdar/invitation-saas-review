import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Release Fix 1 (Agent A, D1): the site header had NO auth UI at all —
// no Sign in link, no Dashboard link, and lib/auth's signOut() had zero
// callers, so a signed-in customer could neither reach their dashboard
// from the home page nor ever sign out. These tests pin the
// auth-aware header: state shown per session, and Sign out actually
// invoking the auth module's signOut and returning the user home.
const hoisted = vi.hoisted(() => ({
  session: null as null | { user: { id: string; email: string } },
  loading: false,
  signOut: vi.fn(async () => {}),
  navigate: vi.fn(async () => {}),
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({ session: hoisted.session, loading: hoisted.loading }),
  useUser: () => hoisted.session?.user ?? null,
  signOut: hoisted.signOut,
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    children,
    ...rest
  }: {
    to: string;
    children?: React.ReactNode;
  }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
  useNavigate: () => hoisted.navigate,
}));

import { LocaleProvider } from "@/i18n/locale-context";
import { SiteHeader } from "@/components/site/chrome";

function renderHeader() {
  return render(
    <LocaleProvider>
      <SiteHeader />
    </LocaleProvider>,
  );
}

describe("SiteHeader auth controls (Fix 1 / D1)", () => {
  beforeEach(() => {
    hoisted.session = null;
    hoisted.loading = false;
    hoisted.signOut.mockClear();
    hoisted.navigate.mockClear();
  });

  it("signed-out: offers Sign in (→ /login) and no account controls", () => {
    renderHeader();
    const signIn = screen.getByRole("link", { name: "Sign in" });
    expect(signIn).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("link", { name: "Dashboard" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Sign out" })).toBeNull();
  });

  it("signed-in: offers Dashboard (→ /dashboard) and Sign out, no Sign in", () => {
    hoisted.session = { user: { id: "user-1", email: "a@example.com" } };
    renderHeader();
    const dash = screen.getByRole("link", { name: "Dashboard" });
    expect(dash).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("button", { name: "Sign out" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
  });

  it("Sign out calls the auth signOut and navigates home", async () => {
    hoisted.session = { user: { id: "user-1", email: "a@example.com" } };
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    await waitFor(() => expect(hoisted.signOut).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(hoisted.navigate).toHaveBeenCalledWith({ to: "/" }),
    );
  });

  it("while the session is still loading, shows neither state", () => {
    hoisted.loading = true;
    renderHeader();
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Sign out" })).toBeNull();
  });
});
