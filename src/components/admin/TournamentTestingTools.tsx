import React, { useState, useEffect } from 'react';
import { Trophy, Users, Loader2, Play, Eye, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

const BracketVerification = ({ tournamentId }: { tournamentId: string }) => {
  const [bracket, setBracket] = useState<any[]>([]);
  const [seeding, setSeeding] = useState<any[]>([]);
  const [bracketData, setBracketData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadBracket = async () => {
    setLoading(true);
    try {
      // Load tournament matches with player info from all_profiles view
      const { data: matches, error: matchError } = await supabase
        .from('tournament_matches')
        .select(`
          *,
          player1:all_profiles!tournament_matches_player1_id_fkey(user_id, full_name, display_name, profile_type),
          player2:all_profiles!tournament_matches_player2_id_fkey(user_id, full_name, display_name, profile_type)
        `)
        .eq('tournament_id', tournamentId)
        .order('round_number', { ascending: true })
        .order('match_number', { ascending: true });

      if (matchError) throw matchError;

      // Load seeding data
      const { data: seedingData, error: seedError } = await supabase
        .from('tournament_seeding')
        .select(`
          *,
          player:all_profiles!tournament_seeding_player_id_fkey(user_id, full_name, display_name, profile_type)
        `)
        .eq('tournament_id', tournamentId)
        .order('seed_position', { ascending: true });

      if (seedError) throw seedError;

      // Load bracket metadata
      const { data: bracketMeta, error: bracketError } = await supabase
        .from('tournament_brackets')
        .select('*')
        .eq('tournament_id', tournamentId)
        .single();

      if (bracketError && bracketError.code !== 'PGRST116') throw bracketError;

      setBracket(matches || []);
      setSeeding(seedingData || []);
      setBracketData(bracketMeta);
    } catch (error) {
      console.error('Error loading bracket:', error);
      toast.error('Lỗi load bracket: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoundName = (round: number, totalRounds: number) => {
    const remaining = Math.pow(2, totalRounds - round + 1);
    switch (remaining) {
      case 2: return 'Final';
      case 4: return 'Semifinal';
      case 8: return 'Quarterfinal';
      default: return `Round ${round} (${remaining}→${remaining/2})`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          🏆 Bracket Verification
        </CardTitle>
        <CardDescription>
          Verify tournament bracket structure and seeding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tournament Bracket</h3>
          <Button onClick={loadBracket} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Load Bracket
              </>
            )}
          </Button>
        </div>

        {seeding.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-3">🎯 Seeding Order (Top 8)</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {seeding.slice(0, 8).map((seed) => (
                <div key={seed.seed_position} className="flex justify-between p-2 bg-white dark:bg-gray-800 rounded">
                  <span className="font-medium">#{seed.seed_position}</span>
                  <span>
                    {seed.player?.display_name || seed.player?.full_name || 'BYE'}
                    {seed.player?.profile_type === 'test' && (
                      <span className="text-orange-500 ml-1">[TEST]</span>
                    )}
                  </span>
                  <span className="text-gray-500">{seed.elo_rating} ELO</span>
                </div>
              ))}
            </div>
            {seeding.length > 8 && (
              <div className="text-center mt-2 text-gray-500 text-sm">
                ... và {seeding.length - 8} players khác
              </div>
            )}
          </div>
        )}

        {bracket.length > 0 && (
          <div className="space-y-4">
            {/* Bracket Structure */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.max(...bracket.map(m => m.round_number))}, 1fr)` }}>
              {[...Array(Math.max(...bracket.map(m => m.round_number)))].map((_, roundIndex) => {
                const round = roundIndex + 1;
                const roundMatches = bracket.filter(m => m.round_number === round);
                const totalRounds = Math.max(...bracket.map(m => m.round_number));
                
                return (
                  <div key={round}>
                    <h4 className="font-medium mb-2 text-center">
                      {getRoundName(round, totalRounds)}
                    </h4>
                    <div className="space-y-2">
                      {roundMatches.map(match => (
                        <div key={match.id} className="p-3 border rounded-lg bg-white dark:bg-gray-800">
                          <div className="text-xs text-gray-500 mb-1">
                            Match {match.match_number}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">
                                {match.player1?.display_name || match.player1?.full_name || 'TBD'}
                                {match.player1?.profile_type === 'test' && (
                                  <span className="text-orange-500 ml-1 text-xs">[TEST]</span>
                                )}
                              </span>
                              {match.winner_id === match.player1_id && (
                                <span className="text-green-500 text-xs">✓</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">vs</div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">
                                {match.player2?.display_name || match.player2?.full_name || 'TBD'}
                                {match.player2?.profile_type === 'test' && (
                                  <span className="text-orange-500 ml-1 text-xs">[TEST]</span>
                                )}
                              </span>
                              {match.winner_id === match.player2_id && (
                                <span className="text-green-500 text-xs">✓</span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Status: {match.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Statistics */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">📊 Bracket Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium">Total Matches</div>
                  <div className="text-gray-600">{bracket.length}</div>
                </div>
                <div>
                  <div className="font-medium">Rounds</div>
                  <div className="text-gray-600">{Math.max(...bracket.map(m => m.round_number))}</div>
                </div>
                <div>
                  <div className="font-medium">Players Seeded</div>
                  <div className="text-gray-600">{seeding.length}</div>
                </div>
                <div>
                  <div className="font-medium">Test Players</div>
                  <div className="text-gray-600">
                    {seeding.filter(s => s.player?.profile_type === 'test').length}
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">✅ Verification Checklist</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={seeding.length === 16 ? "text-green-500" : "text-red-500"}>
                    {seeding.length === 16 ? "✅" : "❌"}
                  </span>
                  <span>All 16 players properly seeded in Round 1: {seeding.length}/16</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={bracket.filter(m => m.round_number === 1).length === 8 ? "text-green-500" : "text-red-500"}>
                    {bracket.filter(m => m.round_number === 1).length === 8 ? "✅" : "❌"}
                  </span>
                  <span>Round 1 has 8 matches: {bracket.filter(m => m.round_number === 1).length}/8</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={bracketData?.bracket_data?.tournament_type === 'single_elimination' ? "text-green-500" : "text-yellow-500"}>
                    {bracketData?.bracket_data?.tournament_type === 'single_elimination' ? "✅" : "⚠️"}
                  </span>
                  <span>Tournament format: {bracketData?.bracket_data?.tournament_type || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={bracket.length === 15 ? "text-green-500" : "text-red-500"}>
                    {bracket.length === 15 ? "✅" : "❌"}
                  </span>
                  <span>Total matches for 16-player bracket: {bracket.length}/15</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && bracket.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Click "Load Bracket" to verify tournament structure
          </div>
        )}
      </CardContent>
    </Card>
  );
};

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
      
      // Step 1: Create 16 fake users using admin function (bypasses wallet triggers)
      const fakeUsersData = Array.from({length: 16}, (_, i) => ({
        phone: `090${String(Date.now() + i).slice(-7)}`,
        full_name: `Test Player ${i + 1}`,
        display_name: `Player${i + 1}`,
        role: 'player',
        skill_level: ['beginner', 'intermediate', 'advanced'][i % 3],
        city: 'Hồ Chí Minh',
        district: 'Quận 1',
        bio: `Auto-generated test user ${i + 1} for tournament testing - NO WALLET`,
        activity_status: 'active'
      }));

      // Use new safe admin function to create test users without wallet triggers
      const { data: createResult, error: userError } = await supabase
        .rpc('admin_create_test_users_safe', {
          user_data: fakeUsersData
        });

      if (userError) throw userError;
      
      // Type cast the result since RPC returns Json type
      const result = createResult as any;
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create test users');
      }

      const users = result.users;
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
        .from('test_player_rankings')
        .insert(rankings);

      if (rankingError) {
        addLog(`⚠️ Lỗi tạo ranking: ${rankingError.message}`, 'error');
      } else {
        addLog('✅ Ranking được tạo thành công');
      }

      // Step 3: Register users to tournament using admin function
      addLog('📝 Đăng ký users vào giải đấu...');
      const testUserIds = users.map(user => user.user_id);
      
      const { data: regResult, error: regError } = await supabase
        .rpc('admin_register_test_users_to_tournament_final', {
          p_tournament_id: selectedTournament,
          p_test_user_ids: testUserIds
        });

      if (regError) throw regError;
      
      // Type cast the result since RPC returns Json type
      const regResultData = regResult as any;
      
      if (!regResultData.success) {
        throw new Error(regResultData.error || 'Failed to register test users');
      }
      
      addLog(`✅ Đã đăng ký ${regResultData.registrations_created} users vào giải`);

      // Step 4: Update tournament status
      addLog('🔄 Cập nhật trạng thái giải đấu...');
      const { error: tournamentError } = await supabase
        .from('tournaments')
        .update({
          current_participants: 16,
          status: 'registration_closed',
          management_status: 'locked'
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
      
      // First get test user IDs from test_profiles table
      const { data: testUsers, error: getUserError } = await supabase
        .from('test_profiles')
        .select('user_id');

      if (getUserError) throw getUserError;
      
      if (testUsers && testUsers.length > 0) {
        const testUserIds = testUsers.map(u => u.user_id);
        
        // Delete test tournament registrations first
        const { error: testRegError } = await supabase
          .from('test_tournament_registrations')
          .delete()
          .in('player_id', testUserIds);

        if (testRegError) {
          addLog(`⚠️ Lỗi xóa test registrations: ${testRegError.message}`, 'error');
        }

        // Delete tournament registrations (if any exist in production table)
        const { error: regError } = await supabase
          .from('tournament_registrations')
          .delete()
          .in('player_id', testUserIds);

        if (regError) {
          addLog(`⚠️ Lỗi xóa registrations: ${regError.message}`, 'error');
        }

        // Delete test rankings
        const { error: rankError } = await supabase
          .from('test_player_rankings')
          .delete()
          .in('player_id', testUserIds);

        if (rankError) {
          addLog(`⚠️ Lỗi xóa rankings: ${rankError.message}`, 'error');
        }

        // Delete test users
        const { error: userError } = await supabase
          .from('test_profiles')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (userError) throw userError;
        
        addLog(`✅ Đã xóa ${testUsers.length} test users và related data`, 'success');
      } else {
        addLog('ℹ️ Không tìm thấy test users để xóa', 'info');
      }
      
      toast.success('Test data đã được xóa');
      loadTournaments(); // Refresh tournament list
    } catch (error) {
      addLog(`❌ Lỗi xóa test data: ${error.message}`, 'error');
      toast.error(`Lỗi xóa test data: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
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

      {/* Bracket Verification Section */}
      {selectedTournament && (
        <BracketVerification tournamentId={selectedTournament} />
      )}
    </div>
  );
};

export default TournamentTestingTools;