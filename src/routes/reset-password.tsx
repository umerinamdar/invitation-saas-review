/*
 * Password recovery landing page (Release Fix 2 / Agent A, D2).
 *
 * OWNER CONFIG — required before this page can ever be reached:
 * the deployed URL of this page, <domain>/reset-password, must be in
 * the live Supabase project's Authentication → URL Configuration →
 * Redirect URLs allow-list. /login requests the reset email with
 * redirectTo=<origin>/reset-password; Supabase rejects any redirect
 * that is not allow-listed, so without that entry the recovery email
 * link lands on an error instead of here.
 *
 * Flow: the recovery link establishes a short-lived session (the
 * AuthProvider in lib/auth picks it up; this page also listens for
 * the PASSWORD_RECOVERY event in case the session lands a beat
 * later). The user sets a new password via updateUser, the recovery
 * session is then ENDED, and the user signs in fresh on /login —
 * deliberately: it proves the new password works end-to-end and
 * never lets a one-purpose recovery session wander into the app.
 * With no recovery session the link is treated as expired or
 * already used, with a clear message and the way back to /login,
 * where a fresh link can be requested.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { absoluteUrl } from "@/config/site";
import { signOut, useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

/** This page's absolute URL — null until the canonical origin is set. */
const OG_URL = absoluteUrl("/reset-password");

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: `Reset password — ${BRAND}` },
      { name: "robots", content: "noindex" },
    ],
    links: [
      // Canonical — only once VITE_SITE_URL is configured, never a
      // guessed or localhost URL (same guard as the public routes).
      ...(OG_URL ? [{ rel: "canonical", href: OG_URL }] : []),
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { session, loading } = useAuth();
  const [recoverySeen, setRecoverySeen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  // Impl round 2 (Agent A, A-6a): `ready` used to be any session at
  // all — so a user who was ALREADY signed in and opened an expired
  // or used recovery link got the password form instead of the
  // expired-link message. Ready now requires a recovery signal: the
  // PASSWORD_RECOVERY event, or a session that arrived AFTER this
  // page load first resolved auth state (the recovery exchange).
  const [initialSession, setInitialSession] = useState<
    "unknown" | "none" | "present"
  >("unknown");

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecoverySeen(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && initialSession === "unknown") {
      setInitialSession(session ? "present" : "none");
    }
  }, [loading, session, initialSession]);

  const sessionArrivedThisLoad = initialSession === "none" && Boolean(session);
  const ready = Boolean(session) && (recoverySeen || sessionArrivedThisLoad);

  // Impl round 2 (Agent A, A-6b): once the recovery session is
  // established, strip the recovery fragment from the address bar —
  // the tokens otherwise sit in browser history for the whole
  // session. Runs once, when ready first becomes true.
  const strippedRef = useRef(false);
  useEffect(() => {
    if (ready && !strippedRef.current) {
      strippedRef.current = true;
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [ready]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError(
        "Those passwords do not match — please type the same one twice.",
      );
      return;
    }
    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;
      // Land the success state FIRST (A-6b): awaiting signOut before
      // setDone could flash the expired-link branch for a frame,
      // because signOut clears the session that `ready` depends on.
      setDone(true);
      // End the recovery session (see the header note): the user
      // signs in fresh with the password they just set.
      await signOut().catch(() => {});
    } catch {
      setError(
        "That password couldn't be saved. The reset link may have expired — request a new one from the sign-in page.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="site">
      <SiteHeader />
      <main className="auth">
        <h1>Reset your password</h1>

        {loading ? (
          <p className="auth-sub">Checking your reset link…</p>
        ) : done ? (
          <>
            <p className="auth-sub">
              Your password has been updated. Sign in with it to continue.
            </p>
            <p className="auth-back">
              <Link to="/login">Sign in</Link>
            </p>
          </>
        ) : ready ? (
          <>
            <p className="auth-sub">Choose a new password for your account.</p>
            <form onSubmit={submit} className="auth-form">
              <label>
                New password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
              </label>
              <label>
                Confirm new password
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>

              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="btn btn-solid" disabled={busy}>
                {busy && <LoaderCircle size={16} className="loading-spinner" />}
                Set new password
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="auth-sub">
              This reset link has expired or already been used. Head back to
              sign in and choose “Forgot password?” to get a fresh one.
            </p>
            <p className="auth-back">
              <Link to="/login">Back to sign in</Link>
            </p>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
