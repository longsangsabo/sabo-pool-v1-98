import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { Tournament } from '@/types/tournament';

type RegistrationStatus = 'NOT_REGISTERED' | 'REGISTERED' | 'PENDING';

interface RegistrationEligibility {
  eligible: boolean;
  reason?: string;
}

interface RegistrationResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const useTournamentRegistrationFlow = () => {
  const { user, profile } = useAuth();
  const [registrationStatus, setRegistrationStatus] = useState<Record<string, RegistrationStatus>>({});

  // Validate registration eligibility
  const checkRegistrationEligibility = useCallback((tournament: Tournament): RegistrationEligibility => {
    if (!user) {
      return { eligible: false, reason: 'Vui lòng đăng nhập để tham gia' };
    }

    // Check registration period
    const now = new Date();
    const regStart = new Date(tournament.registration_start);
    const regEnd = new Date(tournament.registration_end);
    
    if (now < regStart) {
      return { eligible: false, reason: 'Chưa đến thời gian đăng ký' };
    }
    
    if (now > regEnd) {
      return { eligible: false, reason: 'Đã hết hạn đăng ký' };
    }

    // Check available slots
    if (tournament.current_participants >= tournament.max_participants) {
      return { eligible: false, reason: 'Giải đấu đã đủ số lượng tham gia' };
    }

    // Check tournament status
    if (tournament.status !== 'registration_open') {
      return { eligible: false, reason: 'Giải đấu không mở đăng ký' };
    }

    return { eligible: true };
  }, [user]);

  // Perform registration action
  const performRegistrationAction = useCallback(async (tournament: Tournament): Promise<RegistrationResult> => {
    if (!user?.id) {
      return { success: false, error: 'Chưa đăng nhập' };
    }

    try {
      const { data, error } = await supabase
        .from('tournament_registrations')
        .insert({
          tournament_id: tournament.id,
          player_id: user.id,
          registration_status: 'pending',
          payment_status: 'unpaid'
        })
        .select()
        .single();

      if (error) {
        // Check if already registered
        if (error.code === '23505') {
          return { success: false, error: 'Bạn đã đăng ký giải đấu này rồi' };
        }
        throw error;
      }

      return { 
        success: true, 
        message: 'Đăng ký giải đấu thành công!'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi đăng ký'
      };
    }
  }, [user?.id]);

  // Perform cancellation action
  const performCancellationAction = useCallback(async (tournament: Tournament): Promise<RegistrationResult> => {
    if (!user?.id) {
      return { success: false, error: 'Chưa đăng nhập' };
    }

    try {
      const { data, error } = await supabase
        .from('tournament_registrations')
        .delete()
        .eq('tournament_id', tournament.id)
        .eq('player_id', user.id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        return { success: false, error: 'Không tìm thấy đăng ký để hủy' };
      }

      return { 
        success: true, 
        message: 'Đã hủy đăng ký giải đấu thành công!'
      };
    } catch (error) {
      console.error('Cancellation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi hủy đăng ký'
      };
    }
  }, [user?.id]);

