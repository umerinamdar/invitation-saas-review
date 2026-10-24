import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { absoluteUrl } from "@/config/site";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

/** This page's absolute URL — null until the canonical origin is set. */
const OG_URL = absoluteUrl("/login");

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: `Sign in — ${BRAND}` },
      { name: "robots", content: "noindex" },
    ],
    links: [
      // Canonical — only once VITE_SITE_URL is configured, never a
      // guessed or localhost URL (same guard as the public routes).
      ...(OG_URL ? [{ rel: "canonical", href: OG_URL }] : []),
    ],
  }),
  component: Login,
});

type Mode = "signin" | "signup";

// Impl round 2 (Agent A, A-2): the submit path rendered the RAW
// provider error (cause.message) — the forgot-password path in this
// same file was sanitised in the release round, this one never was.
// Raw strings leak provider internals and, for signup, can reveal
// whether an address already has an account. Outcomes are stated in
// plain language per mode; the cause is never rendered.
function submitErrorMessage(mode: Mode): string {
  return mode === "signup"
    ? "We couldn't create your account just now. If you already have an account, try signing in instead — otherwise please try again in a moment."
    : "We couldn't sign you in. Check your email and password for typos and try again — or use “Forgot password?” below.";
}

function Login() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!loading && session) void navigate({ to: "/dashboard" });
  }, [loading, session, navigate]);

  // Release Fix 2 (D2): password reset previously did not exist at
  // all — a forgotten password locked the account (and its paid
  // invitations) forever. Outcomes are stated in plain language: the
  // raw provider error never reaches the page on this surface (D6),
  // and the confirmation never reveals whether the address has an
  // account. OWNER CONFIG: /reset-password must be allow-listed in
  // the live Supabase Auth redirect URLs — see reset-password.tsx.
  async function forgotPassword() {
    setError("");
    setNotice("");
    if (!email.trim()) {
      setNotice(
        "Enter your email above first — then we'll send the reset link to it.",
      );
      return;
    }
    setBusy(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        },
      );
      if (resetError) throw resetError;
      setNotice(
        "If an account exists for that email, we've sent a link to reset your password.",
      );
    } catch {
      setError(
        "We couldn't send the reset email just now. Please try again in a moment.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          setError("Passwords don't match. Please check and try again.");
          setBusy(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // With email confirmation on, there is no session until they confirm.
        if (!data.session) {
          setNotice("Check your email to confirm your address, then sign in.");
          setMode("signin");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      await navigate({ to: "/dashboard" });
    } catch {
      setError(submitErrorMessage(mode));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="site">
      <SiteHeader />
      <main className="auth">
        <h1>{mode === "signin" ? "Sign in" : "Create your account"}</h1>
        <p className="auth-sub">
          {mode === "signin"
            ? "Pick up where you left off."
            : "Free — you only pay when you publish an invitation."}
        </p>

        <form onSubmit={submit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              placeholder="At least 8 characters"
            />
          </label>
          {mode === "signup" && (
            <label>
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Re-enter your password"
              />
            </label>
          )}

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="form-notice" role="status">
              {notice}
            </p>
          )}

          <button type="submit" className="btn btn-solid" disabled={busy}>
            {busy && <LoaderCircle size={16} className="loading-spinner" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>

          {mode === "signin" && (
            <button
              type="button"
              className="forgot-link"
              disabled={busy}
              onClick={() => void forgotPassword()}
            >
              Forgot password?
            </button>
          )}
        </form>

        <p className="auth-swap">
          {mode === "signin" ? "No account yet?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
              setConfirmPassword("");
            }}
          >
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </p>

        <p className="auth-back">
          <Link to="/templates">Browse the designs first</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
