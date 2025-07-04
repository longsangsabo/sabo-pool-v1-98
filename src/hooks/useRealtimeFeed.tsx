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
  type: 'match_result' | 'achievement' | 'tournament_win' | 'streak' | 'text';
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

  // Fetch initial feed data
  useEffect(() => {
    const fetchFeedPosts = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id,
            content,
            post_type,
            metadata,
            image_url,
            likes_count,
            comments_count,
            created_at,
            user_id
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error fetching feed:', error);
          return;
        }

        // Get unique user IDs from posts
        const userIds = [...new Set(data?.map(post => post.user_id) || [])];
        
        // Fetch user profiles
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, verified_rank')
          .in('user_id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

        // Check which posts current user has liked
        const postIds = data?.map(post => post.id) || [];
        const { data: likedPosts } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        const likedPostIds = new Set(likedPosts?.map(like => like.post_id) || []);

        const formattedPosts: FeedPost[] = (data || []).map(post => {
          const profile = profilesMap.get(post.user_id);
          const metadata = post.metadata as any;
          
          return {
            id: post.id,
            user: {
              id: post.user_id,
              name: profile?.full_name || 'Người chơi',
              avatar: profile?.avatar_url || '/placeholder.svg',
              rank: profile?.verified_rank || 'K1',
            },
            type: post.post_type as any,
            content: post.content,
            stats: metadata || {},
            timestamp: new Date(post.created_at).toLocaleString('vi-VN'),
            likes: post.likes_count,
            comments: post.comments_count,
            isLiked: likedPostIds.has(post.id),
          };
        });

        setFeedPosts(formattedPosts);
      } catch (error) {
        console.error('Error loading feed:', error);
      }
    };

    fetchFeedPosts();
  }, [user?.id]);

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
          // Handle real-time feed updates
          if (payload.eventType === 'INSERT' && payload.new) {
            // Add new post to feed
            setTimeout(() => refreshFeed(), 1000);
          }
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

  const handleLike = async (postId: string) => {
    if (!user?.id) return;

    const post = feedPosts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.isLiked) {
        // Unlike post
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Like post
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      // Update local state immediately for better UX
      setFeedPosts(posts =>
        posts.map(p =>
          p.id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likes: p.isLiked ? p.likes - 1 : p.likes + 1,
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
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
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          post_type,
          metadata,
          image_url,
          likes_count,
          comments_count,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error refreshing feed:', error);
        return;
      }

      // Get unique user IDs from posts
      const userIds = [...new Set(data?.map(post => post.user_id) || [])];
      
      // Fetch user profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, verified_rank')
        .in('user_id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      // Check likes again
      const postIds = data?.map(post => post.id) || [];
      const { data: likedPosts } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      const likedPostIds = new Set(likedPosts?.map(like => like.post_id) || []);

      const formattedPosts: FeedPost[] = (data || []).map(post => {
        const profile = profilesMap.get(post.user_id);
        const metadata = post.metadata as any;
        
        return {
          id: post.id,
          user: {
            id: post.user_id,
            name: profile?.full_name || 'Người chơi',
            avatar: profile?.avatar_url || '/placeholder.svg',
            rank: profile?.verified_rank || 'K1',
          },
          type: post.post_type as any,
          content: post.content,
          stats: metadata || {},
          timestamp: new Date(post.created_at).toLocaleString('vi-VN'),
          likes: post.likes_count,
          comments: post.comments_count,
          isLiked: likedPostIds.has(post.id),
        };
      });

      setFeedPosts(formattedPosts);
    } catch (error) {
      console.error('Error refreshing feed:', error);
    }
  };

  // Create a new post
  const createPost = async (content: string, type: string = 'text', metadata: any = {}) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          post_type: type,
          metadata
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh feed to show new post
      setTimeout(() => refreshFeed(), 500);
      
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
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
    createPost,
  };
};