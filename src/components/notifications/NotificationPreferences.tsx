import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Clock, 
  Shield, 
  Volume2,
  VolumeX,
  Settings,
  Plus,
  Check,
  X
} from 'lucide-react';
import { useNotificationService, type NotificationPreferences as PreferencesType } from '@/hooks/useNotificationService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

const LEVEL_OPTIONS = [
  { value: 'high', label: 'Cao', description: 'Nhận tất cả thông báo', icon: '🔴' },
  { value: 'medium', label: 'Trung bình', description: 'Chỉ thông báo quan trọng', icon: '🟡' },
  { value: 'low', label: 'Thấp', description: 'Rất ít thông báo', icon: '🟢' },
  { value: 'off', label: 'Tắt', description: 'Không nhận thông báo', icon: '⚫' },
];

const CATEGORIES = [
  { key: 'tournament', label: 'Giải đấu', icon: '🏆', description: 'Thông báo về giải đấu và đấu tuyển' },
  { key: 'challenge', label: 'Thách đấu', icon: '⚔️', description: 'Thách đấu từ người chơi khác' },
  { key: 'ranking', label: 'Xếp hạng', icon: '📊', description: 'Thay đổi hạng và điểm SPA' },
  { key: 'match', label: 'Trận đấu', icon: '🎱', description: 'Kết quả và lịch thi đấu' },
  { key: 'social', label: 'Xã hội', icon: '👥', description: 'Hoạt động xã hội và theo dõi' },
];

const CHANNELS = [
  { key: 'in_app', label: 'Trong ứng dụng', icon: Bell, description: 'Thông báo hiển thị trong app' },
  { key: 'email', label: 'Email', icon: Mail, description: 'Gửi qua email' },
  { key: 'sms', label: 'SMS', icon: Smartphone, description: 'Tin nhắn điện thoại' },
  { key: 'push_notification', label: 'Push Notification', icon: MessageSquare, description: 'Thông báo đẩy' },
];

interface AddChannelDialogProps {
  channelType: 'sms' | 'email' | 'zalo';
  isOpen: boolean;
  onClose: () => void;
  onAdd: (address: string) => void;
  loading: boolean;
}

