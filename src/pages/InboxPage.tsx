import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Inbox, Send, Archive, Trash2, Search, Filter, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications } from '@/hooks/useNotifications';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const InboxPage = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const { 
    notifications, 
    loading, 
    error, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    getUnreadCount 
  } = useNotifications();
  
  const { isConnected } = useRealtimeNotifications();

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'challenge_received':
      case 'challenge_accepted':
      case 'challenge_declined':
        return '🎯';
      case 'match_reminder':
      case 'match_completed':
        return '🎱';
      case 'tournament_registration':
      case 'tournament_started':
        return '🏆';
      case 'club_approved':
      case 'club_rejected':
        return '🏢';
      case 'rank_verification':
        return '⭐';
      case 'system':
        return '⚙️';
      default:
        return '📧';
    }
  };

  const getMessagePriority = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const filteredMessages = notifications?.filter(notification => {
    const matchesSearch = !searchQuery || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'unread' && !notification.read_at) ||
      (activeTab === 'important' && notification.priority === 'high');
    
    return matchesSearch && matchesTab;
  }) || [];

  const handleMessageClick = (notification: any) => {
    setSelectedMessage(notification);
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
  };

  return (
    <>
      <Helmet>
        <title>Hộp thư - SABO Billiards</title>
        <meta name="description" content="Quản lý tin nhắn và thông báo hệ thống" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Hộp thư</h1>
                  <p className="text-gray-600">Quản lý tin nhắn và thông báo</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  {isConnected ? 'Trực tuyến' : 'Ngoại tuyến'}
                </div>
                
                <Button variant="outline" onClick={markAllAsRead}>
                  Đánh dấu tất cả đã đọc
                </Button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm tin nhắn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Lọc
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">
                  Tất cả ({notifications?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Chưa đọc ({getUnreadCount()})
                </TabsTrigger>
                <TabsTrigger value="important">
                  Quan trọng
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Danh sách tin nhắn</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-500">
                      {error}
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Inbox className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Không có tin nhắn nào</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredMessages.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                            !notification.read_at ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          } ${selectedMessage?.id === notification.id ? 'bg-blue-100' : ''}`}
                          onClick={() => handleMessageClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">
                              {getMessageIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`font-medium text-sm truncate ${
                                  !notification.read_at ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </h4>
                                {notification.priority === 'high' && (
                                  <Badge variant="destructive" className="text-xs">
                                    Quan trọng
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 truncate mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(notification.created_at), {
                                    addSuffix: true,
                                    locale: vi,
                                  })}
                                </span>
                                {!notification.read_at && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                {selectedMessage ? (
                  <>
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">
                            {getMessageIcon(selectedMessage.type)}
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {selectedMessage.title}
                              {selectedMessage.priority === 'high' && (
                                <Badge variant="destructive">Quan trọng</Badge>
                              )}
                            </CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatDistanceToNow(new Date(selectedMessage.created_at), {
                                addSuffix: true,
                                locale: vi,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Archive className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteNotification(selectedMessage.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed">
                          {selectedMessage.message}
                        </p>
                        
                        {selectedMessage.metadata && (
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2">Chi tiết</h4>
                            <pre className="text-sm text-gray-600">
                              {JSON.stringify(selectedMessage.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {selectedMessage.action_url && (
                          <div className="mt-6">
                            <Button asChild>
                              <a href={selectedMessage.action_url}>
                                Xem chi tiết
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Chọn một tin nhắn</h3>
                      <p>Chọn một tin nhắn từ danh sách để xem chi tiết</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InboxPage;