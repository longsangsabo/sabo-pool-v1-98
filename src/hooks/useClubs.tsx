
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Club as CommonClub } from '@/types/common';

export interface MembershipType {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in months
  benefits: string[];
  max_members: number;
  current_members: number;
}

export interface ClubMember {
  id: string;
  club_id: string;
  user_id: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
    rank: string;
  };
  membership_type_id: string;
  membership_type: MembershipType;
  role: 'owner' | 'admin' | 'member';
  joined_at: Date;
  expires_at: Date;
  status: 'active' | 'expired' | 'cancelled';
}

export interface CreateClubData {
  name: string;
  description: string;
  address: string;
  phone?: string;
  email?: string;
  available_tables?: number;
  hourly_rate?: number;
  membership_types: Omit<MembershipType, 'id' | 'current_members'>[];
}

export const useClubs = (userId?: string) => {
  const [clubs, setClubs] = useState<CommonClub[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch clubs
  const fetchClubs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch approved clubs from club_profiles
      const { data: clubProfiles, error } = await supabase
        .from('club_profiles')
        .select(`
          id,
          club_name,
          address,
          phone,
          number_of_tables,
          operating_hours,
          user_id,
          created_at,
          updated_at,
          verification_status
        `)
        .eq('verification_status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Also get corresponding club registration data for more details
      const clubIds = clubProfiles?.map(cp => cp.user_id) || [];
      const { data: registrations } = await supabase
        .from('club_registrations')
        .select('*')
        .in('user_id', clubIds)
        .eq('status', 'approved');

      const registrationMap = new Map(
        registrations?.map(reg => [reg.user_id, reg]) || []
      );

      // Transform to CommonClub format
      const transformedClubs: CommonClub[] = clubProfiles?.map(profile => {
        const registration = registrationMap.get(profile.user_id);
        const operatingHours = profile.operating_hours as any;
        
        return {
          id: profile.id,
          name: profile.club_name,
          address: profile.address,
          phone: profile.phone,
          description: registration?.amenities ? 
            `Câu lạc bộ bida chất lượng cao với ${profile.number_of_tables} bàn chơi. Tiện nghi: ${Object.values(registration.amenities || {}).join(', ')}.` : 
            `Câu lạc bộ bida chuyên nghiệp với ${profile.number_of_tables} bàn chơi.`,
          email: registration?.email,
          logo_url: undefined,
          table_count: profile.number_of_tables || 10,
          latitude: undefined,
          longitude: undefined,
          available_tables: profile.number_of_tables || 10,
          hourly_rate: registration?.basic_price || 50000,
          is_sabo_owned: false, // Set based on your business logic
          priority_score: 85, // Base score for approved clubs
          owner_id: profile.user_id,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };
      }) || [];

      setClubs(transformedClubs);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể tải danh sách club'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new club
  const createClub = useCallback(
    async (data: CreateClubData) => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        // Create club registration first
        const { data: registration, error: regError } = await supabase
          .from('club_registrations')
          .insert({
            user_id: userId,
            club_name: data.name,
            address: data.address,
            phone: data.phone || '',
            email: data.email,
            table_count: data.available_tables || 10,
            table_types: ['Standard', 'Pool'], // Default table types
            opening_time: '08:00',
            closing_time: '22:00',
            basic_price: data.hourly_rate || 50000,
            district: 'Unknown',
            city: 'Ho Chi Minh',
            status: 'pending'
          })
          .select()
          .single();

        if (regError) throw regError;

        // For demo purposes, also create a club profile directly (normally would be done by admin)
        const { data: clubProfile, error: profileError } = await supabase
          .from('club_profiles')
          .insert({
            user_id: userId,
            club_name: data.name,
            address: data.address,
            phone: data.phone || '',
            number_of_tables: data.available_tables || 10,
            verification_status: 'pending'
          })
          .select()
          .single();

        if (profileError) {
          console.warn('Could not create club profile:', profileError);
        }

        await fetchClubs(); // Refresh clubs list
        return registration;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tạo club');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, fetchClubs]
  );

  // Get club by ID
  const getClubById = useCallback(
    (clubId: string) => {
      return clubs.find(club => club.id === clubId);
    },
    [clubs]
  );

  // Get clubs by owner
  const getClubsByOwner = useCallback(
    (ownerId: string) => {
      return clubs.filter(club => club.owner_id === ownerId);
    },
    [clubs]
  );

  // Search clubs
  const searchClubs = useCallback(
    (query: string) => {
      const lowercaseQuery = query.toLowerCase();
      return clubs.filter(
        club =>
          club.name.toLowerCase().includes(lowercaseQuery) ||
          club.description?.toLowerCase().includes(lowercaseQuery) ||
          club.address.toLowerCase().includes(lowercaseQuery)
      );
    },
    [clubs]
  );

  // Get top rated clubs
  const getTopRatedClubs = useCallback(
    (limit: number = 10) => {
      return clubs
        .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
        .slice(0, limit);
    },
    [clubs]
  );

  // Get nearby clubs
  const getNearbyClubs = useCallback(
    (lat: number, lng: number, radius: number = 10) => {
      return clubs.filter(
        club => club.latitude && club.longitude
      );
    },
    [clubs]
  );

  // Update club
  const updateClub = useCallback(
    async (clubId: string, updateData: Partial<CommonClub>) => {
      try {
        const { error } = await supabase
          .from('club_profiles')
          .update({
            club_name: updateData.name,
            address: updateData.address,
            phone: updateData.phone,
            number_of_tables: updateData.table_count,
            updated_at: new Date().toISOString()
          })
          .eq('id', clubId);

        if (error) throw error;

        // Update local state
        setClubs(prev =>
          prev.map(club =>
            club.id === clubId
              ? { ...club, ...updateData, updated_at: new Date().toISOString() }
              : club
          )
        );
      } catch (err) {
        console.error('Failed to update club:', err);
        throw err;
      }
    },
    []
  );

  // Delete club
  const deleteClub = useCallback(async (clubId: string) => {
    try {
      const { error } = await supabase
        .from('club_profiles')
        .delete()
        .eq('id', clubId);

      if (error) throw error;

      setClubs(prev => prev.filter(club => club.id !== clubId));
    } catch (err) {
      console.error('Failed to delete club:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchClubs();

    // Set up real-time subscription for club_profiles
    console.log('Setting up clubs real-time subscription');
    const channel = supabase
      .channel('public-clubs')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'club_profiles',
        filter: 'verification_status=eq.approved'
      }, (payload) => {
        console.log('Real-time club update:', payload);
        
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          // Refresh the clubs list when a new club is approved
          fetchClubs();
        } else if (payload.eventType === 'DELETE') {
          // Remove club from list
          setClubs(prev => prev.filter(club => club.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      console.log('Cleaning up clubs subscription');
      supabase.removeChannel(channel);
    };
  }, [fetchClubs]);

  return {
    clubs,
    loading,
    error,
    fetchClubs,
    createClub,
    getClubById,
    getClubsByOwner,
    searchClubs,
    getTopRatedClubs,
    getNearbyClubs,
    updateClub,
    deleteClub,
  };
};

export const useClubById = (id: string) => {
  return useQuery({
    queryKey: ['club', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};