const AddChannelDialog: React.FC<AddChannelDialogProps> = ({
  channelType,
  isOpen,
  onClose,
  onAdd,
  loading
}) => {
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onAdd(address.trim());
      setAddress('');
    }
  };

  const getPlaceholder = () => {
    switch (channelType) {
      case 'sms': return 'Nhập số điện thoại';
      case 'email': return 'Nhập địa chỉ email';
      case 'zalo': return 'Nhập Zalo ID';
      default: return '';
    }
  };

  const getTitle = () => {
    switch (channelType) {
      case 'sms': return 'Thêm số điện thoại';
      case 'email': return 'Thêm địa chỉ email';
      case 'zalo': return 'Thêm Zalo ID';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !loading && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="address">{getPlaceholder()}</Label>
            <Input
              id="address"
              type={channelType === 'email' ? 'email' : 'text'}
              placeholder={getPlaceholder()}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading || !address.trim()}>
              {loading ? <LoadingSpinner /> : 'Thêm'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const NotificationPreferences: React.FC = () => {
  const { 
    preferences, 
    loading, 
    updatePreferences, 
    communicationChannels,
    addCommunicationChannel,
    stats 
  } = useNotificationService();
  
  const [showAddChannel, setShowAddChannel] = useState<'sms' | 'email' | 'zalo' | null>(null);
  const [channelLoading, setChannelLoading] = useState(false);

  if (!preferences) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <span className="ml-2">Đang tải cài đặt...</span>
      </div>
    );
  }

  const handleChannelToggle = (channel: keyof PreferencesType, value: boolean) => {
    updatePreferences({ [channel]: value });
  };

  const handleLevelChange = (category: string, level: string) => {
    updatePreferences({ [`${category}_level`]: level } as any);
  };

  const handleQuietHoursToggle = (enabled: boolean) => {
    updatePreferences({ quiet_hours_enabled: enabled });
  };

  const handleTimeChange = (type: 'start' | 'end', time: string) => {
    const key = type === 'start' ? 'quiet_start_time' : 'quiet_end_time';
    updatePreferences({ [key]: time });
  };

  const handleAddChannel = async (address: string) => {
    if (!showAddChannel) return;
    
    setChannelLoading(true);
    try {
      await addCommunicationChannel(showAddChannel, address);
      setShowAddChannel(null);
    } catch (error) {
      console.error('Error adding channel:', error);
    } finally {
      setChannelLoading(false);
    }
  };

  const getChannelStatus = (channelType: string) => {
    const channel = communicationChannels.find(c => c.channel_type === channelType);
    if (!channel) return { exists: false, verified: false };
    return { exists: true, verified: channel.is_verified, address: channel.channel_address };
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cài đặt thông báo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.total_notifications || 0}</div>
                <div className="text-sm text-gray-600">Tổng thông báo</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.unread_count || 0}</div>
                <div className="text-sm text-gray-600">Chưa đọc</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Object.keys(stats.by_category || {}).length}
                </div>
                <div className="text-sm text-gray-600">Danh mục</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {communicationChannels.filter(c => c.is_verified).length}
                </div>
                <div className="text-sm text-gray-600">Kênh đã xác thực</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="channels" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="channels">Kênh thông báo</TabsTrigger>
          <TabsTrigger value="categories">Danh mục</TabsTrigger>
          <TabsTrigger value="schedule">Lịch trình</TabsTrigger>
          <TabsTrigger value="advanced">Nâng cao</TabsTrigger>
        </TabsList>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Kênh nhận thông báo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {CHANNELS.map(({ key, label, icon: Icon, description }) => {
                const isEnabled = preferences[key as keyof PreferencesType] as boolean;
                const channelStatus = key !== 'in_app' ? getChannelStatus(key === 'push_notification' ? 'push' : key) : null;
                
                return (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {label}
                          {channelStatus?.exists && channelStatus.verified && (
                            <Badge variant="secondary" className="text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Đã xác thực
                            </Badge>
                          )}
                          {channelStatus?.exists && !channelStatus.verified && (
                            <Badge variant="destructive" className="text-xs">
                              <X className="h-3 w-3 mr-1" />
                              Chưa xác thực
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{description}</div>
                        {channelStatus?.address && (
                          <div className="text-xs text-gray-500 mt-1">{channelStatus.address}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {key !== 'in_app' && !channelStatus?.exists && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAddChannel(key as 'sms' | 'email' | 'zalo')}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Thêm
                        </Button>
                      )}
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => handleChannelToggle(key as keyof PreferencesType, checked)}
                        disabled={loading || (key !== 'in_app' && !channelStatus?.exists)}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mức độ thông báo theo danh mục</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {CATEGORIES.map(({ key, label, icon, description }) => {
                const currentLevel = preferences[`${key}_level` as keyof PreferencesType] as string;
                
                return (
                  <div key={key} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{icon}</span>
                        <div>
                          <div className="font-medium">{label}</div>
                          <div className="text-sm text-gray-600">{description}</div>
                        </div>
                      </div>
                      <Badge variant={currentLevel === 'off' ? 'destructive' : 'secondary'}>
                        {LEVEL_OPTIONS.find(opt => opt.value === currentLevel)?.label || 'Không xác định'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {LEVEL_OPTIONS.map((option) => (
                        <Button
                          key={option.value}
                          variant={currentLevel === option.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleLevelChange(key, option.value)}
                          disabled={loading}
                          className="justify-start"
                        >
                          <span className="mr-2">{option.icon}</span>
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {LEVEL_OPTIONS.find(opt => opt.value === currentLevel)?.description}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Giờ yên lặng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Bật giờ yên lặng</div>
                  <div className="text-sm text-gray-600">
                    Tắt thông báo không quan trọng trong khoảng thời gian này
                  </div>
                </div>
                <Switch
                  checked={preferences.quiet_hours_enabled}
                  onCheckedChange={handleQuietHoursToggle}
                  disabled={loading}
                />
              </div>
              
              {preferences.quiet_hours_enabled && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="quiet-start">Thời gian bắt đầu</Label>
                    <Input
                      id="quiet-start"
                      type="time"
                      value={preferences.quiet_start_time}
                      onChange={(e) => handleTimeChange('start', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quiet-end">Thời gian kết thúc</Label>
                    <Input
                      id="quiet-end"
                      type="time"
                      value={preferences.quiet_end_time}
                      onChange={(e) => handleTimeChange('end', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Cài đặt nâng cao
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="timezone">múi giờ</Label>
                <Select
                  value={preferences.timezone}
                  onValueChange={(value) => updatePreferences({ timezone: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn múi giờ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</SelectItem>
                    <SelectItem value="Asia/Bangkok">Thái Lan (UTC+7)</SelectItem>
                    <SelectItem value="Asia/Singapore">Singapore (UTC+8)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Nhật Bản (UTC+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Lưu ý về quyền riêng tư:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Thông tin liên lạc được mã hóa và bảo vệ</li>
                  <li>Bạn có thể tắt bất kỳ loại thông báo nào bất cứ lúc nào</li>
                  <li>Dữ liệu không được chia sẻ với bên thứ ba</li>
                  <li>Bạn có thể xóa tài khoản và tất cả dữ liệu bất cứ lúc nào</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Channel Dialogs */}
      {(['sms', 'email', 'zalo'] as const).map((channelType) => (
        <AddChannelDialog
          key={channelType}
          channelType={channelType}
          isOpen={showAddChannel === channelType}
          onClose={() => setShowAddChannel(null)}
          onAdd={handleAddChannel}
          loading={channelLoading}
        />
      ))}
    </div>
  );
};