  // Handle registration flow
  const handleRegistrationFlow = useCallback(async (tournament: Tournament) => {
    const tournamentId = tournament.id;
    const currentStatus = registrationStatus[tournamentId] || 'NOT_REGISTERED';
    
    // Set pending state
    setRegistrationStatus(prev => ({
      ...prev,
      [tournamentId]: 'PENDING'
    }));

    try {
      let result: RegistrationResult;

      if (currentStatus === 'NOT_REGISTERED') {
        // Check eligibility for registration
        const eligibility = checkRegistrationEligibility(tournament);
        
        if (!eligibility.eligible) {
          toast.error(eligibility.reason || 'Không đủ điều kiện tham gia');
          setRegistrationStatus(prev => ({
            ...prev,
            [tournamentId]: 'NOT_REGISTERED'
          }));
          return;
        }

        // Perform registration
        result = await performRegistrationAction(tournament);
        
        if (result.success) {
          setRegistrationStatus(prev => ({
            ...prev,
            [tournamentId]: 'REGISTERED'
          }));
          toast.success(result.message || 'Đăng ký thành công!');
        } else {
          setRegistrationStatus(prev => ({
            ...prev,
            [tournamentId]: 'NOT_REGISTERED'
          }));
          toast.error(result.error || 'Đăng ký thất bại');
        }
      } else if (currentStatus === 'REGISTERED') {
        // Perform cancellation
        result = await performCancellationAction(tournament);
        
        if (result.success) {
          setRegistrationStatus(prev => ({
            ...prev,
            [tournamentId]: 'NOT_REGISTERED'
          }));
          toast.success(result.message || 'Hủy đăng ký thành công!');
        } else {
          setRegistrationStatus(prev => ({
            ...prev,
            [tournamentId]: 'REGISTERED'
          }));
          toast.error(result.error || 'Hủy đăng ký thất bại');
        }
      }
    } catch (error) {
      console.error('Unexpected error in registration flow:', error);
      toast.error('Có lỗi không mong muốn xảy ra');
      
      // Revert to previous state
      setRegistrationStatus(prev => ({
        ...prev,
        [tournamentId]: currentStatus
      }));
    }
  }, [registrationStatus, checkRegistrationEligibility, performRegistrationAction, performCancellationAction]);

  // Get registration status for a tournament
  const getRegistrationStatus = useCallback((tournamentId: string): RegistrationStatus => {
    return registrationStatus[tournamentId] || 'NOT_REGISTERED';
  }, [registrationStatus]);

  // Set registration status manually (for initialization)
  const setTournamentRegistrationStatus = useCallback((tournamentId: string, status: RegistrationStatus) => {
    setRegistrationStatus(prev => ({
      ...prev,
      [tournamentId]: status
    }));
  }, []);

  // Check if tournament is in pending state
  const isPending = useCallback((tournamentId: string): boolean => {
    return registrationStatus[tournamentId] === 'PENDING';
  }, [registrationStatus]);

  // Check if user is registered
  const isRegistered = useCallback((tournamentId: string): boolean => {
    return registrationStatus[tournamentId] === 'REGISTERED';
  }, [registrationStatus]);

  // Get button text based on status
  const getButtonText = useCallback((tournamentId: string): string => {
    const status = registrationStatus[tournamentId] || 'NOT_REGISTERED';
    
    switch (status) {
      case 'NOT_REGISTERED':
        return 'Đăng ký tham gia';
      case 'REGISTERED':
        return 'Hủy đăng ký';
      case 'PENDING':
        return 'Đang xử lý...';
      default:
        return 'Đăng ký tham gia';
    }
  }, [registrationStatus]);

  // Initialize registration status from database
  const initializeRegistrationStatus = useCallback(async (tournamentIds: string[]) => {
    if (!user?.id || tournamentIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('tournament_registrations')
        .select('tournament_id')
        .eq('player_id', user.id)
        .in('tournament_id', tournamentIds);

      if (error) throw error;

      const newStatus: Record<string, RegistrationStatus> = {};
      
      // Mark all as not registered first
      tournamentIds.forEach(id => {
        newStatus[id] = 'NOT_REGISTERED';
      });

      // Mark registered ones
      data?.forEach(registration => {
        newStatus[registration.tournament_id] = 'REGISTERED';
      });

      setRegistrationStatus(prev => ({
        ...prev,
        ...newStatus
      }));
    } catch (error) {
      console.error('Error initializing registration status:', error);
    }
  }, [user?.id]);

  return {
    handleRegistrationFlow,
    getRegistrationStatus,
    setTournamentRegistrationStatus,
    isPending,
    isRegistered,
    getButtonText,
    initializeRegistrationStatus,
    checkRegistrationEligibility
  };
};