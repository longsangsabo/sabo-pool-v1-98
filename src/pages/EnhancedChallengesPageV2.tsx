import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import CreateChallengeModal from '@/components/CreateChallengeModal';
import ChallengeDetailsModal from '@/components/ChallengeDetailsModal';
import TrustScoreBadge from '@/components/TrustScoreBadge';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Filter,
  Trophy,
  Target,
  Users,
  Zap,
  Clock,
  MapPin,
  DollarSign,
  TrendingUp,
  Calendar,
  Bell,
  MessageSquare,
  Star,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface Challenge {
  id: string;
  challenger_id: string;
  opponent_id: string;
  club_id?: string;
  bet_points: number;
  race_to: number;
  status: string;
  message?: string;
  scheduled_time?: string;
  created_at: string;
  expires_at: string;
  challenger_profile?: {
    full_name: string;
    avatar_url?: string;
    current_rank?: string;
    spa_points?: number;
  };
  opponent_profile?: {
    full_name: string;
    avatar_url?: string;
    current_rank?: string;
    spa_points?: number;
  };
  club_profiles?: {
    club_name: string;
    address: string;
  };
}

interface ChallengeStats {
  total: number;
  pending: number;
  accepted: number;
  completed: number;
  won: number;
  lost: number;
  winRate: number;
}

