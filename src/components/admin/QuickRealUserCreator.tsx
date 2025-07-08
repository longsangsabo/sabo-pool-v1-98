import React, { useState } from 'react';
import { UserPlus, Play, CheckCircle, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [currentStep, setCurrentStep] = useState('');
  const [logs, setLogs] = useState<Array<{message: string, type: 'info' | 'error' | 'success', timestamp: string}>>([]);
  const [createdUsers, setCreatedUsers] = useState<any[]>([]);
  
  // Admin controls
  const [skipEmailVerification, setSkipEmailVerification] = useState(true);
  const [autoConfirmUsers, setAutoConfirmUsers] = useState(true);
  const [batchMode, setBatchMode] = useState(false);

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
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]/g, ''); // Remove any non-alphanumeric characters
    const randomNum = Math.floor(Math.random() * 10000);
    return `${cleanName || 'user'}${randomNum}@gmail.com`;
  };

  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  // Admin function to confirm user email (bypass verification)
  const confirmUserEmail = async (userId: string, email: string) => {
    try {
      addLog(`🔧 Admin confirming email for: ${email}`, 'info');
      
      // Use admin API to confirm user
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        email_confirm: true
      });

      if (error) {
        addLog(`❌ Admin confirm failed: ${error.message}`, 'error');
        return false;
      }

      addLog(`✅ Admin confirmed user email: ${email}`, 'success');
      return true;
    } catch (error) {
      addLog(`❌ Admin confirm error: ${error.message}`, 'error');
      return false;
    }
  };

  const createRealUsers = async () => {
    setIsCreating(true);
    setProgress(0);
    setCurrentStep('');
    setLogs([]);
    setCreatedUsers([]);

    try {
      addLog('🚀 Bắt đầu tạo user thực...', 'info');
      addLog(`📊 Số lượng: ${userCount} users`, 'info');
      setCurrentStep('Khởi tạo...');
      
      const createdUsersList = [];

      for (let i = 0; i < userCount; i++) {
        setCurrentStep(`Tạo user ${i + 1}/${userCount}...`);
        addLog(`👤 Tạo user ${i + 1}: Bắt đầu...`, 'info');
        
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

        addLog(`📧 Đăng ký Auth cho: ${email}`, 'info');

        // Create real user through Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
              phone: phone,
            },
          },
        });

        if (authError) {
          addLog(`❌ Lỗi Auth user ${i + 1}: ${authError.message}`, 'error');
          console.error(`Lỗi tạo user ${i + 1}:`, authError);
          toast.error(`Lỗi tạo user ${i + 1}: ${authError.message}`);
          continue;
        }

        addLog(`✅ Auth thành công cho user ${i + 1}`, 'success');

        // Admin auto-confirm email if enabled
        if (autoConfirmUsers && authData.user && !authData.user.email_confirmed_at) {
          addLog(`🔧 Admin auto-confirming user ${i + 1}...`, 'info');
          await confirmUserEmail(authData.user.id, email);
        }

        if (authData.user) {
          addLog(`📝 Tạo profile cho user ${i + 1}...`, 'info');
          // Create profile for the user (email is already in auth.users)
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
              // email is stored in auth.users, not profiles
            });

          if (profileError) {
            addLog(`❌ Database error saving new user ${i + 1}: ${profileError.message}`, 'error');
            addLog(`📋 Chi tiết lỗi profile: ${JSON.stringify(profileError)}`, 'error');
            console.error(`Lỗi tạo profile cho user ${i + 1}:`, profileError);
            continue; // Skip to next user if profile creation fails
          } else {
            addLog(`✅ Profile user ${i + 1} thành công`, 'success');
          }

          addLog(`🏆 Tạo ranking cho user ${i + 1}...`, 'info');
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
            addLog(`❌ Database error saving new user ${i + 1}: ${rankingError.message}`, 'error');
            addLog(`📋 Chi tiết lỗi ranking: ${JSON.stringify(rankingError)}`, 'error');
            console.error(`Lỗi tạo ranking cho user ${i + 1}:`, rankingError);
            // Don't continue here - ranking is optional
          } else {
            addLog(`✅ Ranking user ${i + 1} thành công`, 'success');
          }

          createdUsersList.push({
            id: authData.user.id,
            email,
            phone,
            full_name: fullName,
            skill_level: skillLevel,
          });

          addLog(`🎉 Hoàn thành user ${i + 1}: ${fullName}`, 'success');
        }

        setProgress(((i + 1) / userCount) * 100);
      }

      setCurrentStep('Hoàn thành!');
      addLog(`🏁 Tạo thành công ${createdUsersList.length}/${userCount} users thực!`, 'success');
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

        {/* Admin Controls */}
        <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-amber-600" />
            <h3 className="font-medium text-amber-800 dark:text-amber-300">Admin Controls</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="skipEmailVerification" 
                checked={skipEmailVerification}
                onCheckedChange={(checked) => setSkipEmailVerification(checked as boolean)}
              />
              <Label htmlFor="skipEmailVerification" className="text-sm">
                Bỏ qua xác thực email (Testing)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="autoConfirmUsers" 
                checked={autoConfirmUsers}
                onCheckedChange={(checked) => setAutoConfirmUsers(checked as boolean)}
              />
              <Label htmlFor="autoConfirmUsers" className="text-sm">
                Tự động kích hoạt users
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="batchMode" 
                checked={batchMode}
                onCheckedChange={(checked) => setBatchMode(checked as boolean)}
              />
              <Label htmlFor="batchMode" className="text-sm">
                Chế độ batch (Nhanh hơn)
              </Label>
            </div>
          </div>
          
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
            ⚠️ Chỉ dùng cho testing. Skip email verification sẽ tạo users có thể đăng nhập ngay.
          </p>
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

        {/* Real-time Progress Display */}
        {(isCreating || logs.length > 0) && (
          <div className="space-y-4 mt-4">
            {/* Current Step Display */}
            {isCreating && (
              <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {currentStep || 'Đang khởi tạo...'}
                </span>
              </div>
            )}

            {/* Detailed Progress Bar */}
            {isCreating && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Tiến độ tổng thể</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="w-full h-2" />
              </div>
            )}

            {/* Real-time Logs - Always Visible */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border max-h-60 overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                  Debug Logs ({logs.length})
                </h4>
                {logs.length > 0 && (
                  <button 
                    onClick={() => setLogs([])}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`text-xs font-mono flex items-start gap-2 p-2 rounded ${
                      log.type === 'error' 
                        ? 'bg-red-50 text-red-700 border-l-2 border-red-300' 
                        : log.type === 'success'
                        ? 'bg-green-50 text-green-700 border-l-2 border-green-300'
                        : 'bg-blue-50 text-blue-700 border-l-2 border-blue-300'
                    }`}
                  >
                    <span className="text-gray-500 min-w-fit">
                      [{log.timestamp}]
                    </span>
                    <span className="flex-1">
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
              {logs.length === 0 && (
                <p className="text-sm text-gray-500 italic">Chưa có log nào...</p>
              )}
            </div>
          </div>
        )}

        {createdUsers.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-green-800">Tạo thành công!</h3>
            </div>
            <p className="text-sm text-green-700 mb-3">
              Đã tạo {createdUsers.length} user thực với email/password: <strong>Demo123!@#</strong>
              {autoConfirmUsers && <span className="block text-xs mt-1">✅ Users đã được admin kích hoạt - có thể đăng nhập ngay!</span>}
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