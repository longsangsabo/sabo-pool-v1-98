import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Shield, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Star,
  Activity,
  Target,
  Award,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClubStats {
  active_members: number;
  verified_members: number;
  avg_trust_score: number;
  total_matches_hosted: number;
  total_revenue: number;
  peak_hours: Record<string, number>;
}

interface ClubMember {
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
    verified_rank: string;
  };
  player_trust_scores: {
    trust_percentage: number;
  };
}

const ClubStatsDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClubStats | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [clubInfo, setClubInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchClubInfo();
    }
  }, [user]);

  const fetchClubInfo = async () => {
    if (!user) return;

    try {
      // Check if user owns a club
      const { data: clubData, error: clubError } = await supabase
        .from('club_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (clubError || !clubData) {
        setLoading(false);
        return;
      }

      setClubInfo(clubData);
      await Promise.all([
        fetchClubStats(clubData.id),
        fetchClubMembers(clubData.id)
      ]);
    } catch (error) {
      console.error('Error fetching club info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClubStats = async (clubId: string) => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      let { data: statsData, error: statsError } = await supabase
        .from('club_stats')
        .select('*')
        .eq('club_id', clubId)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .single();

      if (statsError && statsError.code === 'PGRST116') {
        // Create initial stats if not exists
        const { data: newStats, error: createError } = await supabase
          .from('club_stats')
          .insert({
            club_id: clubId,
            month: currentMonth,
            year: currentYear
          })
          .select()
          .single();

        if (createError) throw createError;
        statsData = newStats;
      } else if (statsError) {
        throw statsError;
      }

      // Calculate real-time stats
      const realTimeStats = await calculateRealTimeStats(clubId);
      
      setStats({
        active_members: statsData?.active_members || 0,
        verified_members: statsData?.verified_members || 0,
        avg_trust_score: statsData?.avg_trust_score || 0,
        total_matches_hosted: statsData?.total_matches_hosted || 0,
        total_revenue: statsData?.total_revenue || 0,
        peak_hours: typeof statsData?.peak_hours === 'object' && statsData.peak_hours !== null 
          ? statsData.peak_hours as Record<string, number>
          : {},
        ...realTimeStats
      });
    } catch (error) {
      console.error('Error fetching club stats:', error);
    }
  };

  const calculateRealTimeStats = async (clubId: string) => {
    try {
      // Count active members (profiles with this club_id)
      const { count: activeMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubId);

      // Count verified members (with verified_rank)
      const { count: verifiedMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubId)
        .not('verified_rank', 'is', null);

      // Calculate average trust score
      const { data: trustScores } = await supabase
        .from('player_trust_scores')
        .select('trust_percentage')
        .in('player_id', 
          await supabase
            .from('profiles')
            .select('user_id')
            .eq('club_id', clubId)
            .then(({ data }) => data?.map(p => p.user_id) || [])
        );

      const avgTrustScore = trustScores && trustScores.length > 0
        ? trustScores.reduce((sum, score) => sum + score.trust_percentage, 0) / trustScores.length
        : 0;

      // Count matches hosted this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: matchesHosted } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubId)
        .gte('created_at', startOfMonth.toISOString());

      return {
        active_members: activeMembers || 0,
        verified_members: verifiedMembers || 0,
        avg_trust_score: avgTrustScore,
        total_matches_hosted: matchesHosted || 0
      };
    } catch (error) {
      console.error('Error calculating real-time stats:', error);
      return {};
    }
  };

  const fetchClubMembers = async (clubId: string) => {
    try {
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          avatar_url,
          verified_rank
        `)
        .eq('club_id', clubId)
        .limit(10);

      if (error) throw error;

      // Fetch trust scores for members
      const membersWithTrust = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: trustData } = await supabase
            .from('player_trust_scores')
            .select('trust_percentage')
            .eq('player_id', profile.user_id)
            .single();

          return {
            user_id: profile.user_id,
            profiles: {
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
              verified_rank: profile.verified_rank
            },
            player_trust_scores: {
              trust_percentage: trustData?.trust_percentage || 0
            }
          };
        })
      );

      setMembers(membersWithTrust);
    } catch (error) {
      console.error('Error fetching club members:', error);
    }
  };

  const calculateRevenueProjection = () => {
    if (!stats) return 0;
    
    // Simple projection: matches_hosted * average_fee_per_match
    const avgFeePerMatch = 50000; // 50k VND average
    const monthlyMatches = stats.total_matches_hosted;
    return monthlyMatches * avgFeePerMatch;
  };

  const getPeakHours = () => {
    if (!stats?.peak_hours) return [];
    
    return Object.entries(stats.peak_hours)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([hour, count]) => ({ hour, count }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!clubInfo) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Không có câu lạc bộ
          </h3>
          <p className="text-gray-500">
            Bạn cần là chủ sở hữu câu lạc bộ để xem thống kê này
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{clubInfo.club_name}</h2>
          <p className="text-gray-600">{clubInfo.address}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchClubInfo()}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-medium">Thành viên</p>
                <p className="text-2xl font-bold text-blue-700">
                  {stats?.active_members || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 font-medium">Đã xác thực</p>
                <p className="text-2xl font-bold text-green-700">
                  {stats?.verified_members || 0}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 font-medium">Điểm tin cậy TB</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {stats?.avg_trust_score?.toFixed(1) || 0}%
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 font-medium">Trận tháng này</p>
                <p className="text-2xl font-bold text-purple-700">
                  {stats?.total_matches_hosted || 0}
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Projection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Dự báo doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-green-600">
              {calculateRevenueProjection().toLocaleString('vi-VN')} VNĐ
            </div>
            <div className="text-sm text-gray-600">
              <p>Dựa trên {stats?.total_matches_hosted || 0} trận trong tháng</p>
              <p className="mt-2">
                <strong>Giờ cao điểm:</strong>
              </p>
              <div className="space-y-1">
                {getPeakHours().map(({ hour, count }) => (
                  <div key={hour} className="flex justify-between">
                    <span>{hour}:00</span>
                    <span>{count} trận</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Thành viên tích cực
            </CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Chưa có thành viên nào
              </p>
            ) : (
              <div className="space-y-3">
                {members.slice(0, 5).map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.profiles.avatar_url} />
                        <AvatarFallback>
                          {member.profiles.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {member.profiles.full_name}
                        </p>
                        {member.profiles.verified_rank && (
                          <Badge className="text-xs">
                            {member.profiles.verified_rank}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {member.player_trust_scores.trust_percentage.toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-500">tin cậy</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClubStatsDashboard;