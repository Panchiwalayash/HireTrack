import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | { id: string; email: string } | null;
  session: Session | null;
  isLoading: boolean;
  isDemoMode: boolean;
  isSupabaseConfigured: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | { id: string; email: string } | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('grad_tracker_demo_mode') === 'true' || !isSupabaseConfigured;
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const savedDemoUser = localStorage.getItem('grad_tracker_demo_user');
      if (savedDemoUser) {
        try {
          setUser(JSON.parse(savedDemoUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsDemoMode(false);
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
      const demoUser = { id: `usr-${email.replace(/[^a-zA-Z0-9]/g, '') || 'applicant'}`, email };
      localStorage.setItem('grad_tracker_demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      setIsDemoMode(false);
      return {};
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return { error: error.message };
    setIsDemoMode(false);
    localStorage.removeItem('grad_tracker_demo_mode');
    return {};
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    if (!isSupabaseConfigured) {
      const demoUser = { id: `usr-${email.replace(/[^a-zA-Z0-9]/g, '') || 'applicant'}`, email };
      localStorage.setItem('grad_tracker_demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      setIsDemoMode(false);
      return {};
    }
    const { error } = await supabase.auth.signUp({ email, password: pass });
    if (error) return { error: error.message };
    setIsDemoMode(false);
    localStorage.removeItem('grad_tracker_demo_mode');
    return {};
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      const demoUser = { id: 'usr-google-demo', email: 'google.applicant@gradtracker.io' };
      localStorage.setItem('grad_tracker_demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      setIsDemoMode(true);
      return {};
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('grad_tracker_demo_user');
    localStorage.removeItem('grad_tracker_demo_mode');
    setIsDemoMode(false);
    setUser(null);
    setSession(null);
  };

  const enterDemoMode = () => {
    const demoUser = { id: 'usr-local-applicant', email: 'applicant@gradtracker.io' };
    localStorage.setItem('grad_tracker_demo_user', JSON.stringify(demoUser));
    localStorage.setItem('grad_tracker_demo_mode', 'true');
    setUser(demoUser);
    setIsDemoMode(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isDemoMode,
        isSupabaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        enterDemoMode,
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
