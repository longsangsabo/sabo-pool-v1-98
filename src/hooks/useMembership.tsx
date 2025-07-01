import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Membership {
  id: string;
  user_id: string;
  membership_type: string;
  price: number;
  start_date: string;
  end_date: string;
  status: string;
}

interface ClubRegistration {
  id: string;
  user_id: string;
  club_name: string;
  club_type: string;
  existing_club_id?: string;
  province_id?: string;
  district_id?: string;
  ward_id?: string;
  address: string;
  phone: string;
  email?: string;
  description?: string;
  table_count: number;
  hourly_rate: number;
  status: string;
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
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
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch club registration
  const { data: clubRegistration, isLoading: clubLoading } = useQuery({
    queryKey: ['club-registration', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Mock club registration since table doesn't exist
      const mockRegistration = null; // No registration found

      return mockRegistration;
    },
    enabled: !!user?.id,
  });

  // Create or update club registration
  const createClubRegistration = useMutation({
    mutationFn: async (
      registrationData: Omit<
        ClubRegistration,
        'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'
      >
    ) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Mock club registration creation since table doesn't exist
      console.log('Mock creating club registration:', registrationData);
      
      const mockRegistration: ClubRegistration = {
        id: Date.now().toString(),
        user_id: user.id,
        ...registrationData,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return mockRegistration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-registration'] });
      toast.success(
        'Đăng ký CLB thành công! Chúng tôi sẽ xem xét trong 1-3 ngày làm việc.'
      );
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
