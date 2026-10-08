import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { StaffProfile, StaffRole } from '../types/admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  staffProfile: StaffProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  switchRole?: (role: StaffRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch verified staff profile from database
  const fetchStaffProfile = async (userId: string): Promise<StaffProfile | null> => {
    if (!isSupabaseConfigured) return null;

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
        return null;
      } else {
        const profile: StaffProfile = {
          id: data.id,
          email: data.email,
          fullName: data.full_name || 'Staff Member',
          role: data.role,
          isActive: data.is_active,
          createdAt: data.created_at,
        };
        setStaffProfile(profile);
        return profile;
      }
    } catch (err) {
      console.error('Error fetching staff profile:', err);
      setStaffProfile(null);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      if (!isSupabaseConfigured) {
        try {
          const stored = localStorage.getItem('haven_kids_dev_owner_session') || sessionStorage.getItem('haven_kids_dev_owner_session');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.user && parsed?.profile?.role === 'owner' && parsed?.profile?.isActive) {
              if (isMounted) {
                setUser(parsed.user);
                setStaffProfile(parsed.profile);
              }
              localStorage.setItem('haven_kids_dev_owner_session', stored);
            } else {
              localStorage.removeItem('haven_kids_dev_owner_session');
              sessionStorage.removeItem('haven_kids_dev_owner_session');
            }
          }
        } catch (e) {
          console.error('Failed to parse dev session:', e);
          localStorage.removeItem('haven_kids_dev_owner_session');
          sessionStorage.removeItem('haven_kids_dev_owner_session');
        } finally {
          if (isMounted) setIsLoading(false);
        }
        return;
      }

      // Production Supabase Auth: Await session AND owner verification before releasing loading state
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession?.user) {
          if (isMounted) {
            setSession(existingSession);
            setUser(existingSession.user);
          }
          // MUST await profile fetch before setting isLoading to false to prevent race condition
          const profile = await fetchStaffProfile(existingSession.user.id);
          if (!profile || profile.role !== 'owner' || !profile.isActive) {
            console.warn('User is not an active owner. Ejecting session.');
            await supabase.auth.signOut();
            if (isMounted) {
              setSession(null);
              setUser(null);
              setStaffProfile(null);
            }
          }
        } else {
          if (isMounted) {
            setSession(null);
            setUser(null);
            setStaffProfile(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setStaffProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    if (!isSupabaseConfigured) {
      return () => {
        isMounted = false;
      };
    }

    // Real-time auth listener for sign-in, token refresh, sign-out
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT' || !currentSession?.user) {
          setSession(null);
          setUser(null);
          setStaffProfile(null);
          setIsLoading(false);
          return;
        }

        setSession(currentSession);
        setUser(currentSession.user);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          const profile = await fetchStaffProfile(currentSession.user.id);
          if (!profile || profile.role !== 'owner' || !profile.isActive) {
            await supabase.auth.signOut();
            if (isMounted) {
              setSession(null);
              setUser(null);
              setStaffProfile(null);
            }
          }
        }
        if (isMounted) {
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Local development simulated authentication
      const cleanEmail = email.trim().toLowerCase();
      const role: StaffRole = 'owner';
      const fullName = 'Mustafa (Inhaber)';

      const mockUser = {
        id: `dev-user-${role}`,
        email: cleanEmail,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      const profile: StaffProfile = {
        id: mockUser.id,
        email: cleanEmail,
        fullName,
        role,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      setUser(mockUser);
      setStaffProfile(profile);
      try {
        localStorage.setItem('haven_kids_dev_owner_session', JSON.stringify({ user: mockUser, profile }));
        sessionStorage.removeItem('haven_kids_dev_owner_session');
      } catch (e) {
        console.error('Failed to store dev session in localStorage:', e);
      }
      return { success: true };
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

      if (staffError || !staffData || staffData.role !== 'owner') {
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Zugriff verweigert: Nur der autorisierte Inhaber-Account (Owner) hat Zugriff auf diesen Administrationsbereich.',
        };
      }

      setStaffProfile({
        id: staffData.id,
        email: staffData.email,
        fullName: staffData.full_name || 'Inhaber (Owner)',
        role: 'owner',
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

  const switchRole = (newRole: StaffRole) => {
    if (staffProfile) {
      setStaffProfile({
        ...staffProfile,
        role: newRole,
        fullName: newRole === 'owner' ? 'Café Inhaberin (Owner)' : (newRole === 'admin' ? 'Betriebsleiter (Admin)' : 'Mitarbeiter (Staff)'),
      });
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    try {
      localStorage.removeItem('haven_kids_dev_owner_session');
      sessionStorage.removeItem('haven_kids_dev_owner_session');
    } catch (e) {
      console.error('Error clearing local storage on signOut:', e);
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
        switchRole,
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
