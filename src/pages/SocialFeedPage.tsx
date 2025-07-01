import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart,
  MessageCircle,
  Share2,
  Trophy,
  Users,
  TrendingUp,
} from 'lucide-react';
import { useSocial } from '@/hooks/useSocial';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Activity {
  id: string;
  type: string;
  user_id: string;
  content: string;
  created_at: string;
  metadata?: Record<string, any>;
}

const SocialFeedPage = () => {
  const { following, followUser, unfollowUser, isFollowing } = useSocial();

  const { data: topPlayers = [] } = useQuery({
    queryKey: ['topPlayers'],
    queryFn: async () => {
      // Mock top players data since profiles table doesn't have ranking fields
      const mockPlayers = [
        {
          user_id: 'user1',
          full_name: 'Nguyễn Văn A',
          current_rank: 'A1',
          avatar_url: '',
          ranking_points: 2800,
          matches_won: 45,
          matches_played: 50,
        },
        {
          user_id: 'user2',
          full_name: 'Trần Thị B',
          current_rank: 'A2',
          avatar_url: '',
          ranking_points: 2650,
          matches_won: 42,
          matches_played: 48,
        },
      ];
      return mockPlayers;
    },
  });

  const { data: recentActivities = [] } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: async () => {
      // Mock activities data since user_activities table doesn't exist
      const mockActivities = [
        {
          id: '1',
          type: 'tournament_join',
          user_id: 'user1',
          content: 'Joined tournament',
          created_at: new Date().toISOString(),
          profile: {
            full_name: 'Nguyễn Văn A',
            current_rank: 'A2',
            avatar_url: '',
          },
        },
        {
          id: '2',
          type: 'match_win',
          user_id: 'user2',
          content: 'Won match',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          profile: {
            full_name: 'Trần Thị B',
            current_rank: 'B1',
            avatar_url: '',
          },
        },
      ];
      return mockActivities;
    },
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tournament_join':
        return <Trophy className='h-4 w-4 text-yellow-500' />;
      case 'challenge_create':
        return <Users className='h-4 w-4 text-blue-500' />;
      case 'ranking_update':
        return <TrendingUp className='h-4 w-4 text-green-500' />;
      default:
        return <Heart className='h-4 w-4 text-red-500' />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'tournament_join':
        return 'đã tham gia giải đấu';
      case 'challenge_create':
        return 'đã tạo thách đấu mới';
      case 'ranking_update':
        return `đã thăng hạng lên ${activity.metadata?.new_rank}`;
      case 'match_win':
        return 'đã thắng trận đấu';
      default:
        return 'có hoạt động mới';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    return `${Math.floor(diffInHours / 24)} ngày trước`;
  };

  return (
    <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
      {/* Main Feed */}
      <div className='lg:col-span-3 space-y-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Bảng tin cộng đồng
          </h1>
          <p className='text-gray-600'>Theo dõi hoạt động của cộng đồng bida</p>
        </div>

        <Tabs defaultValue='following' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='following'>Đang theo dõi</TabsTrigger>
            <TabsTrigger value='all'>Tất cả hoạt động</TabsTrigger>
            <TabsTrigger value='tournaments'>Giải đấu</TabsTrigger>
          </TabsList>

          <TabsContent value='following' className='space-y-4'>
            {following.length === 0 ? (
              <Card>
                <CardContent className='p-6 text-center'>
                  <Users className='h-12 w-12 mx-auto mb-4 text-gray-400' />
                  <h3 className='text-lg font-semibold mb-2'>
                    Chưa theo dõi ai
                  </h3>
                  <p className='text-gray-600 mb-4'>
                    Theo dõi các tay cơ khác để xem hoạt động của họ
                  </p>
                  <Button>Khám phá người chơi</Button>
                </CardContent>
              </Card>
            ) : (
              <div className='space-y-4'>
                {recentActivities.map(activity => (
                  <Card key={activity.id}>
                    <CardContent className='p-4'>
                      <div className='flex items-start gap-3'>
                        <Avatar>
                          <AvatarImage src={activity.profile?.avatar_url} />
                          <AvatarFallback>
                            {activity.profile?.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-1'>
                            {getActivityIcon(activity.type)}
                            <span className='font-medium'>
                              {activity.profile?.full_name}
                            </span>
                            <Badge variant='secondary' className='text-xs'>
                              {activity.profile?.current_rank}
                            </Badge>
                            <span className='text-gray-600'>
                              {getActivityText(activity)}
                            </span>
                          </div>
                          <p className='text-sm text-gray-500'>
                            {formatTimeAgo(activity.created_at)}
                          </p>

                          <div className='flex items-center gap-4 mt-3'>
                            <Button variant='ghost' size='sm' className='gap-1'>
                              <Heart className='h-4 w-4' />
                              <span>Thích</span>
                            </Button>
                            <Button variant='ghost' size='sm' className='gap-1'>
                              <MessageCircle className='h-4 w-4' />
                              <span>Bình luận</span>
                            </Button>
                            <Button variant='ghost' size='sm' className='gap-1'>
                              <Share2 className='h-4 w-4' />
                              <span>Chia sẻ</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value='all' className='space-y-4'>
            {recentActivities.map(activity => (
              <Card key={activity.id}>
                <CardContent className='p-4'>
                  <div className='flex items-start gap-3'>
                    <Avatar>
                      <AvatarImage src={activity.profile?.avatar_url} />
                      <AvatarFallback>
                        {activity.profile?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        {getActivityIcon(activity.type)}
                        <span className='font-medium'>
                          {activity.profile?.full_name}
                        </span>
                        <Badge variant='secondary' className='text-xs'>
                          {activity.profile?.current_rank}
                        </Badge>
                        <span className='text-gray-600'>
                          {getActivityText(activity)}
                        </span>
                        {!isFollowing(activity.user_id) && (
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => followUser.mutate(activity.user_id)}
                            className='ml-auto'
                          >
                            Theo dõi
                          </Button>
                        )}
                      </div>
                      <p className='text-sm text-gray-500'>
                        {formatTimeAgo(activity.created_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value='tournaments'>
            <Card>
              <CardContent className='p-6 text-center'>
                <Trophy className='h-12 w-12 mx-auto mb-4 text-gray-400' />
                <p className='text-gray-500'>
                  Hoạt động giải đấu sẽ được hiển thị ở đây
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar */}
      <div className='space-y-6'>
        {/* Top Players */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Top Players
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {topPlayers.slice(0, 5).map((player, index) => (
              <div key={player.user_id} className='flex items-center gap-3'>
                <div className='flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium'>
                  {index + 1}
                </div>
                <Avatar className='h-8 w-8'>
                  <AvatarImage src={player.avatar_url} />
                  <AvatarFallback>{player.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium truncate'>
                    {player.full_name}
                  </p>
                  <p className='text-xs text-gray-500'>{player.current_rank}</p>
                </div>
                {!isFollowing(player.user_id) && (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => followUser.mutate(player.user_id)}
                  >
                    Theo dõi
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Suggested Follows */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              Gợi ý theo dõi
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {topPlayers.slice(5, 8).map(player => (
              <div key={player.user_id} className='flex items-center gap-3'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage src={player.avatar_url} />
                  <AvatarFallback>{player.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium truncate'>
                    {player.full_name}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {player.matches_won}/{player.matches_played} thắng
                  </p>
                </div>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => followUser.mutate(player.user_id)}
                >
                  Theo dõi
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SocialFeedPage;
