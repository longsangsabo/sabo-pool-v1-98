import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id?: string;
  referral_code: string;
  status: string;
  reward_claimed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingRewards: number;
  totalEarned: number;
}

export const useReferrals = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingRewards: 0,
    totalEarned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchReferrals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred:profiles!referred_id(full_name)
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReferrals(data || []);

      // Calculate stats
      const totalReferrals = data?.length || 0;
      const successfulReferrals = data?.filter(r => r.status === 'completed').length || 0;
      const pendingRewards = data?.filter(r => r.status === 'pending').length || 0;
      const totalEarned = successfulReferrals * 100; // 100 SPA per successful referral

      setStats({
        totalReferrals,
        successfulReferrals,
        pendingRewards,
        totalEarned,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch referrals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [user]);

  return {
    referrals,
    stats,
    loading,
    error,
    refreshData: fetchReferrals,
  };
};