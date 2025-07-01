import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useRankRequests } from '@/hooks/useRankRequests';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface RankRegistrationFormProps {
  onSuccess?: () => void;
}

interface Club {
  id: string;
  name: string;
  address: string;
  verified: boolean;
}

const RankRegistrationForm = ({ onSuccess }: RankRegistrationFormProps) => {
  const { user, profile } = useAuth();
  const { createRankRequest, rankRequests, getStatusText, getStatusColor } =
    useRankRequests();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userRankRequests, setUserRankRequests] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm();

  const selectedClub = watch('club_id');
  const requestedRank = watch('requested_rank');

  useEffect(() => {
    fetchClubs();
    fetchUserRankRequests();
  }, []);

  useEffect(() => {
    if (rankRequests.length > 0) {
      setUserRankRequests(rankRequests.filter(req => req.user_id === user?.id));
    }
  }, [rankRequests, user?.id]);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name, address, verified')
        .eq('status', 'active')
        .eq('verified', true)
        .order('name');

      if (error) throw error;
      setClubs(data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast.error('Lỗi khi tải danh sách CLB');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRankRequests = async () => {
    try {
      // Use mock data since rank_requests table doesn't exist
      const mockRankRequests = [
        {
          id: '1',
          requested_rank: 1500,
          status: 'pending',
          created_at: new Date().toISOString(),
          club: { name: 'CLB Bi-a Sài Gòn', address: '123 Nguyễn Huệ, Q1' }
        }
      ];
      setUserRankRequests(mockRankRequests);
    } catch (error) {
      console.error('Error fetching user rank requests:', error);
    }
  };

  const onSubmit = async (formData: any) => {
    if (!user?.id) {
      toast.error('Vui lòng đăng nhập để đăng ký rank');
      return;
    }

    setSubmitting(true);
    try {
      await createRankRequest({
        requested_rank: parseInt(formData.requested_rank),
        club_id: formData.club_id,
      });

      reset();
      toast.success(
        'Đã gửi yêu cầu rank thành công! CLB sẽ xem xét và phản hồi sớm.'
      );

      // Refresh user's rank requests
      await fetchUserRankRequests();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting rank request:', error);
      toast.error('Lỗi khi gửi yêu cầu rank');
    } finally {
      setSubmitting(false);
    }
  };

  const getRankDescription = (rank: number) => {
    if (rank >= 0 && rank <= 500) return 'Người mới bắt đầu';
    if (rank >= 501 && rank <= 1000) return 'Người chơi cơ bản';
    if (rank >= 1001 && rank <= 1500) return 'Người chơi trung bình';
    if (rank >= 1501 && rank <= 2000) return 'Người chơi khá';
    if (rank >= 2001 && rank <= 2500) return 'Người chơi giỏi';
    if (rank >= 2501 && rank <= 3000) return 'Cao thủ';
    return '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='w-8 h-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Current Status */}
      {profile?.elo && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Trophy className='w-5 h-5' />
              Rank hiện tại
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center space-x-4'>
              <Badge className='text-lg px-4 py-2'>{profile.elo} ELO</Badge>
              <span className='text-gray-600'>
                {getRankDescription(profile.elo)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previous Requests */}
      {userRankRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu rank trước đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {userRankRequests.map(request => (
                <div
                  key={request.id}
                  className='flex items-center justify-between p-3 border rounded-lg'
                >
                  <div className='flex items-center space-x-3'>
                    <div>
                      <div className='font-medium'>
                        {request.requested_rank} ELO - {request.club?.name}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {formatDate(request.created_at)}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusText(request.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Đăng ký rank mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Club Selection */}
            <div>
              <Label htmlFor='club_id'>Chọn CLB *</Label>
              <Select onValueChange={value => setValue('club_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder='Chọn CLB để đăng ký rank' />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map(club => (
                    <SelectItem key={club.id} value={club.id}>
                      <div className='flex flex-col'>
                        <span className='font-medium'>{club.name}</span>
                        <span className='text-sm text-gray-500'>
                          {club.address}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.club_id && (
                <p className='mt-1 text-sm text-red-600'>
                  {String(errors.club_id.message)}
                </p>
              )}
            </div>

            {/* Rank Selection */}
            <div>
              <Label htmlFor='requested_rank'>Rank yêu cầu *</Label>
              <Select
                onValueChange={value => setValue('requested_rank', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Chọn rank bạn muốn đăng ký' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='500'>
                    500 ELO - Người mới bắt đầu
                  </SelectItem>
                  <SelectItem value='1000'>
                    1000 ELO - Người chơi cơ bản
                  </SelectItem>
                  <SelectItem value='1500'>
                    1500 ELO - Người chơi trung bình
                  </SelectItem>
                  <SelectItem value='2000'>
                    2000 ELO - Người chơi khá
                  </SelectItem>
                  <SelectItem value='2500'>
                    2500 ELO - Người chơi giỏi
                  </SelectItem>
                  <SelectItem value='3000'>3000 ELO - Cao thủ</SelectItem>
                </SelectContent>
              </Select>
              {errors.requested_rank && (
                <p className='mt-1 text-sm text-red-600'>
                  {String(errors.requested_rank.message)}
                </p>
              )}

              {requestedRank && (
                <div className='mt-2 p-3 bg-blue-50 rounded-lg'>
                  <div className='text-sm text-blue-800'>
                    <strong>Mô tả rank:</strong>{' '}
                    {getRankDescription(parseInt(requestedRank))}
                  </div>
                </div>
              )}
            </div>

            {/* Warning */}
            <Alert>
              <AlertTriangle className='h-4 w-4' />
              <AlertDescription>
                <strong>Lưu ý:</strong> Việc đăng ký rank sai có thể dẫn đến
                việc tài khoản bị cấm. Hãy đăng ký rank phù hợp với khả năng
                thực tế của bạn.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <div className='flex justify-end'>
              <Button
                type='submit'
                disabled={submitting || !selectedClub || !requestedRank}
                className='flex items-center'
              >
                {submitting ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Trophy className='w-4 h-4 mr-2' />
                    Gửi yêu cầu rank
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RankRegistrationForm;
