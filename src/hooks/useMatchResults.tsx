import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MatchResultData, MatchResultFormData, MatchDispute, EloHistoryEntry } from '@/types/matchResult';

export const useMatchResults = () => {
  const [loading, setLoading] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchResultData[]>([]);
  const { toast } = useToast();

  // Create match result
  const createMatchResult = async (data: MatchResultFormData): Promise<MatchResultData | null> => {
    setLoading(true);
    try {
      // Determine winner based on scores
      const winner_id = data.player1_score > data.player2_score 
        ? data.player1_id 
        : data.player2_score > data.player1_score 
          ? data.player2_id 
          : undefined;
      
      const loser_id = winner_id === data.player1_id 
        ? data.player2_id 
        : winner_id === data.player2_id 
          ? data.player1_id 
          : undefined;

      const matchResultData = {
        ...data,
        winner_id,
        loser_id,
        total_frames: Math.max(data.player1_score, data.player2_score),
        player1_stats: data.player1_stats || {},
        player2_stats: data.player2_stats || {},
      };

      const { data: result, error } = await supabase
        .from('match_results')
        .insert([matchResultData])
        .select(`
          *,
          player1:player1_id(user_id, display_name, avatar_url, verified_rank, elo),
          player2:player2_id(user_id, display_name, avatar_url, verified_rank, elo),
          club:club_id(id, club_name, address),
          referee:referee_id(user_id, display_name),
          tournament:tournament_id(id, name)
        `)
        .single();

      if (error) throw error;

      // Transform the result to match our interface
      const transformedResult = transformMatchResult(result);
      
      toast({
        title: "Thành công",
        description: "Đã tạo kết quả trận đấu. Chờ xác nhận từ đối thủ.",
      });

      return transformedResult;
    } catch (error) {
      console.error('Error creating match result:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo kết quả trận đấu",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Confirm match result by player
  const confirmMatchResult = async (matchResultId: string, playerId: string): Promise<boolean> => {
    setLoading(true);
    try {
      // First get the match result to determine which player is confirming
      const { data: matchResult, error: fetchError } = await supabase
        .from('match_results')
        .select('player1_id, player2_id, player1_confirmed, player2_confirmed')
        .eq('id', matchResultId)
        .single();

      if (fetchError) throw fetchError;

      const isPlayer1 = matchResult.player1_id === playerId;
      const updateData = isPlayer1 
        ? { 
            player1_confirmed: true, 
            player1_confirmed_at: new Date().toISOString() 
          }
        : { 
            player2_confirmed: true, 
            player2_confirmed_at: new Date().toISOString() 
          };

      const { error } = await supabase
        .from('match_results')
        .update(updateData)
        .eq('id', matchResultId);

      if (error) throw error;

      // Check if both players have now confirmed
      const bothConfirmed = isPlayer1 
        ? matchResult.player2_confirmed 
        : matchResult.player1_confirmed;

      if (bothConfirmed) {
        // Auto-verify the match if both players confirmed
        await verifyMatchResult(matchResultId, playerId, 'auto');
      }

      toast({
        title: "Đã xác nhận",
        description: bothConfirmed 
          ? "Kết quả đã được xác thực và ELO đã cập nhật!" 
          : "Đã xác nhận kết quả. Chờ đối thủ xác nhận.",
      });

      return true;
    } catch (error) {
      console.error('Error confirming match result:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xác nhận kết quả",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verify match result (admin/referee)
  const verifyMatchResult = async (
    matchResultId: string, 
    verifierId: string, 
    method: 'manual' | 'qr_code' | 'referee' | 'auto' = 'manual'
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('verify_match_result', {
        p_match_result_id: matchResultId,
        p_verifier_id: verifierId,
        p_verification_method: method
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        toast({
          title: "Đã xác thực",
          description: "Kết quả trận đấu đã được xác thực và ELO đã cập nhật.",
        });
        return true;
      } else {
        toast({
          title: "Lỗi",
          description: result?.error || "Không thể xác thực kết quả",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error verifying match result:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xác thực kết quả",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Create dispute
  const createDispute = async (
    matchResultId: string,
    reason: string,
    details?: string,
    evidenceUrls?: string[]
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('match_disputes')
        .insert([{
          match_result_id: matchResultId,
          dispute_reason: reason,
          dispute_details: details,
          evidence_urls: evidenceUrls || []
        }]);

      if (error) throw error;

      toast({
        title: "Đã gửi khiếu nại",
        description: "Admin sẽ xem xét và phản hồi trong thời gian sớm nhất.",
      });

      return true;
    } catch (error) {
      console.error('Error creating dispute:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi khiếu nại",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch match results
  const fetchMatchResults = async (filters?: {
    playerId?: string;
    tournamentId?: string;
    clubId?: string;
    status?: string;
    limit?: number;
  }) => {
    setLoading(true);
    try {
      let query = supabase
        .from('match_results')
        .select(`
          *,
          player1:player1_id(user_id, display_name, avatar_url, verified_rank, elo),
          player2:player2_id(user_id, display_name, avatar_url, verified_rank, elo),
          club:club_id(id, club_name, address),
          referee:referee_id(user_id, display_name),
          tournament:tournament_id(id, name)
        `)
        .order('match_date', { ascending: false });

      if (filters?.playerId) {
        query = query.or(`player1_id.eq.${filters.playerId},player2_id.eq.${filters.playerId}`);
      }
      if (filters?.tournamentId) {
        query = query.eq('tournament_id', filters.tournamentId);
      }
      if (filters?.clubId) {
        query = query.eq('club_id', filters.clubId);
      }
      if (filters?.status) {
        query = query.eq('result_status', filters.status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      const transformedResults = data?.map(transformMatchResult) || [];
      setMatchResults(transformedResults);
      
      return transformedResults;
    } catch (error) {
      console.error('Error fetching match results:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải kết quả trận đấu",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch ELO history for a player
  const fetchEloHistory = async (playerId: string, limit = 20): Promise<EloHistoryEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('elo_history')
        .select('*')
        .eq('player_id', playerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(entry => ({
        ...entry,
        match_result: entry.match_result as 'win' | 'loss' | 'draw'
      })) || [];
    } catch (error) {
      console.error('Error fetching ELO history:', error);
      return [];
    }
  };

  // Transform database result to our interface
  const transformMatchResult = (dbResult: any): MatchResultData => {
    return {
      ...dbResult,
      player1: dbResult.player1 ? {
        id: dbResult.player1.user_id,
        display_name: dbResult.player1.display_name,
        avatar_url: dbResult.player1.avatar_url,
        verified_rank: dbResult.player1.verified_rank,
        elo: dbResult.player1.elo
      } : undefined,
      player2: dbResult.player2 ? {
        id: dbResult.player2.user_id,
        display_name: dbResult.player2.display_name,
        avatar_url: dbResult.player2.avatar_url,
        verified_rank: dbResult.player2.verified_rank,
        elo: dbResult.player2.elo
      } : undefined,
      club: dbResult.club ? {
        id: dbResult.club.id,
        club_name: dbResult.club.club_name,
        address: dbResult.club.address
      } : undefined,
      referee: dbResult.referee ? {
        id: dbResult.referee.user_id,
        display_name: dbResult.referee.display_name
      } : undefined,
      tournament: dbResult.tournament ? {
        id: dbResult.tournament.id,
        name: dbResult.tournament.name
      } : undefined
    };
  };

  return {
    loading,
    matchResults,
    createMatchResult,
    confirmMatchResult,
    verifyMatchResult,
    createDispute,
    fetchMatchResults,
    fetchEloHistory,
  };
};