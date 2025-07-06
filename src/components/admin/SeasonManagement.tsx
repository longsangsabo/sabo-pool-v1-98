import { useState, useEffect } from 'react';
import { Calendar, RefreshCw, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { resetSeason, getCurrentSeasonInfo, getPlayerSeasonStats } from '@/utils/seasonUtils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const SeasonManagement = () => {
  const { user } = useAuth();
  const [seasonInfo, setSeasonInfo] = useState<{
    currentQuarter: number;
    seasonStart: string;
    daysRemaining: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const loadSeasonInfo = async () => {
    setLoading(true);
    try {
      const info = await getCurrentSeasonInfo();
      setSeasonInfo(info);
    } catch (error) {
      console.error('Error loading season info:', error);
      toast.error('Lỗi khi tải thông tin mùa giải');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSeason = async () => {
    setResetting(true);
    try {
      const success = await resetSeason();
      if (success) {
        await loadSeasonInfo();
      }
    } catch (error) {
      console.error('Error resetting season:', error);
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    loadSeasonInfo();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Đang tải...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quản lý Mùa giải</h2>
        <Button onClick={loadSeasonInfo} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Current Season Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Mùa giải hiện tại
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seasonInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  Q{seasonInfo.currentQuarter}
                </div>
                <p className="text-sm text-muted-foreground">Quý hiện tại</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {seasonInfo.daysRemaining}
                </div>
                <p className="text-sm text-muted-foreground">Ngày còn lại</p>
              </div>
              
              <div className="text-center">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {seasonInfo.daysRemaining <= 7 ? 'Sắp kết thúc' : 'Đang diễn ra'}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">Trạng thái</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Không thể tải thông tin mùa giải
            </p>
          )}
        </CardContent>
      </Card>

      {/* Season Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Hành động Mùa giải
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Reset Mùa giải</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Lưu trữ ranking hiện tại vào lịch sử và reset điểm rank cho tất cả người chơi.
                Hành động này không thể hoàn tác.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    disabled={resetting}
                    className="w-full"
                  >
                    {resetting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Đang reset...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset Mùa giải
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận Reset Mùa giải</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn reset mùa giải? Hành động này sẽ:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Lưu trữ tất cả ranking hiện tại vào lịch sử</li>
                        <li>Reset điểm rank về 0 cho tất cả người chơi</li>
                        <li>Gửi thông báo reset mùa giải cho tất cả người chơi</li>
                        <li>Không thể hoàn tác</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleResetSeason}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Xác nhận Reset
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Thống kê Mùa giải
              </h3>
              <p className="text-sm text-muted-foreground">
                Xem thống kê chi tiết về hiệu suất người chơi trong mùa giải hiện tại,
                bao gồm điểm SPA, rank points, và lịch sử thăng hạng.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};