import React, { useState, useEffect } from 'react';
import { Trophy, Users, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

const TournamentTestingTools = () => {
  const { t } = useLanguage();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [isPopulating, setIsPopulating] = useState(false);
  const [logs, setLogs] = useState<Array<{message: string, type: 'info' | 'error' | 'success', timestamp: string}>>([]);

  // Load tournaments
  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, name, current_participants, max_participants, status')
        .in('status', ['upcoming', 'registration_open', 'registration_closed'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    }
  };

  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const populateTournamentForTesting = async () => {
    if (!selectedTournament) {
      toast.error('Vui lòng chọn giải đấu trước');
      return;
    }

    setIsPopulating(true);
    setLogs([]);
    
    try {
      addLog('🚀 Bắt đầu tạo 16 test users...');
      
      // Step 1: Create 16 fake users (adjusted for actual schema)
      const fakeUsers = Array.from({length: 16}, (_, i) => ({
        user_id: crypto.randomUUID(),
        full_name: `Test Player ${i + 1}`,
        display_name: `Player${i + 1}`,
        phone: `090${String(Date.now() + i).slice(-7)}`,
        role: 'player',
        skill_level: ['beginner', 'intermediate', 'advanced'][i % 3],
        city: 'Hồ Chí Minh',
        district: 'Quận 1',
        bio: `Auto-generated test user ${i + 1} for tournament testing`
      }));

      const { data: users, error: userError } = await supabase
        .from('profiles')
        .insert(fakeUsers)
        .select('user_id, full_name');

      if (userError) throw userError;
      addLog(`✅ Đã tạo ${users.length} test users thành công`);

      // Step 2: Create rankings for test users
      addLog('🏆 Tạo ranking cho test users...');
      const rankings = users.map(user => ({
        player_id: user.user_id,
        elo: 1000 + Math.floor(Math.random() * 200),
        spa_points: Math.floor(Math.random() * 100),
        total_matches: Math.floor(Math.random() * 10),
        wins: Math.floor(Math.random() * 5),
        losses: Math.floor(Math.random() * 5)
      }));

      const { error: rankingError } = await supabase
        .from('player_rankings')
        .insert(rankings);

      if (rankingError) {
        addLog(`⚠️ Lỗi tạo ranking: ${rankingError.message}`, 'error');
      } else {
        addLog('✅ Ranking được tạo thành công');
      }

      // Step 3: Register users to tournament
      addLog('📝 Đăng ký users vào giải đấu...');
      const registrations = users.map(user => ({
        tournament_id: selectedTournament,
        user_id: user.user_id, // Use user_id not player_id
        status: 'confirmed',
        registration_date: new Date().toISOString()
      }));

      const { error: regError } = await supabase
        .from('tournament_registrations')
        .insert(registrations);

      if (regError) throw regError;
      addLog(`✅ Đã đăng ký ${registrations.length} users vào giải`);

      // Step 4: Update tournament status
      addLog('🔄 Cập nhật trạng thái giải đấu...');
      const { error: tournamentError } = await supabase
        .from('tournaments')
        .update({
          current_participants: 16,
          status: 'registration_closed'
        })
        .eq('id', selectedTournament);

      if (tournamentError) throw tournamentError;
      addLog('✅ Giải đấu đã đầy 16/16 players');

      // Step 5: Generate bracket
      addLog('🎯 Tạo bracket tự động...');
      const { data: bracketResult, error: bracketError } = await supabase
        .rpc('generate_advanced_tournament_bracket', {
          p_tournament_id: selectedTournament,
          p_seeding_method: 'elo_ranking',
          p_force_regenerate: true
        });

      if (bracketError) throw bracketError;
      addLog('🏆 Bracket đã được tạo thành công!', 'success');
      addLog('🎉 Tournament sẵn sàng để test!', 'success');
      
      toast.success('Tournament đã được populate thành công!');
      loadTournaments(); // Refresh tournament list

    } catch (error) {
      addLog(`❌ Lỗi: ${error.message}`, 'error');
      toast.error(`Lỗi: ${error.message}`);
      console.error('Tournament populate error:', error);
    } finally {
      setIsPopulating(false);
    }
  };

  const cleanupTestData = async () => {
    try {
      addLog('🧹 Bắt đầu xóa test data...');
      
      // Delete test users (profiles with bio containing 'Auto-generated test user')
      const { error } = await supabase
        .from('profiles')
        .delete()
        .like('bio', '%Auto-generated test user%');

      if (error) throw error;
      
      addLog('✅ Test data đã được xóa', 'success');
      toast.success('Test data đã được xóa');
      loadTournaments(); // Refresh tournament list
    } catch (error) {
      addLog(`❌ Lỗi xóa test data: ${error.message}`, 'error');
      toast.error(`Lỗi xóa test data: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Công Cụ Test Tournament
        </CardTitle>
        <CardDescription>
          Tạo 16 test users và populate tournament để test bracket generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Chọn giải đấu để test:</label>
            <Select value={selectedTournament} onValueChange={setSelectedTournament}>
              <SelectTrigger>
                <SelectValue placeholder="-- Chọn giải đấu --" />
              </SelectTrigger>
              <SelectContent>
                {tournaments.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.current_participants || 0}/{t.max_participants || 16})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={populateTournamentForTesting}
              disabled={!selectedTournament || isPopulating}
              className="flex-1"
            >
              {isPopulating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo test data...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  🎯 Populate Tournament với 16 Users
                </>
              )}
            </Button>

            <Button 
              onClick={cleanupTestData}
              disabled={isPopulating}
              variant="outline"
            >
              🧹 Cleanup Test Data
            </Button>
          </div>
        </div>

        {/* Real-time logs */}
        {logs.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border max-h-60 overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                Tiến trình ({logs.length})
              </h4>
              <button 
                onClick={() => setLogs([])}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear
              </button>
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
        )}
      </CardContent>
    </Card>
  );
};

export default TournamentTestingTools;