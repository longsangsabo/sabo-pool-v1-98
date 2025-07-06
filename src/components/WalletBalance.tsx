import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface WalletData {
  balance: number;
  recent_transactions: Array<{
    amount: number;
    transaction_type: string;
    transaction_category: string;
    description: string;
    created_at: string;
  }>;
}

export const WalletBalance: React.FC = () => {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Get wallet data and recent transactions
        const { data: walletResult } = await supabase
          .from('wallets')
          .select(`
            balance,
            id,
            wallet_transactions (
              amount,
              transaction_type,
              transaction_category,
              description,
              created_at
            )
          `)
          .eq('user_id', user.id)
          .single();

        setWalletData({
          balance: walletResult?.balance || 0,
          recent_transactions: walletResult?.wallet_transactions?.slice(0, 5) || [],
        });
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [user]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded"></div>
            <div className="h-3 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Số dư SPA</h3>
      </div>
      
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-primary mb-1">
          {walletData?.balance || 0} SPA
        </div>
        <div className="text-sm text-muted-foreground">Số dư hiện tại</div>
      </div>

      {walletData?.recent_transactions && walletData.recent_transactions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Giao dịch gần đây</h4>
          <div className="space-y-1">
            {walletData.recent_transactions.slice(0, 3).map((transaction, index) => (
              <div key={index} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  {transaction.transaction_type === 'credit' ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {transaction.description || transaction.transaction_category}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-medium ${
                    transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.transaction_type === 'credit' ? '+' : '-'}{transaction.amount}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {transaction.transaction_category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default WalletBalance;