import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Club {
  id: string;
  name: string;
}

interface RankRegistration {
  id: string;
  requested_rank: string;
  club_id: string;
  status: string;
  reason: string;
  created_at: string;
  clubs: { name: string } | null;
}

const RankRegistration = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedRank, setSelectedRank] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrations, setRegistrations] = useState<RankRegistration[]>([]);

  const ranks = [
    { value: 'K', label: 'Hạng K', color: 'bg-gray-100 text-gray-800' },
    { value: 'K+', label: 'Hạng K+', color: 'bg-gray-100 text-gray-800' },
    { value: 'I', label: 'Hạng I', color: 'bg-amber-100 text-amber-800' },
    { value: 'I+', label: 'Hạng I+', color: 'bg-amber-100 text-amber-800' },
    { value: 'H', label: 'Hạng H', color: 'bg-green-100 text-green-800' },
    { value: 'H+', label: 'Hạng H+', color: 'bg-green-100 text-green-800' },
    { value: 'G', label: 'Hạng G', color: 'bg-blue-100 text-blue-800' },
    { value: 'G+', label: 'Hạng G+', color: 'bg-blue-100 text-blue-800' },
    { value: 'F', label: 'Hạng F', color: 'bg-purple-100 text-purple-800' },
    { value: 'F+', label: 'Hạng F+', color: 'bg-purple-100 text-purple-800' },
    { value: 'E', label: 'Hạng E', color: 'bg-red-100 text-red-800' },
    { value: 'E+', label: 'Hạng E+', color: 'bg-red-100 text-red-800' },
  ];

  useEffect(() => {
    if (user) {
      fetchClubs();
      fetchRankRegistrations();
    }
  }, [user]);

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name')
        .eq('status', 'active');

      if (error) throw error;
      setClubs(data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const fetchRankRegistrations = async () => {
    try {
      // Use mock data since rank_registrations table doesn't exist
      const mockRegistrations = [
        {
          id: '1',
          requested_rank: 'A1',
          club_id: '1',
          status: 'pending',
          reason: 'Tournament performance',
          created_at: new Date().toISOString(),
          clubs: { name: 'SABO Billiards' }
        }
      ];
      setRegistrations(mockRegistrations);
    } catch (error) {
      console.error('Error fetching rank registrations:', error);
    }
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRank || !selectedClub || !reason.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      // Mock submission since rank_registrations table doesn't exist
      console.log('Mock rank registration:', {
        user_id: user?.id,
        requested_rank: selectedRank,
        club_id: selectedClub,
        reason: reason.trim(),
        status: 'pending',
      });

      toast.success('Gửi yêu cầu đăng ký hạng thành công!');
      setSelectedRank('');
      setSelectedClub('');
      setReason('');
      fetchRankRegistrations();
    } catch (error) {
      console.error('Error submitting rank registration:', error);
      toast.error('Có lỗi xảy ra khi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant='secondary' className='bg-yellow-100 text-yellow-800'>
            <Clock className='w-3 h-3 mr-1' />
            Chờ xác nhận
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant='secondary' className='bg-green-100 text-green-800'>
            <CheckCircle className='w-3 h-3 mr-1' />
            Đã xác nhận
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant='secondary' className='bg-red-100 text-red-800'>
            <AlertCircle className='w-3 h-3 mr-1' />
            Từ chối
          </Badge>
        );
      default:
        return <Badge variant='secondary'>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Trophy className='h-5 w-5' />
          Đăng ký hạng của bạn
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Registration Form */}
        <form onSubmit={handleSubmitRegistration} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Hạng bạn muốn đăng ký *
            </label>
            <Select value={selectedRank} onValueChange={setSelectedRank}>
              <SelectTrigger>
                <SelectValue placeholder='Chọn hạng' />
              </SelectTrigger>
              <SelectContent>
                {ranks.map(rank => (
                  <SelectItem key={rank.value} value={rank.value}>
                    <div className='flex items-center gap-2'>
                      <span
                        className={`px-2 py-1 rounded text-xs ${rank.color}`}
                      >
                        {rank.label}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Câu lạc bộ xác nhận *
            </label>
            <Select value={selectedClub} onValueChange={setSelectedClub}>
              <SelectTrigger>
                <SelectValue placeholder='Chọn CLB' />
              </SelectTrigger>
              <SelectContent>
                {clubs.map(club => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Lý do đăng ký hạng này *
            </label>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder='Mô tả kinh nghiệm, thành tích hoặc lý do bạn đánh giá mình ở hạng này...'
              rows={3}
            />
          </div>

          <Button type='submit' disabled={loading} className='w-full'>
            {loading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu đăng ký hạng'}
          </Button>
        </form>

        {/* Registration History */}
        {registrations.length > 0 && (
          <div className='border-t pt-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Lịch sử đăng ký hạng
            </h3>
            <div className='space-y-3'>
              {registrations.map(registration => (
                <div
                  key={registration.id}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                >
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <Badge
                        className={
                          ranks.find(
                            r => r.value === registration.requested_rank
                          )?.color || 'bg-gray-100'
                        }
                      >
                        {registration.requested_rank}
                      </Badge>
                      <span className='text-sm text-gray-600'>
                        tại {registration.clubs?.name || 'CLB không xác định'}
                      </span>
                    </div>
                    <p className='text-xs text-gray-500'>
                      {new Date(registration.created_at).toLocaleDateString(
                        'vi-VN'
                      )}
                    </p>
                  </div>
                  <div>{getStatusBadge(registration.status)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RankRegistration;
