import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play, FastForward, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TournamentProgressionStepProps {
  onComplete: (results: any) => void;
  sharedData: any;
  addLog: (message: string, type?: 'info' | 'error' | 'success') => void;
}

export const TournamentProgressionStep: React.FC<TournamentProgressionStepProps> = ({
  onComplete,
  sharedData,
  addLog
}) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [tournamentStatus, setTournamentStatus] = useState('');

  useEffect(() => {
    if (sharedData.tournament?.id) {
      loadTournamentData();
    }
  }, [sharedData.tournament]);

  const loadTournamentData = async () => {
    try {
      // Load current tournament status
      const { data: tournamentData } = await supabase
        .from('tournaments')
        .select('status')
        .eq('id', sharedData.tournament.id)
        .single();
      
      setTournamentStatus(tournamentData?.status || 'unknown');

      // Load all matches
      const { data: matchData, error } = await supabase
        .from('tournament_matches')
        .select(`
          id, round_number, match_number, status, winner_id,
          player1_id, player2_id, score_player1, score_player2
        `)
        .eq('tournament_id', sharedData.tournament.id)
        .order('round_number', { ascending: true })
        .order('match_number', { ascending: true });

      if (error) throw error;

      setMatches(matchData || []);
      
      // Calculate current round
      const completedRounds = Math.max(
        ...(matchData || [])
          .filter(m => m.status === 'completed')
          .map(m => m.round_number)
      );
      setCurrentRound(isFinite(completedRounds) ? completedRounds + 1 : 1);

      addLog(`📊 Loaded ${matchData?.length || 0} matches, currently at round ${currentRound}`, 'info');
    } catch (error: any) {
      addLog(`❌ Error loading tournament data: ${error.message}`, 'error');
    }
  };

  const simulateMatchResult = async (match: any) => {
    const winnerId = Math.random() > 0.5 ? match.player1_id : match.player2_id;
    const score1 = winnerId === match.player1_id ? 2 : 1;
    const score2 = winnerId === match.player2_id ? 2 : 1;

    const { error: updateError } = await supabase
      .from('tournament_matches')
      .update({
        winner_id: winnerId,
        score_player1: score1,
        score_player2: score2,
        status: 'completed',
        actual_end_time: new Date().toISOString()
      })
      .eq('id', match.id);

    if (updateError) throw updateError;

    // Advance winner to next round
    const { error: advanceError } = await supabase
      .rpc('advance_tournament_winner', {
        p_match_id: match.id,
        p_tournament_id: sharedData.tournament.id
      });

    if (advanceError) throw advanceError;

    return {
      matchId: match.id,
      round: match.round_number,
      match: match.match_number,
      winnerId,
      score: `${score1}-${score2}`
    };
  };

  const simulateRound = async () => {
    setIsSimulating(true);
    const startTime = Date.now();

    try {
      addLog(`🎮 Simulating round ${currentRound}...`, 'info');

      // Get available matches for current round
      const availableMatches = matches.filter(m => 
        m.round_number === currentRound && 
        m.status === 'scheduled' &&
        m.player1_id && m.player2_id
      );

      if (availableMatches.length === 0) {
        addLog(`⚠️ No available matches in round ${currentRound}`, 'error');
        return;
      }

      const roundResults = [];
      for (const match of availableMatches) {
        const result = await simulateMatchResult(match);
        roundResults.push(result);
        addLog(`⚽ Match ${match.match_number}: Winner ${result.score}`, 'info');
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay for visual effect
      }

      setSimulationResults(prev => [...prev, ...roundResults]);
      setCurrentRound(prev => prev + 1);
      
      const duration = Date.now() - startTime;
      addLog(`✅ Round ${currentRound} completed in ${duration}ms`, 'success');

      // Reload data to see updates
      await loadTournamentData();

    } catch (error: any) {
      addLog(`❌ Error simulating round: ${error.message}`, 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const simulateEntireTournament = async () => {
    setIsSimulating(true);
    const startTime = Date.now();

    try {
      addLog(`🚀 Starting full tournament simulation...`, 'info');

      let round = currentRound;
      let totalMatches = 0;

      while (round <= 10) { // Safety limit
        // Load current matches
        const { data: currentMatches } = await supabase
          .from('tournament_matches')
          .select('*')
          .eq('tournament_id', sharedData.tournament.id)
          .eq('round_number', round)
          .eq('status', 'scheduled')
          .not('player1_id', 'is', null)
          .not('player2_id', 'is', null);

        if (!currentMatches || currentMatches.length === 0) {
          addLog(`🏁 Tournament completed at round ${round - 1}`, 'success');
          break;
        }

        addLog(`🎮 Simulating round ${round} (${currentMatches.length} matches)...`, 'info');

        for (const match of currentMatches) {
          const result = await simulateMatchResult(match);
          totalMatches++;
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        round++;
      }

      const duration = Date.now() - startTime;
      
      // Mark tournament as completed
      await supabase
        .from('tournaments')
        .update({ status: 'completed' })
        .eq('id', sharedData.tournament.id);

      const results = {
        totalRounds: round - 1,
        totalMatches,
        duration,
        simulationResults,
        tournamentCompleted: true,
        completedAt: new Date().toISOString()
      };

      setSimulationResults(prev => [...prev, ...results.simulationResults || []]);
      addLog(`🏆 Tournament simulation completed! ${totalMatches} matches in ${results.totalRounds} rounds (${duration}ms)`, 'success');

      onComplete(results);
      toast.success('🎉 Tournament progression test completed!');

    } catch (error: any) {
      addLog(`❌ Error in tournament simulation: ${error.message}`, 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const resetTournament = async () => {
    try {
      addLog(`🔄 Resetting tournament to initial state...`, 'info');

      // Reset all matches to scheduled and clear results
      await supabase
        .from('tournament_matches')
        .update({
          status: 'scheduled',
          winner_id: null,
          score_player1: null,
          score_player2: null,
          actual_end_time: null
        })
        .eq('tournament_id', sharedData.tournament.id);

      // Reset players to first round only
      const { data: seedingData } = await supabase
        .from('tournament_seeding')
        .select('*')
        .eq('tournament_id', sharedData.tournament.id)
        .eq('is_bye', false)
        .order('seed_position');

      // Clear all round 2+ matches
      await supabase
        .from('tournament_matches')
        .update({
          player1_id: null,
          player2_id: null
        })
        .eq('tournament_id', sharedData.tournament.id)
        .gt('round_number', 1);

      // Set tournament back to ongoing
      await supabase
        .from('tournaments')
        .update({ status: 'ongoing' })
        .eq('id', sharedData.tournament.id);

      setCurrentRound(1);
      setSimulationResults([]);
      await loadTournamentData();

      addLog(`✅ Tournament reset to initial bracket state`, 'success');

    } catch (error: any) {
      addLog(`❌ Error resetting tournament: ${error.message}`, 'error');
    }
  };

  const maxRounds = Math.ceil(Math.log2(matches.filter(m => m.round_number === 1).length));
  const currentRoundMatches = matches.filter(m => 
    m.round_number === currentRound && 
    m.player1_id && m.player2_id
  );

  return (
    <div className="space-y-6">
      {/* Tournament Status */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-2">🏆 Tournament: {sharedData.tournament?.name}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium">Status</div>
            <div className="text-gray-600">{tournamentStatus}</div>
          </div>
          <div>
            <div className="font-medium">Current Round</div>
            <div className="text-gray-600">{currentRound} / {maxRounds}</div>
          </div>
          <div>
            <div className="font-medium">Total Matches</div>
            <div className="text-gray-600">{matches.length}</div>
          </div>
          <div>
            <div className="font-medium">Completed</div>
            <div className="text-gray-600">{matches.filter(m => m.status === 'completed').length}</div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button 
          onClick={simulateRound}
          disabled={isSimulating || currentRoundMatches.length === 0}
          className="flex items-center gap-2"
        >
          {isSimulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Simulate Round {currentRound}
          {currentRoundMatches.length > 0 && ` (${currentRoundMatches.length} matches)`}
        </Button>
        
        <Button 
          onClick={simulateEntireTournament}
          disabled={isSimulating}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isSimulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FastForward className="h-4 w-4" />}
          Simulate Entire Tournament
        </Button>

        <Button 
          onClick={resetTournament}
          disabled={isSimulating}
          variant="destructive"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Tournament
        </Button>
      </div>

      {/* Round Status */}
      {currentRoundMatches.length === 0 && currentRound <= maxRounds && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <p className="text-sm">⏳ Waiting for round {currentRound - 1} to complete before proceeding to round {currentRound}</p>
        </div>
      )}

      {currentRound > maxRounds && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <p className="text-sm">🏆 Tournament completed! All rounds finished.</p>
        </div>
      )}

      {/* Simulation Results */}
      {simulationResults.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-medium mb-3">📊 Simulation Results</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {simulationResults.slice(-10).map((result, index) => (
              <div key={index} className="text-xs p-2 bg-white dark:bg-gray-700 rounded">
                R{result.round} M{result.match}: Winner advances ({result.score})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};