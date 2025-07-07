import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Banknote, Check, Clock } from 'lucide-react';
interface TournamentData {
  id: string;
  name: string;
  entry_fee: number;
  current_participants: number;
  max_participants: number;
}
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface TournamentRegistrationModalProps {
  tournament: TournamentData;
  isOpen: boolean;
  onClose: () => void;
  onRegistrationSuccess: () => void;
}

type PaymentMethod = 'cash' | 'vnpay' | null;

export const TournamentRegistrationModal: React.FC<TournamentRegistrationModalProps> = ({
  tournament,
  isOpen,
  onClose,
  onRegistrationSuccess
}) => {
  const { user } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleCashPayment = async () => {
    if (!user?.id) {
      toast.error('Vui lòng đăng nhập để tiếp tục');
      return;
    }

    setIsProcessing(true);
    try {
      // Register with cash payment method
      const { data, error } = await supabase
        .from('tournament_registrations')
        .insert({
          tournament_id: tournament.id,
          user_id: user.id,
          registration_status: 'pending',
          payment_status: 'cash_pending',
          payment_method: 'cash',
          notes: 'Thanh toán tiền mặt tại CLB'
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('Bạn đã đăng ký giải đấu này rồi');
          return;
        }
        throw error;
      }

      // Update tournament participant count
      await supabase
        .from('tournaments')
        .update({ 
          current_participants: tournament.current_participants + 1 
        })
        .eq('id', tournament.id);

      toast.success('Đăng ký thành công! Vui lòng thanh toán tại CLB.');
      onRegistrationSuccess();
      onClose();
    } catch (error) {
      console.error('Cash registration error:', error);
      toast.error('Có lỗi xảy ra khi đăng ký');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVNPayPayment = async () => {
    if (!user?.id) {
      toast.error('Vui lòng đăng nhập để tiếp tục');
      return;
    }

    setIsProcessing(true);
    try {
      // First register the user
      const { data: registrationData, error: regError } = await supabase
        .from('tournament_registrations')
        .insert({
          tournament_id: tournament.id,
          user_id: user.id,
          registration_status: 'pending',
          payment_status: 'processing',
          payment_method: 'vnpay'
        })
        .select()
        .single();

      if (regError) {
        if (regError.code === '23505') {
          toast.error('Bạn đã đăng ký giải đấu này rồi');
          return;
        }
        throw regError;
      }

      // Create VNPAY payment
      const response = await fetch('https://dd3f440a-0b12-42c4-8561-ca9f03abc65b.supabase.co/functions/v1/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtueGV2Ymtra2lhZGdwcHhicGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODQ1NzMsImV4cCI6MjA2Njk2MDU3M30.bVpo1y8fZuX5y6pePpQafvAQtihY-nJOmsKL9QzRkW4'}`
        },
        body: JSON.stringify({
          userId: user.id,
          membershipType: 'tournament',
          amount: tournament.entry_fee || 100000,
          tournamentId: tournament.id,
          registrationId: registrationData.id
        })
      });

      const paymentResult = await response.json();

      if (paymentResult.success && paymentResult.paymentUrl) {
        // Redirect to VNPAY
        window.location.href = paymentResult.paymentUrl;
      } else {
        throw new Error(paymentResult.error || 'Không thể tạo liên kết thanh toán');
      }
    } catch (error) {
      console.error('VNPay payment error:', error);
      toast.error('Có lỗi xảy ra khi tạo thanh toán');
      
      // Clean up failed registration
      if (user?.id) {
        await (supabase as any)
          .from('tournament_registrations')
          .delete()
          .eq('tournament_id', tournament.id)
          .eq('user_id', user.id);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPayment(method);
  };

  const handleConfirmPayment = () => {
    if (selectedPayment === 'cash') {
      handleCashPayment();
    } else if (selectedPayment === 'vnpay') {
      handleVNPayPayment();
    }
  };

  const resetSelection = () => {
    setSelectedPayment(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Đăng ký tham gia giải đấu</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tournament Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{tournament.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Lệ phí:</span>
                <span className="font-semibold">{formatCurrency(tournament.entry_fee || 100000)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Người tham gia:</span>
                <span className="text-sm">{tournament.current_participants}/{tournament.max_participants}</span>
              </div>
            </CardContent>
          </Card>

          {!selectedPayment ? (
            /* Payment Method Selection */
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Chọn phương thức thanh toán:</h3>
              
              <Card 
                className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                onClick={() => handlePaymentMethodSelect('cash')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Banknote className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Thanh toán tiền mặt tại CLB</h4>
                      <p className="text-xs text-muted-foreground">Đăng ký ngay, thanh toán khi đến CLB</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Tiện lợi
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                onClick={() => handlePaymentMethodSelect('vnpay')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Thanh toán online VNPAY</h4>
                      <p className="text-xs text-muted-foreground">Thanh toán ngay qua thẻ/QR/banking</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Nhanh chóng
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Confirmation */
            <div className="space-y-4">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      {selectedPayment === 'cash' ? (
                        <Banknote className="h-5 w-5 text-green-600" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-green-800">
                        {selectedPayment === 'cash' 
                          ? 'Thanh toán tiền mặt tại CLB'
                          : 'Thanh toán online VNPAY'
                        }
                      </h4>
                      <p className="text-sm text-green-700">
                        {selectedPayment === 'cash'
                          ? 'Bạn sẽ thanh toán khi đến CLB thi đấu'
                          : 'Chuyển hướng đến trang thanh toán VNPAY'
                        }
                      </p>
                    </div>
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" onClick={resetSelection} disabled={isProcessing}>
                  Chọn lại
                </Button>
                <Button 
                  onClick={handleConfirmPayment} 
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing && <Clock className="h-4 w-4 mr-2 animate-spin" />}
                  {isProcessing ? 'Đang xử lý...' : 'Xác nhận đăng ký'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};