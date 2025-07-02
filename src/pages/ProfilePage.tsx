import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, MapPin, User, Phone, Calendar, Trophy } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClubRegistrationForm from '@/components/ClubRegistrationForm';
import RankVerificationForm from '@/components/RankVerificationForm';
import RankVerificationRequests from '@/components/RankVerificationRequests';
import PenaltyManagement from '@/components/PenaltyManagement';
import TrustScoreBadge from '@/components/TrustScoreBadge';

// Export types for other components
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  cover_image_url?: string;
  bio?: string;
  location?: string;
  rank: string;
  rating: number;
  join_date: Date;
  is_verified: boolean;
  is_online: boolean;
  last_seen: Date;
  total_matches: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_earnings: number;
  achievements_count: number;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  is_friend: boolean;
  privacy_level: 'public' | 'friends' | 'private';
  notifications_enabled: boolean;
}

export interface ProfilePost {
  id: string;
  type: 'post' | 'achievement' | 'match_result' | 'event';
  content: string;
  created_at: Date;
  likes_count: number;
  comments_count: number;
  images?: string[];
  achievement?: {
    title: string;
    description: string;
    icon: string;
    points: number;
  };
  match_result?: {
    opponent: string;
    result: 'win' | 'loss' | 'draw';
    score: string;
    rating_change: number;
  };
  event?: {
    title: string;
    date: Date;
    location: string;
  };
}

