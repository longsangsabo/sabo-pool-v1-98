import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🏓 Starting match scheduling automation...');

    // Find tournaments with brackets generated but matches not scheduled
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('status', 'ongoing')
      .eq('bracket_generated', true);

    if (tournamentsError) {
      console.error('❌ Error fetching tournaments:', tournamentsError);
      throw tournamentsError;
    }

    console.log(`📋 Found ${tournaments?.length || 0} tournaments ready for match scheduling`);

    let scheduledMatches = 0;
    let notificationsCount = 0;

    for (const tournament of tournaments || []) {
      console.log(`🎯 Processing tournament: ${tournament.name}`);

      // Get unscheduled matches for this tournament
      const { data: matches, error: matchesError } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', tournament.id)
        .eq('status', 'scheduled')
        .is('scheduled_time', null);

      if (matchesError) {
        console.error(`❌ Error fetching matches for ${tournament.name}:`, matchesError);
        continue;
      }

      if (!matches || matches.length === 0) {
        console.log(`✅ Tournament ${tournament.name} already has all matches scheduled`);
        continue;
      }

      console.log(`📅 Scheduling ${matches.length} matches for ${tournament.name}`);

      // Calculate scheduling intervals
      const tournamentStart = new Date(tournament.tournament_start);
      const tournamentEnd = new Date(tournament.tournament_end);
      const totalDurationMs = tournamentEnd.getTime() - tournamentStart.getTime();
      const intervalMs = totalDurationMs / matches.length;

      let notifications = [];

      // Schedule each match
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const scheduledTime = new Date(tournamentStart.getTime() + (i * intervalMs));

        // Update match with scheduled time
        const { error: updateError } = await supabase
          .from('tournament_matches')
          .update({ 
            scheduled_time: scheduledTime.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', match.id);

        if (updateError) {
          console.error(`❌ Error scheduling match ${match.id}:`, updateError);
          continue;
        }

        scheduledMatches++;
        console.log(`⏰ Scheduled match ${i + 1}/${matches.length} for ${scheduledTime.toLocaleString('vi-VN')}`);

        // Create notifications for players if they exist
        if (match.player1_id) {
          notifications.push({
            user_id: match.player1_id,
            type: 'match_scheduled',
            title: 'Lịch thi đấu đã được xếp',
            message: `Trận đấu của bạn trong giải "${tournament.name}" đã được lên lịch vào ${scheduledTime.toLocaleString('vi-VN')}.`,
            priority: 'normal',
            action_url: `/tournaments/${tournament.id}`,
            metadata: {
              match_id: match.id,
              tournament_id: tournament.id,
              tournament_name: tournament.name,
              scheduled_time: scheduledTime.toISOString(),
              round_number: match.round_number,
              match_number: match.match_number
            }
          });
        }

        if (match.player2_id) {
          notifications.push({
            user_id: match.player2_id,
            type: 'match_scheduled',
            title: 'Lịch thi đấu đã được xếp',
            message: `Trận đấu của bạn trong giải "${tournament.name}" đã được lên lịch vào ${scheduledTime.toLocaleString('vi-VN')}.`,
            priority: 'normal',
            action_url: `/tournaments/${tournament.id}`,
            metadata: {
              match_id: match.id,
              tournament_id: tournament.id,
              tournament_name: tournament.name,
              scheduled_time: scheduledTime.toISOString(),
              round_number: match.round_number,
              match_number: match.match_number
            }
          });
        }
      }

      // Send all notifications for this tournament
      if (notifications.length > 0) {
        const { error: notifError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (!notifError) {
          notificationsCount += notifications.length;
          console.log(`📢 Sent ${notifications.length} scheduling notifications for "${tournament.name}"`);
        } else {
          console.error(`❌ Error sending notifications for ${tournament.name}:`, notifError);
        }
      }

      // Mark tournament as fully scheduled
      await supabase
        .from('tournaments')
        .update({ 
          matches_scheduled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', tournament.id);

      console.log(`✅ Completed scheduling for tournament: ${tournament.name}`);
    }

    // Log the automation activity
    await supabase
      .from('system_logs')
      .insert({
        log_type: 'match_scheduling_automation',
        message: 'Match scheduling automation completed',
        metadata: {
          tournaments_processed: tournaments?.length || 0,
          matches_scheduled: scheduledMatches,
          notifications_sent: notificationsCount,
          execution_time: new Date().toISOString()
        }
      });

    const result = {
      success: true,
      tournaments_processed: tournaments?.length || 0,
      matches_scheduled: scheduledMatches,
      notifications_sent: notificationsCount,
      message: `Scheduled ${scheduledMatches} matches and sent ${notificationsCount} notifications`
    };

    console.log('🎉 Match scheduling automation completed:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('💥 Error in match scheduling automation:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);