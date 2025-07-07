import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Flame, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SPABreakdown {
  basePoints: number;
  streakBonus: number;
  comebackBonus: number;
  timeMultiplier: number;
  finalPoints: number;
  loserPenalty: number;
}

interface SPAPointsBreakdownProps {
  matchId: string;
  className?: string;
}

export function SPAPointsBreakdown({ matchId, className }: SPAPointsBreakdownProps) {
  const { data: breakdown, isLoading } = useQuery({
    queryKey: ['spa-breakdown', matchId],
    queryFn: async () => {
      // Get match details and calculate breakdown
      const { data: match, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (error || !match) {
        throw new Error('Match not found');
      }

      // For now, return mock data - in real implementation this would call the SQL function
      const mockBreakdown: SPABreakdown = {
        basePoints: 300,
        streakBonus: 45, // 15% for 3-win streak
        comebackBonus: 0,
        timeMultiplier: 1.2, // 20% peak hour
        finalPoints: 414, // (300 + 45) * 1.2
        loserPenalty: -150
      };

      return mockBreakdown;
    },
    enabled: !!matchId
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Chi tiết điểm SPA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!breakdown) {
    return null;
  }

  const timeMultiplierPercent = Math.round((breakdown.timeMultiplier - 1) * 100);
  const streakPercent = breakdown.basePoints > 0 ? Math.round((breakdown.streakBonus / breakdown.basePoints) * 100) : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Chi tiết điểm SPA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Base Points */}
          <div className="flex justify-between items-center">
            <span className="text-sm">Điểm cơ bản</span>
            <Badge variant="secondary">+{breakdown.basePoints}</Badge>
          </div>

          {/* Streak Bonus */}
          {breakdown.streakBonus > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-orange-600">Chuỗi thắng (+{streakPercent}%)</span>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                +{breakdown.streakBonus}
              </Badge>
            </div>
          )}

          {/* Comeback Bonus */}
          {breakdown.comebackBonus > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm">
                <Gift className="h-4 w-4 text-purple-500" />
                <span className="text-purple-600">Comeback bonus</span>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                +{breakdown.comebackBonus}
              </Badge>
            </div>
          )}

          {/* Time Multiplier */}
          {breakdown.timeMultiplier > 1 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-blue-600">
                  {timeMultiplierPercent >= 50 ? 'Giờ vàng sáng' : 'Giờ cao điểm'} (x{breakdown.timeMultiplier})
                </span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                +{Math.round((breakdown.finalPoints - breakdown.basePoints - breakdown.streakBonus - breakdown.comebackBonus))}
              </Badge>
            </div>
          )}

          <Separator className="my-3" />

          {/* Total Points */}
          <div className="flex justify-between items-center font-semibold">
            <span>Tổng điểm</span>
            <Badge className="bg-primary text-primary-foreground px-3 py-1">
              +{breakdown.finalPoints} SPA
            </Badge>
          </div>

          {/* Loser Penalty (if applicable) */}
          {breakdown.loserPenalty < 0 && (
            <div className="flex justify-between items-center text-sm text-muted-foreground pt-2 border-t">
              <span>Người thua mất điểm</span>
              <Badge variant="destructive" className="opacity-75">
                {breakdown.loserPenalty} SPA
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default SPAPointsBreakdown;