import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

interface TrustScoreBadgeProps {
  playerId: string;
  showFullDetails?: boolean;
  className?: string;
}

interface TrustScore {
  trust_percentage: number;
  flag_status: string;
  total_ratings: number;
  negative_reports_count: number;
}

const TrustScoreBadge = ({ playerId, showFullDetails = false, className = '' }: TrustScoreBadgeProps) => {
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
  const [verifiedByClub, setVerifiedByClub] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrustScore();
    fetchVerificationInfo();
  }, [playerId]);

  const fetchTrustScore = async () => {
    try {
      const { data, error } = await supabase
        .from('player_trust_scores')
        .select('*')
        .eq('player_id', playerId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching trust score:', error);
        return;
      }

      setTrustScore(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('rank_verifications')
        .select(`
          verified_at,
          club_profiles!rank_verifications_club_id_fkey(club_name)
        `)
        .eq('player_id', playerId)
        .eq('status', 'approved')
        .order('verified_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const verification = data[0];
        if (verification && verification.club_profiles) {
          setVerifiedByClub(verification.club_profiles.club_name);
        }
      }
    } catch (error) {
      console.error('Error fetching verification info:', error);
    }
  };

  const getTrustBadge = () => {
    if (!trustScore) {
      return {
        variant: 'secondary' as const,
        icon: Shield,
        text: 'Chưa có đánh giá',
        color: 'text-gray-600'
      };
    }

    const percentage = trustScore.trust_percentage;

    if (trustScore.flag_status === 'red') {
      return {
        variant: 'destructive' as const,
        icon: AlertTriangle,
        text: 'Cảnh báo',
        color: 'text-red-600'
      };
    }

    if (percentage >= 95) {
      return {
        variant: 'default' as const,
        icon: ShieldCheck,
        text: `${percentage.toFixed(0)}% tin cậy`,
        color: 'text-green-600'
      };
    } else if (percentage >= 80) {
      return {
        variant: 'secondary' as const,
        icon: Shield,
        text: `${percentage.toFixed(0)}% tin cậy`,
        color: 'text-yellow-600'
      };
    } else {
      return {
        variant: 'outline' as const,
        icon: ShieldAlert,
        text: `${percentage.toFixed(0)}% tin cậy`,
        color: 'text-red-600'
      };
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded h-6 w-20 ${className}`}></div>
    );
  }

  const badge = getTrustBadge();
  const Icon = badge.icon;

  return (
    <div className={`space-y-1 ${className}`}>
      <Badge variant={badge.variant} className="flex items-center space-x-1">
        <Icon className="w-3 h-3" />
        <span className="text-xs">{badge.text}</span>
      </Badge>
      
      {showFullDetails && (
        <div className="text-xs text-gray-500 space-y-0.5">
          {verifiedByClub && (
            <div>Xác thực bởi: {verifiedByClub}</div>
          )}
          {trustScore && trustScore.total_ratings > 0 && (
            <div>
              {trustScore.total_ratings} đánh giá
              {trustScore.negative_reports_count > 0 && (
                <span className="text-red-600 ml-1">
                  ({trustScore.negative_reports_count} báo cáo tiêu cực)
                </span>
              )}
            </div>
          )}
          {trustScore?.flag_status === 'yellow' && (
            <div className="text-yellow-600 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Cảnh báo vàng
            </div>
          )}
          {trustScore?.flag_status === 'red' && (
            <div className="text-red-600 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Cảnh báo đỏ
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrustScoreBadge;