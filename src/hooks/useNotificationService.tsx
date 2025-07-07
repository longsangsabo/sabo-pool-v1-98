import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface NotificationPreferences {
  id?: string;
  user_id: string;
  in_app: boolean;
  sms: boolean;
  email: boolean;
  zalo: boolean;
  push_notification: boolean;
  tournament_level: 'high' | 'medium' | 'low' | 'off';
  challenge_level: 'high' | 'medium' | 'low' | 'off';
  ranking_level: 'high' | 'medium' | 'low' | 'off';
  match_level: 'high' | 'medium' | 'low' | 'off';
  social_level: 'high' | 'medium' | 'low' | 'off';
  quiet_hours_enabled: boolean;
  quiet_start_time: string;
  quiet_end_time: string;
  timezone: string;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'tournament' | 'challenge' | 'ranking' | 'match' | 'social' | 'system';
  channels_sent: string[];
  channels_failed: string[];
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  metadata: any;
  action_url?: string;
  scheduled_at: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CommunicationChannel {
  id?: string;
  user_id: string;
  channel_type: 'sms' | 'email' | 'zalo' | 'push';
  channel_address: string;
  is_verified: boolean;
  is_active: boolean;
}

export const useNotificationService = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [communicationChannels, setCommunicationChannels] = useState<CommunicationChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Fetch notification preferences
  const fetchPreferences = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        return;
      }

      if (data) {
        setPreferences(data as NotificationPreferences);
      } else {
        // Create default preferences
        const defaultPrefs: Partial<NotificationPreferences> = {
          user_id: user.id,
          in_app: true,
          sms: false,
          email: true,
          zalo: false,
          push_notification: true,
          tournament_level: 'high',
          challenge_level: 'medium',
          ranking_level: 'medium',
          match_level: 'high',
          social_level: 'low',
          quiet_hours_enabled: false,
          quiet_start_time: '22:00:00',
          quiet_end_time: '07:00:00',
          timezone: 'Asia/Ho_Chi_Minh',
        };

        const { data: newPrefs, error: createError } = await supabase
          .from('notification_preferences')
          .insert([defaultPrefs as any])
          .select()
          .single();

        if (createError) {
          console.error('Error creating preferences:', createError);
        } else {
          setPreferences(newPrefs as NotificationPreferences);
        }
      }
    } catch (error) {
      console.error('Error in fetchPreferences:', error);
    }
  }, [user?.id]);

  // Update notification preferences
  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    if (!user?.id || !preferences) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating preferences:', error);
        toast.error('Không thể cập nhật cài đặt thông báo');
        return;
      }

      setPreferences(data as NotificationPreferences);
      toast.success('Cài đặt thông báo đã được cập nhật');
    } catch (error) {
      console.error('Error in updatePreferences:', error);
      toast.error('Có lỗi xảy ra khi cập nhật cài đặt');
    } finally {
      setLoading(false);
    }
  }, [user?.id, preferences]);

  // Fetch notification logs
  const fetchNotificationLogs = useCallback(async (limit = 50) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching notification logs:', error);
        return;
      }

      setNotificationLogs((data || []) as NotificationLog[]);
    } catch (error) {
      console.error('Error in fetchNotificationLogs:', error);
    }
  }, [user?.id]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notification_logs')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Update local state
      setNotificationLogs(logs => 
        logs.map(log => 
          log.id === notificationId 
            ? { ...log, read_at: new Date().toISOString() }
            : log
        )
      );
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  }, [user?.id]);

  // Send enhanced notification
  const sendNotification = useCallback(async (
    targetUserId: string,
    templateKey: string,
    variables: Record<string, any> = {},
    overridePriority?: string,
    scheduledAt?: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('send_enhanced_notification', {
        p_user_id: targetUserId,
        p_template_key: templateKey,
        p_variables: variables,
        p_override_priority: overridePriority,
        p_scheduled_at: scheduledAt,
      });

      if (error) {
        console.error('Error sending notification:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in sendNotification:', error);
      return null;
    }
  }, []);

  // Fetch communication channels
  const fetchCommunicationChannels = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_communication_channels')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching communication channels:', error);
        return;
      }

      setCommunicationChannels((data || []) as CommunicationChannel[]);
    } catch (error) {
      console.error('Error in fetchCommunicationChannels:', error);
    }
  }, [user?.id]);

  // Add communication channel
  const addCommunicationChannel = useCallback(async (
    channelType: 'sms' | 'email' | 'zalo' | 'push',
    channelAddress: string
  ) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_communication_channels')
        .insert([{
          user_id: user.id,
          channel_type: channelType,
          channel_address: channelAddress,
          is_verified: channelType === 'push', // Push tokens don't need verification
          is_active: true,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding communication channel:', error);
        toast.error('Không thể thêm kênh liên lạc');
        return;
      }

      setCommunicationChannels(prev => [...prev, data as CommunicationChannel]);
      toast.success('Đã thêm kênh liên lạc thành công');
    } catch (error) {
      console.error('Error in addCommunicationChannel:', error);
      toast.error('Có lỗi xảy ra khi thêm kênh liên lạc');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch notification statistics
  const fetchStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase.rpc('get_notification_stats', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Error fetching notification stats:', error);
        return;
      }

      setStats(data);
    } catch (error) {
      console.error('Error in fetchStats:', error);
    }
  }, [user?.id]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to new notifications
    const notificationChannel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notification_logs',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        console.log('New notification:', payload);
        setNotificationLogs(prev => [payload.new as NotificationLog, ...prev]);
        
        // Show toast for high priority notifications
        if (payload.new.priority === 'high' || payload.new.priority === 'urgent') {
          toast.info(payload.new.title, {
            description: payload.new.message,
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notification_logs',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotificationLogs(prev => 
          prev.map(log => 
            log.id === payload.new.id ? payload.new as NotificationLog : log
          )
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    if (user?.id) {
      fetchPreferences();
      fetchNotificationLogs();
      fetchCommunicationChannels();
      fetchStats();
    }
  }, [user?.id, fetchPreferences, fetchNotificationLogs, fetchCommunicationChannels, fetchStats]);

  return {
    preferences,
    notificationLogs,
    communicationChannels,
    stats,
    loading,
    updatePreferences,
    markAsRead,
    sendNotification,
    addCommunicationChannel,
    fetchNotificationLogs,
    fetchStats,
  };
};