
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { EnhancedLeaderboard } from '@/components/EnhancedLeaderboard';
import ClubStatsDashboard from '@/components/ClubStatsDashboard';
import { TrendingUp, Building2, Users } from 'lucide-react';

const LeaderboardPage = () => {
  // Mock data for now - in real implementation, this would come from useLeaderboard hook
  const mockPlayers = [
    {
      id: '1',
      user_id: '1',
      username: 'Player 1',
      current_rating: 2400,
      matches_played: 120,
      matches_won: 85,
      matches_lost: 35,
      wins: 85,
      losses: 35,
      draws: 0,
      win_rate: 70.8,
      current_streak: 5,
      longest_streak: 12,
      recent_form: 65,
      consistency_score: 78,
      rating_volatility: 45,
      club_name: 'Elite Billiards Club',
      peak_rating: 2450,
      volatility: 45,
      prediction_accuracy: 85,
      total_games: 120,
      best_streak: 12,
      elo_rating: 2400,
      rank: 'G+'
    },
    {
      id: '2',
      user_id: '2', 
      username: 'Player 2',
      current_rating: 2200,
      matches_played: 98,
      matches_won: 62,
      matches_lost: 36,
      wins: 62,
      losses: 36,
      draws: 0,
      win_rate: 63.3,
      current_streak: 2,
      longest_streak: 8,
      recent_form: 42,
      consistency_score: 65,
      rating_volatility: 55,
      club_name: 'Pro Pool Arena',
      peak_rating: 2250,
      volatility: 55,
      prediction_accuracy: 72,
      total_games: 98,
      best_streak: 8,
      elo_rating: 2200,
      rank: 'A+'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bảng Xếp Hạng & Thống Kê
          </h1>
          <p className="text-xl text-gray-600">
            Xếp hạng và thống kê chi tiết của cộng đồng
          </p>
        </div>

        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leaderboard" className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Bảng xếp hạng
            </TabsTrigger>
            <TabsTrigger value="club-stats" className="flex items-center">
              <Building2 className="w-4 h-4 mr-2" />
              Thống kê CLB
            </TabsTrigger>
            <TabsTrigger value="overall" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Tổng quan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <EnhancedLeaderboard players={mockPlayers} />
          </TabsContent>

          <TabsContent value="club-stats">
            <ClubStatsDashboard />
          </TabsContent>

          <TabsContent value="overall">
            <Card>
              <CardHeader>
                <CardTitle>Thống kê tổng quan hệ thống</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">1,247</div>
                    <div className="text-gray-600">Người chơi tích cực</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">3,892</div>
                    <div className="text-gray-600">Trận đấu tháng này</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">156</div>
                    <div className="text-gray-600">Câu lạc bộ</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default LeaderboardPage;
