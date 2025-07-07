import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Clock, Award } from 'lucide-react';
import { useAdvancedSPAPoints } from '@/hooks/useAdvancedSPAPoints';
import { usePlayerRanking } from '@/hooks/usePlayerRanking';
import { useAuth } from '@/hooks/useAuth';

export function SPAMilestones() {
  const { user } = useAuth();
  const { milestones, playerMilestones } = useAdvancedSPAPoints();
  const { playerRanking: playerStats } = usePlayerRanking(user?.id);

  if (!milestones || !playerStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Cột mốc SPA
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

  const achievedMilestoneIds = new Set(playerMilestones?.map(pm => pm.milestone_id) || []);

  // Calculate progress for each milestone
  const milestonesWithProgress = milestones.map(milestone => {
    const isAchieved = achievedMilestoneIds.has(milestone.id);
    let currentProgress = 0;
    let progressPercent = 0;

    switch (milestone.milestone_type) {
      case 'total_matches':
        currentProgress = playerStats.total_matches || 0;
        progressPercent = Math.min((currentProgress / milestone.threshold) * 100, 100);
        break;
      case 'win_rate_50':
        const winRate = playerStats.total_matches > 0 ? (playerStats.wins / playerStats.total_matches) * 100 : 0;
        const matchesProgress = playerStats.total_matches || 0;
        currentProgress = matchesProgress;
        progressPercent = matchesProgress >= milestone.threshold && winRate >= 50 ? 100 : 
          Math.min((matchesProgress / milestone.threshold) * 100, 100);
        break;
      case 'tournament_wins':
        currentProgress = (playerStats as any).tournament_wins || 0;
        progressPercent = Math.min((currentProgress / milestone.threshold) * 100, 100);
        break;
      case 'perfect_match':
        // This would need special tracking - for now assume not achieved
        currentProgress = 0;
        progressPercent = 0;
        break;
    }

    return {
      ...milestone,
      isAchieved,
      currentProgress,
      progressPercent
    };
  });

  const achievedCount = milestonesWithProgress.filter(m => m.isAchieved).length;
  const totalCount = milestonesWithProgress.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Cột mốc SPA
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            {achievedCount}/{totalCount}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestonesWithProgress.map((milestone) => (
            <div key={milestone.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-full ${
                    milestone.isAchieved 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {milestone.milestone_type === 'total_matches' && <Target className="h-3 w-3" />}
                    {milestone.milestone_type === 'tournament_wins' && <Trophy className="h-3 w-3" />}
                    {milestone.milestone_type === 'win_rate_50' && <Award className="h-3 w-3" />}
                    {milestone.milestone_type === 'perfect_match' && <Clock className="h-3 w-3" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{milestone.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {milestone.milestone_type === 'total_matches' && 
                        `${milestone.currentProgress}/${milestone.threshold} trận`}
                      {milestone.milestone_type === 'tournament_wins' && 
                        `${milestone.currentProgress}/${milestone.threshold} giải`}
                      {milestone.milestone_type === 'win_rate_50' && 
                        `${milestone.currentProgress}/${milestone.threshold} trận (≥50% tỷ lệ thắng)`}
                      {milestone.milestone_type === 'perfect_match' && 
                        `${milestone.currentProgress}/${milestone.threshold} trận hoàn hảo`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {milestone.isAchieved ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      +{milestone.reward_spa} SPA
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      +{milestone.reward_spa} SPA
                    </Badge>
                  )}
                </div>
              </div>
              
              {!milestone.isAchieved && (
                <Progress 
                  value={milestone.progressPercent} 
                  className="h-2"
                />
              )}
            </div>
          ))}

          {achievedCount === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chưa đạt được cột mốc nào</p>
              <p className="text-xs">Hãy chơi thêm để mở khóa thành tựu!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default SPAMilestones;