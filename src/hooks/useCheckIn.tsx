import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  total_points: number;
  last_checkin_date: string | null;
  created_at: string;
  updated_at: string;
}

interface CheckInResult {
  success: boolean;
  points_earned?: number;
  current_streak?: number;
  total_points?: number;
  message: string;
}

export const useCheckIn = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user streak data
  const { data: userStreak, isLoading } = useQuery({
    queryKey: ['user-streak', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user streak:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  // Check if user has checked in today
  const hasCheckedInToday = () => {
    if (!userStreak?.last_checkin_date) return false;
    const today = new Date().toISOString().split('T')[0];
    return userStreak.last_checkin_date === today;
  };

  // Perform daily check-in
  const checkInMutation = useMutation({
    mutationFn: async (): Promise<CheckInResult> => {
      if (!user?.id) throw new Error('Must be logged in');

      const { data, error } = await supabase.rpc('daily_checkin', {
        user_uuid: user.id
      });

      if (error) throw error;
      return data as unknown as CheckInResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['user-streak'] });
      
      if (result.success) {
        toast.success(result.message, {
          duration: 3000,
        });
      } else {
        toast.info(result.message);
      }
    },
    onError: (error) => {
      console.error('Check-in error:', error);
      toast.error('Có lỗi xảy ra khi check-in');
    },
  });

  const performCheckIn = () => {
    checkInMutation.mutate();
  };

  return {
    userStreak,
    isLoading,
    hasCheckedInToday: hasCheckedInToday(),
    performCheckIn,
    isCheckingIn: checkInMutation.isPending,
  };
};