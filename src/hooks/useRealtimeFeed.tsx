import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Post } from '@/types/common';

interface FeedPost {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    rank: string;
  };
  type: 'match_result' | 'achievement' | 'tournament_win' | 'streak';
  content: string;
  image?: string;
  stats?: {
    score?: string;
    opponent?: string;
    achievement?: string;
  };
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export const useRealtimeFeed = () => {
  const { user } = useAuth();
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Mock initial data
  useEffect(() => {
    const mockPosts: FeedPost[] = [
      {
        id: '1',
        user: {
          id: '1',
          name: 'Nguyễn Văn A',
          avatar: '/placeholder.svg',
          rank: 'A+',
        },
        type: 'match_result',
        content:
          'Vừa có trận đấu tuyệt vời! Đối thủ rất mạnh nhưng mình đã chiến thắng 🎱',
        stats: {
          score: '8-6',
          opponent: 'Trần Văn B',
        },
        timestamp: '2 giờ trước',
        likes: 24,
        comments: 5,
        isLiked: false,
      },
      {
        id: '2',
        user: {
          id: '2',
          name: 'Lê Thị C',
          avatar: '/placeholder.svg',
          rank: 'B+',
        },
        type: 'achievement',
        content:
          'Cuối cùng cũng mở khóa được thành tích "Streak Master"! Cảm ơn mọi người đã ủng hộ 🔥',
        stats: {
          achievement: '10 trận thắng liên tiếp',
        },
        timestamp: '4 giờ trước',
        likes: 56,
        comments: 12,
        isLiked: true,
      },
      {
        id: '3',
        user: {
          id: '3',
          name: 'Phạm Đức D',
          avatar: '/placeholder.svg',
          rank: 'A',
        },
        type: 'tournament_win',
        content:
          'Vô địch giải đấu hàng tuần! Cám ơn tất cả mọi người đã cổ vũ 👑',
        timestamp: '6 giờ trước',
        likes: 89,
        comments: 23,
        isLiked: false,
      },
    ];
    setFeedPosts(mockPosts);
  }, []);

  // Real-time subscription setup
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time feed subscription...');

    const channel = supabase
      .channel('feed-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        payload => {
          console.log('Feed update received:', payload);
          handleFeedUpdate(payload);
        }
      )
      .on('system', {}, status => {
        console.log('Feed connection status:', status);
        setIsConnected(status.status === 'ok');
      })
      .subscribe();

    return () => {
      console.log('Cleaning up feed subscription...');
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleFeedUpdate = (payload: any) => {
    console.log('Processing feed update:', payload);

    // Handle different types of updates
    switch (payload.eventType) {
      case 'INSERT':
        // Add new post to feed
        break;
      case 'UPDATE':
        // Update existing post
        break;
      case 'DELETE':
        // Remove post from feed
        break;
    }
  };

  const handleLike = (postId: string) => {
    setFeedPosts(posts =>
      posts.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId);
    // Mở modal comment hoặc navigate đến trang comment
    window.location.href = `/feed/post/${postId}#comments`;
  };

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
    // Implement share functionality với Web Share API
    if (navigator.share) {
      navigator.share({
        title: 'Sabo Pool Arena - Bài viết thú vị',
        text: 'Xem bài viết này trên Sabo Pool Arena',
        url: `${window.location.origin}/feed/post/${postId}`,
      });
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(
        `${window.location.origin}/feed/post/${postId}`
      );
      alert('Đã sao chép link vào clipboard!');
    }
  };

  const handleChallenge = (postId: string) => {
    console.log('Challenge user from post:', postId);
    // Mở modal challenge hoặc navigate đến trang challenge
    window.location.href = `/challenges/create?fromPost=${postId}`;
  };

  const refreshFeed = async () => {
    console.log('Refreshing feed...');
    try {
      // Mock refresh since posts table doesn't exist
      console.log('Mock refreshing feed...');
      
      const mockNewPosts: FeedPost[] = [
        {
          id: Date.now().toString(),
          user: {
            id: 'new_user',
            name: 'Người chơi mới',
            avatar: '/placeholder.svg',
            rank: 'C',
          },
          type: 'match_result',
          content: 'Vừa hoàn thành trận đấu mới!',
          timestamp: 'Vừa xong',
          likes: 1,
          comments: 0,
          isLiked: false,
        },
      ];

      setFeedPosts(prevPosts => [
        ...mockNewPosts,
        ...prevPosts,
      ]);
    } catch (error) {
      console.error('Error refreshing feed:', error);
    }
  };

  return {
    feedPosts,
    isConnected,
    handleLike,
    handleComment,
    handleShare,
    handleChallenge,
    refreshFeed,
  };
};
