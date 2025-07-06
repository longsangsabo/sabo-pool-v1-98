import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Zap } from 'lucide-react';
import { completeChallengeMatch } from '@/utils/challengeUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MatchCompletionHandlerProps {
  match: {
    id: string;
    player1_id: string;
    player2_id: string;
    challenge_id?: string;
    tournament_id?: string;
    score_player1: number;
    score_player2: number;
    status: string;
  };
  wagerPoints?: number;
  onComplete: () => void;
}

export const MatchCompletionHandler = ({ 
  match, 
  wagerPoints = 100, 
  onComplete 
}: MatchCompletionHandlerProps) => {
  const [completing, setCompleting] = useState(false);

  const handleComplete = async (winnerId: string) => {
    if (completing) return;
    
    setCompleting(true);
    try {
      const loserId = winnerId === match.player1_id ? match.player2_id : match.player1_id;
      
      // Update match status
      const { error: matchError } = await supabase
        .from('matches')
        .update({
          winner_id: winnerId,
          status: 'completed',
          played_at: new Date().toISOString()
        })
        .eq('id', match.id);

      if (matchError) throw matchError;

      // If this is a challenge match, award SPA points
      if (match.challenge_id) {
        await completeChallengeMatch(match.id, winnerId, loserId, wagerPoints);
        
        // Update challenge status
        const { error: challengeError } = await supabase
          .from('challenges')
          .update({ status: 'completed' })
          .eq('id', match.challenge_id);
          
        if (challengeError) throw challengeError;
      }

      toast.success('Trận đấu đã hoàn thành!');
      onComplete();
    } catch (error) {
      console.error('Error completing match:', error);
      toast.error('Lỗi khi hoàn thành trận đấu');
    } finally {
      setCompleting(false);
    }
  };

  if (match.status === 'completed') {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Trophy className="h-5 w-5" />
            <span className="font-semibold">Trận đấu đã hoàn thành</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Hoàn thành trận đấu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {match.challenge_id && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Thách đấu</span>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {wagerPoints} SPA Points
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Người thắng sẽ nhận SPA points (có thể giảm nếu đã chơi 2+ kèo hôm nay)
            </p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium">Chọn người thắng:</p>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleComplete(match.player1_id)}
              disabled={completing}
              variant="outline"
              className="h-auto p-3 flex flex-col items-center gap-2"
            >
              <div className="font-semibold">Người chơi 1</div>
              <div className="text-lg font-bold">{match.score_player1}</div>
            </Button>
            
            <Button
              onClick={() => handleComplete(match.player2_id)}
              disabled={completing}
              variant="outline"
              className="h-auto p-3 flex flex-col items-center gap-2"
            >
              <div className="font-semibold">Người chơi 2</div>
              <div className="text-lg font-bold">{match.score_player2}</div>
            </Button>
          </div>
        </div>

        {completing && (
          <div className="text-center text-sm text-muted-foreground">
            Đang xử lý kết quả trận đấu...
          </div>
        )}
      </CardContent>
    </Card>
  );
};