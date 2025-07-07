import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TournamentSPAParams {
  tournamentId: string;
  playerId: string;
  position: number;
  playerRank: string;
  tournamentType?: string;
}

export function useTournamentSPA() {
  const queryClient = useQueryClient();

  const calculateTournamentSPAMutation = useMutation({
    mutationFn: async ({ position, playerRank, tournamentType = 'normal' }: {
      position: number;
      playerRank: string;
      tournamentType?: string;
    }) => {
      const { data, error } = await supabase.rpc('calculate_tournament_spa', {
        p_position: position,
        p_player_rank: playerRank,
        p_tournament_type: tournamentType
      });

      if (error) throw error;
      return data as number;
    }
  });

  const awardTournamentSPAMutation = useMutation({
    mutationFn: async ({
      tournamentId,
      playerId,
      position,
      playerRank,
      tournamentType = 'normal'
    }: TournamentSPAParams) => {
      // First calculate the SPA points
      const spaPoints = await calculateTournamentSPAMutation.mutateAsync({
        position,
        playerRank,
        tournamentType
      });

      // Award the SPA points
      const { error } = await supabase.rpc('credit_spa_points', {
        p_user_id: playerId,
        p_amount: spaPoints,
        p_category: 'tournament',
        p_description: `Giải đấu - Hạng ${position}`,
        p_reference_id: tournamentId
      });

      if (error) throw error;
      
      return { spaPoints, position, playerRank, tournamentType };
    },
    onSuccess: (result) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['spa-wallet-updates'] });
      queryClient.invalidateQueries({ queryKey: ['player-rankings'] });

      // Show success message
      const multiplierText = result.tournamentType === 'season' ? ' (x1.5 Season)' : 
                             result.tournamentType === 'open' ? ' (x2.0 Open)' : '';
      
      toast.success(
        `🏆 +${result.spaPoints} SPA điểm!`,
        {
          description: `Giải đấu - Hạng ${result.position}${multiplierText}`
        }
      );
    },
    onError: (error) => {
      console.error('Error awarding tournament SPA:', error);
      toast.error('Lỗi khi tính điểm giải đấu');
    }
  });

  return {
    calculateTournamentSPA: (params: Omit<TournamentSPAParams, 'playerId' | 'tournamentId'>) =>
      calculateTournamentSPAMutation.mutateAsync(params),
    
    awardTournamentSPA: (params: TournamentSPAParams) =>
      awardTournamentSPAMutation.mutateAsync(params),
    
    loading: calculateTournamentSPAMutation.isPending || awardTournamentSPAMutation.isPending
  };
}

export default useTournamentSPA;