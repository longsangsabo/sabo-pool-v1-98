import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Plus, Calendar, MapPin, Users } from 'lucide-react';
import { EnhancedTournamentCreator } from '@/components/tournament/EnhancedTournamentCreator';

interface Tournament {
  id: string;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  location: string;
  entry_fee: number;
  prize_pool: number;
  max_participants: number;
  current_participants: number;
  status: 'upcoming' | 'registration' | 'ongoing' | 'completed';
  organizer: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  category: 'amateur' | 'professional' | 'championship';
  is_registered: boolean;
}

const TournamentsPage: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'upcoming' | 'ongoing' | 'completed'
  >('all');
  const [showTournamentCreator, setShowTournamentCreator] = useState(false);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTournaments([
        {
          id: '1',
          name: 'Giải đấu mùa xuân 2024',
          description: 'Giải đấu thường niên dành cho tất cả người chơi',
          start_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week from now
          end_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 2 weeks from now
          location: 'Club Pool Hà Nội',
          entry_fee: 50000,
          prize_pool: 5000000,
          max_participants: 64,
          current_participants: 32,
          status: 'registration',
          organizer: {
            id: '1',
            username: 'pool_club_hanoi',
            avatar_url: '/avatars/club.jpg',
          },
          category: 'amateur',
          is_registered: false,
        },
        {
          id: '2',
          name: 'Giải vô địch quốc gia',
          description:
            'Giải đấu cấp quốc gia dành cho các tay chơi chuyên nghiệp',
          start_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 1 month from now
          end_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 37), // 1 month + 1 week from now
          location: 'Trung tâm thể thao quốc gia',
          entry_fee: 200000,
          prize_pool: 20000000,
          max_participants: 32,
          current_participants: 28,
          status: 'upcoming',
          organizer: {
            id: '2',
            username: 'vietnam_pool_federation',
            avatar_url: '/avatars/federation.jpg',
          },
          category: 'championship',
          is_registered: true,
        },
        {
          id: '3',
          name: 'Giải đấu cuối tuần',
          description: 'Giải đấu nhanh dành cho người chơi cuối tuần',
          start_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          end_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
          location: 'Club Pool TP.HCM',
          entry_fee: 30000,
          prize_pool: 1000000,
          max_participants: 16,
          current_participants: 16,
          status: 'ongoing',
          organizer: {
            id: '3',
            username: 'pool_club_hcm',
            avatar_url: '/avatars/club_hcm.jpg',
          },
          category: 'amateur',
          is_registered: true,
        },
        {
          id: '4',
          name: 'Giải đấu mùa đông 2023',
          description: 'Giải đấu đã kết thúc',
          start_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60), // 2 months ago
          end_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 53), // 2 months - 1 week ago
          location: 'Club Pool Đà Nẵng',
          entry_fee: 40000,
          prize_pool: 2000000,
          max_participants: 32,
          current_participants: 32,
          status: 'completed',
          organizer: {
            id: '4',
            username: 'pool_club_danang',
            avatar_url: '/avatars/club_danang.jpg',
          },
          category: 'professional',
          is_registered: false,
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch tournaments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'registration':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Sắp diễn ra';
      case 'registration':
        return 'Đang đăng ký';
      case 'ongoing':
        return 'Đang diễn ra';
      case 'completed':
        return 'Đã kết thúc';
      default:
        return status;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'amateur':
        return 'bg-green-100 text-green-800';
      case 'professional':
        return 'bg-blue-100 text-blue-800';
      case 'championship':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'amateur':
        return 'Nghiệp dư';
      case 'professional':
        return 'Chuyên nghiệp';
      case 'championship':
        return 'Vô địch';
      default:
        return category;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const filteredTournaments = tournaments.filter(tournament => {
    if (selectedFilter === 'all') return true;
    return tournament.status === selectedFilter;
  });

  const handleTournamentCreated = (tournament: any) => {
    setShowTournamentCreator(false);
    fetchTournaments(); // Refresh tournament list
  };

  const handleCancelCreator = () => {
    setShowTournamentCreator(false);
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  // Show Tournament Creator
  if (showTournamentCreator) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 py-6'>
          <EnhancedTournamentCreator 
            onSuccess={handleTournamentCreated}
            onCancel={handleCancelCreator}
          />
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto px-4 py-6'>
        {/* Header */}
        <div className='mb-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Giải đấu</h1>
              <p className='text-gray-600 mt-1'>
                Tham gia các giải đấu và thi đấu với người chơi khác
              </p>
            </div>
            <Button onClick={() => setShowTournamentCreator(true)}>
              <Plus className='h-4 w-4 mr-2' />
              Tạo giải đấu
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className='mb-6'>
          <CardContent className='pt-6'>
            <div className='flex flex-wrap gap-2'>
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('all')}
              >
                Tất cả
              </Button>
              <Button
                variant={selectedFilter === 'upcoming' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('upcoming')}
              >
                Sắp diễn ra
              </Button>
              <Button
                variant={selectedFilter === 'ongoing' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('ongoing')}
              >
                Đang diễn ra
              </Button>
              <Button
                variant={selectedFilter === 'completed' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('completed')}
              >
                Đã kết thúc
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tournaments Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredTournaments.map(tournament => (
            <Card
              key={tournament.id}
              className='hover:shadow-lg transition-shadow'
            >
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <CardTitle className='text-lg mb-2'>
                      {tournament.name}
                    </CardTitle>
                    <div className='flex items-center gap-2 mb-2'>
                      <Badge className={getStatusColor(tournament.status)}>
                        {getStatusName(tournament.status)}
                      </Badge>
                      <Badge className={getCategoryColor(tournament.category)}>
                        {getCategoryName(tournament.category)}
                      </Badge>
                    </div>
                  </div>
                  <Trophy className='h-6 w-6 text-yellow-500' />
                </div>
              </CardHeader>

              <CardContent className='space-y-4'>
                {/* Description */}
                <p className='text-sm text-gray-600'>
                  {tournament.description}
                </p>

                {/* Organizer */}
                <div className='flex items-center gap-2'>
                  <Avatar className='h-6 w-6'>
                    <AvatarImage src={tournament.organizer.avatar_url} />
                    <AvatarFallback>
                      {tournament.organizer.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className='text-sm text-gray-600'>
                    {tournament.organizer.username}
                  </span>
                </div>

                {/* Details */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm'>
                    <Calendar className='h-4 w-4 text-gray-500' />
                    <span>
                      {tournament.start_date.toLocaleDateString('vi-VN')} -{' '}
                      {tournament.end_date.toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <div className='flex items-center gap-2 text-sm'>
                    <MapPin className='h-4 w-4 text-gray-500' />
                    <span>{tournament.location}</span>
                  </div>

                  <div className='flex items-center gap-2 text-sm'>
                    <Users className='h-4 w-4 text-gray-500' />
                    <span>
                      {tournament.current_participants}/
                      {tournament.max_participants} người tham gia
                    </span>
                  </div>
                </div>

                {/* Prize Pool */}
                <div className='bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-sm text-gray-600'>Giải thưởng</div>
                      <div className='font-bold text-lg text-yellow-800'>
                        {formatCurrency(tournament.prize_pool)}
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-sm text-gray-600'>Phí tham gia</div>
                      <div className='font-medium text-gray-800'>
                        {formatCurrency(tournament.entry_fee)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className='flex justify-between text-sm text-gray-600 mb-1'>
                    <span>Tiến độ đăng ký</span>
                    <span>
                      {Math.round(
                        (tournament.current_participants /
                          tournament.max_participants) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-500 h-2 rounded-full transition-all'
                      style={{
                        width: `${(tournament.current_participants / tournament.max_participants) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className='flex gap-2'>
                  {tournament.status === 'registration' &&
                    !tournament.is_registered && (
                      <Button className='flex-1'>Đăng ký tham gia</Button>
                    )}
                  {tournament.status === 'registration' &&
                    tournament.is_registered && (
                      <Button variant='outline' className='flex-1'>
                        Đã đăng ký
                      </Button>
                    )}
                  {tournament.status === 'ongoing' && (
                    <Button className='flex-1'>Xem bảng đấu</Button>
                  )}
                  {tournament.status === 'completed' && (
                    <Button variant='outline' className='flex-1'>
                      Xem kết quả
                    </Button>
                  )}
                  <Button variant='outline' size='sm'>
                    Chi tiết
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTournaments.length === 0 && (
          <div className='text-center py-12'>
            <Trophy className='h-12 w-12 mx-auto mb-4 text-gray-400' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Không có giải đấu nào
            </h3>
            <p className='text-gray-600 mb-4'>
              {selectedFilter === 'all'
                ? 'Chưa có giải đấu nào được tạo'
                : `Không có giải đấu nào ở trạng thái "${getStatusName(selectedFilter)}"`}
            </p>
            <Button onClick={() => setShowTournamentCreator(true)}>
              <Plus className='h-4 w-4 mr-2' />
              Tạo giải đấu đầu tiên
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentsPage;
