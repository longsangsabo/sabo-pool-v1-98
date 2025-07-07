import React, { useState } from 'react';
import { Users, Play, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage, interpolate } from '@/contexts/LanguageContext';

const BulkUserGenerator = () => {
  const { t } = useLanguage();
  const [userCount, setUserCount] = useState(10);
  const [includeRanks, setIncludeRanks] = useState(true);
  const [includeSpaPoints, setIncludeSpaPoints] = useState(true);
  const [skillDistribution, setSkillDistribution] = useState('mixed');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedUsers, setGeneratedUsers] = useState<any[]>([]);

  const vietnamesePrefixes = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng'];
  const vietnameseFirstNames = ['Văn', 'Thị', 'Minh', 'Tuấn', 'Hương', 'Lan', 'Hùng', 'Linh', 'Nam', 'Mai'];
  const vietnameseLastNames = ['An', 'Bình', 'Cường', 'Dũng', 'Hải', 'Khoa', 'Long', 'Phong', 'Quân', 'Sơn'];

  const skillLevels = ['beginner', 'intermediate', 'advanced', 'professional'];
  const rankCodes = ['K', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A', 'S'];

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

  const generateUsers = async () => {
    setIsGenerating(true);
    setProgress(0);
    setGeneratedUsers([]);

    try {
      const users = [];
      
      for (let i = 0; i < userCount; i++) {
        const fullName = generateVietnameseName();
        const phone = generatePhoneNumber();
        const email = `test.user.${Date.now()}.${i}@sabopool.test`;
        
        let skillLevel = 'beginner';
        if (skillDistribution === 'mixed') {
          skillLevel = skillLevels[Math.floor(Math.random() * skillLevels.length)];
        } else {
          skillLevel = skillDistribution;
        }

        const userData = {
          full_name: fullName,
          display_name: fullName.split(' ').slice(-2).join(' '),
          phone: phone,
          skill_level: skillLevel,
          city: ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'][Math.floor(Math.random() * 5)],
          district: `Quận ${Math.floor(Math.random() * 12) + 1}`,
          bio: `Người chơi billiards ${skillLevel === 'beginner' ? 'mới bắt đầu' : skillLevel === 'intermediate' ? 'trung bình' : skillLevel === 'advanced' ? 'giỏi' : 'chuyên nghiệp'}`,
          created_at: new Date().toISOString(),
        };

        users.push(userData);
        setProgress(((i + 1) / userCount) * 50); // First 50% for generation
      }

      // Insert users into profiles table
      const { data: insertedUsers, error: insertError } = await supabase
        .from('profiles')
        .insert(users)
        .select();

      if (insertError) throw insertError;

      // Generate rankings if requested
      if (includeRanks && insertedUsers) {
        const rankings = insertedUsers.map((user, index) => {
          const rankIndex = Math.floor(Math.random() * rankCodes.length);
          const elo = 800 + Math.floor(Math.random() * 1200); // 800-2000 ELO
          const spaPoints = includeSpaPoints ? Math.floor(Math.random() * 500) : 0;
          
          return {
            player_id: user.user_id,
            current_rank_id: null, // Would need to link to actual rank IDs
            elo: elo,
            spa_points: spaPoints,
            total_matches: Math.floor(Math.random() * 50),
            wins: Math.floor(Math.random() * 30),
            losses: Math.floor(Math.random() * 20),
            created_at: new Date().toISOString(),
          };
        });

        const { error: rankingError } = await supabase
          .from('player_rankings')
          .insert(rankings);

        if (rankingError) {
          console.warn('Failed to create rankings:', rankingError);
        }
      }

      setProgress(100);
      setGeneratedUsers(insertedUsers || []);
      toast.success(`Successfully generated ${userCount} test users!`);

    } catch (error) {
      console.error('Error generating users:', error);
      toast.error('Failed to generate users. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t('dev.bulk_user_title')}
        </CardTitle>
        <CardDescription>
          {t('dev.bulk_user_desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="userCount">{t('dev.user_count')}</Label>
            <Input
              id="userCount"
              type="number"
              min="10"
              max="100"
              value={userCount}
              onChange={(e) => setUserCount(Number(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="skillDistribution">{t('dev.skill_distribution')}</Label>
            <Select value={skillDistribution} onValueChange={setSkillDistribution}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mixed">Mixed Levels</SelectItem>
                <SelectItem value="beginner">All Beginner</SelectItem>
                <SelectItem value="intermediate">All Intermediate</SelectItem>
                <SelectItem value="advanced">All Advanced</SelectItem>
                <SelectItem value="professional">All Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeRanks"
              checked={includeRanks}
              onCheckedChange={(checked) => setIncludeRanks(checked as boolean)}
            />
            <Label htmlFor="includeRanks">Generate ranking data</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeSpaPoints"
              checked={includeSpaPoints}
              onCheckedChange={(checked) => setIncludeSpaPoints(checked as boolean)}
            />
            <Label htmlFor="includeSpaPoints">Include SPA points</Label>
          </div>
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Generating users... {progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <Button 
          onClick={generateUsers} 
          disabled={isGenerating || userCount < 10 || userCount > 100}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Generate {userCount} Users
            </>
          )}
        </Button>

        {generatedUsers.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-green-800">Generation Complete</h3>
            </div>
            <p className="text-sm text-green-700">
              Successfully created {generatedUsers.length} test users with profiles
              {includeRanks && ' and ranking data'}
              {includeSpaPoints && ' including SPA points'}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkUserGenerator;