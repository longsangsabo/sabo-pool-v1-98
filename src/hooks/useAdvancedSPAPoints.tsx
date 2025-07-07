import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface SPABreakdown {
  basePoints: number;
  streakBonus: number;
  comebackBonus: number;
  timeMultiplier: number;
  finalPoints: number;
  loserPenalty: number;
}

interface Milestone {
  id: string;
  milestone_type: string;
  threshold: number;
  reward_spa: number;
  description: string;
}

interface PlayerMilestone {
  id: string;
  milestone_id: string;
  achieved_at: string;
  progress: number;
  claimed: boolean;
  spa_milestones: Milestone;
}

export function useAdvancedSPAPoints() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Get available milestones
  const { data: milestones } = useQuery({
    queryKey: ['spa-milestones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spa_milestones')
        .select('*')
        .order('threshold');
      
      if (error) throw error;
      return data as Milestone[];
    }
  });

  // Get player's achieved milestones
  const { data: playerMilestones } = useQuery({
    queryKey: ['player-milestones', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('player_milestones')
        .select(`
          *,
          spa_milestones (*)
        `)
        .eq('player_id', user.id)
        .order('achieved_at', { ascending: false });
      
      if (error) throw error;
      return data as PlayerMilestone[];
    },
    enabled: !!user
  });

  // Complete challenge with bonuses
  const completeChallengeMutation = useMutation({
    mutationFn: async ({
      matchId,
      winnerId,
      loserId,
      basePoints = 100
    }: {
      matchId: string;
      winnerId: string;
      loserId: string;
      basePoints?: number;
    }) => {
      const { data, error } = await supabase.rpc('complete_challenge_match_with_bonuses', {
        p_match_id: matchId,
        p_winner_id: winnerId,
        p_loser_id: loserId,
        p_base_points: basePoints
      });

      if (error) throw error;
      return data as unknown as SPABreakdown;
    },
    onSuccess: (breakdown, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['spa-wallet-updates'] });
      queryClient.invalidateQueries({ queryKey: ['player-rankings'] });
      
      // Check for new milestones
      if (user) {
        checkMilestones(user.id);
      }

      // Show success message with breakdown
      const bonusText = [];
      if (breakdown.streakBonus > 0) bonusText.push(`🔥 Chuỗi thắng: +${breakdown.streakBonus}`);
      if (breakdown.comebackBonus > 0) bonusText.push(`🎁 Comeback: +${breakdown.comebackBonus}`);
      if (breakdown.timeMultiplier > 1) bonusText.push(`⏰ Thời gian: x${breakdown.timeMultiplier}`);
      
      toast.success(
        `🏆 +${breakdown.finalPoints} SPA điểm!`,
        {
          description: bonusText.length > 0 ? bonusText.join(' • ') : undefined
        }
      );
    },
    onError: (error) => {
      console.error('Error completing challenge:', error);
      toast.error('Lỗi khi hoàn thành thách đấu');
    }
  });

  // Check and award milestones
  const checkMilestonesMutation = useMutation({
    mutationFn: async (playerId: string) => {
      const { data, error } = await supabase.rpc('check_and_award_milestones', {
        p_player_id: playerId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (newMilestones) => {
      if (Array.isArray(newMilestones) && newMilestones.length > 0) {
        // Invalidate milestones queries
        queryClient.invalidateQueries({ queryKey: ['player-milestones'] });
        queryClient.invalidateQueries({ queryKey: ['wallets'] });
        
        // Show milestone notifications
        newMilestones.forEach((milestone: any) => {
          toast.success(
            `🎉 Cột mốc mới: ${milestone.description}`,
            {
              description: `+${milestone.reward} SPA điểm thưởng!`
            }
          );
        });
      }
    }
  });

  // Get current time multiplier
  const { data: timeMultiplier } = useQuery({
    queryKey: ['time-multiplier'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_time_multiplier');
      if (error) throw error;
      return data as number;
    },
    refetchInterval: 60000 // Refetch every minute
  });

  // Calculate streak bonus preview
  const calculateStreakPreview = async (playerId: string, basePoints: number) => {
    const { data, error } = await supabase.rpc('calculate_streak_bonus', {
      p_player_id: playerId,
      p_base_points: basePoints
    });
    
    if (error) throw error;
    return data as number;
  };

  // Calculate comeback bonus preview
  const calculateComebackPreview = async (playerId: string) => {
    const { data, error } = await supabase.rpc('calculate_comeback_bonus', {
      p_player_id: playerId
    });
    
    if (error) throw error;
    return data as number;
  };

  const completeChallenge = (params: {
    matchId: string;
    winnerId: string;
    loserId: string;
    basePoints?: number;
  }) => {
    return completeChallengeMutation.mutateAsync(params);
  };

  const checkMilestones = (playerId: string) => {
    return checkMilestonesMutation.mutateAsync(playerId);
  };

  return {
    // Data
    milestones,
    playerMilestones,
    timeMultiplier,
    
    // State
    loading: loading || completeChallengeMutation.isPending || checkMilestonesMutation.isPending,
    
    // Functions
    completeChallenge,
    checkMilestones,
    calculateStreakPreview,
    calculateComebackPreview,
    
    // Breakdown component data
    breakdown: completeChallengeMutation.data
  };
}

export default useAdvancedSPAPoints;