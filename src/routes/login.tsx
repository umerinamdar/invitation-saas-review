import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: `Sign in — ${BRAND}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

type Mode = "signin" | "signup";

function Login() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!loading && session) void navigate({ to: "/dashboard" });
  }, [loading, session, navigate]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "signup") {
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
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Something went wrong.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="site">
      <SiteHeader />
      <section className="auth">
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
        </form>

        <p className="auth-swap">
          {mode === "signin" ? "No account yet?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
            }}
          >
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </p>

        <p className="auth-back">
          <Link to="/templates">Browse the designs first</Link>
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}
