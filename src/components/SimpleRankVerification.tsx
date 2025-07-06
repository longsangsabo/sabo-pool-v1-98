import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';

interface RankRequest {
  id: string;
  player_id: string;
  requested_rank: string;
  status: string;
  created_at: string;
  player_name?: string;
  player_phone?: string;
}

const SimpleRankVerification = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RankRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [notes, setNotes] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get club ID first
      const { data: clubData } = await supabase
        .from('club_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!clubData) {
        console.log('No club found for user');
        setLoading(false);
        return;
      }

      // Get rank verification requests
      const { data: rankData, error } = await supabase
        .from('rank_verifications')
        .select('id, player_id, requested_rank, status, created_at')
        .eq('club_id', clubData.id)
        .in('status', ['pending', 'testing'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rank requests:', error);
        throw error;
      }

      // Get player info for each request
      const requestsWithPlayerInfo = await Promise.all(
        (rankData || []).map(async (request) => {
          const { data: playerData } = await supabase
            .from('profiles')
            .select('full_name, display_name, phone')
            .eq('user_id', request.player_id)
            .single();
          
          return {
            ...request,
            player_name: playerData?.display_name || playerData?.full_name || 'Người chơi',
            player_phone: playerData?.phone || ''
          };
        })
      );

      setRequests(requestsWithPlayerInfo);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Lỗi khi tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: 'testing' | 'approved' | 'rejected') => {
    if (processing === requestId) return;
    
    setProcessing(requestId);

    try {
      // Simple direct update
      const updateData: any = {
        status: newStatus,
        verified_by: user?.id,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'approved' || newStatus === 'rejected') {
        updateData.verified_at = new Date().toISOString();
        if (notes[requestId]) {
          updateData.club_notes = notes[requestId];
          if (newStatus === 'rejected') {
            updateData.rejection_reason = notes[requestId];
          }
        }
      }

      const { error } = await supabase
        .from('rank_verifications')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        console.error('Error updating:', error);
        throw error;
      }

      // Update player profile if approved
      if (newStatus === 'approved') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          await supabase
            .from('profiles')
            .update({
              verified_rank: request.requested_rank,
              rank_verified_at: new Date().toISOString(),
              rank_verified_by: user?.id
            })
            .eq('user_id', request.player_id);
        }
      }

      // Send notification
      const request = requests.find(r => r.id === requestId);
      if (request) {
        let message = '';
        let title = '';
        
        switch (newStatus) {
          case 'testing':
            title = 'Bắt đầu test hạng';
            message = `Bạn được yêu cầu đến CLB để test hạng ${request.requested_rank}`;
            break;
          case 'approved':
            title = 'Xác thực hạng thành công';
            message = `Chúc mừng! Hạng ${request.requested_rank} của bạn đã được xác thực`;
            break;
          case 'rejected':
            title = 'Xác thực hạng bị từ chối';
            message = `Yêu cầu xác thực hạng ${request.requested_rank} đã bị từ chối`;
            break;
        }

        await supabase.rpc('create_notification', {
          target_user_id: request.player_id,
          notification_type: `rank_${newStatus}`,
          notification_title: title,
          notification_message: message,
          notification_priority: newStatus === 'approved' ? 'high' : 'normal'
        });
      }

      toast.success(`Đã cập nhật trạng thái thành công`);
      await fetchRequests();
      
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(`Lỗi: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Đã duyệt</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Từ chối</Badge>;
      case 'testing':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Đang test</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Chờ xử lý</Badge>;
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
        <CardTitle className="flex items-center">
          <Trophy className="w-5 h-5 mr-2" />
          Yêu cầu xác thực hạng ({requests.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Chưa có yêu cầu xác thực nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(request => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{request.player_name}</h3>
                    <p className="text-sm text-gray-600">Muốn xác thực hạng {request.requested_rank}</p>
                    {request.player_phone && (
                      <p className="text-xs text-gray-500">SĐT: {request.player_phone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {getStatusBadge(request.status)}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(request.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleStatusUpdate(request.id, 'testing')}
                      disabled={processing === request.id}
                      className="mr-2"
                    >
                      Bắt đầu Test
                    </Button>
                  </div>
                )}

                {request.status === 'testing' && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Ghi chú về kết quả test..."
                      value={notes[request.id] || ''}
                      onChange={(e) => setNotes({...notes, [request.id]: e.target.value})}
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleStatusUpdate(request.id, 'approved')}
                        disabled={processing === request.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Duyệt hạng
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleStatusUpdate(request.id, 'rejected')}
                        disabled={processing === request.id}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Từ chối
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleRankVerification;