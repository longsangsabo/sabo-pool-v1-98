import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ClubDashboardData {
  clubInfo: any;
  pendingVerifications: any[];
  recentNotifications: any[];
  memberStats: {
    total: number;
    verified: number;
    thisMonth: number;
  };
  matchStats: {
    total: number;
    thisMonth: number;
    thisWeek: number;
  };
  tournamentStats: {
    hosted: number;
    upcoming: number;
  };
  trustScore: number;
  systemStatus: {
    database: 'connected' | 'disconnected' | 'error';
    realtime: 'active' | 'inactive';
    lastUpdate: Date;
  };
}

export const useClubDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ClubDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Realtime subscriptions
  useEffect(() => {
    if (!user) return;

    let clubId: string | null = null;
    
    const channels: any[] = [];

    const setupRealtimeSubscriptions = async () => {
      try {
        // Get club ID first
        const { data: clubData } = await supabase
          .from('club_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!clubData) return;
        clubId = clubData.id;

        // Subscribe to rank verifications
        const verificationChannel = supabase
          .channel('club-rank-verifications')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'rank_verifications',
              filter: `club_id=eq.${clubId}`
            },
            () => {
              fetchDashboardData();
            }
          )
          .subscribe();

        // Subscribe to notifications
        const notificationChannel = supabase
          .channel('club-notifications')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',  
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              fetchDashboardData();
            }
          )
          .subscribe();

        // Subscribe to club stats
        const statsChannel = supabase
          .channel('club-stats')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'club_stats',
              filter: `club_id=eq.${clubId}`
            },
            () => {
              fetchDashboardData();
            }
          )
          .subscribe();

        channels.push(verificationChannel, notificationChannel, statsChannel);

        setData(prev => prev ? {
          ...prev,
          systemStatus: {
            ...prev.systemStatus,
            realtime: 'active',
            lastUpdate: new Date()
          }
        } : null);

      } catch (error) {
        console.error('Error setting up realtime:', error);
        setData(prev => prev ? {
          ...prev,
          systemStatus: {
            ...prev.systemStatus,
            realtime: 'inactive'
          }
        } : null);
      }
    };

    setupRealtimeSubscriptions();

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setError(null);
      
      // Get club profile
      const { data: clubData, error: clubError } = await supabase
        .from('club_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (clubError) throw clubError;
      if (!clubData) throw new Error('Club not found');

      const clubId = clubData.id;

      // Parallel fetch all data
      const [
        verifications,
        notifications,
        memberships,
        matches,
        tournaments,
        trustScore
      ] = await Promise.all([
        // Pending rank verifications
        supabase
          .from('rank_verifications')
          .select(`
            *,
            profiles!rank_verifications_player_id_fkey(full_name, phone)
          `)
          .eq('club_id', clubId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(10),

        // Recent notifications
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),

        // Member stats
        supabase
          .from('rank_verifications')
          .select('id, created_at, status')
          .eq('club_id', clubId)
          .eq('status', 'approved'),

        // Match stats
        supabase
          .from('matches')
          .select('id, created_at')
          .eq('club_id', clubId),

        // Tournament stats
        supabase
          .from('tournaments')
          .select('id, status, start_date')
          .eq('club_id', clubId),

        // Trust score
        supabase
          .from('club_accountability')
          .select('accuracy_percentage')
          .eq('club_id', clubId)
          .single()
      ]);

      // Process member stats
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const memberStats = {
        total: memberships.data?.length || 0,
        verified: memberships.data?.filter(m => m.status === 'approved').length || 0,
        thisMonth: memberships.data?.filter(m => 
          new Date(m.created_at) >= thisMonth
        ).length || 0
      };

      // Process match stats
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const matchStats = {
        total: matches.data?.length || 0,
        thisMonth: matches.data?.filter(m => 
          new Date(m.created_at) >= thisMonth
        ).length || 0,
        thisWeek: matches.data?.filter(m => 
          new Date(m.created_at) >= thisWeek
        ).length || 0
      };

      // Process tournament stats
      const tournamentStats = {
        hosted: tournaments.data?.filter(t => t.status === 'completed').length || 0,
        upcoming: tournaments.data?.filter(t => 
          t.status === 'upcoming' || t.status === 'active'
        ).length || 0
      };

      const dashboardData: ClubDashboardData = {
        clubInfo: clubData,
        pendingVerifications: verifications.data || [],
        recentNotifications: notifications.data || [],
        memberStats,
        matchStats,
        tournamentStats,
        trustScore: trustScore.data?.accuracy_percentage || 100,
        systemStatus: {
          database: 'connected',
          realtime: 'active',
          lastUpdate: new Date()
        }
      };

      setData(dashboardData);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
      setData(prev => prev ? {
        ...prev,
        systemStatus: {
          ...prev.systemStatus,
          database: 'error',
          lastUpdate: new Date()
        }
      } : null);
      toast.error('Lỗi khi tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!user) return;

    fetchDashboardData();
    
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const refreshData = () => {
    setLoading(true);
    fetchDashboardData();
  };

  return {
    data,
    loading,
    error,
    refreshData
  };
};