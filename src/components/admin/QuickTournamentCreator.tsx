import React, { useState } from 'react';
import { Trophy, Play, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const QuickTournamentCreator = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [createdTournament, setCreatedTournament] = useState<any>(null);

  const createQuickTournament = async () => {
    setIsCreating(true);
    
    try {
      // Get current user for tournament creation
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Bạn cần đăng nhập để tạo giải đấu');
      }

      // Create a quick tournament for testing
      const tournamentData = {
        name: `Test Tournament ${Date.now()}`,
        description: 'Giải đấu test được tạo tự động cho mục đích kiểm tra bracket generation',
        tournament_type: 'single_elimination',
        max_participants: 16,
        current_participants: 0,
        entry_fee: 0,
        prize_pool: 0,
        registration_start: new Date().toISOString(),
        registration_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        start_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
        end_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days from now
        location: 'Sabo Pool Arena - Test Venue',
        status: 'upcoming',
        management_status: 'draft',
        created_by: user.id,
        rules: 'Race to 5 - Standard 8-ball rules - Time limit: 30 minutes'
      };

      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .insert(tournamentData)
        .select()
        .single();

      if (tournamentError) throw tournamentError;

      setCreatedTournament(tournament);
      toast.success(`Đã tạo giải đấu test: ${tournament.name}`);

    } catch (error) {
      console.error('Error creating tournament:', error);
      toast.error(`Lỗi tạo giải đấu: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const resetTournamentStatus = async (tournamentId: string) => {
    try {
      // Reset tournament to draft status and clear participants
      const { error } = await supabase
        .from('tournaments')
        .update({
          current_participants: 0,
          status: 'upcoming',
          management_status: 'draft'
        })
        .eq('id', tournamentId);

      if (error) throw error;

      // Delete existing registrations
      await supabase
        .from('tournament_registrations')
        .delete()
        .eq('tournament_id', tournamentId);

      // Delete existing bracket
      await supabase
        .from('tournament_brackets')
        .delete()
        .eq('tournament_id', tournamentId);

      toast.success('Đã reset giải đấu về trạng thái ban đầu');
      setCreatedTournament(prev => prev ? { ...prev, current_participants: 0, status: 'upcoming' } : null);

    } catch (error) {
      console.error('Error resetting tournament:', error);
      toast.error(`Lỗi reset giải đấu: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Tạo Giải Đấu Test Nhanh
        </CardTitle>
        <CardDescription>
          Tạo nhanh một giải đấu test để sử dụng với Tournament Testing Tools
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <Button 
          onClick={createQuickTournament}
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Đang tạo giải đấu test...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Tạo Giải Đấu Test (16 người)
            </>
          )}
        </Button>

        {createdTournament && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-green-800 dark:text-green-200">
                Giải đấu đã được tạo!
              </h3>
            </div>
            
            <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
              <div><strong>Tên:</strong> {createdTournament.name}</div>
              <div><strong>ID:</strong> {createdTournament.id}</div>
              <div><strong>Trạng thái:</strong> {createdTournament.status}</div>
              <div><strong>Số người:</strong> {createdTournament.current_participants || 0}/{createdTournament.max_participants}</div>
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetTournamentStatus(createdTournament.id)}
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Reset Tournament
              </Button>
            </div>

            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Tip:</strong> Bây giờ bạn có thể sử dụng giải đấu này trong Tournament Testing Tools để populate 16 users và test bracket generation.
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default QuickTournamentCreator;