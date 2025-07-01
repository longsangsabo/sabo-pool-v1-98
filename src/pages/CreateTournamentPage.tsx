import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Trophy, Building, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Club } from '@/types/common';

interface TournamentFormData {
  name: string;
  description?: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  registration_deadline: string;
  max_participants: string;
  entry_fee: string;
  prize_pool: string;
  bracket_type: string;
  eligible_ranks: string[];
  first_prize_percent: string;
  second_prize_percent: string;
  third_prize_percent: string;
}

const CreateTournamentPage = () => {
  const [loading, setLoading] = useState(false);
  const [club, setClub] = useState<Club | null>(null);
  const [checkingClub, setCheckingClub] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TournamentFormData>({
    defaultValues: {
      bracket_type: 'single_elimination',
      first_prize_percent: '50',
      second_prize_percent: '30',
      third_prize_percent: '20',
      eligible_ranks: [],
    },
  });

  const ranks = [
    'K1',
    'K2',
    'K3',
    'K4',
    'K5',
    'A1',
    'A2',
    'A3',
    'A4',
    'A5',
    'B1',
    'B2',
    'B3',
    'B4',
    'B5',
    'G1',
    'G2',
    'G3',
    'G4',
    'G+',
  ];

  useEffect(() => {
    if (user) {
      fetchClubInfo();
    }
  }, [user]);

  const fetchClubInfo = async () => {
    if (!user) return;

    try {
      // Mock club data since clubs table doesn't have owner_id field
      const mockClub = {
        id: 'club1',
        name: 'CLB Bi-a Mock',
        address: 'Hà Nội',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active',
        verified: true,
      };

      setClub(mockClub);
    } catch (error) {
      console.error('Error fetching club:', error);
    } finally {
      setCheckingClub(false);
    }
  };

  const handleCreateTournament = async (formData: TournamentFormData) => {
    if (!club || !user) {
      toast.error('Bạn cần có CLB để tạo giải đấu');
      return;
    }

    setLoading(true);
    try {
      const tournamentData = {
        name: formData.name,
        description: formData.description || '',
        club_id: club.id,
        start_date: `${formData.start_date}T${formData.start_time}:00`,
        end_date: `${formData.end_date}T${formData.end_time}:00`,
        registration_deadline: `${formData.registration_deadline}T23:59:59`,
        max_participants: parseInt(formData.max_participants),
        entry_fee: parseInt(formData.entry_fee) || 0,
        prize_pool: parseInt(formData.prize_pool) || 0,
        eligible_ranks: formData.eligible_ranks,
        bracket_type: formData.bracket_type,
        created_by: user.id,
        status: 'upcoming',
        first_prize_percent: parseInt(formData.first_prize_percent) || 50,
        second_prize_percent: parseInt(formData.second_prize_percent) || 30,
        third_prize_percent: parseInt(formData.third_prize_percent) || 20,
      };

      const { error } = await supabase
        .from('tournaments')
        .insert(tournamentData);

      if (error) throw error;

      toast.success('Tạo giải đấu thành công!');
      navigate('/dashboard/tournaments');
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast.error('Có lỗi xảy ra khi tạo giải đấu');
    } finally {
      setLoading(false);
    }
  };

  if (checkingClub) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    );
  }

  if (!club) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <Trophy className='w-16 h-16 mx-auto text-gray-400 mb-4' />
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Cần xác minh CLB
          </h2>
          <p className='text-gray-600 mb-4'>
            Chỉ các CLB đã xác minh mới có thể tạo giải đấu
          </p>
          <Button onClick={() => navigate('/dashboard/membership')}>
            Đăng ký CLB
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>Tạo giải đấu mới</h1>
          <p className='mt-2 text-gray-600'>
            Tổ chức giải đấu cho CLB {club.name}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Building className='w-5 h-5' />
              Thông tin giải đấu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(handleCreateTournament)}
              className='space-y-6'
            >
              {/* Basic Info */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='md:col-span-2'>
                  <Label htmlFor='name'>Tên giải đấu *</Label>
                  <Input
                    id='name'
                    {...register('name', {
                      required: 'Vui lòng nhập tên giải đấu',
                    })}
                    placeholder='Ví dụ: Giải Bida Mở Rộng Tháng 2'
                  />
                  {errors.name && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className='md:col-span-2'>
                  <Label htmlFor='description'>Mô tả giải đấu</Label>
                  <Textarea
                    id='description'
                    {...register('description')}
                    placeholder='Mô tả chi tiết về giải đấu, thể thức thi đấu...'
                    rows={3}
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <Label htmlFor='start_date'>Ngày bắt đầu *</Label>
                  <Input
                    id='start_date'
                    type='date'
                    {...register('start_date', {
                      required: 'Vui lòng chọn ngày bắt đầu',
                    })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.start_date && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.start_date.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor='start_time'>Giờ bắt đầu *</Label>
                  <Input
                    id='start_time'
                    type='time'
                    {...register('start_time', {
                      required: 'Vui lòng chọn giờ bắt đầu',
                    })}
                  />
                  {errors.start_time && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.start_time.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor='end_date'>Ngày kết thúc *</Label>
                  <Input
                    id='end_date'
                    type='date'
                    {...register('end_date', {
                      required: 'Vui lòng chọn ngày kết thúc',
                    })}
                    min={watch('start_date')}
                  />
                  {errors.end_date && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.end_date.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor='end_time'>Giờ kết thúc *</Label>
                  <Input
                    id='end_time'
                    type='time'
                    {...register('end_time', {
                      required: 'Vui lòng chọn giờ kết thúc',
                    })}
                  />
                  {errors.end_time && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.end_time.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor='registration_deadline'>Hạn đăng ký *</Label>
                  <Input
                    id='registration_deadline'
                    type='date'
                    {...register('registration_deadline', {
                      required: 'Vui lòng chọn hạn đăng ký',
                    })}
                    max={watch('start_date')}
                  />
                  {errors.registration_deadline && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.registration_deadline.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Tournament Settings */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <Label htmlFor='max_participants'>
                    Số người tham gia tối đa *
                  </Label>
                  <Select
                    onValueChange={value => setValue('max_participants', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn số người' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='8'>8 người</SelectItem>
                      <SelectItem value='16'>16 người</SelectItem>
                      <SelectItem value='32'>32 người</SelectItem>
                      <SelectItem value='64'>64 người</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.max_participants && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.max_participants.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor='bracket_type'>Thể thức thi đấu</Label>
                  <Select
                    onValueChange={value => setValue('bracket_type', value)}
                    defaultValue='single_elimination'
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='single_elimination'>
                        Loại trực tiếp
                      </SelectItem>
                      <SelectItem value='double_elimination'>
                        Loại kép
                      </SelectItem>
                      <SelectItem value='round_robin'>Vòng tròn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor='entry_fee'>Lệ phí tham gia (VNĐ)</Label>
                  <Input
                    id='entry_fee'
                    type='number'
                    {...register('entry_fee')}
                    placeholder='0'
                    min='0'
                  />
                </div>

                <div>
                  <Label htmlFor='prize_pool'>Tổng giải thưởng (VNĐ)</Label>
                  <Input
                    id='prize_pool'
                    type='number'
                    {...register('prize_pool')}
                    placeholder='0'
                    min='0'
                  />
                </div>
              </div>

              {/* Eligible Ranks */}
              <div>
                <Label>Hạng được tham gia *</Label>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mt-2'>
                  {ranks.map(rank => (
                    <div key={rank} className='flex items-center space-x-2'>
                      <Checkbox
                        id={rank}
                        {...register('eligible_ranks', {
                          required: 'Vui lòng chọn ít nhất một hạng',
                        })}
                        value={rank}
                      />
                      <Label htmlFor={rank} className='text-sm'>
                        {rank}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.eligible_ranks && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.eligible_ranks.message}
                  </p>
                )}
              </div>

              {/* Prize Distribution */}
              <div>
                <Label>Phân chia giải thưởng</Label>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-2'>
                  <div>
                    <Label htmlFor='first_prize'>Giải nhất (%)</Label>
                    <Input
                      id='first_prize'
                      type='number'
                      {...register('first_prize_percent')}
                      placeholder='50'
                      min='0'
                      max='100'
                    />
                  </div>
                  <div>
                    <Label htmlFor='second_prize'>Giải nhì (%)</Label>
                    <Input
                      id='second_prize'
                      type='number'
                      {...register('second_prize_percent')}
                      placeholder='30'
                      min='0'
                      max='100'
                    />
                  </div>
                  <div>
                    <Label htmlFor='third_prize'>Giải ba (%)</Label>
                    <Input
                      id='third_prize'
                      type='number'
                      {...register('third_prize_percent')}
                      placeholder='20'
                      min='0'
                      max='100'
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className='flex justify-end space-x-3 pt-6'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => navigate(-1)}
                >
                  Hủy
                </Button>
                <Button
                  type='submit'
                  disabled={loading}
                  className='flex items-center gap-2'
                >
                  {loading ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin' />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Trophy className='w-4 h-4' />
                      Tạo giải đấu
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTournamentPage;
