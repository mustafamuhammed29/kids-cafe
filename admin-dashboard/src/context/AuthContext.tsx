import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { StaffProfile } from '../types/admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  staffProfile: StaffProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch verified staff profile from database
  const fetchStaffProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.warn('User has no active staff record in staff_members table:', error);
        setStaffProfile(null);
      } else {
        setStaffProfile({
          id: data.id,
          email: data.email,
          fullName: data.full_name || 'Staff Member',
          role: data.role,
          isActive: data.is_active,
          createdAt: data.created_at,
        });
      }
    } catch (err) {
      console.error('Error fetching staff profile:', err);
      setStaffProfile(null);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Check existing active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchStaffProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen to real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          await fetchStaffProfile(currentSession.user.id);
        } else {
          setStaffProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase ist noch nicht konfiguriert. Bitte trage VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY in .env ein.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Kein Benutzerkonto gefunden.' };
      }

      // Check staff membership
      const { data: staffData, error: staffError } = await supabase
        .from('staff_members')
        .select('*')
        .eq('id', data.user.id)
        .eq('is_active', true)
        .single();

      if (staffError || !staffData) {
        // Sign out immediately if not authorized staff
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Zugriff verweigert: Dieses Konto besitzt keine autorisierten Mitarbeiter-Rechte.',
        };
      }

      setStaffProfile({
        id: staffData.id,
        email: staffData.email,
        fullName: staffData.full_name || 'Staff Member',
        role: staffData.role,
        isActive: staffData.is_active,
        createdAt: staffData.created_at,
      });

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unerwarteter Anmeldefehler.',
      };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setStaffProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        staffProfile,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
