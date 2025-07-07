import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellOff,
  Search,
  Filter,
  Archive,
  Trash2,
  Check,
  Check,
  Star,
  Clock,
  Trophy,
  Gamepad2,
  TrendingUp,
  Users,
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import { useNotificationService, type NotificationLog } from '@/hooks/useNotificationService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const PRIORITY_COLORS = {
  low: 'text-gray-500 bg-gray-100',
  normal: 'text-blue-500 bg-blue-100',  
  high: 'text-orange-500 bg-orange-100',
  urgent: 'text-red-500 bg-red-100',
};

const CATEGORY_ICONS = {
  tournament: Trophy,
  challenge: Gamepad2,
  ranking: TrendingUp,
  match: Users,
  social: Users,
  system: Settings,
};

const CHANNEL_ICONS = {
  in_app: Bell,
  email: Mail,
  sms: Smartphone,
  push: MessageSquare,
  zalo: MessageSquare,
};

interface NotificationItemProps {
  notification: NotificationLog;
  onMarkAsRead: (id: string) => void;
  onAction?: (notification: NotificationLog) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onAction
}) => {
  const CategoryIcon = CATEGORY_ICONS[notification.category] || Bell;
  const isUnread = !notification.read_at;

  const handleClick = () => {
    if (isUnread) {
      onMarkAsRead(notification.id);
    }
    if (notification.action_url && onAction) {
      onAction(notification);
    }
  };

  const getChannelIcons = () => {
    return notification.channels_sent.map(channel => {
      const Icon = CHANNEL_ICONS[channel as keyof typeof CHANNEL_ICONS] || Bell;
      return (
        <Icon key={channel} className="h-3 w-3 text-gray-400" />
      );
    });
  };

  return (
    <div
      className={`p-4 border-l-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
        isUnread ? 'border-l-blue-500 bg-blue-50/50' : 'border-l-transparent'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${PRIORITY_COLORS[notification.priority]}`}>
          <CategoryIcon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`font-medium truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
              {notification.title}
            </h4>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">{getChannelIcons()}</div>
              <Badge variant="outline" className="text-xs">
                {notification.priority}
              </Badge>
            </div>
          </div>
          
          <p className={`text-sm mb-2 ${isUnread ? 'text-gray-800' : 'text-gray-600'}`}>
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(notification.created_at), { 
                  addSuffix: true, 
                  locale: vi 
                })}
              </span>
            </div>
            
            {notification.action_url && (
              <div className="flex items-center gap-1 text-blue-500">
                <ExternalLink className="h-3 w-3" />
                <span>Xem chi tiết</span>
              </div>
            )}
          </div>
        </div>
        
        {isUnread && (
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
        )}
      </div>
    </div>
  );
};

interface NotificationFiltersProps {
  selectedCategory: string;
  selectedPriority: string;
  selectedStatus: string;
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onPriorityChange: (priority: string) => void;
  onStatusChange: (status: string) => void;
  onSearchChange: (query: string) => void;
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  selectedCategory,
  selectedPriority,
  selectedStatus,
  searchQuery,
  onCategoryChange,
  onPriorityChange,
  onStatusChange,
  onSearchChange
}) => {
  return (
    <div className="space-y-4 p-4 border-b">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm thông báo..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            <SelectItem value="tournament">🏆 Giải đấu</SelectItem>
            <SelectItem value="challenge">⚔️ Thách đấu</SelectItem>
            <SelectItem value="ranking">📊 Xếp hạng</SelectItem>
            <SelectItem value="match">🎱 Trận đấu</SelectItem>
            <SelectItem value="social">👥 Xã hội</SelectItem>
            <SelectItem value="system">⚙️ Hệ thống</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedPriority} onValueChange={onPriorityChange}>
          <SelectTrigger>
            <SelectValue placeholder="Mức độ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả mức độ</SelectItem>
            <SelectItem value="urgent">🔴 Khẩn cấp</SelectItem>
            <SelectItem value="high">🟠 Cao</SelectItem>
            <SelectItem value="normal">🔵 Bình thường</SelectItem>
            <SelectItem value="low">🟢 Thấp</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="unread">Chưa đọc</SelectItem>
            <SelectItem value="read">Đã đọc</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export const EnhancedNotificationCenter: React.FC = () => {
  const { 
    notificationLogs, 
    loading, 
    markAsRead, 
    stats,
    fetchNotificationLogs 
  } = useNotificationService();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notificationLogs.filter(notification => {
      // Category filter
      if (selectedCategory !== 'all' && notification.category !== selectedCategory) {
        return false;
      }
      
      // Priority filter
      if (selectedPriority !== 'all' && notification.priority !== selectedPriority) {
        return false;
      }
      
      // Status filter
      if (selectedStatus === 'unread' && notification.read_at) {
        return false;
      }
      if (selectedStatus === 'read' && !notification.read_at) {
        return false;
      }
      
      // Search filter
      if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [notificationLogs, selectedCategory, selectedPriority, selectedStatus, searchQuery]);

  // Group notifications by tab
  const groupedNotifications = useMemo(() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return {
      all: filteredNotifications,
      today: filteredNotifications.filter(n => 
        new Date(n.created_at).toDateString() === today.toDateString()
      ),
      yesterday: filteredNotifications.filter(n => 
        new Date(n.created_at).toDateString() === yesterday.toDateString()
      ),
      week: filteredNotifications.filter(n => 
        new Date(n.created_at) >= weekAgo && 
        new Date(n.created_at) < yesterday
      ),
      older: filteredNotifications.filter(n => 
        new Date(n.created_at) < weekAgo
      ),
    };
  }, [filteredNotifications]);

  const handleNotificationAction = (notification: NotificationLog) => {
    if (notification.action_url) {
      // Navigate to the action URL
      window.location.href = notification.action_url;
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = filteredNotifications.filter(n => !n.read_at);
    for (const notification of unreadNotifications) {
      await markAsRead(notification.id);
    }
  };

  const unreadCount = filteredNotifications.filter(n => !n.read_at).length;

  if (loading && notificationLogs.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <span className="ml-2">Đang tải thông báo...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Trung tâm thông báo</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNotificationLogs()}
              disabled={loading}
            >
              {loading ? <LoadingSpinner /> : 'Làm mới'}
            </Button>
            
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                <Check className="h-4 w-4 mr-1" />
                Đánh dấu tất cả
              </Button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{stats.total_notifications || 0}</div>
              <div className="text-xs text-gray-600">Tổng số</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xl font-bold text-red-600">{unreadCount}</div>
              <div className="text-xs text-gray-600">Chưa đọc</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {filteredNotifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length}
              </div>
              <div className="text-xs text-gray-600">Quan trọng</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">
                {Object.keys(stats.by_category || {}).length}
              </div>
              <div className="text-xs text-gray-600">Danh mục</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <NotificationFilters
        selectedCategory={selectedCategory}
        selectedPriority={selectedPriority}
        selectedStatus={selectedStatus}
        searchQuery={searchQuery}
        onCategoryChange={setSelectedCategory}
        onPriorityChange={setSelectedPriority}
        onStatusChange={setSelectedStatus}
        onSearchChange={setSearchQuery}
      />

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="all">
            Tất cả ({groupedNotifications.all.length})
          </TabsTrigger>
          <TabsTrigger value="today">
            Hôm nay ({groupedNotifications.today.length})
          </TabsTrigger>
          <TabsTrigger value="yesterday">
            Hôm qua ({groupedNotifications.yesterday.length})
          </TabsTrigger>
          <TabsTrigger value="week">
            Tuần này ({groupedNotifications.week.length})
          </TabsTrigger>
          <TabsTrigger value="older">
            Cũ hơn ({groupedNotifications.older.length})
          </TabsTrigger>
        </TabsList>

        {/* Notification Lists */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {(['all', 'today', 'yesterday', 'week', 'older'] as const).map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-0">
                {groupedNotifications[tab].length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                    <BellOff className="h-12 w-12 mb-4" />
                    <h3 className="text-lg font-medium">Không có thông báo</h3>
                    <p className="text-sm">
                      {tab === 'all' ? 'Bạn chưa có thông báo nào' : `Không có thông báo nào ${
                        tab === 'today' ? 'hôm nay' :
                        tab === 'yesterday' ? 'hôm qua' :
                        tab === 'week' ? 'tuần này' : 'cũ hơn'
                      }`}
                    </p>
                  </div>
                ) : (
                  <div>
                    {groupedNotifications[tab].map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onAction={handleNotificationAction}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
};