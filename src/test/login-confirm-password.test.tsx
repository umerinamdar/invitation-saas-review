import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Confirm-password field on /login's signup form: a mistyped password
// should be caught client-side before ever calling signUp, not surface
// as a silent lockout the user discovers later at sign-in.
const hoisted = vi.hoisted(() => ({
  session: null as null | { user: { id: string; email: string } },
  loading: false,
  navigate: vi.fn(async () => {}),
  signUp: vi.fn(async () => ({ data: { session: null }, error: null })),
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({ session: hoisted.session, loading: hoisted.loading }),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signUp: hoisted.signUp,
      signInWithPassword: vi.fn(async () => ({ error: null })),
      resetPasswordForEmail: vi.fn(async () => ({ error: null })),
    },
  },
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: Record<string, unknown>) => opts,
  Link: ({ to, children }: { to: string; children?: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => hoisted.navigate,
}));

import { LocaleProvider } from "@/i18n/locale-context";
import { Route as LoginRoute } from "@/routes/login";

const Login = (LoginRoute as unknown as { component: React.ComponentType })
  .component;

function renderLogin() {
  return render(
    <LocaleProvider>
      <Login />
    </LocaleProvider>,
  );
}

describe("/login signup confirm-password field", () => {
  beforeEach(() => {
    hoisted.session = null;
    hoisted.loading = false;
    hoisted.signUp.mockClear();
  });

  function switchToSignup() {
    fireEvent.click(screen.getByRole("button", { name: /create one/i }));
  }

  it("shows a Confirm password field only in signup mode", () => {
    renderLogin();
    expect(screen.queryByLabelText(/confirm password/i)).toBeNull();
    switchToSignup();
    expect(screen.getByLabelText(/confirm password/i)).toBeTruthy();
  });

  it("blocks submission and never calls signUp when the passwords don't match", async () => {
    renderLogin();
    switchToSignup();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "a@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "correct-horse-1" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "different-horse-2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText(/passwords don't match/i),
    ).toBeTruthy();
    expect(hoisted.signUp).not.toHaveBeenCalled();
  });

  it("submits normally when the passwords match", async () => {
    renderLogin();
    switchToSignup();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "a@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "correct-horse-1" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "correct-horse-1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() =>
      expect(hoisted.signUp).toHaveBeenCalledWith({
        email: "a@example.com",
        password: "correct-horse-1",
      }),
    );
  });
});
