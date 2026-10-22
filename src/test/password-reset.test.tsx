import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Release Fix 2 (Agent A, D2): password reset did not exist at all —
// no resetPasswordForEmail call, no recovery page, no updateUser UI —
// so a forgotten password meant a permanently locked-out account
// (and its paid invitations). These tests pin both halves:
//  1. /login's "Forgot password" requests a reset email pointing at
//     /reset-password, with plain-language outcomes (never the raw
//     Supabase error string — D6 for this surface).
//  2. /reset-password sets the new password on the recovery session
//     via updateUser, ends that session, and sends the user to sign
//     in fresh; an absent recovery session reads as an
//     expired/invalid link.
const hoisted = vi.hoisted(() => ({
  session: null as null | { user: { id: string; email: string } },
  loading: false,
  navigate: vi.fn(async () => {}),
  signOut: vi.fn(async () => {}),
  signInWithPassword: vi.fn(async () => ({ error: null })),
  signUp: vi.fn(async () => ({ data: { session: null }, error: null })),
  resetPasswordForEmail: vi.fn(async () => ({ error: null })),
  updateUser: vi.fn(async () => ({ error: null })),
  authCallback: null as null | ((event: string) => void),
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({ session: hoisted.session, loading: hoisted.loading }),
  useUser: () => hoisted.session?.user ?? null,
  signOut: hoisted.signOut,
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: hoisted.signInWithPassword,
      signUp: hoisted.signUp,
      resetPasswordForEmail: hoisted.resetPasswordForEmail,
      updateUser: hoisted.updateUser,
      onAuthStateChange: (cb: (event: string) => void) => {
        hoisted.authCallback = cb;
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      getSession: async () => ({ data: { session: hoisted.session } }),
    },
  },
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: Record<string, unknown>) => opts,
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
  useSearch: () => ({}),
}));

import { LocaleProvider } from "@/i18n/locale-context";
import { Route as LoginRoute } from "@/routes/login";
import { Route as ResetRoute } from "@/routes/reset-password";

const Login = (LoginRoute as unknown as { component: React.ComponentType })
  .component;
const ResetPassword = (
  ResetRoute as unknown as { component: React.ComponentType }
).component;

function renderPage(Page: React.ComponentType) {
  return render(
    <LocaleProvider>
      <Page />
    </LocaleProvider>,
  );
}

