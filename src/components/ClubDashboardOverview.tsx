import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Trophy, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Database,
  Wifi,
  RefreshCw
} from 'lucide-react';
import { useClubDashboard } from '@/hooks/useClubDashboard';

const ClubDashboardOverview = () => {
  const { data, loading, error, refreshData } = useClubDashboard();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Lỗi kết nối database</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button onClick={refreshData} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return 'text-green-500';
      case 'disconnected':
      case 'inactive':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'disconnected':
      case 'inactive':
        return <Clock className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Trạng thái hệ thống
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 ${getStatusColor(data.systemStatus.database)}`}>
                {getStatusIcon(data.systemStatus.database)}
                <span className="font-medium">Database</span>
              </div>
              <Badge variant={data.systemStatus.database === 'connected' ? 'default' : 'destructive'}>
                {data.systemStatus.database === 'connected' ? 'Kết nối' : 'Lỗi'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 ${getStatusColor(data.systemStatus.realtime)}`}>
                <Wifi className="w-4 h-4" />
                <span className="font-medium">Realtime</span>
              </div>
              <Badge variant={data.systemStatus.realtime === 'active' ? 'default' : 'secondary'}>
                {data.systemStatus.realtime === 'active' ? 'Hoạt động' : 'Tạm dừng'}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Cập nhật: {data.systemStatus.lastUpdate.toLocaleTimeString('vi-VN')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thành viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.memberStats.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{data.memberStats.thisMonth}</span> tháng này
            </p>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {data.memberStats.verified} đã xác thực
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trận đấu</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.matchStats.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">+{data.matchStats.thisWeek}</span> tuần này
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {data.matchStats.thisMonth} tháng này
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giải đấu</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.tournamentStats.hosted}</div>
            <p className="text-xs text-muted-foreground">
              Đã tổ chức
            </p>
            <div className="mt-2">
              <Badge variant="default" className="text-xs">
                {data.tournamentStats.upcoming} sắp tới
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Độ tin cậy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.trustScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Xác thực chính xác
            </p>
            <div className="mt-2">
              <Badge 
                variant={data.trustScore >= 95 ? 'default' : data.trustScore >= 85 ? 'secondary' : 'destructive'}
                className="text-xs"
              >
                {data.trustScore >= 95 ? 'Xuất sắc' : data.trustScore >= 85 ? 'Tốt' : 'Cần cải thiện'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Verifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Yêu cầu xác thực ({data.pendingVerifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.pendingVerifications.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Không có yêu cầu nào đang chờ xử lý
              </p>
            ) : (
              <div className="space-y-3">
                {data.pendingVerifications.slice(0, 5).map((verification) => (
                  <div key={verification.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{verification.profiles?.full_name || 'Không rõ tên'}</p>
                      <p className="text-sm text-muted-foreground">
                        Hạng: {verification.requested_rank}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {new Date(verification.created_at).toLocaleDateString('vi-VN')}
                    </Badge>
                  </div>
                ))}
                {data.pendingVerifications.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Và {data.pendingVerifications.length - 5} yêu cầu khác...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              Thông báo gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentNotifications.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Chưa có thông báo nào
              </p>
            ) : (
              <div className="space-y-3">
                {data.recentNotifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClubDashboardOverview;