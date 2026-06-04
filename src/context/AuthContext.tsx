import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'student' | 'class_rep' | 'admin' | 'tutor' | 'super_admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  middle_name?: string;
  username?: string;
  matric_number?: string;
  university?: string;
  faculty?: string;
  department?: string;
  dob?: string;
  gender?: string;
  phone?: string;
  address?: string;
  role: UserRole;
  avatar_url?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, metadata: Record<string, any>) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
});

// Safety: fetchProfile will never hang longer than 6 seconds
const withTimeout = <T,>(promise: Promise<T>, ms = 6000): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), ms)),
  ]);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // Only true during the very first session check on app boot
  const [isLoading, setIsLoading] = useState(true);

  const buildProfileFromMeta = (authUser: User): UserProfile => ({
    id: authUser.id,
    email: authUser.email || '',
    full_name: authUser.user_metadata?.first_name || authUser.user_metadata?.full_name || '',
    first_name: authUser.user_metadata?.first_name,
    role: (authUser.user_metadata?.role as UserRole) || 'student',
    avatar_url: authUser.user_metadata?.avatar_url,
    university: authUser.user_metadata?.university,
    department: authUser.user_metadata?.department,
    matric_number: authUser.user_metadata?.matric_number,
  });

  const fetchProfile = async (authUser: User) => {
    try {
      const { data, error } = await withTimeout(
        supabase.from('profiles').select('*').eq('id', authUser.id).single() as unknown as Promise<{ data: any; error: any }>
      );

      if (data && !error) {
        setUser({
          id: data.id,
          email: data.email,
          full_name: data.full_name || data.first_name || '',
          first_name: data.first_name,
          middle_name: data.middle_name,
          username: data.username,
          matric_number: data.matric_number,
          university: data.university,
          faculty: data.faculty,
          department: data.department,
          dob: data.dob,
          gender: data.gender,
          phone: data.phone,
          address: data.address,
          role: data.role || 'student',
          avatar_url: data.avatar_url,
        });
      } else {
        setUser(buildProfileFromMeta(authUser));
      }
    } catch {
      // Timeout or network error — fall back to auth metadata so the app keeps working
      setUser(buildProfileFromMeta(authUser));
    }
  };

  useEffect(() => {
    // ── BOOT: resolve the initial session once ──────────────────────────────
    supabase.auth
      .getSession()
      .then(async ({ data: { session: s } }) => {
        setSession(s);
        if (s?.user) await fetchProfile(s.user);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false)); // ← clears the one-time loading gate

    // ── ONGOING: silently keep user/session in sync ─────────────────────────
    // NOTE: we do NOT call setIsLoading(true) here — that's what caused the
    // infinite spinner.  Auth state changes update user silently in the background.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          await fetchProfile(newSession.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: 'Invalid email or password. Please try again.' };
    return {};
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: Record<string, any>
  ): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: metadata } });
    if (error) {
      if (error.message?.includes('already registered')) {
        return { error: 'An account with this email already exists. Please sign in instead.' };
      }
      if (error.message?.includes('password')) {
        return { error: 'Password must be at least 6 characters long.' };
      }
      return { error: error.message || 'Unable to create your account. Please try again later.' };
    }
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
