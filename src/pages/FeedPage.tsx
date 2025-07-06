
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Filter,
  Search,
  Users,
  Trophy,
  MapPin,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MobileLayout from '../components/MobileLayout';
import TournamentFeedCard from '@/components/TournamentFeedCard';
import { EnhancedChallengeCard } from '@/components/challenges/EnhancedChallengeCard';
import { EnhancedAuthFlow } from '@/components/auth/EnhancedAuthFlow';
import SocialFeedCard from '@/components/SocialFeedCard';
import { useTournaments } from '@/hooks/useTournaments';
import { useChallenges } from '@/hooks/useChallenges';
import { useAuth } from '@/hooks/useAuth';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useRealtimeFeed } from '@/hooks/useRealtimeFeed';
import { toast } from 'sonner';

const FeedPage = () => {
  const { user } = useAuth();
  const { tournaments, joinTournament } = useTournaments();
  const { receivedChallenges } = useChallenges();
  const { userLocation, requestLocationPermission } = useUserLocation();
  const { 
    feedPosts, 
    isConnected, 
    handleLike, 
    handleComment, 
    handleShare, 
    handleChallenge,
    refreshFeed 
  } = useRealtimeFeed();
  const [showAuthFlow, setShowAuthFlow] = useState(false);
  const [activeTab, setActiveTab] = useState('social');
  const [searchQuery, setSearchQuery] = useState('');

  // Show auth flow if user is not logged in
  useEffect(() => {
    if (!user) {
      setShowAuthFlow(true);
    }
  }, [user]);

  const handleJoinTournament = async (tournamentId: string) => {
    if (!user) {
      setShowAuthFlow(true);
      return;
    }

    try {
      await joinTournament.mutateAsync({ tournamentId });
    } catch (error) {
      console.error('Error joining tournament:', error);
    }
  };

  const handleChallengeAction = (action: string, challengeId: string) => {
    toast.success(
      `Thách đấu đã được ${action === 'accepted' ? 'chấp nhận' : 'từ chối'}`
    );
  };

  const filteredTournaments = tournaments.filter(
    tournament =>
      tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChallenges = receivedChallenges.filter(challenge =>
    challenge.challenger_profile?.full_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <>
        {showAuthFlow && (
          <EnhancedAuthFlow
            onSuccess={() => {
              setShowAuthFlow(false);
              toast.success('Chào mừng bạn đến với SABO! 🎱');
            }}
          />
        )}
        <MobileLayout>
          <div className='flex items-center justify-center min-h-screen bg-gray-50'>
            <div className='text-center p-8'>
              <h1 className='text-2xl font-bold mb-4'>Chào mừng đến SABO</h1>
              <p className='text-gray-600 mb-6'>
                Vui lòng đăng nhập để tiếp tục
              </p>
              <Button onClick={() => setShowAuthFlow(true)}>Đăng nhập</Button>
            </div>
          </div>
        </MobileLayout>
      </>
    );
  }

  return (
    <MobileLayout>
      <div className='bg-gray-50 min-h-screen'>
        {/* Header */}
        <div className='bg-white p-4 shadow-sm'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h1 className='text-2xl font-bold'>Bảng tin</h1>
              <p className='text-sm text-gray-600'>
                Cập nhật mới nhất từ cộng đồng
              </p>
            </div>
            <div className='flex items-center space-x-2'>
              {!userLocation && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={requestLocationPermission}
                  className='text-xs'
                >
                  <MapPin className='w-4 h-4 mr-1' />
                  Vị trí
                </Button>
              )}
              <Button size='sm' className='bg-blue-500'>
                <Plus className='w-4 h-4 mr-2' />
                Tạo
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className='relative mb-4'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
            <Input
              placeholder='Tìm kiếm giải đấu, thách đấu...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='social' className='text-xs'>
                <Bell className='w-4 h-4 mr-1' />
                Hoạt động
              </TabsTrigger>
              <TabsTrigger value='tournaments' className='text-xs'>
                <Trophy className='w-4 h-4 mr-1' />
                Giải đấu
              </TabsTrigger>
              <TabsTrigger value='challenges' className='text-xs'>
                <Users className='w-4 h-4 mr-1' />
                Thách đấu
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className='p-4'>
          <Tabs value={activeTab} className='w-full'>
            <TabsContent value='social' className='space-y-4 mt-0'>
              {/* Real-time status indicator */}
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className='text-xs text-muted-foreground'>
                    {isConnected ? 'Trực tuyến' : 'Ngoại tuyến'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshFeed}
                  className='flex items-center gap-2'
                >
                  <RefreshCw className='w-4 h-4' />
                  Làm mới
                </Button>
              </div>

              {feedPosts.length > 0 ? (
                feedPosts.map(post => (
                  <SocialFeedCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    onShare={handleShare}
                    onChallenge={handleChallenge}
                  />
                ))
              ) : (
                <div className='text-center py-12'>
                  <Bell className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500 mb-2'>Chưa có hoạt động nào</p>
                  <p className='text-sm text-gray-400'>
                    Các bài viết về thành tích, xác nhận hạng sẽ hiển thị ở đây
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value='tournaments' className='space-y-4 mt-0'>
              {filteredTournaments.length > 0 ? (
                filteredTournaments.map(tournament => (
                  <TournamentFeedCard
                    key={tournament.id}
                    tournament={{
                      id: tournament.id,
                      name: tournament.name,
                      description: tournament.description || '',
                      start_date: tournament.tournament_start,
                      club_name: tournament.club?.name || 'Unknown Club',
                      max_participants: tournament.max_participants,
                      current_participants: tournament.current_participants,
                      prize_pool: tournament.prize_pool,
                      status: tournament.status,
                      organizer: {
                        id: 'organizer-id',
                        name: 'Organizer',
                        avatar: '',
                        rank: 'K1',
                      },
                    }}
                    onRegister={handleJoinTournament}
                  />
                ))
              ) : (
                <div className='text-center py-12'>
                  <Trophy className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500'>Không có giải đấu nào</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value='challenges' className='space-y-4 mt-0'>
              {filteredChallenges.length > 0 ? (
                filteredChallenges.map(challenge => {
                  // Transform the challenge data to match EnhancedChallengeCard expectations
                  const transformedChallenge = {
                    id: challenge.id,
                    challenger_id: challenge.challenger_id,
                    challenged_id: challenge.challenged_id,
                    status: challenge.status,
                    bet_points: challenge.bet_points,
                    proposed_datetime: challenge.proposed_datetime || new Date().toISOString(),
                    confirmed_datetime: challenge.confirmed_datetime,
                    message: challenge.message,
                    proposed_club_id: challenge.proposed_club_id,
                    confirmed_club_id: challenge.confirmed_club_id,
                    club: challenge.club
                      ? {
                          id: challenge.club_id || 'unknown',
                          name: challenge.club.name || 'Unknown Club',
                          address: challenge.club.address || 'Unknown Address',
                        }
                      : undefined,
                    challenger_profile: challenge.challenger_profile
                      ? {
                          user_id: challenge.challenger_profile.user_id || challenge.challenger_id,
                          full_name:
                            challenge.challenger_profile.full_name ||
                            'Unknown User',
                          avatar_url: challenge.challenger_profile.avatar_url,
                          current_rank:
                            challenge.challenger_profile.current_rank || 'K1',
                          ranking_points: challenge.challenger_profile.ranking_points || 0,
                        }
                      : undefined,
                    challenged_profile: challenge.challenged_profile
                      ? {
                          user_id: challenge.challenged_profile.user_id || challenge.challenged_id,
                          full_name: challenge.challenged_profile.full_name || 'Unknown User',
                          avatar_url: challenge.challenged_profile.avatar_url,
                          current_rank: challenge.challenged_profile.current_rank || 'K1',
                          ranking_points: challenge.challenged_profile.ranking_points,
                        }
                      : undefined,
                  };

                  return (
                    <EnhancedChallengeCard
                      key={challenge.id}
                      challenge={transformedChallenge}
                      onAction={handleChallengeAction}
                    />
                  );
                })
              ) : (
                <div className='text-center py-12'>
                  <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500'>Không có thách đấu nào</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
};

export default FeedPage;
