import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { UserProfile } from '../types/common';

interface ProfileFormData {
  full_name: string;
  nickname?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  club_id?: string;
}

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getProfile = async (): Promise<UserProfile | null> => {
    setLoading(true);
    setError('');

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('No authenticated user');
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Convert database profile to UserProfile format
      const userProfile: UserProfile = {
        ...data,
        current_rank: 'B',
        ranking_points: 1000,
        total_matches: 0,
        wins: 0,
        losses: 0,
        current_streak: 0,
        matches_played: 0,
        matches_won: 0,
        min_bet_points: 50,
        max_bet_points: 1000,
      };

      return userProfile;
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: ProfileFormData): Promise<UserProfile | null> => {
    setLoading(true);
    setError('');

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('No authenticated user');
      }

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', userData.user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Convert database profile to UserProfile format
      const userProfile: UserProfile = {
        ...data,
        current_rank: 'B',
        ranking_points: 1000,
        total_matches: 0,
        wins: 0,
        losses: 0,
        current_streak: 0,
        matches_played: 0,
        matches_won: 0,
        min_bet_points: 50,
        max_bet_points: 1000,
      };

      return userProfile;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getProfile,
    updateProfile
  };
};
