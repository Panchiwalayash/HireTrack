import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | { id: string; email: string } | null;
  session: Session | null;
  isLoading: boolean;
  isSupabaseConfigured: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signInWithGoogle: (redirectToPath?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | { id: string; email: string } | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Purge any stale demo tokens or demo credentials
    localStorage.removeItem('grad_tracker_demo_mode');
    if (localStorage.getItem('grad_tracker_demo_user')?.includes('applicant@gradtracker.io')) {
      localStorage.removeItem('grad_tracker_demo_user');
    }

    if (!isSupabaseConfigured) {
      const savedUser = localStorage.getItem('hiretrack_local_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isSupabaseConfigured) {
      const localUser = { id: `usr-${email.replace(/[^a-zA-Z0-9]/g, '') || 'engineer'}`, email };
      localStorage.setItem('hiretrack_local_user', JSON.stringify(localUser));
      setUser(localUser);
      return {};
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return { error: error.message };
    return {};
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    if (!isSupabaseConfigured) {
      const localUser = { id: `usr-${email.replace(/[^a-zA-Z0-9]/g, '') || 'engineer'}`, email };
      localStorage.setItem('hiretrack_local_user', JSON.stringify(localUser));
      setUser(localUser);
      return {};
    }
    const { error } = await supabase.auth.signUp({ email, password: pass });
    if (error) return { error: error.message };
    return {};
  };

  const signInWithGoogle = async (redirectToPath?: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Google sign-in requires Supabase configuration.' };
    }
    const targetPath = redirectToPath?.startsWith('/') ? redirectToPath : '/dashboard';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${targetPath}`,
      },
    });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('hiretrack_local_user');
    localStorage.removeItem('grad_tracker_demo_user');
    localStorage.removeItem('grad_tracker_demo_mode');
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isSupabaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
