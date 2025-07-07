import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface TournamentWorkflowStep {
  id: string;
  tournament_id: string;
  step_number: number;
  step_name: string;
  step_status: string;
  completed_at?: string;
  completed_by?: string;
  notes?: string;
  automation_data: any;
}

interface TournamentRealtimeStats {
  id: string;
  tournament_id: string;
  current_participants: number;
  checked_in_participants: number;
  completed_matches: number;
  total_matches: number;
  bracket_generated: boolean;
  prize_distributed: boolean;
  last_activity: string;
}

export const useTournamentManagement = (tournamentId: string) => {
  const { user } = useAuth();
  const [tournament, setTournament] = useState<any>(null);
  const [workflowSteps, setWorkflowSteps] = useState<TournamentWorkflowStep[]>([]);
  const [realtimeStats, setRealtimeStats] = useState<TournamentRealtimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch tournament data
  const fetchTournamentData = useCallback(async () => {
    if (!tournamentId) return;

    try {
      setLoading(true);

      // Fetch tournament details
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select(`
          *,
          club_profiles(*)
        `)
        .eq('id', tournamentId)
        .single();

      if (tournamentError) throw tournamentError;

      // Fetch workflow steps
      const { data: stepsData, error: stepsError } = await supabase
        .from('tournament_workflow_steps')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('step_number');

      if (stepsError) throw stepsError;

      // Fetch realtime stats
      const { data: statsData, error: statsError } = await supabase
        .from('tournament_realtime_stats')
        .select('*')
        .eq('tournament_id', tournamentId)
        .single();

      if (statsError && statsError.code !== 'PGRST116') throw statsError;

      setTournament(tournamentData);
      setWorkflowSteps(stepsData || []);
      setRealtimeStats(statsData);

    } catch (error) {
      console.error('Error fetching tournament data:', error);
      toast.error('Lỗi khi tải dữ liệu giải đấu');
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  // Update tournament management status
  const updateManagementStatus = useCallback(async (newStatus: string) => {
    if (!tournamentId || !user) return;

    try {
      setUpdating(true);

      const { data, error } = await supabase.rpc('update_tournament_management_status', {
        p_tournament_id: tournamentId,
        p_new_status: newStatus,
        p_completed_by: user.id
      });

      if (error) throw error;

      if (data && typeof data === 'object' && 'error' in data) {
        toast.error(String(data.error));
        return;
      }

      toast.success(`Đã cập nhật trạng thái giải đấu thành "${newStatus}"`);
      await fetchTournamentData();

    } catch (error) {
      console.error('Error updating tournament status:', error);
      toast.error('Lỗi khi cập nhật trạng thái giải đấu');
    } finally {
      setUpdating(false);
    }
  }, [tournamentId, user, fetchTournamentData]);

  // Real-time subscriptions
  useEffect(() => {
    if (!tournamentId) return;

    // Subscribe to tournament changes
    const tournamentChannel = supabase
      .channel(`tournament-${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments',
          filter: `id=eq.${tournamentId}`
        },
        (payload) => {
          if (payload.new) {
            setTournament(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_workflow_steps',
          filter: `tournament_id=eq.${tournamentId}`
        },
        () => {
          fetchTournamentData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_realtime_stats',
          filter: `tournament_id=eq.${tournamentId}`
        },
        (payload) => {
          if (payload.new) {
            setRealtimeStats(payload.new as TournamentRealtimeStats);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tournamentChannel);
    };
  }, [tournamentId, fetchTournamentData]);

  // Initial data fetch
  useEffect(() => {
    fetchTournamentData();
  }, [fetchTournamentData]);

  return {
    tournament,
    workflowSteps,
    realtimeStats,
    loading,
    updating,
    updateManagementStatus,
    refetch: fetchTournamentData
  };
};