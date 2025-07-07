
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useRealTimeTournamentSync = (
  onRegistrationChange: (tournamentId: string, isRegistered: boolean) => void
) => {
  const { user } = useAuth();

  const handleRegistrationChange = useCallback((payload: any) => {
    console.log('Real-time tournament registration change:', payload);
    
    const tournamentId = payload.new?.tournament_id || payload.old?.tournament_id;
    if (!tournamentId) return;

    switch (payload.eventType) {
      case 'INSERT':
        onRegistrationChange(tournamentId, true);
        break;
      case 'DELETE':
        onRegistrationChange(tournamentId, false);
        break;
      case 'UPDATE':
        const isRegistered = payload.new?.registration_status !== 'cancelled';
        onRegistrationChange(tournamentId, isRegistered);
        break;
    }
  }, [onRegistrationChange]);

  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time tournament registration listeners for user:', user.id);

    // Listen to tournament_registrations changes for current user
    const registrationChannel = supabase
      .channel('user-tournament-registrations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_registrations',
          filter: `player_id=eq.${user.id}`
        },
        handleRegistrationChange
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time tournament listeners');
      supabase.removeChannel(registrationChannel);
    };
  }, [user?.id, handleRegistrationChange]);

  return null;
};
