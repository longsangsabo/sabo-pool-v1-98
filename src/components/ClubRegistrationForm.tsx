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
    city: 'TP. Hồ Chí Minh',
    district: '',
    phone: '',
    opening_time: '08:00',
    closing_time: '23:00',
    table_count: 1,
    table_types: ['Pool'],
    basic_price: 0,
    email: '',
    manager_name: '',
    manager_phone: ''
  });

  useEffect(() => {
    fetchClubProfile();
  }, [user]);

  const fetchClubProfile = async () => {
    if (!user) return;

    try {
      // Check existing registration first
      const { data: regData, error: regError } = await supabase
        .from('club_registrations')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (regData) {
        setFormData({
          club_name: regData.club_name,
          address: regData.address,
          city: regData.city,
          district: regData.district,
          phone: regData.phone,
          opening_time: regData.opening_time,
          closing_time: regData.closing_time,
          table_count: regData.table_count,
          table_types: regData.table_types,
          basic_price: regData.basic_price,
          email: regData.email || '',
          manager_name: regData.manager_name || '',
          manager_phone: regData.manager_phone || ''
        });
        setClubProfile({
          id: regData.id,
          club_name: regData.club_name,
          address: regData.address,
          phone: regData.phone,
          operating_hours: null,
          number_of_tables: regData.table_count,
          verification_status: regData.status,
          verification_notes: regData.rejection_reason,
          created_at: regData.created_at
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

    // Validate required fields
    if (!formData.club_name.trim() || !formData.address.trim() || !formData.phone.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('club_registrations')
        .upsert({
          user_id: user.id,
          ...formData,
          status: 'pending',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Đã gửi đăng ký thành công! Admin sẽ xem xét trong 1-3 ngày làm việc.');
      fetchClubProfile();
    } catch (error: any) {
      console.error('Error saving club registration:', error);
      toast.error('Lỗi khi gửi đăng ký: ' + error.message);
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
              placeholder="123 Đường ABC, Phường DEF"
              required
              className="min-h-[80px]"
            />
          </div>

          {/* City and District */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thành phố *
              </label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="TP. Hồ Chí Minh"
                required
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quận/Huyện *
              </label>
              <Input
                value={formData.district}
                onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                placeholder="Quận 1"
                required
                className="h-12"
              />
            </div>
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
                value={formData.opening_time}
                onChange={(e) => setFormData(prev => ({ ...prev, opening_time: e.target.value }))}
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ đóng cửa
              </label>
              <Input
                type="time"
                value={formData.closing_time}
                onChange={(e) => setFormData(prev => ({ ...prev, closing_time: e.target.value }))}
                className="h-12"
              />
            </div>
          </div>

          {/* Number of Tables and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Số bàn bida *
              </label>
              <Input
                type="number"
                min="1"
                max="50"
                value={formData.table_count}
                onChange={(e) => setFormData(prev => ({ ...prev, table_count: parseInt(e.target.value) || 1 }))}
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá cơ bản (VNĐ/giờ) *
              </label>
              <Input
                type="number"
                min="0"
                value={formData.basic_price}
                onChange={(e) => setFormData(prev => ({ ...prev, basic_price: parseInt(e.target.value) || 0 }))}
                placeholder="50000"
                className="h-12"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email liên hệ
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@club.com"
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên người quản lý
              </label>
              <Input
                value={formData.manager_name}
                onChange={(e) => setFormData(prev => ({ ...prev, manager_name: e.target.value }))}
                placeholder="Nguyễn Văn A"
                className="h-12"
              />
            </div>
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
            disabled={saving || !formData.club_name.trim() || !formData.address.trim() || !formData.phone.trim() || !formData.district.trim()}
            className="w-full h-12"
          >
            {saving ? 'Đang gửi...' : clubProfile?.verification_status === 'pending' ? 'Đã gửi đăng ký' : clubProfile?.verification_status === 'approved' ? 'Đã được duyệt': clubProfile?.verification_status === 'rejected' ? 'Gửi lại đăng ký' : 'Gửi đăng ký'}
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