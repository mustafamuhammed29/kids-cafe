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

const STAFF_PROFILE_STORAGE_KEY = 'haven_kids_staff_profile';
const DEV_SESSION_STORAGE_KEY = 'haven_kids_dev_owner_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sync initialization from localStorage so that on browser refresh (F5),
  // user & profile are IMMEDIATELY available and ProtectedRoute never prematurely redirects.
  const [user, setUser] = useState<User | null>(() => {
    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(DEV_SESSION_STORAGE_KEY) || sessionStorage.getItem(DEV_SESSION_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.user) return parsed.user;
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  const [session, setSession] = useState<Session | null>(null);

  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(() => {
    try {
      if (!isSupabaseConfigured) {
        const stored = localStorage.getItem(DEV_SESSION_STORAGE_KEY) || sessionStorage.getItem(DEV_SESSION_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.profile?.role === 'owner' && parsed?.profile?.isActive) {
            return parsed.profile;
          }
        }
      } else {
        const cached = localStorage.getItem(STAFF_PROFILE_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.role === 'owner' && parsed.isActive) {
            return parsed;
          }
        }
      }
    } catch {
      // ignore JSON parse errors
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to persist or clear cached staff profile in localStorage
  const saveStaffProfile = (profile: StaffProfile | null) => {
    setStaffProfile(profile);
    if (profile) {
      try {
        localStorage.setItem(STAFF_PROFILE_STORAGE_KEY, JSON.stringify(profile));
      } catch (e) {
        console.error('Failed to cache staff profile:', e);
      }
    } else {
      try {
        localStorage.removeItem(STAFF_PROFILE_STORAGE_KEY);
      } catch (e) {
        console.error('Failed to remove cached staff profile:', e);
      }
    }
  };

  // Fetch verified staff profile from database
  const fetchStaffProfile = async (userId: string): Promise<StaffProfile | null> => {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.warn('Error querying staff_members:', error.message);
        // Do NOT clear cached profile on transient network errors
        const cached = localStorage.getItem(STAFF_PROFILE_STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed?.id === userId && parsed?.role === 'owner' && parsed?.isActive) {
              return parsed;
            }
          } catch {
            // ignore
          }
        }
        return null;
      }

      if (!data) {
        console.warn('User has no active staff record in staff_members table.');
        saveStaffProfile(null);
        return null;
      }

      const profile: StaffProfile = {
        id: data.id,
        email: data.email,
        fullName: data.full_name || 'Inhaber (Owner)',
        role: data.role,
        isActive: data.is_active,
        createdAt: data.created_at,
      };

      saveStaffProfile(profile);
      return profile;
    } catch (err) {
      console.error('Error fetching staff profile:', err);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(DEV_SESSION_STORAGE_KEY) || sessionStorage.getItem(DEV_SESSION_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.user && parsed?.profile?.role === 'owner' && parsed?.profile?.isActive) {
            if (isMounted) {
              setUser(parsed.user);
              setStaffProfile(parsed.profile);
            }
            localStorage.setItem(DEV_SESSION_STORAGE_KEY, stored);
          } else {
            localStorage.removeItem(DEV_SESSION_STORAGE_KEY);
            sessionStorage.removeItem(DEV_SESSION_STORAGE_KEY);
          }
        }
      } catch (e) {
        console.error('Failed to parse dev session:', e);
        localStorage.removeItem(DEV_SESSION_STORAGE_KEY);
        sessionStorage.removeItem(DEV_SESSION_STORAGE_KEY);
      } finally {
        if (isMounted) setIsLoading(false);
      }
      return () => {
        isMounted = false;
      };
    }

    // Production Supabase Auth:
    // Listen to onAuthStateChange (handles INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED, SIGNED_OUT)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT' || !currentSession?.user) {
          setSession(null);
          setUser(null);
          saveStaffProfile(null);
          if (isMounted) setIsLoading(false);
          return;
        }

        setSession(currentSession);
        setUser(currentSession.user);

        // For any valid session event (INITIAL_SESSION on reload, SIGNED_IN, TOKEN_REFRESHED, etc.),
        // fetch and verify staff permissions before lifting isLoading
        try {
          const profile = await fetchStaffProfile(currentSession.user.id);
          if (!profile || profile.role !== 'owner' || !profile.isActive) {
            console.warn('User is not an active owner. Ejecting session.');
            await supabase.auth.signOut();
            if (isMounted) {
              setSession(null);
              setUser(null);
              saveStaffProfile(null);
            }
          }
        } catch (err) {
          console.error('Staff profile verification error:', err);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
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
      saveStaffProfile(profile);
      try {
        localStorage.setItem(DEV_SESSION_STORAGE_KEY, JSON.stringify({ user: mockUser, profile }));
        sessionStorage.removeItem(DEV_SESSION_STORAGE_KEY);
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

      // Check staff membership and active owner status
      const { data: staffData, error: staffError } = await supabase
        .from('staff_members')
        .select('*')
        .eq('id', data.user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (staffError || !staffData || staffData.role !== 'owner') {
        await supabase.auth.signOut();
        saveStaffProfile(null);
        return {
          success: false,
          error: 'Zugriff verweigert: Nur der autorisierte Inhaber-Account (Owner) hat Zugriff auf diesen Administrationsbereich.',
        };
      }

      const profile: StaffProfile = {
        id: staffData.id,
        email: staffData.email,
        fullName: staffData.full_name || 'Inhaber (Owner)',
        role: 'owner',
        isActive: staffData.is_active,
        createdAt: staffData.created_at,
      };

      saveStaffProfile(profile);
      setUser(data.user);
      setSession(data.session);

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
      const updated: StaffProfile = {
        ...staffProfile,
        role: newRole,
        fullName: newRole === 'owner' ? 'Café Inhaberin (Owner)' : (newRole === 'admin' ? 'Betriebsleiter (Admin)' : 'Mitarbeiter (Staff)'),
      };
      saveStaffProfile(updated);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    try {
      localStorage.removeItem(DEV_SESSION_STORAGE_KEY);
      sessionStorage.removeItem(DEV_SESSION_STORAGE_KEY);
      localStorage.removeItem(STAFF_PROFILE_STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing local storage on signOut:', e);
    }
    saveStaffProfile(null);
    setUser(null);
    setSession(null);
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
