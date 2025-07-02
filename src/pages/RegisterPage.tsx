
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const RegisterPage = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register attempt:', { phone, fullName });
    
    if (!phone || !password || !confirmPassword || !fullName) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    // Validate phone format
    if (!/^0\d{9}$/.test(phone)) {
      toast.error('Số điện thoại phải có định dạng 0xxxxxxxxx');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signUp(phone, password, fullName);
      
      if (error) {
        console.error('Registration error:', error);
        if (error.message.includes('User already registered')) {
          toast.error('Số điện thoại này đã được đăng ký');
        } else if (error.message.includes('Password')) {
          toast.error('Mật khẩu phải có ít nhất 6 ký tự');
        } else {
          toast.error(error.message || 'Đăng ký thất bại');
        }
      } else {
        toast.success('Đăng ký thành công! Chào mừng bạn đến với SABO Pool Arena!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Có lỗi xảy ra khi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Đăng ký - CLB Bi-a Sài Gòn</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🎱 Đăng ký</h1>
            <p className="text-gray-600">SABO Pool Arena</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Họ và tên
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full h-12 text-lg border-2 border-gray-300 focus:border-blue-500 rounded-xl"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Số điện thoại
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0987654321"
                className="w-full h-12 text-lg border-2 border-gray-300 focus:border-blue-500 rounded-xl"
                required
                disabled={loading}
                maxLength={10}
                inputMode="numeric"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Mật khẩu
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                className="w-full h-12 text-lg border-2 border-gray-300 focus:border-blue-500 rounded-xl"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Xác nhận mật khẩu
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="w-full h-12 text-lg border-2 border-gray-300 focus:border-blue-500 rounded-xl"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl font-semibold mt-6"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          </form>

          <div className="text-center mt-6 space-y-4">
            <div className="text-gray-600 text-sm">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Đăng nhập ngay
              </Link>
            </div>

            <Link 
              to="/" 
              className="inline-block text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
