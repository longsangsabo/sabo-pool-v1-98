import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ChallengeResult {
  winner_points: number;
  loser_points: number;
  daily_count: number;
  multiplier: number;
}

/**
 * Complete a challenge match and award SPA points with daily limits
 */
export async function completeChallengeMatch(
  matchId: string,
  winnerId: string,
  loserId: string,
  wagerPoints: number = 100
): Promise<ChallengeResult | null> {
  try {
    const { data, error } = await supabase.rpc('complete_challenge_match', {
      p_match_id: matchId,
      p_winner_id: winnerId,
      p_loser_id: loserId,
      p_wager_points: wagerPoints
    });

    if (error) {
      console.error('Error completing challenge:', error);
      toast.error('Lỗi khi hoàn thành thách đấu');
      return null;
    }

    const result = data as unknown as ChallengeResult;
    
    // Show appropriate toast based on daily count
    if (result.multiplier < 1.0) {
      toast.warning(
        `Thách đấu hoàn thành! +${result.winner_points} SPA (30% do đã chơi ${result.daily_count} kèo)`
      );
    } else {
      toast.success(
        `Thách đấu hoàn thành! +${result.winner_points} SPA points`
      );
    }

    return result;
  } catch (error) {
    console.error('Error in completeChallengeMatch:', error);
    toast.error('Lỗi khi xử lý kết quả thách đấu');
    return null;
  }
}

/**
 * Check if a player has reached daily challenge limit
 */
export async function checkDailyLimit(playerId: string): Promise<{
  count: number;
  isAtLimit: boolean;
  multiplier: number;
}> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { count, error } = await supabase
      .from('spa_points_log')
      .select('*', { count: 'exact' })
      .eq('player_id', playerId)
      .eq('source_type', 'challenge')
      .gte('created_at', `${today}T00:00:00`);

    if (error) throw error;

    const dailyCount = count || 0;
    const isAtLimit = dailyCount >= 2;
    const multiplier = isAtLimit ? 0.3 : 1.0;

    return { count: dailyCount, isAtLimit, multiplier };
  } catch (error) {
    console.error('Error checking daily limit:', error);
    return { count: 0, isAtLimit: false, multiplier: 1.0 };
  }
}

/**
 * Calculate potential points for a challenge
 */
export function calculateChallengePoints(
  wagerPoints: number,
  rankDifference: number,
  dailyCount: number
): { winnerPoints: number; loserPoints: number; multiplier: number } {
  let winnerPoints = wagerPoints;
  const loserPoints = -(wagerPoints * 0.5);
  
  // Rank difference bonus (25% for beating higher rank)
  if (rankDifference >= 1) {
    winnerPoints *= 1.25;
  }
  
  // Daily limit multiplier
  const multiplier = dailyCount >= 2 ? 0.3 : 1.0;
  winnerPoints *= multiplier;
  
  return {
    winnerPoints: Math.round(winnerPoints),
    loserPoints: Math.round(loserPoints * multiplier),
    multiplier
  };
}