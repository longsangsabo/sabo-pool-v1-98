import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface RewardItem {
  type: string;
  name: string;
  description: string;
  points_cost: number;
  value: string;
  icon: string;
}

const AVAILABLE_REWARDS: RewardItem[] = [
  {
    type: 'tournament_discount',
    name: 'Giảm giá giải đấu 10k',
    description: 'Giảm 10k phí tham gia giải đấu',
    points_cost: 100,
    value: '10000',
    icon: '🏆'
  },
  {
    type: 'badge',
    name: 'Huy hiệu Đặc biệt',
    description: 'Huy hiệu hiển thị trên profile',
    points_cost: 50,
    value: 'special_badge',
    icon: '⭐'
  },
  {
    type: 'priority_listing',
    name: 'Ưu tiên tìm kiếm',
    description: 'Hiển thị ưu tiên trong danh sách tìm bạn tập',
    points_cost: 75,
    value: '7_days',
    icon: '🔝'
  }
];

export const useRewards = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user redemptions
  const { data: redemptions = [] } = useQuery({
    queryKey: ['reward-redemptions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('reward_redemptions')
        .select('*')
        .eq('user_id', user.id)
        .order('redeemed_at', { ascending: false });

      if (error) {
        console.error('Error fetching redemptions:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  // Redeem reward mutation
  const redeemMutation = useMutation({
    mutationFn: async (reward: RewardItem) => {
      if (!user?.id) throw new Error('Must be logged in');

      const { data, error } = await supabase.rpc('redeem_reward', {
        user_uuid: user.id,
        reward_type: reward.type,
        reward_value: reward.value,
        points_cost: reward.points_cost
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (result, reward) => {
      queryClient.invalidateQueries({ queryKey: ['reward-redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['user-streak'] });
      
      const resultData = result as any;
      if (resultData?.success) {
        toast.success(resultData.message);
      } else {
        toast.error(resultData?.message || 'Có lỗi xảy ra');
      }
    },
    onError: (error) => {
      console.error('Redemption error:', error);
      toast.error('Có lỗi xảy ra khi đổi phần thưởng');
    },
  });

  return {
    availableRewards: AVAILABLE_REWARDS,
    redemptions,
    redeemReward: (reward: RewardItem) => redeemMutation.mutate(reward),
    isRedeeming: redeemMutation.isPending,
  };
};