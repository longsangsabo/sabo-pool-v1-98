import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Trophy, DollarSign, MapPin, AlertCircle, Play, UserPlus, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTournamentManagement } from '@/hooks/useTournamentManagement';
import { useAuth } from '@/hooks/useAuth';
import { TournamentRegistrationModal } from './TournamentRegistrationModal';

interface TournamentManagementFlowProps {
  tournamentId: string;
}

const TournamentManagementFlow: React.FC<TournamentManagementFlowProps> = ({ tournamentId }) => {
  const { user } = useAuth();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const {
    tournament,
    workflowSteps,
    realtimeStats,
    loading,
    updating,
    updateManagementStatus,
    refetch
  } = useTournamentManagement(tournamentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Không thể tải thông tin giải đấu</AlertDescription>
      </Alert>
    );
  }

  const getStatusInfo = (status: string) => {
    switch(status) {
      case 'draft':
        return {
          label: 'Giải đấu chưa mở đăng ký',
          color: 'secondary' as const,
          description: 'Giải đấu đang được chuẩn bị và chưa được công bố',
          actions: ['Chỉnh sửa thông tin', 'Mở đăng ký', 'Xóa giải']
        };
      case 'open':
        return {
          label: 'Đang mở đăng ký',
          color: 'default' as const,
          description: 'Người chơi có thể đăng ký tham gia',
          actions: ['Khóa đăng ký', 'Chỉnh sửa', 'Hủy giải']
        };
      case 'locked':
        return {
          label: 'Đã khóa đăng ký',
          color: 'outline' as const,
          description: 'Chuẩn bị bắt đầu giải đấu',
          actions: ['Bắt đầu giải', 'Mở lại đăng ký']
        };
      case 'ongoing':
        return {
          label: 'Đang diễn ra',
          color: 'destructive' as const,
          description: 'Giải đấu đang được thi đấu',
          actions: ['Xem bracket', 'Nhập kết quả', 'Tạm dừng']
        };
      case 'completed':
        return {
          label: 'Đã hoàn thành',
          color: 'default' as const,
          description: 'Giải đấu đã kết thúc',
          actions: ['Xem kết quả', 'Xuất báo cáo', 'Tạo giải mới']
        };
      default:
        return {
          label: 'Không xác định',
          color: 'secondary' as const,
          description: '',
          actions: []
        };
    }
  };

  const statusInfo = getStatusInfo(tournament.management_status || 'draft');
  const currentPlayers = realtimeStats?.current_participants || tournament.current_participants || 0;
  const maxPlayers = tournament.max_participants || 16;
  const playerProgress = (currentPlayers / maxPlayers) * 100;

  const handleStatusChange = async (newStatus: string) => {
    await updateManagementStatus(newStatus);
  };

  const handleRegistrationSuccess = () => {
    refetch(); // Refresh tournament data to update participant count
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const automationSteps = [
    {
      step: 1,
      title: 'Tạo giải',
      description: 'CLB điền thông tin cơ bản',
      status: 'completed',
      actions: ['Thiết lập tên giải', 'Chọn format', 'Định lệ phí']
    },
    {
      step: 2,
      title: 'Mở đăng ký',
      description: 'Công bố và thu thập đăng ký',
      status: tournament.management_status === 'draft' ? 'pending' : 'completed',
      actions: ['Thông báo tự động', 'Thu phí VNPAY', 'Tracking đăng ký']
    },
    {
      step: 3,
      title: 'Khóa sổ & Bốc thăm',
      description: 'Tạo bracket và phân bảng',
      status: ['locked', 'ongoing', 'completed'].includes(tournament.management_status) ? 'completed' : 'pending',
      actions: ['Random seed', 'Tạo bracket', 'Thông báo lịch']
    },
    {
      step: 4,
      title: 'Check-in & Gán bàn',
      description: 'QR check-in và phân bàn',
      status: ['ongoing', 'completed'].includes(tournament.management_status) ? 'completed' : 'pending',
      actions: ['QR scanner', 'Auto assign bàn', 'Thông báo match']
    },
    {
      step: 5,
      title: 'Thi đấu & Kết quả',
      description: 'Nhập kết quả và cập nhật bracket',
      status: tournament.management_status === 'completed' ? 'completed' : 'pending',
      actions: ['Self-report', 'Xác nhận kết quả', 'Update bracket']
    },
    {
      step: 6,
      title: 'Trao giải & SPA',
      description: 'Tính điểm SPA và trao thưởng',
      status: tournament.management_status === 'completed' ? 'completed' : 'pending',
      actions: ['Tính SPA bonus', 'Xuất certificate', 'Hall of Fame']
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Tournament Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{tournament.name}</CardTitle>
              <p className="text-muted-foreground mb-4">{tournament.description}</p>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{formatDate(tournament.tournament_start)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{tournament.venue_address || 'Chưa xác định'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm">{tournament.game_format} - {tournament.tournament_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">{formatPrice(tournament.entry_fee)}</span>
                </div>
              </div>
            </div>
            <Badge variant={statusInfo.color} className="text-sm">
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Status */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Trạng thái hiện tại</h3>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{statusInfo.description}</AlertDescription>
                </Alert>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Người tham gia</span>
                  <span className="text-sm text-muted-foreground">
                    {currentPlayers}/{maxPlayers}
                  </span>
                </div>
                <Progress value={playerProgress} className="h-2" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="font-semibold">Hành động</h3>
              <div className="flex flex-wrap gap-2">
                {statusInfo.actions.map((action, index) => (
                  <Button 
                    key={index}
                    variant={index === 0 ? "default" : "outline"}
                    size="sm"
                    disabled={updating}
                    onClick={async () => {
                      if (action === 'Mở đăng ký') await handleStatusChange('open');
                      if (action === 'Khóa đăng ký') await handleStatusChange('locked');
                      if (action === 'Bắt đầu giải') await handleStatusChange('ongoing');
                      if (action === 'Mở lại đăng ký') await handleStatusChange('open');
                    }}
                  >
                    {action}
                  </Button>
                ))}
              </div>
              
              {/* Registration Button for Open Tournaments */}
              {tournament.management_status === 'open' && (
                <div className="pt-2 border-t">
                  <Button 
                    onClick={() => setShowRegistrationModal(true)}
                    className="w-full"
                    size="sm"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Đăng ký tham gia
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automation Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Quy trình Tự động - SABO Tournament System</CardTitle>
          <p className="text-muted-foreground">
            Hệ thống tự động hóa toàn bộ quy trình từ đăng ký đến trao giải
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {automationSteps.map((step) => (
              <div key={step.step} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${step.status === 'completed' ? 'bg-green-500 text-white' : 
                    step.status === 'pending' ? 'bg-gray-200 text-gray-600' : 
                    'bg-blue-500 text-white'}
                `}>
                  {step.status === 'completed' ? '✓' : step.step}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{step.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {step.actions.map((action, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Bước tiếp theo được đề xuất</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <Settings className="h-8 w-8 mb-2 text-blue-500" />
              <h4 className="font-semibold mb-2">Hoàn thiện thông tin</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Cập nhật mô tả, quy định, và hình ảnh giải đấu
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Chỉnh sửa
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <UserPlus className="h-8 w-8 mb-2 text-green-500" />
              <h4 className="font-semibold mb-2">Mở đăng ký</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Công bố giải đấu và cho phép người chơi đăng ký
              </p>
              <Button 
                size="sm" 
                className="w-full"
                disabled={updating || tournament.management_status !== 'draft'}
                onClick={() => handleStatusChange('open')}
              >
                {tournament.management_status === 'draft' ? 'Mở đăng ký ngay' : 'Đã mở đăng ký'}
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <Play className="h-8 w-8 mb-2 text-purple-500" />
              <h4 className="font-semibold mb-2">Test Automation</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Chạy thử quy trình tự động với dữ liệu test
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Chạy test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Modal */}
      {tournament && (
        <TournamentRegistrationModal
          tournament={tournament}
          isOpen={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          onRegistrationSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  );
};

export default TournamentManagementFlow;