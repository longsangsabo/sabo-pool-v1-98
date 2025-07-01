
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdminCheck = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      // Mock admin check since is_user_admin RPC doesn't exist
      // For demo purposes, make first user an admin
      return user?.email === 'admin@example.com';
    },
    enabled: !!user?.id,
  });
};
