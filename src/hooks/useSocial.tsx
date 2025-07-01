import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useSocial = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: following = [], isLoading: loadingFollowing } = useQuery({
    queryKey: ['following', user?.id],
    queryFn: async () => {
      // Mock following data since user_follows table doesn't exist
      return [];
    },
    enabled: !!user,
  });

  const { data: followers = [], isLoading: loadingFollowers } = useQuery({
    queryKey: ['followers', user?.id],
    queryFn: async () => {
      // Mock followers data since user_follows table doesn't exist
      return [];
    },
    enabled: !!user,
  });

  const followUser = useMutation({
    mutationFn: async (userId: string) => {
      // Mock follow user since user_follows table doesn't exist
      console.log('Mock follow user:', userId);
      return { id: 'mock', follower_id: user?.id, following_id: userId };
    },
    onSuccess: () => {
      toast.success('Đã theo dõi người chơi!');
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
    onError: error => {
      console.error('Error following user:', error);
      toast.error('Có lỗi xảy ra');
    },
  });

  const unfollowUser = useMutation({
    mutationFn: async (userId: string) => {
      // Mock unfollow user since user_follows table doesn't exist
      console.log('Mock unfollow user:', userId);
    },
    onSuccess: () => {
      toast.success('Đã bỏ theo dõi!');
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
    onError: error => {
      console.error('Error unfollowing user:', error);
      toast.error('Có lỗi xảy ra');
    },
  });

  const isFollowing = (userId: string) => {
    return following.some(f => f.following_id === userId);
  };

  return {
    following,
    followers,
    loadingFollowing,
    loadingFollowers,
    followUser,
    unfollowUser,
    isFollowing,
  };
};
