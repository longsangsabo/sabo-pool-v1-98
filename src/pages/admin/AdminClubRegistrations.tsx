import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Building, 
  Eye, 
  Check, 
  X, 
  Clock, 
  MapPin, 
  Phone,
  Users,
  Calendar,
  ExternalLink
} from 'lucide-react';

interface ClubRegistration {
  id: string;
  user_id: string;
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
  amenities: Record<string, boolean>;
  photos: string[];
  facebook_url?: string;
  google_maps_url?: string;
  manager_name?: string;
  manager_phone?: string;
  email?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string;
    full_name: string;
    email: string;
  };
}

const AdminClubRegistrations = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<ClubRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<ClubRegistration | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, [statusFilter]);

  const fetchRegistrations = async () => {
    try {
      let query = supabase
        .from('club_registrations')
        .select(`
          *,
          profiles!inner(display_name, full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setRegistrations((data || []).map(item => ({
        ...item,
        amenities: (item.amenities as Record<string, boolean>) || {},
        profiles: item.profiles as any,
        status: item.status as 'draft' | 'pending' | 'approved' | 'rejected'
      })));
    } catch (error: any) {
      console.error('Error fetching registrations:', error);
      toast.error('Lỗi khi tải danh sách đăng ký: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const approveRegistration = async (registration: ClubRegistration) => {
    setProcessing(true);
    try {
      // Update registration status
      const { error: updateError } = await supabase
        .from('club_registrations')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', registration.id);

      if (updateError) throw updateError;

      // Create club profile
      const { error: clubError } = await supabase
        .from('club_profiles')
        .insert({
          user_id: registration.user_id,
          club_name: registration.club_name,
          address: registration.address,
          phone: registration.phone,
          operating_hours: {
            open: registration.opening_time,
            close: registration.closing_time,
            days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
          },
          number_of_tables: registration.table_count,
          verification_status: 'approved',
          verified_at: new Date().toISOString(),
          verified_by: user?.id
        });

      if (clubError) throw clubError;

      // Update user role
      const { error: roleError } = await supabase
        .from('profiles')
        .update({
          role: 'both',
          active_role: 'club_owner'
        })
        .eq('user_id', registration.user_id);

      if (roleError) throw roleError;

      toast.success('Đã duyệt đăng ký câu lạc bộ thành công!');
      fetchRegistrations();
      setSelectedRegistration(null);
    } catch (error: any) {
      console.error('Error approving registration:', error);
      toast.error('Lỗi khi duyệt đăng ký: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const rejectRegistration = async (registration: ClubRegistration) => {
    if (!rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('club_registrations')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason
        })
        .eq('id', registration.id);

      if (error) throw error;

      toast.success('Đã từ chối đăng ký câu lạc bộ');
      setRejectionReason('');
      fetchRegistrations();
      setSelectedRegistration(null);
    } catch (error: any) {
      console.error('Error rejecting registration:', error);
      toast.error('Lỗi khi từ chối đăng ký: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Đã duyệt</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Bị từ chối</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Bản nháp</Badge>;
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Chưa đặt';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getAmenityLabels = (amenities: Record<string, boolean>) => {
    const labels: Record<string, string> = {
      wifi: 'WiFi miễn phí',
      car_parking: 'Chỗ đậu xe ô tô',
      bike_parking: 'Chỗ đậu xe máy',
      canteen: 'Căn tin/Đồ ăn',
      air_conditioning: 'Máy lạnh',
      vip_room: 'Phòng VIP riêng',
      equipment_rental: 'Cho thuê dụng cụ',
      coach: 'Có HLV/Coach'
    };

    return Object.entries(amenities)
      .filter(([_, value]) => value)
      .map(([key, _]) => labels[key])
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý đăng ký câu lạc bộ</h1>
          <p className="text-gray-600">Xét duyệt các yêu cầu đăng ký câu lạc bộ</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="pending">Chờ duyệt</SelectItem>
            <SelectItem value="approved">Đã duyệt</SelectItem>
            <SelectItem value="rejected">Bị từ chối</SelectItem>
            <SelectItem value="draft">Bản nháp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Registration List */}
      <div className="grid gap-4">
        {registrations.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Building className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Không có đăng ký nào</p>
            </CardContent>
          </Card>
        ) : (
          registrations.map((registration) => (
            <Card key={registration.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">{registration.club_name}</h3>
                      {getStatusBadge(registration.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>{registration.address}, {registration.district}, {registration.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{registration.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>{registration.table_count} bàn - {registration.table_types.join(', ')}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{registration.opening_time} - {registration.closing_time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{new Date(registration.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Người đăng ký:</span> {registration.profiles?.display_name || registration.profiles?.full_name}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedRegistration(registration)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Building className="w-5 h-5" />
                              {registration.club_name}
                              {getStatusBadge(registration.status)}
                            </DialogTitle>
                          </DialogHeader>
                          
                          {selectedRegistration && (
                            <div className="space-y-6">
                              {/* Basic Info */}
                              <div>
                                <h4 className="font-semibold mb-3">Thông tin cơ bản</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Tên câu lạc bộ</label>
                                    <p className="text-sm">{selectedRegistration.club_name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                                    <p className="text-sm">{selectedRegistration.phone}</p>
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700">Địa chỉ</label>
                                    <p className="text-sm">{selectedRegistration.address}, {selectedRegistration.district}, {selectedRegistration.city}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Giờ hoạt động</label>
                                    <p className="text-sm">{selectedRegistration.opening_time} - {selectedRegistration.closing_time}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Số bàn & loại</label>
                                    <p className="text-sm">{selectedRegistration.table_count} bàn ({selectedRegistration.table_types.join(', ')})</p>
                                  </div>
                                </div>
                              </div>

                              {/* Pricing */}
                              <div>
                                <h4 className="font-semibold mb-3">Bảng giá</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Giá cơ bản</label>
                                    <p className="text-sm">{formatPrice(selectedRegistration.basic_price)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Giờ thường</label>
                                    <p className="text-sm">{formatPrice(selectedRegistration.normal_hour_price)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Giờ vàng</label>
                                    <p className="text-sm">{formatPrice(selectedRegistration.peak_hour_price)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Cuối tuần</label>
                                    <p className="text-sm">{formatPrice(selectedRegistration.weekend_price)}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Amenities */}
                              <div>
                                <h4 className="font-semibold mb-3">Tiện ích</h4>
                                <div className="flex flex-wrap gap-2">
                                  {getAmenityLabels(selectedRegistration.amenities).map((amenity) => (
                                    <Badge key={amenity} variant="outline">{amenity}</Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Photos */}
                              {selectedRegistration.photos.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-3">Hình ảnh câu lạc bộ</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {selectedRegistration.photos.map((photo, index) => (
                                      <img
                                        key={index}
                                        src={photo}
                                        alt={`Club photo ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border"
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Contact Info */}
                              <div>
                                <h4 className="font-semibold mb-3">Thông tin liên hệ</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Người quản lý</label>
                                    <p className="text-sm">{selectedRegistration.manager_name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Số điện thoại quản lý</label>
                                    <p className="text-sm">{selectedRegistration.manager_phone}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <p className="text-sm">{selectedRegistration.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Facebook</label>
                                    {selectedRegistration.facebook_url ? (
                                      <a 
                                        href={selectedRegistration.facebook_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                                      >
                                        Xem trang Facebook <ExternalLink className="w-3 h-3" />
                                      </a>
                                    ) : (
                                      <p className="text-sm text-gray-500">Chưa cung cấp</p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              {selectedRegistration.status === 'pending' && (
                                <div className="space-y-4 pt-4 border-t">
                                  <div className="flex gap-4">
                                    <Button
                                      onClick={() => approveRegistration(selectedRegistration)}
                                      disabled={processing}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="w-4 h-4 mr-2" />
                                      {processing ? 'Đang duyệt...' : 'Duyệt đăng ký'}
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => rejectRegistration(selectedRegistration)}
                                      disabled={processing || !rejectionReason.trim()}
                                    >
                                      <X className="w-4 h-4 mr-2" />
                                      {processing ? 'Đang từ chối...' : 'Từ chối'}
                                    </Button>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Lý do từ chối (bắt buộc nếu từ chối)
                                    </label>
                                    <Textarea
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      placeholder="Nhập lý do từ chối..."
                                      className="min-h-[80px]"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Rejection Reason */}
                              {selectedRegistration.status === 'rejected' && selectedRegistration.rejection_reason && (
                                <div className="p-4 bg-red-50 rounded-lg">
                                  <h4 className="font-semibold text-red-900 mb-2">Lý do từ chối:</h4>
                                  <p className="text-red-800 text-sm">{selectedRegistration.rejection_reason}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {registration.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => approveRegistration(registration)}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Duyệt
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <X className="w-4 h-4 mr-2" />
                                Từ chối
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Từ chối đăng ký</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p>Bạn có chắc chắn muốn từ chối đăng ký câu lạc bộ "{registration.club_name}"?</p>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lý do từ chối *
                                  </label>
                                  <Textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Nhập lý do từ chối..."
                                    className="min-h-[80px]"
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="destructive"
                                    onClick={() => rejectRegistration(registration)}
                                    disabled={processing || !rejectionReason.trim()}
                                  >
                                    {processing ? 'Đang từ chối...' : 'Từ chối'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminClubRegistrations;