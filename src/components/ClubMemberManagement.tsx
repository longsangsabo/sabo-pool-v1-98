import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Search, Users, Trophy, Eye, MessageSquare } from 'lucide-react';
import TrustScoreBadge from '@/components/TrustScoreBadge';
import { toast } from 'sonner';

interface ClubMember {
  user_id: string;
  full_name: string;
  phone?: string;
  verified_rank?: string;
  rank_verified_at?: string;
  avatar_url?: string;
  elo?: number;
  total_matches?: number;
  wins?: number;
  created_at: string;
}

const ClubMemberManagement = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  useEffect(() => {
    fetchClubMembers();
  }, [user]);

  const fetchClubMembers = async () => {
    if (!user) return;

    try {
      // First get club profile
      const { data: clubData, error: clubError } = await supabase
        .from('club_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (clubError || !clubData) {
        console.error('Club not found:', clubError);
        setLoading(false);
        return;
      }

      // Get all rank verifications for this club
      const { data: verifications, error: verError } = await supabase
        .from('rank_verifications')
        .select(`
          player_id,
          status,
          verified_at,
          requested_rank
        `)
        .eq('club_id', clubData.id)
        .eq('status', 'approved');
      
      if (verError) {
        console.error('Error fetching verifications:', verError);
        toast.error('Lỗi khi tải danh sách xác thực');
        return;
      }

      // Get player profiles separately
      const playerIds = (verifications || []).map(v => v.player_id);
      if (playerIds.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          phone,
          verified_rank,
          rank_verified_at,
          avatar_url,
          elo
        `)
        .in('user_id', playerIds);

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        toast.error('Lỗi khi tải thông tin người chơi');
        return;
      }

      // Get player rankings separately
      const { data: rankings, error: rankingError } = await supabase
        .from('player_rankings')
        .select(`
          player_id,
          total_matches,
          wins
        `)
        .in('player_id', playerIds);

      if (rankingError) {
        console.error('Error fetching rankings:', rankingError);
        // Continue without rankings data
      }

      // Transform data
      const memberList: ClubMember[] = (verifications || []).map(v => {
        const profile = profiles?.find(p => p.user_id === v.player_id);
        const stats = rankings?.find(r => r.player_id === v.player_id);
        
        if (!profile) return null;
        
        return {
          user_id: profile.user_id,
          full_name: profile.full_name || 'Chưa có tên',
          phone: profile.phone,
          verified_rank: profile.verified_rank,
          rank_verified_at: profile.rank_verified_at,
          avatar_url: profile.avatar_url,
          elo: profile.elo,
          total_matches: stats?.total_matches || 0,
          wins: stats?.wins || 0,
          created_at: v.verified_at || new Date().toISOString()
        };
      }).filter(Boolean) as ClubMember[];

      setMembers(memberList);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.phone && member.phone.includes(searchTerm));
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'verified' && member.verified_rank) ||
      (filter === 'unverified' && !member.verified_rank);

    return matchesSearch && matchesFilter;
  });

  const sendMessage = async (memberId: string, memberName: string) => {
    // Placeholder for messaging functionality
    toast.info(`Chức năng nhắn tin với ${memberName} sẽ có sẵn sớm`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Đang tải danh sách thành viên...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Thành viên đã xác thực ({filteredMembers.length})
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Tất cả
            </Button>
            <Button
              variant={filter === 'verified' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('verified')}
            >
              Đã xác thực
            </Button>
            <Button
              variant={filter === 'unverified' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unverified')}
            >
              Chưa xác thực
            </Button>
          </div>
        </div>

        {/* Members List */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="font-medium">Chưa có thành viên nào</p>
            <p className="text-sm mt-1">
              {searchTerm ? 'Không tìm thấy thành viên phù hợp' : 'Chưa có thành viên nào được xác thực tại CLB này'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMembers.map(member => (
              <div key={member.user_id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {member.avatar_url ? (
                        <img 
                          src={member.avatar_url} 
                          alt={member.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <Users className="w-6 h-6 text-primary" />
                      )}
                    </div>

                    {/* Member Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{member.full_name}</h3>
                        {member.verified_rank && (
                          <Badge variant="secondary" className="text-xs">
                            <Trophy className="w-3 h-3 mr-1" />
                            {member.verified_rank}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {member.phone && (
                          <span>{member.phone}</span>
                        )}
                        {member.elo && (
                          <span>ELO: {member.elo}</span>
                        )}
                        {member.total_matches > 0 && (
                          <span>
                            {member.wins}/{member.total_matches} thắng
                          </span>
                        )}
                      </div>

                      <div className="mt-2">
                        <TrustScoreBadge playerId={member.user_id} />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/players/${member.user_id}`, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendMessage(member.user_id, member.full_name)}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Nhắn tin
                    </Button>
                  </div>
                </div>

                {member.rank_verified_at && (
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    Xác thực vào: {new Date(member.rank_verified_at).toLocaleDateString('vi-VN')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClubMemberManagement;