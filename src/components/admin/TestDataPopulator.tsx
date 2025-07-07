import React, { useState } from 'react';
import { Database, Zap, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TestDataPopulator = () => {
  const [selectedDataTypes, setSelectedDataTypes] = useState({
    tournaments: true,
    matches: true,
    challenges: true,
    spaPoints: true,
    notifications: false
  });
  const [isPopulating, setIsPopulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const dataTypeDescriptions = {
    tournaments: 'Create tournaments with registrations and different statuses',
    matches: 'Generate match results with ELO calculations',
    challenges: 'Create challenge requests between users',
    spaPoints: 'Award SPA points for various activities',
    notifications: 'Generate system notifications for users'
  };

  const populateData = async () => {
    setIsPopulating(true);
    setProgress(0);
    setResults(null);

    try {
      const populationResults = {
        tournaments: 0,
        matches: 0,
        challenges: 0,
        spaPoints: 0,
        notifications: 0
      };

      // Get existing users for test data
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .limit(20);

      if (usersError || !users || users.length < 2) {
        throw new Error('Need at least 2 users to generate test data');
      }

      let step = 0;
      const totalSteps = Object.values(selectedDataTypes).filter(Boolean).length;

      // Create Tournaments
      if (selectedDataTypes.tournaments) {
        step++;
        setProgress((step / totalSteps) * 100);
        
        const tournaments = [];
        const tournamentNames = [
          'Giải billiards mùa xuân 2024',
          'Tournament Cup SABO Arena',
          'Giải vô địch billiards TP.HCM',
          'SABO Pool Championship',
          'Giải Tứ Hùng Billiards'
        ];

        for (let i = 0; i < 3; i++) {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 2);

          const tournament = {
            name: tournamentNames[i],
            description: `Giải đấu billiards chuyên nghiệp ${i + 1}`,
            tournament_type: ['single_elimination', 'double_elimination', 'round_robin'][i % 3],
            game_format: 'race_to_5',
            max_participants: 32,
            entry_fee: (i + 1) * 100000,
            prize_pool: (i + 1) * 500000,
            registration_start: new Date().toISOString(),
            registration_end: startDate.toISOString(),
            tournament_start: startDate.toISOString(),
            tournament_end: endDate.toISOString(),
            status: ['upcoming', 'registration_open', 'ongoing'][i % 3],
            venue_name: `SABO Pool Arena ${i + 1}`,
            venue_address: `123 Đường ${i + 1}, Quận ${i + 1}, TP.HCM`,
            created_by: users[0].user_id,
            created_at: new Date().toISOString()
          };

          tournaments.push(tournament);
        }

        const { data: createdTournaments, error: tournamentError } = await supabase
          .from('tournaments')
          .insert(tournaments)
          .select();

        if (tournamentError) throw tournamentError;
        populationResults.tournaments = createdTournaments?.length || 0;

        // Create tournament registrations
        if (createdTournaments) {
          for (const tournament of createdTournaments) {
            const registrationCount = Math.min(users.length, Math.floor(Math.random() * 10) + 5);
            const registrations = users.slice(0, registrationCount).map(user => ({
              tournament_id: tournament.id,
              player_id: user.user_id,
              registration_status: 'confirmed',
              payment_status: Math.random() > 0.3 ? 'paid' : 'pending',
              created_at: new Date().toISOString()
            }));

            await supabase.from('tournament_registrations').insert(registrations);
          }
        }
      }

      // Create Match Results
      if (selectedDataTypes.matches) {
        step++;
        setProgress((step / totalSteps) * 100);

        const matches = [];
        for (let i = 0; i < 10; i++) {
          const player1 = users[Math.floor(Math.random() * users.length)];
          let player2 = users[Math.floor(Math.random() * users.length)];
          while (player2.user_id === player1.user_id) {
            player2 = users[Math.floor(Math.random() * users.length)];
          }

          const player1Score = Math.floor(Math.random() * 6) + 3; // 3-8
          const player2Score = Math.floor(Math.random() * 6) + 3; // 3-8
          const winnerId = player1Score > player2Score ? player1.user_id : player2.user_id;

          const match = {
            player1_id: player1.user_id,
            player2_id: player2.user_id,
            player1_score: player1Score,
            player2_score: player2Score,
            winner_id: winnerId,
            loser_id: winnerId === player1.user_id ? player2.user_id : player1.user_id,
            match_format: 'race_to_5',
            result_status: 'verified',
            player1_confirmed: true,
            player2_confirmed: true,
            player1_elo_before: 1000 + Math.floor(Math.random() * 500),
            player2_elo_before: 1000 + Math.floor(Math.random() * 500),
            verified_at: new Date().toISOString(),
            match_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          };

          matches.push(match);
        }

        const { data: createdMatches, error: matchError } = await supabase
          .from('match_results')
          .insert(matches)
          .select();

        if (matchError) throw matchError;
        populationResults.matches = createdMatches?.length || 0;
      }

      // Create Challenges
      if (selectedDataTypes.challenges) {
        step++;
        setProgress((step / totalSteps) * 100);

        const challenges = [];
        for (let i = 0; i < 8; i++) {
          const challenger = users[Math.floor(Math.random() * users.length)];
          let opponent = users[Math.floor(Math.random() * users.length)];
          while (opponent.user_id === challenger.user_id) {
            opponent = users[Math.floor(Math.random() * users.length)];
          }

          const challenge = {
            challenger_id: challenger.user_id,
            opponent_id: opponent.user_id,
            message: `Thách đấu từ ${challenger.full_name}`,
            race_to: Math.floor(Math.random() * 3) + 3, // 3-5
            stake_type: ['friendly', 'points', 'money'][Math.floor(Math.random() * 3)],
            bet_points: Math.floor(Math.random() * 100) + 10,
            status: ['pending', 'accepted', 'declined'][Math.floor(Math.random() * 3)],
            location: `SABO Arena ${Math.floor(Math.random() * 5) + 1}`,
            scheduled_time: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
          };

          challenges.push(challenge);
        }

        const { data: createdChallenges, error: challengeError } = await supabase
          .from('challenges')
          .insert(challenges)
          .select();

        if (challengeError) throw challengeError;
        populationResults.challenges = createdChallenges?.length || 0;
      }

      // Award SPA Points
      if (selectedDataTypes.spaPoints) {
        step++;
        setProgress((step / totalSteps) * 100);

        const spaLogs = [];
        for (const user of users) {
          const activities = [
            { type: 'match_win', points: 25, description: 'Thắng trận đấu' },
            { type: 'tournament_participation', points: 50, description: 'Tham gia giải đấu' },
            { type: 'daily_login', points: 5, description: 'Đăng nhập hàng ngày' },
            { type: 'profile_completion', points: 20, description: 'Hoàn thành profile' }
          ];

          const selectedActivities = activities.slice(0, Math.floor(Math.random() * 3) + 1);
          
          for (const activity of selectedActivities) {
            spaLogs.push({
              player_id: user.user_id,
              source_type: activity.type,
              points_earned: activity.points,
              description: activity.description,
              created_at: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString()
            });
          }
        }

        const { data: createdSpaLogs, error: spaError } = await supabase
          .from('spa_points_log')
          .insert(spaLogs)
          .select();

        if (spaError) throw spaError;
        populationResults.spaPoints = createdSpaLogs?.length || 0;

        // Update player rankings with SPA points
        for (const user of users) {
          const userLogs = spaLogs.filter(log => log.player_id === user.user_id);
          const totalPoints = userLogs.reduce((sum, log) => sum + log.points_earned, 0);

          await supabase
            .from('player_rankings')
            .upsert({
              player_id: user.user_id,
              spa_points: totalPoints,
              updated_at: new Date().toISOString()
            });
        }
      }

      // Create Notifications
      if (selectedDataTypes.notifications) {
        step++;
        setProgress((step / totalSteps) * 100);

        const notifications = [];
        const notificationTypes = [
          { type: 'tournament_start', title: 'Giải đấu bắt đầu', message: 'Giải đấu của bạn sắp bắt đầu' },
          { type: 'challenge_received', title: 'Thách đấu mới', message: 'Bạn nhận được lời thách đấu' },
          { type: 'rank_promotion', title: 'Thăng hạng', message: 'Chúc mừng bạn đã thăng hạng' },
          { type: 'spa_points_earned', title: 'Điểm SPA', message: 'Bạn vừa nhận được điểm SPA' }
        ];

        for (const user of users.slice(0, 10)) {
          const notifCount = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < notifCount; i++) {
            const notif = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
            notifications.push({
              user_id: user.user_id,
              type: notif.type,
              title: notif.title,
              message: notif.message,
              priority: ['low', 'normal', 'high'][Math.floor(Math.random() * 3)],
              is_read: Math.random() > 0.5,
              created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
            });
          }
        }

        const { data: createdNotifications, error: notifError } = await supabase
          .from('notifications')
          .insert(notifications)
          .select();

        if (notifError) throw notifError;
        populationResults.notifications = createdNotifications?.length || 0;
      }

      setProgress(100);
      setResults(populationResults);
      toast.success('Test data populated successfully!');

    } catch (error) {
      console.error('Error populating data:', error);
      toast.error('Failed to populate test data. Check console for details.');
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Test Data Populator
        </CardTitle>
        <CardDescription>
          Generate realistic test data for tournaments, matches, challenges, and more
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium">Select Data Types to Generate:</h4>
          {Object.entries(selectedDataTypes).map(([key, value]) => (
            <div key={key} className="flex items-start space-x-2">
              <Checkbox
                id={key}
                checked={value}
              onCheckedChange={(checked) => 
                setSelectedDataTypes(prev => ({ ...prev, [key]: checked as boolean }))
              }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor={key} className="capitalize font-medium">
                  {key === 'spaPoints' ? 'SPA Points' : key}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {dataTypeDescriptions[key as keyof typeof dataTypeDescriptions]}
                </p>
              </div>
            </div>
          ))}
        </div>

        {isPopulating && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Populating test data... {progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <Button 
          onClick={populateData} 
          disabled={isPopulating || !Object.values(selectedDataTypes).some(Boolean)}
          className="w-full"
        >
          {isPopulating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Populating Data...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Populate Test Data
            </>
          )}
        </Button>

        {results && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-green-800">Data Population Complete</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
              {Object.entries(results).map(([key, count]) => (
                (count as number) > 0 && (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key === 'spaPoints' ? 'SPA Points' : key}:</span>
                    <span className="font-medium">{count as number}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestDataPopulator;