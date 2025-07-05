import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, Calendar, Trophy, Target, Zap, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import TrustScoreBadge from '@/components/TrustScoreBadge';

interface ProfileData {
  user_id: string;
  display_name: string;
  phone: string;
  bio: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  city: string;
  district: string;
  avatar_url: string;
  member_since: string;
  role: 'player' | 'club_owner' | 'both';
  active_role: 'player' | 'club_owner';
  verified_rank: string | null;
}

interface PlayerStats {
  matches_played: number;
  matches_won: number;
  current_streak: number;
  win_rate: number;
}

interface RankVerificationStatus {
  status: 'verified' | 'pending' | 'none';
  current_rank?: string;
}

interface ProfileHeaderProps {
  profile: ProfileData;
  avatarUrl: string;
  uploading: boolean;
  onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  skillLevels: {
    [key: string]: { label: string; color: string };
  };
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  avatarUrl,
  uploading,
  onAvatarUpload,
  skillLevels
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<RankVerificationStatus>({
    status: 'none'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPlayerStats();
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchPlayerStats = async () => {
    if (!user) return;

    try {
      const { data: statsData, error } = await supabase
        .from('player_stats')
        .select('matches_played, matches_won, current_streak, win_rate')
        .eq('player_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching stats:', error);
        return;
      }

      setStats(statsData || {
        matches_played: 0,
        matches_won: 0,
        current_streak: 0,
        win_rate: 0
      });
    } catch (error) {
      console.error('Error fetching player stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationStatus = async () => {
    if (!user) return;

    try {
      // Check if user has verified rank in profile
      if (profile.verified_rank) {
        setVerificationStatus({
          status: 'verified',
          current_rank: profile.verified_rank
        });
        return;
      }

      // Check for pending rank verification requests
      const { data: pendingVerification, error } = await supabase
        .from('rank_verifications')
        .select('requested_rank, status')
        .eq('player_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching verification status:', error);
        return;
      }

      if (pendingVerification && pendingVerification.length > 0) {
        setVerificationStatus({
          status: 'pending',
          current_rank: pendingVerification[0].requested_rank
        });
      } else {
        setVerificationStatus({ status: 'none' });
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  const getVerificationIcon = () => {
    switch (verificationStatus.status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getVerificationText = () => {
    switch (verificationStatus.status) {
      case 'verified':
        return 'Đã xác minh';
      case 'pending':
        return 'Chờ xác minh';
      default:
        return 'Chưa xác minh';
    }
  };

  const getCurrentRank = () => {
    if (verificationStatus.current_rank) {
      return verificationStatus.current_rank;
    }
    return 'Chưa có hạng';
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Avatar and basic info */}
          <div className="flex flex-col items-center lg:items-start space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl || profile.avatar_url} alt="Avatar" />
                <AvatarFallback className="text-xl">
                  {profile.display_name?.charAt(0) || '👤'}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={onAvatarUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            
            <div className="text-center lg:text-left">
              <h2 className="text-xl font-semibold mb-2">
                {profile.display_name || 'Chưa đặt tên'}
              </h2>
              
              <div className="flex flex-col items-center lg:items-start space-y-2">
                <Badge className={skillLevels[profile.skill_level].color}>
                  <Trophy className="w-3 h-3 mr-1" />
                  {skillLevels[profile.skill_level].label}
                </Badge>
                
                <TrustScoreBadge 
                  playerId={profile.user_id}
                  showFullDetails={true}
                />
              </div>

              {profile.member_since && (
                <p className="text-sm text-gray-500 mt-2 flex items-center justify-center lg:justify-start">
                  <Calendar className="w-4 h-4 mr-1" />
                  Tham gia {new Date(profile.member_since).toLocaleDateString('vi-VN')}
                </p>
              )}
              
              {uploading && (
                <p className="text-sm text-blue-600 mt-2">Đang tải ảnh...</p>
              )}
            </div>
          </div>

          {/* Right side - Rank and Stats */}
          <div className="flex-1 space-y-4">
            {/* Current Rank */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hạng hiện tại</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-blue-700">
                      {getCurrentRank()}
                    </span>
                    {getVerificationIcon()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {getVerificationText()}
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            {/* Stats Grid */}
            {loading ? (
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-50 p-3 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-600 font-medium">Trận đấu</p>
                      <p className="text-lg font-bold text-green-700">
                        {stats?.matches_played || 0}
                      </p>
                    </div>
                    <Target className="w-5 h-5 text-green-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Tỷ lệ thắng</p>
                      <p className="text-lg font-bold text-blue-700">
                        {stats?.win_rate?.toFixed(0) || 0}%
                      </p>
                    </div>
                    <Trophy className="w-5 h-5 text-blue-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-orange-600 font-medium">Chuỗi thắng</p>
                      <p className="text-lg font-bold text-orange-700">
                        {stats?.current_streak || 0}
                      </p>
                    </div>
                    <Zap className="w-5 h-5 text-orange-500" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;