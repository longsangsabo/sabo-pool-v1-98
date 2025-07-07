import React, { useState } from 'react';
import { UserPlus, Play, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

const QuickRealUserCreator = () => {
  const { t } = useLanguage();
  const [userCount, setUserCount] = useState(5);
  const [skillDistribution, setSkillDistribution] = useState('mixed');
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [createdUsers, setCreatedUsers] = useState<any[]>([]);

  const vietnamesePrefixes = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng'];
  const vietnameseFirstNames = ['Văn', 'Thị', 'Minh', 'Tuấn', 'Hương', 'Lan', 'Hùng', 'Linh', 'Nam', 'Mai'];
  const vietnameseLastNames = ['An', 'Bình', 'Cường', 'Dũng', 'Hải', 'Khoa', 'Long', 'Phong', 'Quân', 'Sơn'];
  const skillLevels = ['beginner', 'intermediate', 'advanced', 'professional'];

  const generateVietnameseName = () => {
    const prefix = vietnamesePrefixes[Math.floor(Math.random() * vietnamesePrefixes.length)];
    const firstName = vietnameseFirstNames[Math.floor(Math.random() * vietnameseFirstNames.length)];
    const lastName = vietnameseLastNames[Math.floor(Math.random() * vietnameseLastNames.length)];
    return `${prefix} ${firstName} ${lastName}`;
  };

  const generatePhoneNumber = () => {
    const prefixes = ['096', '097', '098', '032', '033', '034', '035', '036', '037', '038', '039'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    return `${prefix}${number}`;
  };

  const generateEmail = (fullName: string) => {
    const cleanName = fullName.toLowerCase()
      .replace(/\s+/g, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
    const randomNum = Math.floor(Math.random() * 1000);
    return `${cleanName}${randomNum}@demo.sabopool.com`;
  };

  const createRealUsers = async () => {
    setIsCreating(true);
    setProgress(0);
    setCreatedUsers([]);

    try {
      const createdUsersList = [];

      for (let i = 0; i < userCount; i++) {
        const fullName = generateVietnameseName();
        const phone = generatePhoneNumber();
        const email = generateEmail(fullName);
        const password = 'Demo123!@#'; // Simple password for demo users
        
        let skillLevel = 'beginner';
        if (skillDistribution === 'mixed') {
          skillLevel = skillLevels[Math.floor(Math.random() * skillLevels.length)];
        } else {
          skillLevel = skillDistribution;
        }

        // Create real user through Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
            },
          },
        });

        if (authError) {
          console.error(`Lỗi tạo user ${i + 1}:`, authError);
          toast.error(`Lỗi tạo user ${i + 1}: ${authError.message}`);
          continue;
        }

        if (authData.user) {
          // Create profile for the user
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: authData.user.id,
              phone: phone,
              display_name: fullName.split(' ').slice(-2).join(' '),
              full_name: fullName,
              role: 'player',
              skill_level: skillLevel,
              city: ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'][Math.floor(Math.random() * 5)],
              district: `Quận ${Math.floor(Math.random() * 12) + 1}`,
              bio: `Demo user - ${skillLevel} level`,
            });

          if (profileError) {
            console.error(`Lỗi tạo profile cho user ${i + 1}:`, profileError);
          }

          // Create initial ranking
          const { error: rankingError } = await supabase
            .from('player_rankings')
            .insert({
              player_id: authData.user.id,
              elo: 800 + Math.floor(Math.random() * 400),
              spa_points: Math.floor(Math.random() * 100),
              total_matches: Math.floor(Math.random() * 20),
              wins: Math.floor(Math.random() * 15),
              losses: Math.floor(Math.random() * 10),
            });

          if (rankingError) {
            console.error(`Lỗi tạo ranking cho user ${i + 1}:`, rankingError);
          }

          createdUsersList.push({
            id: authData.user.id,
            email,
            phone,
            full_name: fullName,
            skill_level: skillLevel,
          });
        }

        setProgress(((i + 1) / userCount) * 100);
      }

      setCreatedUsers(createdUsersList);
      toast.success(`Thành công tạo ${createdUsersList.length} user thực!`);

    } catch (error) {
      console.error('Lỗi tạo users:', error);
      toast.error(`Lỗi: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Tạo User Thực Nhanh
        </CardTitle>
        <CardDescription>
          Tạo user thực thông qua Supabase Auth với profile và wallet tự động
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="userCount">Số lượng user</Label>
            <Input
              id="userCount"
              type="number"
              min="1"
              max="20"
              value={userCount}
              onChange={(e) => setUserCount(Number(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="skillDistribution">Phân bố kỹ năng</Label>
            <Select value={skillDistribution} onValueChange={setSkillDistribution}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mixed">Hỗn hợp</SelectItem>
                <SelectItem value="beginner">Tất cả Beginner</SelectItem>
                <SelectItem value="intermediate">Tất cả Intermediate</SelectItem>
                <SelectItem value="advanced">Tất cả Advanced</SelectItem>
                <SelectItem value="professional">Tất cả Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isCreating && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Đang tạo users... {progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <Button 
          onClick={createRealUsers} 
          disabled={isCreating || userCount < 1 || userCount > 20}
          className="w-full"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Tạo {userCount} User Thực
            </>
          )}
        </Button>

        {createdUsers.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-green-800">Tạo thành công!</h3>
            </div>
            <p className="text-sm text-green-700 mb-3">
              Đã tạo {createdUsers.length} user thực với email/password: <strong>Demo123!@#</strong>
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {createdUsers.map((user, index) => (
                <div key={user.id} className="text-xs bg-white p-2 rounded border">
                  <div><strong>{user.full_name}</strong></div>
                  <div>Email: {user.email}</div>
                  <div>SĐT: {user.phone} | Skill: {user.skill_level}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickRealUserCreator;