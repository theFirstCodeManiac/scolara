import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type HubUserRole = 'aspirant' | 'hub_tutor' | 'hub_admin';

export interface HubAspirantProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  state_of_origin?: string;
  target_university?: string;
  target_course?: string;
  utme_year?: number;
  subjects?: string[];
  avatar_url?: string;
  bio?: string;
  study_streak?: number;
}

export interface HubTutorProfile {
  id: string;
  user_id: string;
  bio?: string;
  subjects?: string[];
  universities?: string[];
  experience_years?: number;
  rating?: number;
  followers_count?: number;
  students_count?: number;
  is_verified?: boolean;
  phone?: string;
}

interface HubContextType {
  // Auth
  hubUser: {
    id: string;
    email: string;
    role: HubUserRole;
    aspirant?: HubAspirantProfile;
    tutor?: HubTutorProfile;
  } | null;
  isHubLoading: boolean;
  hubSignIn: (email: string, password: string) => Promise<{ error?: string }>;
  hubSignUp: (data: {
    email: string;
    password: string;
    full_name: string;
    role: 'aspirant' | 'hub_tutor';
  }) => Promise<{ error?: string }>;
  hubSignOut: () => Promise<void>;
  refreshHubUser: () => Promise<void>;

  // Notifications
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;

  // Active group context
  activeGroupId: string | null;
  setActiveGroupId: (id: string | null) => void;
}

const HubContext = createContext<HubContextType>({
  hubUser: null,
  isHubLoading: true,
  hubSignIn: async () => ({}),
  hubSignUp: async () => ({}),
  hubSignOut: async () => {},
  refreshHubUser: async () => {},
  unreadCount: 0,
  refreshUnreadCount: async () => {},
  activeGroupId: null,
  setActiveGroupId: () => {},
});

export const HubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hubUser, setHubUser] = useState<HubContextType['hubUser']>(null);
  const [isHubLoading, setIsHubLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  const loadHubProfile = useCallback(async (userId: string, email: string) => {
    try {
      // Check if aspirant
      const { data: aspirant } = await supabase
        .from('hub_aspirants')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (aspirant) {
        setHubUser({
          id: userId,
          email,
          role: 'aspirant',
          aspirant,
        });
        return;
      }

      // Check if tutor
      const { data: tutor } = await supabase
        .from('hub_tutors')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (tutor) {
        setHubUser({
          id: userId,
          email,
          role: 'hub_tutor',
          tutor,
        });
        return;
      }

      setHubUser(null);
    } catch {
      setHubUser(null);
    }
  }, []);

  const refreshHubUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await loadHubProfile(user.id, user.email || '');
    }
  }, [loadHubProfile]);

  const refreshUnreadCount = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { count } = await supabase
      .from('hub_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setUnreadCount(count || 0);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadHubProfile(session.user.id, session.user.email || '');
        await refreshUnreadCount();
      }
      setIsHubLoading(false);
    });
  }, [loadHubProfile, refreshUnreadCount]);

  const hubSignIn = async (email: string, password: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: 'Invalid email or password.' };

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await loadHubProfile(user.id, user.email || '');
      await refreshUnreadCount();
    }
    return {};
  };

  const hubSignUp = async (data: {
    email: string;
    password: string;
    full_name: string;
    role: 'aspirant' | 'hub_tutor';
  }): Promise<{ error?: string }> => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.full_name, hub_role: data.role } },
    });

    if (error) {
      if (error.message?.includes('already registered')) {
        return { error: 'An account with this email already exists.' };
      }
      return { error: error.message || 'Unable to create account.' };
    }

    const userId = authData.user?.id;
    if (!userId) return { error: 'Signup failed. Please try again.' };

    // Create role-specific profile
    if (data.role === 'aspirant') {
      const { error: profileError } = await supabase.from('hub_aspirants').insert({
        user_id: userId,
        full_name: data.full_name,
      });
      if (profileError) return { error: 'Could not create aspirant profile.' };
    } else {
      const { error: tutorError } = await supabase.from('hub_tutors').insert({
        user_id: userId,
      });
      if (tutorError) return { error: 'Could not create tutor profile.' };
    }

    await loadHubProfile(userId, data.email);
    return {};
  };

  const hubSignOut = async () => {
    await supabase.auth.signOut();
    setHubUser(null);
    setUnreadCount(0);
    setActiveGroupId(null);
  };

  return (
    <HubContext.Provider value={{
      hubUser,
      isHubLoading,
      hubSignIn,
      hubSignUp,
      hubSignOut,
      refreshHubUser,
      unreadCount,
      refreshUnreadCount,
      activeGroupId,
      setActiveGroupId,
    }}>
      {children}
    </HubContext.Provider>
  );
};

export const useHub = () => useContext(HubContext);
