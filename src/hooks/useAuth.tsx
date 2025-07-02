
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, UserProfile } from '@/types/common';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider: Setting up auth state...");
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("AuthProvider: Error getting session:", error);
        }
        console.log("AuthProvider: Initial session:", session?.user?.phone || session?.user?.email || 'No user');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error("AuthProvider: Failed to get session:", error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthProvider: Auth state changed:", event, session?.user?.phone || session?.user?.email || 'No user');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      console.log("AuthProvider: Cleaning up subscription");
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (phone: string, password: string) => {
    try {
      console.log("AuthProvider: Attempting sign in for:", phone);
      const { error } = await supabase.auth.signInWithPassword({
        phone,
        password,
      });
      return { error };
    } catch (error: any) {
      console.error('AuthProvider: Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (phone: string, password: string, fullName: string) => {
    try {
      console.log("AuthProvider: Attempting sign up for:", phone);
      const { data, error } = await supabase.auth.signUp({
        phone,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      });

      // Create profile after successful signup
      if (data.user && !error) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            full_name: fullName,
            phone: phone,
          });
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      return { error };
    } catch (error: any) {
      console.error('AuthProvider: Sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log("AuthProvider: Signing out");
      await supabase.auth.signOut();
    } catch (error) {
      console.error('AuthProvider: Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    profile,
    signIn,
    signUp,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
