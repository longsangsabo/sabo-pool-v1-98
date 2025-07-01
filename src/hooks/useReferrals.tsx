import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id?: string;
  referral_code: string;
  status: string;
  reward_type?: string;
  reward_amount: number;
  completed_at?: string;
  rewarded_at?: string;
  created_at: string;
}

export interface ReferralReward {
  id: string;
  user_id: string;
  referral_id: string;
  reward_type: string;
  reward_value: number;
  description: string;
  claimed_at?: string;
  expires_at?: string;
  created_at: string;
}

export const useReferrals = () => {
  const [myReferralCode, setMyReferralCode] = useState<string>('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingRewards: 0,
    totalEarned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const generateReferralCode = (userId: string) => {
    return `SABO${userId.slice(-6).toUpperCase()}`;
  };

  const fetchOrCreateReferralCode = async () => {
    if (!user) return;

    try {
      // Mock referral code generation since referrals table doesn't exist
      const newCode = generateReferralCode(user.id);
      setMyReferralCode(newCode);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch referral code'
      );
    }
  };

  const fetchReferrals = async () => {
    if (!user) return;

    try {
      // Mock referrals data since referrals table doesn't exist
      const mockReferrals: Referral[] = [
        {
          id: '1',
          referrer_id: user.id,
          referred_id: 'referred_user_1',
          referral_code: generateReferralCode(user.id),
          status: 'completed',
          reward_amount: 99000,
          completed_at: new Date().toISOString(),
          rewarded_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ];

      setReferrals(mockReferrals);

      // Calculate stats
      const totalReferrals = mockReferrals.length;
      const successfulReferrals = mockReferrals.filter(r => r.status === 'completed').length;
      const pendingRewards = mockReferrals.filter(r => r.status === 'completed' && !r.rewarded_at).length;

      setStats(prev => ({
        ...prev,
        totalReferrals,
        successfulReferrals,
        pendingRewards,
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch referrals'
      );
    }
  };

  const fetchRewards = async () => {
    if (!user) return;

    try {
      // Mock rewards data since referral_rewards table doesn't exist
      const mockRewards: ReferralReward[] = [
        {
          id: '1',
          user_id: user.id,
          referral_id: '1',
          reward_type: 'free_month',
          reward_value: 99000,
          description: 'Tặng 1 tháng Premium miễn phí',
          claimed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ];

      setRewards(mockRewards);

      // Calculate total earned
      const totalEarned = mockRewards.reduce((sum, reward) => sum + reward.reward_value, 0);
      setStats(prev => ({ ...prev, totalEarned }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rewards');
    }
  };

  const processReferral = async (referralCode: string, newUserId: string) => {
    try {
      // Mock process referral since tables don't exist
      console.log('Mock process referral:', { referralCode, newUserId });
      return { success: true };
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to process referral'
      );
    }
  };

  const claimReward = async (rewardId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Mock claim reward since table doesn't exist
      console.log('Mock claim reward:', rewardId);
      await fetchRewards();
      return { success: true };
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to claim reward'
      );
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchOrCreateReferralCode(),
        fetchReferrals(),
        fetchRewards(),
      ]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    myReferralCode,
    referrals,
    rewards,
    stats,
    loading,
    error,
    processReferral,
    claimReward,
    refreshData: () => Promise.all([fetchReferrals(), fetchRewards()]),
  };
};
