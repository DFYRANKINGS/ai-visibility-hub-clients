import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { isBreakerOpen, onBreakerChange, resetBreaker } from '@/lib/authCircuitBreaker';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authUnavailable, setAuthUnavailable] = useState(() => isBreakerOpen());

  useEffect(() => {
    // Subscribe to circuit breaker trips
    const unsub = onBreakerChange(() => {
      const open = isBreakerOpen();
      setAuthUnavailable(open);
      if (open) {
        // Force logged-out state so UI shows login screen
        setUser(null);
        setSession(null);
        setLoading(false);
      }
    });

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // If breaker is open, ignore any stale session
      if (isBreakerOpen()) {
        setUser(null);
        setSession(null);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      unsub();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // Successful sign-in resets the breaker
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      resetBreaker();
      setAuthUnavailable(false);
    }
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    authUnavailable,
    signIn,
    signUp,
    signOut,
  };
}
