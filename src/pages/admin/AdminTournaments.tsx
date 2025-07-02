
import React, { useState } from 'react';
import { Plus, Calendar, Trophy, Users, Settings, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/AdminLayout';
import { useTournaments } from '@/hooks/useTournaments';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { toast } from 'sonner';

const AdminTournaments = () => {
  const { tournaments, loading, createTournament } = useTournaments();
  const { data: isAdmin, isLoading: adminLoading } = useAdminCheck();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Show loading while checking admin status
  if (adminLoading) {
    return (
      <AdminLayout>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
        </div>
      </AdminLayout>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              Access Denied
            </h2>
            <p className='text-gray-600'>
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const handleCreateTournament = async () => {
    try {
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 86400000 * 3);
      const oneDayFromNow = new Date(now.getTime() + 86400000);

      await createTournament({
        name: 'Giải đấu mới',
        description: 'Mô tả giải đấu',
        tournament_start: now.toISOString(),
        tournament_end: threeDaysFromNow.toISOString(),
        registration_start: now.toISOString(),
        registration_end: oneDayFromNow.toISOString(),
        max_participants: 32,
        entry_fee: 100000,
        prize_pool: 1000000,
        tournament_type: 'single_elimination',
        game_format: '8_ball',
        venue_name: 'Sảnh thi đấu chính',
        venue_address: 'Hà Nội',
        rules: 'Quy định thi đấu theo luật quốc tế',
      });
    } catch (error) {
      console.error('Error creating tournament:', error);
    }
  };

  const handleGenerateBracket = async (tournamentId: string) => {
    try {
      // Mock bracket generation - replace with actual implementation
      toast.success('Bảng đấu đã được tạo!');
    } catch (error) {
      console.error('Error generating bracket:', error);
    }
  };

  const filteredTournaments =
    tournaments?.filter(tournament => {
      const matchesSearch = tournament.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || tournament.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'registration_open':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Sắp diễn ra';
      case 'registration_open':
        return 'Đang mở đăng ký';
      case 'ongoing':
        return 'Đang diễn ra';
      case 'completed':
        return 'Đã kết thúc';
      default:
        return status;
    }
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

  const formatPrize = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Quản Lý Giải Đấu
            </h1>
            <p className='text-gray-600'>Tạo và quản lý các giải đấu bida</p>
          </div>
          <Button onClick={handleCreateTournament} className='gap-2'>
            <Plus className='w-4 h-4' />
            Tạo Giải Đấu Mới
          </Button>
        </div>

        {/* Filters */}
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              placeholder='Tìm kiếm giải đấu...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-48'>
              <SelectValue placeholder='Trạng thái' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả</SelectItem>
              <SelectItem value='upcoming'>Sắp diễn ra</SelectItem>
              <SelectItem value='registration_open'>Đang mở đăng ký</SelectItem>
              <SelectItem value='ongoing'>Đang diễn ra</SelectItem>
              <SelectItem value='completed'>Đã kết thúc</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tournaments Grid */}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {filteredTournaments.map(tournament => (
            <Card
              key={tournament.id}
              className='hover:shadow-lg transition-shadow'
            >
              <CardHeader>
                <div className='flex justify-between items-start mb-2'>
                  <CardTitle className='text-xl'>{tournament.name}</CardTitle>
                  <Badge className={getStatusColor(tournament.status)}>
                    {getStatusText(tournament.status)}
                  </Badge>
                </div>
                <CardDescription className='line-clamp-2'>
                  {tournament.description}
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div className='flex items-center text-gray-600'>
                    <Calendar className='w-4 h-4 mr-2' />
                    <span>{formatDate(tournament.tournament_start)}</span>
                  </div>

                  <div className='flex items-center text-gray-600'>
                    <Trophy className='w-4 h-4 mr-2' />
                    <span>{formatPrize(tournament.prize_pool)}</span>
                  </div>

                  <div className='flex items-center text-gray-600'>
                    <Users className='w-4 h-4 mr-2' />
                    <span>
                      {tournament.current_participants}/
                      {tournament.max_participants}
                    </span>
                  </div>

                  <div className='flex items-center text-gray-600'>
                    <span className='text-green-600 font-semibold'>
                      {formatPrize(tournament.entry_fee)}
                    </span>
                  </div>
                </div>

                <div className='flex gap-2'>
                  <Button variant='outline' size='sm' className='flex-1'>
                    <Eye className='w-4 h-4 mr-2' />
                    Xem
                  </Button>
                  <Button variant='outline' size='sm' className='flex-1'>
                    <Settings className='w-4 h-4 mr-2' />
                    Cài đặt
                  </Button>
                </div>

                {tournament.status === 'registration_open' && (
                  <Button
                    onClick={() => handleGenerateBracket(tournament.id)}
                    className='w-full'
                    size='sm'
                  >
                    Tạo Bảng Đấu
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTournaments.length === 0 && (
          <div className='text-center py-12'>
            <Trophy className='w-12 h-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-500 font-medium'>
              Không tìm thấy giải đấu nào
            </p>
            <p className='text-gray-400 text-sm mt-2'>
              Thử thay đổi bộ lọc hoặc tạo giải đấu mới
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTournaments;