describe("Forgot password on /login (Fix 2a)", () => {
  beforeEach(() => {
    hoisted.session = null;
    hoisted.loading = false;
    hoisted.resetPasswordForEmail.mockClear();
    hoisted.resetPasswordForEmail.mockResolvedValue({ error: null });
  });

  it("requests a reset email pointing at /reset-password and confirms in plain language", async () => {
    renderPage(Login);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "a@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /forgot password/i }));
    await waitFor(() =>
      expect(hoisted.resetPasswordForEmail).toHaveBeenCalledWith(
        "a@example.com",
        { redirectTo: `${window.location.origin}/reset-password` },
      ),
    );
    expect(
      await screen.findByText(/sent a link to reset your password/i),
    ).toBeTruthy();
  });

  it("never shows the raw Supabase error string when the request fails", async () => {
    hoisted.resetPasswordForEmail.mockResolvedValue({
      error: new Error("AuthApiException: rate limit raw internals"),
    } as never);
    renderPage(Login);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "a@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /forgot password/i }));
    expect(
      await screen.findByText(/couldn't send the reset email/i),
    ).toBeTruthy();
    expect(screen.queryByText(/AuthApiException/)).toBeNull();
  });
});

describe("/reset-password (Fix 2b)", () => {
  beforeEach(() => {
    hoisted.session = { user: { id: "user-1", email: "a@example.com" } };
    hoisted.loading = false;
    hoisted.authCallback = null;
    hoisted.updateUser.mockClear();
    hoisted.updateUser.mockResolvedValue({ error: null });
    hoisted.signOut.mockClear();
    window.history.replaceState(null, "", "/reset-password");
  });

  // The form is gated on a recovery signal (impl round 2, A-6a):
  // a bare pre-existing session is NOT enough — the page must have
  // seen the PASSWORD_RECOVERY event (or a session arriving after
  // first resolution). Tests fire the event like Supabase does.
  function arriveViaRecoveryLink() {
    act(() => hoisted.authCallback?.("PASSWORD_RECOVERY"));
  }

  it("sets the new password via updateUser, ends the recovery session, and confirms", async () => {
    renderPage(ResetPassword);
    arriveViaRecoveryLink();
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "newsecret1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "newsecret1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /set new password/i }));
    await waitFor(() =>
      expect(hoisted.updateUser).toHaveBeenCalledWith({
        password: "newsecret1",
      }),
    );
    await waitFor(() => expect(hoisted.signOut).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/password has been updated/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("refuses mismatched passwords without calling updateUser", async () => {
    renderPage(ResetPassword);
    arriveViaRecoveryLink();
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "newsecret1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "different1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /set new password/i }));
    expect(await screen.findByText(/do not match/i)).toBeTruthy();
    expect(hoisted.updateUser).not.toHaveBeenCalled();
  });

  it("with no recovery session, reads as an expired link and offers the way back", async () => {
    hoisted.session = null;
    renderPage(ResetPassword);
    expect(
      await screen.findByText(/expired or already been used/i),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Back to sign in" }),
    ).toHaveAttribute("href", "/login");
    expect(hoisted.updateUser).not.toHaveBeenCalled();
  });

  it("a pre-existing session opening an expired link gets the expired message, not the form (A-6a)", async () => {
    // Session was already there when the page loaded and NO recovery
    // event ever fires: the link was expired/used, the session is
    // just the user's normal sign-in.
    renderPage(ResetPassword);
    expect(
      await screen.findByText(/expired or already been used/i),
    ).toBeTruthy();
    expect(screen.queryByLabelText("New password")).toBeNull();
    expect(hoisted.updateUser).not.toHaveBeenCalled();
  });

  it("strips the recovery fragment from the URL once ready (A-6b)", async () => {
    window.history.pushState(
      null,
      "",
      "/reset-password#access_token=tok123&type=recovery",
    );
    renderPage(ResetPassword);
    arriveViaRecoveryLink();
    await screen.findByLabelText("New password");
    expect(window.location.hash).toBe("");
  });

  it("success state lands (and the expired branch never shows) after submit (A-6b)", async () => {
    renderPage(ResetPassword);
    arriveViaRecoveryLink();
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "newsecret1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "newsecret1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /set new password/i }));
    expect(await screen.findByText(/password has been updated/i)).toBeTruthy();
    expect(screen.queryByText(/expired or already been used/i)).toBeNull();
  });
});

describe("Login/signup submit errors (impl round 2, A-2)", () => {
  beforeEach(() => {
    hoisted.session = null;
    hoisted.loading = false;
    hoisted.signInWithPassword.mockClear();
    hoisted.signInWithPassword.mockResolvedValue({ error: null });
    hoisted.signUp.mockClear();
    hoisted.signUp.mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);
  });

  it("sign-in failure shows plain language, never the raw provider string", async () => {
    hoisted.signInWithPassword.mockResolvedValue({
      error: new Error("Invalid login credentials (raw provider text)"),
    } as never);
    renderPage(Login);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "a@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "whatever123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText(/couldn't sign you in/i)).toBeTruthy();
    expect(screen.queryByText(/raw provider text/)).toBeNull();
  });

  it("signup failure shows the generic message, never the raw provider string", async () => {
    hoisted.signUp.mockResolvedValue({
      data: { session: null },
      error: new Error("User already registered (raw provider text)"),
    } as never);
    renderPage(Login);
    fireEvent.click(screen.getByRole("button", { name: "Create one" }));
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "a@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "whatever123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(
      await screen.findByText(/couldn't create your account/i),
    ).toBeTruthy();
    expect(screen.queryByText(/raw provider text/)).toBeNull();
    expect(screen.queryByText(/already registered/i)).toBeNull();
  });
});