interface ProfileData {
  user_id: string;
  display_name: string;
  phone: string;
  bio: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  city: string;
  district: string;
  avatar_url: string;
  member_since: string;
  role: 'player' | 'club_owner' | 'both';
  active_role: 'player' | 'club_owner';
  verified_rank: string | null;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    user_id: '',
    display_name: '',
    phone: '',
    bio: '',
    skill_level: 'beginner',
    city: '',
    district: '',
    avatar_url: '',
    member_since: '',
    role: 'player',
    active_role: 'player',
    verified_rank: null,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const skillLevels = {
    beginner: { label: 'Người mới', color: 'bg-green-100 text-green-800' },
    intermediate: { label: 'Trung bình', color: 'bg-blue-100 text-blue-800' },
    advanced: { label: 'Khá', color: 'bg-purple-100 text-purple-800' },
    pro: { label: 'Chuyên nghiệp', color: 'bg-gold-100 text-gold-800' },
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile({
          user_id: data.user_id || user.id,
          display_name: data.display_name || data.full_name || '',
          phone: data.phone || user.phone || '',
          bio: data.bio || '',
          skill_level: (data.skill_level || 'beginner') as 'beginner' | 'intermediate' | 'advanced' | 'pro',
          city: data.city || '',
          district: data.district || '',
          avatar_url: data.avatar_url || '',
          member_since: data.member_since || data.created_at || '',
          role: (data.role || 'player') as 'player' | 'club_owner' | 'both',
          active_role: (data.active_role || 'player') as 'player' | 'club_owner',
          verified_rank: data.verified_rank || null,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (field: string, value: string) => {
    if (!user) return;

    try {
      const updateData = { [field]: value };
      if (field === 'display_name') {
        updateData.full_name = value; // Also update full_name for compatibility
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...updateData,
        });

      if (error) throw error;

      toast.success('Đã lưu thay đổi!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Lỗi khi lưu: ' + error.message);
    }
  };

  const handleFieldBlur = (field: string, value: string) => {
    if (profile[field as keyof ProfileData] !== value) {
      updateProfile(field, value);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (500KB max)
    if (file.size > 500 * 1024) {
      toast.error('Ảnh phải nhỏ hơn 500KB');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      await updateProfile('avatar_url', avatarUrl);
      setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));

      toast.success('Đã tải lên ảnh đại diện!');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('Lỗi khi tải ảnh: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hồ sơ cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin của bạn</p>
        </div>

        {/* Avatar Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.avatar_url} alt="Avatar" />
                  <AvatarFallback className="text-xl">
                    {profile.display_name?.charAt(0) || '👤'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              
              <div className="text-center">
                <h2 className="text-xl font-semibold">
                  {profile.display_name || 'Chưa đặt tên'}
                </h2>
                <div className="flex flex-col items-center space-y-2">
                  <Badge className={skillLevels[profile.skill_level].color}>
                    <Trophy className="w-3 h-3 mr-1" />
                    {skillLevels[profile.skill_level].label}
                  </Badge>
                   {profile.verified_rank && (
                     <Badge className="bg-blue-100 text-blue-800">
                       <Trophy className="w-3 h-3 mr-1" />
                       Hạng đã xác thực: {profile.verified_rank}
                     </Badge>
                   )}
                   <TrustScoreBadge 
                     playerId={profile.user_id}
                     showFullDetails={true}
                   />
                </div>
                {profile.member_since && (
                  <p className="text-sm text-gray-500 mt-2 flex items-center justify-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Tham gia {new Date(profile.member_since).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>
              
              {uploading && (
                <p className="text-sm text-blue-600">Đang tải ảnh...</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
            <TabsTrigger value="rank">Xác thực hạng</TabsTrigger>
            <TabsTrigger value="penalties">Hình phạt</TabsTrigger>
            <TabsTrigger value="club">Câu lạc bộ</TabsTrigger>
            {profile.role === 'club_owner' || profile.role === 'both' ? (
              <TabsTrigger value="requests">Yêu cầu xác thực</TabsTrigger>
            ) : (
              <TabsTrigger value="requests" disabled>Yêu cầu xác thực</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Thông tin cá nhân
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên hiển thị *
                  </label>
                  <Input
                    value={profile.display_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                    onBlur={(e) => handleFieldBlur('display_name', e.target.value)}
                    placeholder="Nhập tên hiển thị của bạn"
                    className="h-12 text-lg"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Số điện thoại
                  </label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                    placeholder="0987654321"
                    className="h-12 text-lg"
                    type="tel"
                    inputMode="numeric"
                  />
                </div>

                {/* Skill Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trình độ chơi bida
                  </label>
                  <Select
                    value={profile.skill_level}
                    onValueChange={(value) => {
                      setProfile(prev => ({ ...prev, skill_level: value as any }));
                      updateProfile('skill_level', value);
                    }}
                  >
                    <SelectTrigger className="h-12 text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(skillLevels).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Thành phố
                    </label>
                    <Input
                      value={profile.city}
                      onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                      onBlur={(e) => handleFieldBlur('city', e.target.value)}
                      placeholder="TP. Hồ Chí Minh"
                      className="h-12 text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quận/Huyện
                    </label>
                    <Input
                      value={profile.district}
                      onChange={(e) => setProfile(prev => ({ ...prev, district: e.target.value }))}
                      onBlur={(e) => handleFieldBlur('district', e.target.value)}
                      placeholder="Quận 1"
                      className="h-12 text-lg"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới thiệu bản thân
                    <span className="text-sm text-gray-500 ml-2">
                      ({profile.bio.length}/200)
                    </span>
                  </label>
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => {
                      if (e.target.value.length <= 200) {
                        setProfile(prev => ({ ...prev, bio: e.target.value }));
                      }
                    }}
                    onBlur={(e) => handleFieldBlur('bio', e.target.value)}
                    placeholder="Chia sẻ về sở thích chơi bida, thành tích hoặc mục tiêu của bạn..."
                    className="min-h-[100px] text-lg"
                    maxLength={200}
                  />
                </div>

                {/* Privacy Notice */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Quyền riêng tư:</strong> Số điện thoại của bạn sẽ không hiển thị công khai. 
                    Chỉ tên hiển thị, ảnh đại diện, trình độ và giới thiệu sẽ được hiển thị cho người khác.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rank">
            <RankVerificationForm />
          </TabsContent>

          <TabsContent value="club">
            <ClubRegistrationForm />
          </TabsContent>

          <TabsContent value="penalties">
            <PenaltyManagement />
          </TabsContent>

          <TabsContent value="requests">
            {(profile.role === 'club_owner' || profile.role === 'both') ? (
              <RankVerificationRequests />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <p>Bạn cần đăng ký câu lạc bộ để xem mục này</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;