const EnhancedChallengesPageV2: React.FC = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<ChallengeStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    won: 0,
    lost: 0,
    winRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    calculateStats();
  }, [challenges]);

  const fetchChallenges = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('challenges')
        .select(`
          *,
          challenger_profile:profiles!challenges_challenger_id_fkey(
            full_name,
            avatar_url,
            player_rankings(
              spa_points,
              ranks(code)
            )
          ),
          opponent_profile:profiles!challenges_opponent_id_fkey(
            full_name,
            avatar_url,
            player_rankings(
              spa_points,
              ranks(code)
            )
          ),
          club_profiles!challenges_club_id_fkey(
            club_name,
            address
          )
        `)
        .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;

      setChallenges(data || []);

      
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Lỗi khi tải danh sách thách đấu');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!user) return;

    const total = challenges.length;
    const pending = challenges.filter(c => c.status === 'pending').length;
    const accepted = challenges.filter(c => c.status === 'accepted').length;
    const completed = challenges.filter(c => c.status === 'completed').length;
    
    // Note: Win/loss logic would need match results data
    const won = 0; // This would come from match results
    const lost = 0;
    const winRate = total > 0 ? (won / (won + lost)) * 100 : 0;

    setStats({
      total,
      pending,
      accepted,
      completed,
      won,
      lost,
      winRate,
    });
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (!searchTerm) return true;
    
    const challengerName = challenge.challenger_profile?.full_name?.toLowerCase() || '';
    const opponentName = challenge.opponent_profile?.full_name?.toLowerCase() || '';
    const clubName = challenge.club_profiles?.club_name?.toLowerCase() || '';
    
    return (
      challengerName.includes(searchTerm.toLowerCase()) ||
      opponentName.includes(searchTerm.toLowerCase()) ||
      clubName.includes(searchTerm.toLowerCase())
    );
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'Chờ phản hồi', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'accepted':
        return { text: 'Đã chấp nhận', color: 'bg-green-100 text-green-800', icon: Trophy };
      case 'declined':
        return { text: 'Đã từ chối', color: 'bg-red-100 text-red-800', icon: Target };
      case 'completed':
        return { text: 'Hoàn thành', color: 'bg-blue-100 text-blue-800', icon: Star };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800', icon: Users };
    }
  };

  const handleChallengeClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowDetailsModal(true);
  };

  const renderChallengeCard = (challenge: Challenge) => {
    const statusInfo = getStatusInfo(challenge.status);
    const StatusIcon = statusInfo.icon;
    const isChallenger = user?.id === challenge.challenger_id;
    const canRespond = !isChallenger && challenge.status === 'pending';

    return (
      <Card
        key={challenge.id}
        className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-primary/20"
        onClick={() => handleChallengeClick(challenge)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon className="w-4 h-4" />
              <CardTitle className="text-base">
                Thách đấu #{challenge.id.slice(-6)}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {canRespond && (
                <Bell className="w-4 h-4 text-amber-500 animate-pulse" />
              )}
              <Badge className={statusInfo.color}>
                {statusInfo.text}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Players */}
          <div className="grid grid-cols-3 gap-2 items-center">
            {/* Challenger */}
            <div className="text-center space-y-1">
              <Avatar className="w-10 h-10 mx-auto">
                <AvatarImage src={challenge.challenger_profile?.avatar_url} />
                <AvatarFallback className="text-xs">
                  {challenge.challenger_profile?.full_name?.[0] || 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="text-xs">
                <div className="font-medium truncate">
                  {challenge.challenger_profile?.full_name || 'Thách đấu'}
                </div>
                <div className="text-gray-500">
                  {challenge.challenger_profile?.current_rank || 'K'}
                </div>
              </div>
              {challenge.challenger_id && (
                <TrustScoreBadge playerId={challenge.challenger_id} />
              )}
            </div>

            {/* VS & Bet */}
            <div className="text-center space-y-1">
              <div className="text-lg font-bold text-gray-400">VS</div>
              <div className="flex items-center justify-center gap-1 bg-yellow-50 rounded px-2 py-1">
                <DollarSign className="w-3 h-3 text-yellow-600" />
                <span className="text-xs font-bold text-yellow-800">
                  {challenge.bet_points}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Race {challenge.race_to}
              </div>
            </div>

            {/* Opponent */}
            <div className="text-center space-y-1">
              <Avatar className="w-10 h-10 mx-auto">
                <AvatarImage src={challenge.opponent_profile?.avatar_url} />
                <AvatarFallback className="text-xs">
                  {challenge.opponent_profile?.full_name?.[0] || 'O'}
                </AvatarFallback>
              </Avatar>
              <div className="text-xs">
                <div className="font-medium truncate">
                  {challenge.opponent_profile?.full_name || 'Đối thủ'}
                </div>
                <div className="text-gray-500">
                  {challenge.opponent_profile?.current_rank || 'K'}
                </div>
              </div>
              {challenge.opponent_id && (
                <TrustScoreBadge playerId={challenge.opponent_id} />
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-xs text-gray-600">
            {challenge.club_profiles && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{challenge.club_profiles.club_name}</span>
              </div>
            )}
            
            {challenge.scheduled_time && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(challenge.scheduled_time).toLocaleDateString('vi-VN')}</span>
              </div>
            )}

            {challenge.message && (
              <div className="flex items-start gap-1">
                <MessageSquare className="w-3 h-3 mt-0.5" />
                <span className="truncate italic">"{challenge.message}"</span>
              </div>
            )}

            <div className="flex justify-between text-gray-400">
              <span>Tạo: {new Date(challenge.created_at).toLocaleDateString('vi-VN')}</span>
              <span>HH: {new Date(challenge.expires_at).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Đang tải thách đấu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Thách đấu</h1>
            <p className="text-muted-foreground">
              Quản lý và tham gia các thách đấu billiards
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Tạo thách đấu
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Tổng cộng</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Chờ phản hồi</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.accepted}</div>
              <div className="text-sm text-muted-foreground">Đã chấp nhận</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Hoàn thành</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên người chơi hoặc câu lạc bộ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="pending">Chờ phản hồi</SelectItem>
                    <SelectItem value="accepted">Đã chấp nhận</SelectItem>
                    <SelectItem value="declined">Đã từ chối</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Ngày tạo</SelectItem>
                    <SelectItem value="bet_points">Mức cược</SelectItem>
                    <SelectItem value="expires_at">Hết hạn</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Challenges List */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Tất cả ({filteredChallenges.length})</TabsTrigger>
            <TabsTrigger value="received">
              Nhận được ({filteredChallenges.filter(c => c.opponent_id === user?.id).length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Đã gửi ({filteredChallenges.filter(c => c.challenger_id === user?.id).length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Đang diễn ra ({filteredChallenges.filter(c => c.status === 'accepted').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChallenges.map(renderChallengeCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Chưa có thách đấu nào</h3>
                  <p className="text-muted-foreground mb-4">
                    Tạo thách đấu đầu tiên của bạn để bắt đầu!
                  </p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo thách đấu
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="received" className="space-y-4">
            {filteredChallenges.filter(c => c.opponent_id === user?.id).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChallenges
                  .filter(c => c.opponent_id === user?.id)
                  .map(renderChallengeCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Chưa có thách đấu nào</h3>
                  <p className="text-muted-foreground">
                    Bạn chưa nhận được thách đấu nào
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {filteredChallenges.filter(c => c.challenger_id === user?.id).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChallenges
                  .filter(c => c.challenger_id === user?.id)
                  .map(renderChallengeCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Chưa gửi thách đấu nào</h3>
                  <p className="text-muted-foreground mb-4">
                    Tạo thách đấu để thách thức đối thủ!
                  </p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo thách đấu
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {filteredChallenges.filter(c => c.status === 'accepted').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChallenges
                  .filter(c => c.status === 'accepted')
                  .map(renderChallengeCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Không có trận đấu nào đang diễn ra</h3>
                  <p className="text-muted-foreground">
                    Các trận đấu đã được chấp nhận sẽ hiển thị ở đây
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CreateChallengeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onChallengeCreated={fetchChallenges}
      />
      
      <ChallengeDetailsModal
        challenge={selectedChallenge}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedChallenge(null);
        }}
        onUpdate={fetchChallenges}
      />
    </div>
  );
};

export default EnhancedChallengesPageV2;