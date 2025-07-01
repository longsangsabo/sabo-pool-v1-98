import React, { ComponentType } from 'react';
import { Home, Compass, Zap, User, Trophy } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  current: boolean;
}

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Trang chủ',
      href: '/',
      icon: Home,
      current: location.pathname === '/' || location.pathname === '/feed',
    },
    {
      name: 'Khám phá',
      href: '/discovery',
      icon: Compass,
      current: location.pathname === '/discovery' || location.pathname === '/enhanced-discovery',
    },
    {
      name: 'Giải đấu',
      href: '/tournaments',
      icon: Trophy,
      current: location.pathname === '/tournaments' || location.pathname === '/tournament-discovery',
    },
    {
      name: 'Thách đấu',
      href: '/challenges',
      icon: Zap,
      current: location.pathname === '/challenges' || location.pathname === '/enhanced-challenges',
    },
    {
      name: 'Hồ sơ',
      href: '/profile',
      icon: User,
      current: location.pathname === '/profile',
    },
  ];

  return (
    <nav className='fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-white border-t border-gray-200 z-50 shadow-lg'>
      <div className='flex justify-around items-center h-16 px-2'>
        {navigationItems.map(item => (
          <button
            key={item.name}
            onClick={() => navigate(item.href)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
              item.current
                ? 'text-blue-600 bg-blue-50 rounded-lg mx-1'
                : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-lg mx-1'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
          >
            <item.icon
              className={`h-5 w-5 mb-1 transition-transform duration-200 ${
                item.current ? 'scale-110' : 'scale-100'
              }`}
            />
            <span
              className={`text-xs font-medium transition-colors duration-200 ${
                item.current ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;
