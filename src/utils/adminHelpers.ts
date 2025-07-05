import { supabase } from '@/integrations/supabase/client';

const ADMIN_IDENTIFIERS = {
  emails: [
    'longsangsabo@gmail.com',
    'longsang063@gmail.com'
  ],
  phones: [
    '0961167717',
    '0798893333'
  ]
};

export function isAdminUser(email?: string, phone?: string): boolean {
  if (email && ADMIN_IDENTIFIERS.emails.includes(email.toLowerCase().trim())) {
    return true;
  }
  if (phone && ADMIN_IDENTIFIERS.phones.includes(phone.trim())) {
    return true;
  }
  return false;
}

export async function checkUserAdminStatus(userId: string): Promise<boolean> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return profile?.is_admin || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function updateUserAdminStatus(userId: string, email?: string, phone?: string): Promise<void> {
  const isAdmin = isAdminUser(email, phone);
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: isAdmin })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating admin status:', error);
    }
  } catch (error) {
    console.error('Error updating admin status:', error);
  }
}