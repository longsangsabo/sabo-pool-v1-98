import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SPAWallet {
  id: string;
  points_balance: number;
  total_earned: number;
  total_spent: number;
}

export function useSPAPoints() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<SPAWallet | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('id, points_balance, total_earned, total_spent')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching wallet:', error);
      } else {
        setWallet(data);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  // Credit SPA points
  const creditPoints = async (
    amount: number, 
    category: string, 
    description: string,
    referenceId?: string
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase.rpc('credit_spa_points', {
        p_user_id: user.id,
        p_amount: amount,
        p_category: category,
        p_description: description,
        p_reference_id: referenceId || null
      });

      if (error) {
        console.error('Error crediting points:', error);
        toast.error('Lỗi khi cộng điểm SPA');
        return false;
      }

      // Refresh wallet
      await fetchWallet();
      toast.success(`+${amount} SPA điểm! ${description}`);
      return true;
    } catch (error) {
      console.error('Error crediting points:', error);
      toast.error('Lỗi khi cộng điểm SPA');
      return false;
    }
  };

  // Debit SPA points  
  const debitPoints = async (
    amount: number,
    category: string,
    description: string, 
    referenceId?: string
  ) => {
    if (!user) return false;

    try {
      const { data: success, error } = await supabase.rpc('debit_spa_points', {
        p_user_id: user.id,
        p_amount: amount,
        p_category: category,
        p_description: description,
        p_reference_id: referenceId || null
      });

      if (error || !success) {
        console.error('Error debiting points:', error);
        toast.error('Không đủ điểm SPA hoặc có lỗi xảy ra');
        return false;
      }

      // Refresh wallet
      await fetchWallet();
      toast.success(`-${amount} SPA điểm. ${description}`);
      return true;
    } catch (error) {
      console.error('Error debiting points:', error);
      toast.error('Lỗi khi trừ điểm SPA');
      return false;
    }
  };

  // Check if user can afford amount
  const canAfford = (amount: number) => {
    return (wallet?.points_balance || 0) >= amount;
  };

  useEffect(() => {
    fetchWallet();

    // Set up real-time subscription
    if (user) {
      const channel = supabase
        .channel('spa-wallet-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'wallets',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('SPA wallet updated via realtime:', payload);
            fetchWallet();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    wallet,
    balance: wallet?.points_balance || 0,
    totalEarned: wallet?.total_earned || 0,
    totalSpent: wallet?.total_spent || 0,
    loading,
    creditPoints,
    debitPoints,
    canAfford,
    refresh: fetchWallet
  };
}

export default useSPAPoints;