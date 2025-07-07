import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trophy, Plus, Calendar, MapPin, Users, Eye, Settings, Check, Clock } from 'lucide-react';
import { EnhancedTournamentCreator } from '@/components/tournament/EnhancedTournamentCreator';
import { TournamentRegistrationDashboard } from '@/components/tournament/TournamentRegistrationDashboard';
import { useTournaments } from '@/hooks/useTournaments';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Using Tournament type from useTournaments hook

const TournamentsPage: React.FC = () => {
  const { user } = useAuth();
  const { tournaments, loading, registerForTournament, cancelRegistration, checkUserRegistration, fetchTournaments } = useTournaments();
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'upcoming' | 'registration_open' | 'ongoing' | 'completed'
  >('all');
  const [showTournamentCreator, setShowTournamentCreator] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [showRegistrationDashboard, setShowRegistrationDashboard] = useState(false);
  const [userRegistrations, setUserRegistrations] = useState<Record<string, any>>({});
  const [registrationLoading, setRegistrationLoading] = useState<string | null>(null);

  // Check user registrations for all tournaments
  useEffect(() => {
    const loadUserRegistrations = async () => {
      if (!user || tournaments.length === 0) return;
      
      console.log('Loading user registrations for', tournaments.length, 'tournaments');
      const registrations: Record<string, any> = {};
      for (const tournament of tournaments) {
        const registration = await checkUserRegistration(tournament.id);
        if (registration) {
          registrations[tournament.id] = registration;
          console.log('Found registration for tournament:', tournament.id, registration);
        }
      }
      setUserRegistrations(registrations);
      console.log('Final userRegistrations state:', registrations);
    };

    loadUserRegistrations();
  }, [user, tournaments, checkUserRegistration]);

  const handleRegisterTournament = async (tournamentId: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đăng ký giải đấu');
      return;
    }

    setRegistrationLoading(tournamentId);
    try {
      await registerForTournament(tournamentId);
      
      // Refresh tournaments data to get updated participant count
      await fetchTournaments();
      
      // Get the registration data and update state
      const registration = await checkUserRegistration(tournamentId);
      setUserRegistrations(prev => ({
        ...prev,
        [tournamentId]: registration
      }));
      
      if (registration) {
        console.log('Registration successful for tournament:', tournamentId);
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      // On error, ensure we have the correct state
      const registration = await checkUserRegistration(tournamentId);
      setUserRegistrations(prev => ({
        ...prev,
        [tournamentId]: registration
      }));
    } finally {
      setRegistrationLoading(null);
    }
  };

  const handleCancelRegistration = async (tournamentId: string) => {
    if (!user) return;

    setRegistrationLoading(tournamentId);
    try {
      await cancelRegistration(tournamentId);
      
      // Immediately remove from userRegistrations state to update UI
      setUserRegistrations(prev => {
        const updated = { ...prev };
        delete updated[tournamentId];
        return updated;
      });
      
      // Refresh tournaments data to ensure consistency
      await fetchTournaments();
      
      // Double-check registration status
      const registration = await checkUserRegistration(tournamentId);
      if (!registration) {
        console.log('Registration successfully canceled for tournament:', tournamentId);
      }
      
    } catch (error) {
      console.error('Cancel registration error:', error);
      // On error, reload registrations to get current state
      const registration = await checkUserRegistration(tournamentId);
      setUserRegistrations(prev => ({
        ...prev,
        [tournamentId]: registration
      }));
    } finally {
      setRegistrationLoading(null);
    }
  };

  const handleViewRegistrations = (tournament: any) => {
    setSelectedTournament(tournament);
    setShowRegistrationDashboard(true);
  };

  const handleTournamentCreated = (tournament: any) => {
    setShowTournamentCreator(false);
    toast.success('Giải đấu đã được tạo thành công!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'registration_open':
        return 'bg-green-100 text-green-800';
      case 'registration_closed':
        return 'bg-yellow-100 text-yellow-800';
      case 'ongoing':
        return 'bg-purple-100 text-purple-800';
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
      case 'registration_open':
        return 'Đang mở đăng ký';
      case 'registration_closed':
        return 'Đã đóng đăng ký';
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

  const filteredTournaments = tournaments?.filter(tournament => {
    if (selectedFilter === 'all') return true;
    return tournament.status === selectedFilter;
  }) || [];

  if (loading) {
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
            onCancel={() => setShowTournamentCreator(false)}
          />
        </div>
      </div>
    );
  }

  // Show Registration Dashboard
  if (showRegistrationDashboard && selectedTournament) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 py-6'>
          <TournamentRegistrationDashboard
            tournament={selectedTournament}
            onClose={() => setShowRegistrationDashboard(false)}
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
                variant={selectedFilter === 'registration_open' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('registration_open')}
              >
                Đang mở đăng ký
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

                {/* Tournament Info */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Loại: {tournament.tournament_type === 'single_elimination' ? 'Loại trực tiếp' : tournament.tournament_type}</span>
                </div>

                {/* Details */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm'>
                    <Calendar className='h-4 w-4 text-gray-500' />
                    <span>
                      {new Date(tournament.tournament_start).toLocaleDateString('vi-VN')} -{' '}
                      {new Date(tournament.tournament_end).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <div className='flex items-center gap-2 text-sm'>
                    <MapPin className='h-4 w-4 text-gray-500' />
                    <span>{tournament.venue_address || 'Chưa có địa điểm'}</span>
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
                  {/* Check if registration is open by dates */}
                  {(() => {
                    const now = new Date();
                    const regStart = new Date(tournament.registration_start);
                    const regEnd = new Date(tournament.registration_end);
                    const isRegistrationOpen = now >= regStart && now <= regEnd;
                    
                    return (tournament.status === 'registration_open' || tournament.status === 'upcoming') && isRegistrationOpen && (
                      userRegistrations[tournament.id] ? (
                        <div className='flex-1 flex gap-2'>
                          <Button 
                            variant='outline'
                            className='flex-1'
                            onClick={() => handleCancelRegistration(tournament.id)}
                            disabled={registrationLoading === tournament.id}
                          >
                            {registrationLoading === tournament.id ? 'Đang hủy...' : 'Hủy đăng ký'}
                          </Button>
                          <div className='flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm'>
                            <Check className='h-4 w-4 mr-1' />
                            Đã đăng ký
                          </div>
                        </div>
                      ) : (
                        <Button 
                          className='flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
                          onClick={() => handleRegisterTournament(tournament.id)}
                          disabled={registrationLoading === tournament.id || tournament.current_participants >= tournament.max_participants}
                        >
                          {registrationLoading === tournament.id ? 'Đang đăng ký...' : 
                           tournament.current_participants >= tournament.max_participants ? 'Đã đầy' : 'Đăng ký tham gia'}
                        </Button>
                      )
                    );
                  })()}
                  
                  {tournament.status === 'ongoing' && (
                    <Button 
                      className='flex-1'
                      onClick={() => {
                        setSelectedTournament(tournament);
                        // Add bracket viewer logic here
                      }}
                    >
                      Xem bảng đấu
                    </Button>
                  )}
                  
                  {tournament.status === 'completed' && (
                    <Button variant='outline' className='flex-1'>
                      Xem kết quả
                    </Button>
                  )}
                  
                  {(() => {
                    const now = new Date();
                    const regStart = new Date(tournament.registration_start);
                    const regEnd = new Date(tournament.registration_end);
                    const isRegistrationClosed = now > regEnd;
                    
                    return (tournament.status === 'registration_closed' || isRegistrationClosed) && tournament.status !== 'ongoing' && tournament.status !== 'completed' && (
                      <div className='flex-1 flex items-center justify-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md text-sm'>
                        <Clock className='h-4 w-4 mr-1' />
                        Đã đóng đăng ký
                      </div>
                    );
                  })()}
                  
                  {/* Admin/Organizer Actions */}
                  {user?.id === tournament.organizer_id && (
                    <Button 
                      variant='outline' 
                      size='sm'
                      onClick={() => handleViewRegistrations(tournament)}
                    >
                      <Settings className='h-4 w-4 mr-1' />
                      Quản lý
                    </Button>
                  )}
                  
                  <Button variant='outline' size='sm'>
                    <Eye className='h-4 w-4 mr-1' />
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
