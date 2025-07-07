import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BracketValidation {
  valid: boolean;
  reason?: string;
  participant_count?: number;
  bracket_exists?: boolean;
  tournament_type?: string;
}

export interface BracketGenerationResult {
  success?: boolean;
  error?: string;
  bracket_id?: string;
  participant_count?: number;
  bracket_size?: number;
  rounds?: number;
  matches_created?: number;
  bracket_data?: any;
}

export interface SeedingOptions {
  method: 'elo_ranking' | 'registration_order' | 'random';
  forceRegenerate?: boolean;
}

export const useBracketGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const validateTournament = useCallback(async (tournamentId: string): Promise<BracketValidation> => {
    setIsValidating(true);
    try {
      const { data, error } = await supabase.rpc('can_generate_bracket', {
        p_tournament_id: tournamentId
      });

      if (error) {
        console.error('Error validating tournament:', error);
        return { valid: false, reason: 'Validation failed' };
      }

      return (data as any) as BracketValidation;
    } catch (error) {
      console.error('Error in validateTournament:', error);
      return { valid: false, reason: 'Validation error' };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const generateBracket = useCallback(async (
    tournamentId: string, 
    options: SeedingOptions = { method: 'elo_ranking' }
  ): Promise<BracketGenerationResult> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.rpc('generate_advanced_tournament_bracket', {
        p_tournament_id: tournamentId,
        p_seeding_method: options.method,
        p_force_regenerate: options.forceRegenerate || false
      });

      if (error) {
        console.error('Error generating bracket:', error);
        toast.error('Không thể tạo bảng đấu');
        return { error: error.message };
      }

      const result = data as any;
      
      if (result.error) {
        toast.error(result.error);
        return { error: result.error };
      }

      if (result.success) {
        toast.success(`Đã tạo bảng đấu thành công! ${result.matches_created} trận đấu được tạo.`);
        
        // Send notification using enhanced notification system
        await supabase.rpc('send_enhanced_notification', {
          p_user_id: (await supabase.auth.getUser()).data.user?.id,
          p_template_key: 'tournament_bracket_generated',
          p_variables: {
            tournament_name: 'Tournament',
            matches_created: result.matches_created
          }
        });
      }

      return result as BracketGenerationResult;
    } catch (error) {
      console.error('Error in generateBracket:', error);
      toast.error('Có lỗi xảy ra khi tạo bảng đấu');
      return { error: 'Generation failed' };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reseedTournament = useCallback(async (
    tournamentId: string,
    seedingMethod: 'elo_ranking' | 'registration_order' | 'random' = 'elo_ranking'
  ): Promise<BracketGenerationResult> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.rpc('reseed_tournament', {
        p_tournament_id: tournamentId,
        p_seeding_method: seedingMethod
      });

      if (error) {
        console.error('Error reseeding tournament:', error);
        toast.error('Không thể sắp xếp lại thứ tự');
        return { error: error.message };
      }

      const result = data as any;
      
      if (result.error) {
        toast.error(result.error);
        return { error: result.error };
      }

      if (result.success) {
        toast.success('Đã sắp xếp lại thứ tự thành công!');
      }

      return result as BracketGenerationResult;
    } catch (error) {
      console.error('Error in reseedTournament:', error);
      toast.error('Có lỗi xảy ra khi sắp xếp lại');
      return { error: 'Reseeding failed' };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const fetchBracketData = useCallback(async (tournamentId: string) => {
    try {
      const { data, error } = await supabase
        .from('tournament_brackets')
        .select('*')
        .eq('tournament_id', tournamentId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching bracket data:', error);
      return null;
    }
  }, []);

  const fetchSeeding = useCallback(async (tournamentId: string) => {
    try {
      const { data, error } = await supabase
        .from('tournament_seeding')
        .select(`
          *,
          player:profiles(
            user_id,
            full_name,
            display_name,
            avatar_url
          )
        `)
        .eq('tournament_id', tournamentId)
        .order('seed_position');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching seeding:', error);
      return [];
    }
  }, []);

  return {
    isGenerating,
    isValidating,
    validateTournament,
    generateBracket,
    reseedTournament,
    fetchBracketData,
    fetchSeeding
  };
};