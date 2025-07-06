import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Trophy, Users, Settings, BarChart3, Bell } from 'lucide-react';
import RankVerificationRequests from '@/components/RankVerificationRequests';
import ClubMemberManagement from '@/components/ClubMemberManagement';
import ClubStatsDashboard from '@/components/ClubStatsDashboard';
import ClubNotifications from '@/components/ClubNotifications';
import ClubSettings from '@/components/ClubSettings';

const ClubManagementPage = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is a verified club owner
  const isClubOwner = (profile as any)?.clbVerified || profile?.club_id;
  const hasClubProfile = profile?.club_id;

  if (!user || !isClubOwner || !hasClubProfile) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Quản lý Câu lạc bộ</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý thông tin CLB, xác thực hạng và theo dõi hoạt động
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Tổng quan</span>
          </TabsTrigger>
          <TabsTrigger value="rank-verification" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Xác thực Hạng</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Thành viên</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Thông báo</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Cài đặt</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span className="hidden sm:inline">Hồ sơ CLB</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ClubStatsDashboard />
        </TabsContent>

        <TabsContent value="rank-verification">
          <RankVerificationRequests />
        </TabsContent>

        <TabsContent value="members">
          <ClubMemberManagement />
        </TabsContent>

        <TabsContent value="notifications">
          <ClubNotifications />
        </TabsContent>

        <TabsContent value="settings">
          <ClubSettings />
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Thông tin Câu lạc bộ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="font-medium">Chỉnh sửa thông tin CLB</p>
                <p className="text-sm mt-1">
                  Tính năng sẽ có sẵn trong phiên bản tiếp theo
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClubManagementPage;