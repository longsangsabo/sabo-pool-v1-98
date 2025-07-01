import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface EnhancedNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  data?: any;
  read_at?: string;
  action_url?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expires_at?: string;
  created_at: string;
  challenge?: {
    id: string;
    bet_points: number;
    message?: string;
    status: string;
    challenger: {
      user_id: string;
      full_name: string;
      avatar_url?: string;
      current_rank: string;
    };
    challenged: {
      user_id: string;
      full_name: string;
      avatar_url?: string;
      current_rank: string;
    };
  };
}

export const useEnhancedNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  // Use mock notifications since notifications table doesn't exist
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['enhanced-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Mock notifications data
      const mockNotifications = [
        {
          id: '1',
          user_id: user.id,
          title: 'Thách đấu mới',
          message: 'Bạn có một thách đấu mới từ Nguyễn Văn A',
          type: 'challenge',
          read_at: null,
          action_url: null,
          priority: 'high' as const,
          expires_at: null,
          created_at: new Date().toISOString(),
          challenge: {
            id: '1',
            bet_points: 300,
            message: 'Thách đấu race to 8',
            status: 'pending',
            challenger: {
              user_id: '1',
              full_name: 'Nguyễn Văn A',
              avatar_url: null,
              current_rank: 'A1',
            },
            challenged: {
              user_id: user.id,
              full_name: 'Bạn',
              avatar_url: null,
              current_rank: 'A2',
            },
          },
        },
        {
          id: '2',
          user_id: user.id,
          title: 'Giải đấu mới',
          message: 'Giải đấu tháng 7 đã mở đăng ký',
          type: 'tournament',
          read_at: null,
          action_url: null,
          priority: 'normal' as const,
          expires_at: null,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          challenge: null,
        },
      ];

      return mockNotifications;
    },
    enabled: !!user,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const unreadCount = notifications.filter(n => !n.read_at).length;

  // Simplified real-time subscription (the main one is in useRealtimeSubscriptions)
  useEffect(() => {
    if (!user?.id) return;

    // Simple connection status check
    const channel = supabase.channel('notification-status-check');

    channel.subscribe(status => {
      setIsConnected(status === 'SUBSCRIBED');
    });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [user]);

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      // Mock mark as read since notifications table doesn't exist
      console.log('Mock mark notification as read:', notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-notifications'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      // Mock mark all as read since notifications table doesn't exist
      console.log('Mock mark all notifications as read for user:', user?.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-notifications'] });
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
  };
};
