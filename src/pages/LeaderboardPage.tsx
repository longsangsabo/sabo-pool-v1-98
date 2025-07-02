
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import EnhancedLeaderboard from '@/components/EnhancedLeaderboard';
import ClubStatsDashboard from '@/components/ClubStatsDashboard';
import { TrendingUp, Building2, Users } from 'lucide-react';

const LeaderboardPage = () => {
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
            <EnhancedLeaderboard />
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
