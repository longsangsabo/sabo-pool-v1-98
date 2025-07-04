import { Button } from '@/components/ui/button';
import { Facebook, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const FacebookLoginButton = () => {
  const [loading, setLoading] = useState(false);
  const { signInWithFacebook } = useAuth();

  const handleFacebookLogin = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithFacebook();
      
      if (error) {
        console.error('Facebook login error:', error);
        
        if (error.message.includes('provider is not enabled')) {
          toast.error('Tính năng đăng nhập Facebook đang được cấu hình. Vui lòng sử dụng email hoặc số điện thoại.');
        } else {
          toast.error(error.message || 'Không thể đăng nhập với Facebook. Vui lòng thử lại.');
        }
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
      toast.error(`Không thể đăng nhập với Facebook: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full hover:bg-blue-50 border-gray-300 transition-all duration-200 group"
      onClick={handleFacebookLogin}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : (
        <Facebook className="w-5 h-5 mr-2 text-[#1877F2] group-hover:scale-110 transition-transform" />
      )}
      {loading ? 'Đang xử lý...' : 'Tiếp tục với Facebook'}
    </Button>
  );
};