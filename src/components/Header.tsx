import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  User,
  Crown,
  Trophy,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import NotificationCenter from './NotificationCenter';
import { useCheckIn } from '@/hooks/useCheckIn';

const Header = () => {
  const { user, signOut } = useAuth();
  const { userStreak, hasCheckedInToday, performCheckIn, isCheckingIn } = useCheckIn();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(
          `
          *,
          clubs(name)
        `
        )
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      toast.success('Đăng xuất thành công!');
      navigate('/');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng xuất');
    } finally {
      setLoading(false);
      setShowUserMenu(false);
    }
  };

  const navItems = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Giải đấu', href: '/tournaments' },
    { name: 'Ranking', href: '/leaderboard' },
    { name: 'CLB', href: '/clubs' },
    { name: 'Thách đấu', href: '/challenges' },
    { name: 'Về chúng tôi', href: '/about' },
  ];

  return (
    <header className='bg-white shadow-sm border-b sticky top-0 z-40'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='flex items-center'>
            <Link to='/' className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>S</span>
              </div>
              <span className='text-xl font-bold text-gray-900 hidden sm:block'>
                SABO POOL ARENA
              </span>
              <span className='text-xl font-bold text-gray-900 sm:hidden'>
                SABO
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex space-x-8'>
            {navItems.map(item => (
              <Link
                key={item.name}
                to={item.href}
                className='text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors'
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Menu or Auth Buttons */}
          <div className='flex items-center space-x-4'>
            {user && (
              <Button
                onClick={performCheckIn}
                disabled={hasCheckedInToday || isCheckingIn}
                size="sm"
                className={`${
                  hasCheckedInToday 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-primary hover:bg-primary/90'
                } transition-all duration-200 ${isCheckingIn ? 'animate-pulse' : ''}`}
              >
                {hasCheckedInToday ? (
                  <>
                    ✓ Đã check-in
                    {userStreak && (
                      <span className="ml-2 text-xs">
                        🔥 {userStreak.current_streak} ngày
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {isCheckingIn ? 'Đang check-in...' : 'Check-in hôm nay'}
                    {userStreak && userStreak.current_streak > 0 && (
                      <span className="ml-2 text-xs">
                        🔥 {userStreak.current_streak} ngày
                      </span>
                    )}
                  </>
                )}
              </Button>
            )}
            {user && <NotificationCenter />}
            {user ? (
              <div className='relative' ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className='flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors'
                >
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src={userProfile?.avatar_url} />
                    <AvatarFallback>
                      {userProfile?.full_name?.charAt(0) ||
                        user.email?.charAt(0)?.toUpperCase() ||
                        'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='hidden md:block text-left'>
                    <p className='text-sm font-medium text-gray-900'>
                      {userProfile?.full_name || 'User'}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {userProfile?.current_rank || 'K1'} •{' '}
                      {userProfile?.role === 'premium' ? 'Premium' : 'Free'}
                    </p>
                  </div>
                  <ChevronDown className='w-4 h-4 text-gray-500 hidden md:block' />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className='absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50'>
                    <div className='py-1'>
                      {/* User Info */}
                      <div className='px-4 py-3 border-b'>
                        <p className='text-sm font-medium text-gray-900'>
                          {userProfile?.full_name || 'User'}
                        </p>
                        <p className='text-sm text-gray-500'>{user.email}</p>
                        <div className='flex items-center mt-1 space-x-2'>
                          <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                            {userProfile?.current_rank || 'K1'}
                          </span>
                          <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                            {userProfile?.role === 'premium'
                              ? 'Premium'
                              : 'Free'}
                          </span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <Link
                        to='/dashboard'
                        className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        onClick={() => setShowUserMenu(false)}
                      >
                        <LayoutDashboard className='w-4 h-4 mr-3' />
                        Dashboard
                      </Link>
                      <Link
                        to='/profile'
                        className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className='w-4 h-4 mr-3' />
                        Hồ sơ cá nhân
                      </Link>
                      <Link
                        to='/membership'
                        className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Crown className='w-4 h-4 mr-3' />
                        Gói hội viên
                      </Link>
                      <Link
                        to='/matches'
                        className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Trophy className='w-4 h-4 mr-3' />
                        Lịch sử trận đấu
                      </Link>
                      <Link
                        to='/settings'
                        className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className='w-4 h-4 mr-3' />
                        Cài đặt
                      </Link>

                      <div className='border-t'>
                        <button
                          onClick={handleLogout}
                          disabled={loading}
                          className='flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50'
                        >
                          <LogOut className='w-4 h-4 mr-3' />
                          {loading ? 'Đang đăng xuất...' : 'Đăng xuất'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex items-center space-x-3'>
                <Link to='/login'>
                  <Button variant='ghost' size='sm'>
                    Đăng nhập
                  </Button>
                </Link>
                <Link to='/register'>
                  <Button size='sm'>Đăng ký</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className='md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100'
            >
              {showMobileMenu ? (
                <X className='h-6 w-6' />
              ) : (
                <Menu className='h-6 w-6' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className='md:hidden border-t'>
            <div className='px-2 pt-2 pb-3 space-y-1'>
              {navItems.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className='block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md'
                  onClick={() => setShowMobileMenu(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
