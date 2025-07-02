import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Building, MapPin, Phone, Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ClubProfile {
  id: string;
  club_name: string;
  address: string;
  phone: string;
  operating_hours: any;
  number_of_tables: number;
  verification_status: string;
  verification_notes: string | null;
  created_at: string;
}

const ClubRegistrationForm = () => {
  const { user } = useAuth();
  const [clubProfile, setClubProfile] = useState<ClubProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    club_name: '',
    address: '',
    phone: '',
    operating_hours: {
      open: '08:00',
      close: '23:00',
      days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    },
    number_of_tables: 1
  });

  useEffect(() => {
    fetchClubProfile();
  }, [user]);

  const fetchClubProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('club_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching club profile:', error);
        return;
      }

      if (data) {
        setClubProfile(data);
        setFormData({
          club_name: data.club_name,
          address: data.address,
          phone: data.phone,
          operating_hours: (data.operating_hours as any) || {
            open: '08:00',
            close: '23:00',
            days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
          },
          number_of_tables: data.number_of_tables
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('club_profiles')
        .upsert({
          user_id: user.id,
          ...formData,
          verification_status: clubProfile ? clubProfile.verification_status : 'pending'
        });

      if (error) throw error;

      // Update user role to include club_owner
      const { error: roleError } = await supabase
        .from('profiles')
        .update({
          role: 'both',
          active_role: 'club_owner'
        })
        .eq('user_id', user.id);

      if (roleError) throw roleError;

      toast.success('Đã lưu thông tin câu lạc bộ!');
      fetchClubProfile();
    } catch (error: any) {
      console.error('Error saving club profile:', error);
      toast.error('Lỗi khi lưu: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã xác thực
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Bị từ chối
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Chờ xác thực
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Đang tải...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Đăng ký câu lạc bộ
          </div>
          {clubProfile && getStatusBadge(clubProfile.verification_status)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Club Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên câu lạc bộ *
            </label>
            <Input
              value={formData.club_name}
              onChange={(e) => setFormData(prev => ({ ...prev, club_name: e.target.value }))}
              placeholder="CLB Billiards ABC"
              required
              className="h-12"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Địa chỉ *
            </label>
            <Textarea
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="123 Đường ABC, Phường DEF, Quận GHI, TP.HCM"
              required
              className="min-h-[80px]"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Số điện thoại *
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="0901234567"
              type="tel"
              required
              className="h-12"
            />
          </div>

          {/* Operating Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Giờ mở cửa
              </label>
              <Input
                type="time"
                value={formData.operating_hours.open}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  operating_hours: { ...prev.operating_hours, open: e.target.value }
                }))}
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ đóng cửa
              </label>
              <Input
                type="time"
                value={formData.operating_hours.close}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  operating_hours: { ...prev.operating_hours, close: e.target.value }
                }))}
                className="h-12"
              />
            </div>
          </div>

          {/* Number of Tables */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Số bàn bida
            </label>
            <Input
              type="number"
              min="1"
              max="50"
              value={formData.number_of_tables}
              onChange={(e) => setFormData(prev => ({ ...prev, number_of_tables: parseInt(e.target.value) || 1 }))}
              className="h-12"
            />
          </div>

          {/* Verification Notes */}
          {clubProfile?.verification_notes && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Ghi chú từ admin:</h4>
              <p className="text-blue-800 text-sm">{clubProfile.verification_notes}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={saving}
            className="w-full h-12"
          >
            {saving ? 'Đang lưu...' : clubProfile ? 'Cập nhật thông tin' : 'Đăng ký câu lạc bộ'}
          </Button>

          {/* Info */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Sau khi đăng ký, admin sẽ xem xét và xác thực thông tin câu lạc bộ của bạn. 
              Quá trình này có thể mất 1-3 ngày làm việc.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClubRegistrationForm;