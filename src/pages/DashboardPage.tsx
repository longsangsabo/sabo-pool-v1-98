import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Trophy, Target, Users } from 'lucide-react';

const DashboardPage = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🎱</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SABO Pool Arena</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Xin chào, {user?.user_metadata?.full_name || user?.phone || 'User'}
              </span>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
              >
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Chào mừng bạn đến với SABO Pool Arena!</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hồ sơ cá nhân</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Hoàn thiện</div>
              <p className="text-xs text-muted-foreground">
                Cập nhật thông tin cá nhân
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Giải đấu</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Giải đấu đã tham gia
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thách đấu</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Trận đấu đã chơi
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CLB</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Chưa có</div>
              <p className="text-xs text-muted-foreground">
                Tham gia CLB ngay
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Thách đấu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Tìm kiếm đối thủ và thách đấu ngay!</p>
              <Button className="w-full">Tạo thách đấu</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Giải đấu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Tham gia các giải đấu hấp dẫn</p>
              <Button className="w-full" variant="outline">Xem giải đấu</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>CLB Pool</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Tìm kiếm CLB gần bạn</p>
              <Button className="w-full" variant="outline">Tìm CLB</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;