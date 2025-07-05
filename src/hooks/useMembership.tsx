import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Membership {
  id: string;
  club_id: string;
  user_id: string;
  joined_at: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ClubRegistration {
  id: string;
  user_id?: string;
  club_name: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  opening_time: string;
  closing_time: string;
  table_count: number;
  table_types: string[];
  basic_price: number;
  normal_hour_price?: number;
  peak_hour_price?: number;
  weekend_price?: number;
  vip_table_price?: number;
  amenities?: any;
  photos?: string[];
  facebook_url?: string;
  google_maps_url?: string;
  business_license_url?: string;
  manager_name?: string;
  manager_phone?: string;
  email?: string;
  status: string;
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
  approved_at?: string;
  approved_by?: string;
}

export const useMembership = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch current membership
  const { data: currentMembership, isLoading: membershipLoading } = useQuery({
    queryKey: ['membership', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Error fetching membership:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch club registration
  const { data: clubRegistration, isLoading: clubLoading } = useQuery({
    queryKey: ['club-registration', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('club_registrations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) {
        console.error('Error fetching club registration:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  // Create or update club registration
  const createClubRegistration = useMutation({
    mutationFn: async (
      registrationData: {
        club_name: string;
        address: string;
        phone: string;
        email?: string;
        table_count: number;
        hourly_rate: number;
      }
    ) => {
      if (!user?.id) throw new Error('User not authenticated');

          const { data, error } = await supabase
            .from('club_registrations')
            .insert({
              user_id: user.id,
              club_name: registrationData.club_name,
              address: registrationData.address,
              phone: registrationData.phone,
              email: registrationData.email,
              table_count: registrationData.table_count,
              table_types: ['Standard', 'Pool'], // Default table types
              opening_time: '08:00',
              closing_time: '22:00',
              basic_price: registrationData.hourly_rate,
              district: 'Unknown',
              city: 'Ho Chi Minh',
              status: 'pending'
            })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['club-registration'] });
      toast.success(
        'Đăng ký CLB thành công! Chúng tôi sẽ xem xét trong 1-3 ngày làm việc.'
      );
      
      // Send notification to user
      if (user?.id) {
        // The database trigger will handle sending notification to admins
        // But we should also confirm to user that their registration was received
        console.log('Club registration created successfully:', data);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi đăng ký CLB');
    },
  });

  return {
    currentMembership,
    clubRegistration,
    membershipLoading,
    clubLoading,
    createClubRegistration,
  };
};
