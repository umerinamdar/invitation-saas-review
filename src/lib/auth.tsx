import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { clearLocalDraftData, draftClearsOnUserChange } from "./local-draft";
import { supabase } from "./supabase";

type AuthState = {
  session: Session | null;
  /** True until the stored session has been read, so guards do not flash. */
  loading: boolean;
};

const AuthContext = createContext<AuthState>({ session: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Impl round 2 (C-1): remember whose session this browser last
  // held so a sign-out or a different account taking over clears the
  // previous account's local draft (see local-draft.ts).
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    const trackUser = (next: Session | null) => {
      const nextUserId = next?.user?.id ?? null;
      if (draftClearsOnUserChange(previousUserId.current, nextUserId)) {
        // Task 9: pass the departing id so their editor mirrors are
        // cleared with the draft (see local-draft.ts).
        clearLocalDraftData(previousUserId.current ?? undefined);
      }
      previousUserId.current = nextUserId;
    };
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      trackUser(data.session);
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      trackUser(next);
      setSession(next);
      setLoading(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ session, loading }), [session, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useUser() {
  return useAuth().session?.user ?? null;
}

export async function signOut() {
  await supabase.auth.signOut();
}
