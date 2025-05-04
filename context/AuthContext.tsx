'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: SupabaseUser | null; session: Session | null }>;
  signUp: (email: string, password: string) => Promise<{ user: SupabaseUser | null; session: Session | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('[AuthProvider] Checking session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[AuthProvider] getSession error:', sessionError);
          setUser(null);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('[AuthProvider] Session found, fetching profile for user:', session.user.id);
          await fetchProfile(session.user.id);
        } else {
          console.log('[AuthProvider] No session found.');
          setUser(null);
        }
      } catch (e) {
        console.error('[AuthProvider] Error in initializeAuth:', e);
        setUser(null);
      } finally {
        setLoading(false);
        console.log('[AuthProvider] Loading set to false (initializeAuth)');
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthProvider] onAuthStateChange event:', event, 'Session exists:', !!session);
      
      if (session?.user) {
        console.log('[AuthProvider] User authenticated, fetching profile...');
        await fetchProfile(session.user.id);
      } else {
        console.log('[AuthProvider] No user in session, clearing user state');
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('[AuthProvider] Fetching profile for user:', userId);
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      
      if (error) {
        console.error('[AuthProvider] Error fetching profile:', error);
        setUser(null);
        return;
      }

      if (data) {
        console.log('[AuthProvider] Profile fetched successfully:', data);
        setUser(data);
      } else {
        console.log('[AuthProvider] No profile found for user');
        setUser(null);
      }
    } catch (e) {
      console.error('[AuthProvider] Exception in fetchProfile:', e);
      setUser(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) await fetchProfile(data.user.id);
    return data;
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) await fetchProfile(data.user.id);
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const refreshProfile = async () => {
    if (user?.id) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
