import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations = {
  vi: {
    // Admin Navigation
    'admin.dashboard': 'Bảng điều khiển',
    'admin.users': 'Quản lý Users',
    'admin.clubs': 'Câu lạc bộ',
    'admin.tournaments': 'Giải đấu',
    'admin.transactions': 'Giao dịch',
    'admin.analytics': 'Thống kê',
    'admin.automation': 'Automation',
    'admin.test_ranking': 'Test Ranking',
    'admin.development': 'Development Tools',
    'admin.settings': 'Cài đặt',
    'admin.home': 'Về trang chủ',
    'admin.logout': 'Đăng xuất',
    'admin.panel': 'Admin Panel',
    
    // User Management
    'admin.user_management': 'Quản Lý Người Dùng',
    'admin.user_management_desc': 'Quản lý thông tin và trạng thái người dùng',
    'admin.search_users': 'Tìm kiếm người dùng...',
    'admin.status': 'Trạng thái',
    'admin.all': 'Tất cả',
    'admin.active': 'Hoạt động',
    'admin.inactive': 'Không hoạt động',
    'admin.banned': 'Đã khóa',
    'admin.user_list': 'Danh sách người dùng',
    'admin.total_users': 'Tổng cộng {count} người dùng',
    'admin.not_updated': 'Chưa cập nhật',
    'admin.no_phone': 'Chưa có SĐT',
    'admin.not_verified': 'Chưa xác thực',
    'admin.joined': 'Tham gia',
    'admin.updated': 'Cập nhật',
    'admin.view_details': 'Xem chi tiết',
    'admin.unlock_account': 'Mở khóa tài khoản',
    'admin.ban_account': 'Khóa tài khoản',
    'admin.upgrade_premium': 'Nâng cấp Premium',
    'admin.cancel_premium': 'Hủy Premium',
    'admin.ban_user_title': 'Khóa tài khoản người dùng',
    'admin.ban_user_desc': 'Bạn có chắc chắn muốn khóa tài khoản của {name}? Vui lòng nhập lý do khóa tài khoản.',
    'admin.ban_reason_placeholder': 'Nhập lý do khóa tài khoản...',
    'admin.cancel': 'Hủy',
    'admin.processing': 'Đang xử lý...',
    'admin.no_users_found': 'Không tìm thấy người dùng nào',
    
    // Development Tools
    'admin.dev_tools': 'Development Tools',
    'admin.dev_warning': 'Những công cụ này dành cho phát triển và kiểm thử. Sử dụng cẩn thận trong môi trường production.',
    'admin.bulk_user_gen': 'Tạo Người Dùng Hàng Loạt',
    'admin.bulk_user_desc': 'Tạo nhiều người dùng test với tên và thông tin thực tế',
    'admin.quick_club': 'Tạo CLB Nhanh',
    'admin.quick_club_desc': 'Tạo câu lạc bộ test với thông tin kinh doanh thực tế và địa điểm',
    'admin.test_data': 'Dữ Liệu Test',
    'admin.test_data_desc': 'Tạo dữ liệu test toàn diện cho tất cả các tính năng',
    'admin.db_tools': 'Công Cụ Database',
    'admin.db_tools_desc': 'Xóa dữ liệu test, xuất/nhập tập dữ liệu, và quản lý trạng thái database',
    
    // Common
    'common.access_denied': 'Truy cập bị từ chối',
    'common.no_permission': 'Bạn không có quyền truy cập trang này.',
    'common.loading': 'Đang tải...'
  },
  en: {
    // Admin Navigation
    'admin.dashboard': 'Dashboard',
    'admin.users': 'User Management',
    'admin.clubs': 'Club Management',
    'admin.tournaments': 'Tournament Management',
    'admin.transactions': 'Transactions',
    'admin.analytics': 'Analytics',
    'admin.automation': 'Automation',
    'admin.test_ranking': 'Test Ranking',
    'admin.development': 'Development Tools',
    'admin.settings': 'Settings',
    'admin.home': 'Go to Home',
    'admin.logout': 'Logout',
    'admin.panel': 'Admin Panel',
    
    // User Management
    'admin.user_management': 'User Management',
    'admin.user_management_desc': 'Manage user information and status',
    'admin.search_users': 'Search users...',
    'admin.status': 'Status',
    'admin.all': 'All',
    'admin.active': 'Active',
    'admin.inactive': 'Inactive',
    'admin.banned': 'Banned',
    'admin.user_list': 'User List',
    'admin.total_users': 'Total {count} users',
    'admin.not_updated': 'Not updated',
    'admin.no_phone': 'No phone',
    'admin.not_verified': 'Not verified',
    'admin.joined': 'Joined',
    'admin.updated': 'Updated',
    'admin.view_details': 'View Details',
    'admin.unlock_account': 'Unlock Account',
    'admin.ban_account': 'Ban Account',
    'admin.upgrade_premium': 'Upgrade Premium',
    'admin.cancel_premium': 'Cancel Premium',
    'admin.ban_user_title': 'Ban User Account',
    'admin.ban_user_desc': 'Are you sure you want to ban {name}\'s account? Please enter the reason for banning.',
    'admin.ban_reason_placeholder': 'Enter reason for banning...',
    'admin.cancel': 'Cancel',
    'admin.processing': 'Processing...',
    'admin.no_users_found': 'No users found',
    
    // Development Tools
    'admin.dev_tools': 'Development Tools',
    'admin.dev_warning': 'These tools are for development and testing purposes only. Use with caution in production environments.',
    'admin.bulk_user_gen': 'Bulk User Generator',
    'admin.bulk_user_desc': 'Generate multiple test users with realistic Vietnamese names and profiles',
    'admin.quick_club': 'Quick Club Creator',
    'admin.quick_club_desc': 'Generate test clubs with realistic business information and locations',
    'admin.test_data': 'Test Data',
    'admin.test_data_desc': 'Generate comprehensive test data for all features',
    'admin.db_tools': 'Database Tools',
    'admin.db_tools_desc': 'Clear test data, export/import datasets, and manage database state',
    
    // Common
    'common.access_denied': 'Access Denied',
    'common.no_permission': 'You don\'t have permission to access this page.',
    'common.loading': 'Loading...'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get saved language from localStorage, default to Vietnamese
    const saved = localStorage.getItem('admin-language');
    return (saved as Language) || 'vi';
  });

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('admin-language', language);
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    const translation = translations[language][key as keyof typeof translations[typeof language]];
    
    if (translation) {
      return translation;
    }
    
    // If not found in current language, try fallback or return key
    return fallback || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Helper function for interpolation
export const interpolate = (template: string, variables: Record<string, string | number>): string => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
};