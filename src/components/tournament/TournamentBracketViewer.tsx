import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Users, Calendar, Play, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TournamentMatch {
  id: string;
  round_number: number;
  match_number: number;
  player1_id?: string;
  player2_id?: string;
  winner_id?: string;
  player1_score: number;
  player2_score: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  scheduled_time?: string;
  player1?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  player2?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface TournamentBracketViewerProps {
  tournamentId: string;
  canManage?: boolean;
}

export const TournamentBracketViewer: React.FC<TournamentBracketViewerProps> = ({
  tournamentId,
  canManage = false
}) => {
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [bracketData, setBracketData] = useState<any>(null);

  useEffect(() => {
    fetchBracketData();
  }, [tournamentId]);

  const fetchBracketData = async () => {
    try {
      setLoading(true);
      
      // Fetch bracket data
      const { data: bracket, error: bracketError } = await supabase
        .from('tournament_brackets')
        .select('*')
        .eq('tournament_id', tournamentId)
        .single();

      if (bracketError && bracketError.code !== 'PGRST116') {
        throw bracketError;
      }

      setBracketData(bracket);

      // Fetch matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('tournament_matches')
        .select(`
          *,
          player1:profiles!tournament_matches_player1_id_fkey(user_id, full_name, avatar_url),
          player2:profiles!tournament_matches_player2_id_fkey(user_id, full_name, avatar_url)
        `)
        .eq('tournament_id', tournamentId)
        .order('round_number')
        .order('match_number');

      if (matchesError) throw matchesError;
      
      // Transform the data to match our interface
      const transformedMatches = (matchesData || []).map(match => ({
        id: match.id,
        round_number: match.round_number,
        match_number: match.match_number,
        player1_id: match.player1_id,
        player2_id: match.player2_id,
        winner_id: match.winner_id,
        player1_score: match.player1_score || 0,
        player2_score: match.player2_score || 0,
        status: (match.status as 'scheduled' | 'ongoing' | 'completed' | 'cancelled') || 'scheduled',
        scheduled_time: match.scheduled_time,
        player1: match.player1 ? {
          id: match.player1.user_id,
          full_name: match.player1.full_name,
          avatar_url: match.player1.avatar_url
        } : undefined,
        player2: match.player2 ? {
          id: match.player2.user_id,
          full_name: match.player2.full_name,
          avatar_url: match.player2.avatar_url
        } : undefined
      }));
      
      setMatches(transformedMatches);
    } catch (error) {
      console.error('Error fetching bracket data:', error);
      toast.error('Không thể tải dữ liệu bảng đấu');
    } finally {
      setLoading(false);
    }
  };

  const generateBracket = async () => {
    try {
      const { data, error } = await supabase.rpc(
        'generate_tournament_bracket',
        { tournament_uuid: tournamentId }
      );

      if (error) throw error;
      
      toast.success('Bảng đấu đã được tạo thành công!');
      fetchBracketData();
    } catch (error) {
      console.error('Error generating bracket:', error);
      toast.error('Có lỗi khi tạo bảng đấu');
    }
  };

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderMatch = (match: TournamentMatch) => (
    <Card key={match.id} className="w-64 mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Vòng {match.round_number} - Trận {match.match_number}
          </span>
          <Badge className={getMatchStatusColor(match.status)}>
            {match.status === 'completed' && 'Hoàn thành'}
            {match.status === 'ongoing' && 'Đang diễn ra'}
            {match.status === 'scheduled' && 'Đã lên lịch'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Player 1 */}
        <div className={`flex items-center gap-3 p-2 rounded ${
          match.winner_id === match.player1_id ? 'bg-green-50 border-green-200' : 'bg-gray-50'
        }`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={match.player1?.avatar_url} />
            <AvatarFallback>
              {match.player1?.full_name?.[0] || 'P1'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-sm">
              {match.player1?.full_name || 'TBD'}
            </p>
          </div>
          <div className="text-lg font-bold">
            {match.player1_score}
          </div>
        </div>

        {/* VS */}
        <div className="text-center text-xs text-muted-foreground">VS</div>

        {/* Player 2 */}
        <div className={`flex items-center gap-3 p-2 rounded ${
          match.winner_id === match.player2_id ? 'bg-green-50 border-green-200' : 'bg-gray-50'
        }`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={match.player2?.avatar_url} />
            <AvatarFallback>
              {match.player2?.full_name?.[0] || 'P2'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-sm">
              {match.player2?.full_name || 'TBD'}
            </p>
          </div>
          <div className="text-lg font-bold">
            {match.player2_score}
          </div>
        </div>

        {/* Match Info */}
        {match.scheduled_time && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {new Date(match.scheduled_time).toLocaleString('vi-VN')}
          </div>
        )}

        {/* Actions */}
        {canManage && match.status === 'scheduled' && (
          <Button size="sm" className="w-full">
            <Play className="h-3 w-3 mr-1" />
            Bắt đầu trận đấu
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!bracketData && matches.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa có bảng đấu</h3>
          <p className="text-muted-foreground mb-4">
            Bảng đấu chưa được tạo cho giải đấu này.
          </p>
          {canManage && (
            <Button onClick={generateBracket}>
              <Trophy className="h-4 w-4 mr-2" />
              Tạo bảng đấu
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round_number]) {
      acc[match.round_number] = [];
    }
    acc[match.round_number].push(match);
    return acc;
  }, {} as Record<number, TournamentMatch[]>);

  const rounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Bảng đấu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {matches.length} trận đấu
            </div>
            {bracketData && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Tạo lúc: {new Date(bracketData.created_at).toLocaleDateString('vi-VN')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bracket */}
      <div className="space-y-8">
        {rounds.map(roundNumber => (
          <div key={roundNumber}>
            <h3 className="text-lg font-semibold mb-4">
              Vòng {roundNumber}
              {roundNumber === Math.max(...rounds) && ' (Chung kết)'}
            </h3>
            
            <div className="flex flex-wrap gap-4">
              {matchesByRound[roundNumber].map(renderMatch)}
            </div>
          </div>
        ))}
      </div>

      {/* Generate Bracket Button */}
      {canManage && matches.length === 0 && (
        <Card>
          <CardContent className="py-6">
            <div className="text-center">
              <Button onClick={generateBracket} size="lg">
                <Trophy className="h-4 w-4 mr-2" />
                Tạo bảng đấu tự động
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Sẽ tự động tạo bảng đấu dựa trên danh sách người đăng ký
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TournamentBracketViewer;
