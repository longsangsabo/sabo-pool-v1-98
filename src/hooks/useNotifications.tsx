
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Notification } from '@/types/common';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      // Transform database notifications to match our interface
      const transformedNotifications: Notification[] = (data || []).map(notification => ({
        id: notification.id,
        user_id: notification.user_id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        created_at: notification.created_at,
        read_at: notification.is_read ? notification.updated_at : undefined,
        priority: (notification.priority as 'low' | 'medium' | 'high') || 'medium',
        action_url: notification.action_url,
        metadata: notification.metadata,
      }));

      setNotifications(transformedNotifications);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const unreadIds = notifications
        .filter(n => !n.read_at)
        .map(n => n.id);

      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .in('id', unreadIds)
        .eq('user_id', user.id);

      if (error) throw error;

      const now = new Date().toISOString();
      setNotifications(prev =>
        prev.map(notification =>
          notification.read_at ? notification : { ...notification, read_at: now }
        )
      );
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (err: any) {
      console.error('Error deleting notification:', err);
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read_at).length;
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
  };
};
