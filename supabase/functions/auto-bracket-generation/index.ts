import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Tournament {
  id: string;
  name: string;
  max_participants: number;
  current_participants: number;
  status: string;
  tournament_type: string;
  registration_end: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🏆 Starting auto bracket generation check...');

    // Find tournaments that need bracket generation
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('status', 'registration_closed')
      .is('bracket_generated', null);

    if (tournamentsError) {
      console.error('❌ Error fetching tournaments:', tournamentsError);
      throw tournamentsError;
    }

    console.log(`📋 Found ${tournaments?.length || 0} tournaments ready for bracket generation`);

    let generatedCount = 0;
    let notifications = [];

    for (const tournament of tournaments || []) {
      console.log(`🎯 Processing tournament: ${tournament.name}`);

      // Count confirmed registrations
      const { data: registrations, error: regError } = await supabase
        .from('tournament_registrations')
        .select('id, user_id')
        .eq('tournament_id', tournament.id)
        .eq('status', 'confirmed');

      if (regError) {
        console.error(`❌ Error fetching registrations for ${tournament.name}:`, regError);
        continue;
      }

      const participantCount = registrations?.length || 0;
      console.log(`👥 Tournament ${tournament.name} has ${participantCount} confirmed participants`);

      // Check if tournament has enough participants (minimum 4)
      if (participantCount < 4) {
        console.log(`⚠️ Tournament ${tournament.name} doesn't have enough participants (${participantCount}/4 minimum)`);
        continue;
      }

      // Generate bracket using existing function
      const { data: bracketResult, error: bracketError } = await supabase
        .rpc('generate_advanced_tournament_bracket', {
          p_tournament_id: tournament.id,
          p_seeding_method: 'elo_ranking',
          p_force_regenerate: false
        });

      if (bracketError) {
        console.error(`❌ Error generating bracket for ${tournament.name}:`, bracketError);
        continue;
      }

      if (bracketResult?.success) {
        // Mark tournament as bracket generated
        await supabase
          .from('tournaments')
          .update({ 
            bracket_generated: true,
            status: 'ongoing',
            updated_at: new Date().toISOString()
          })
          .eq('id', tournament.id);

        console.log(`✅ Successfully generated bracket for ${tournament.name}`);
        generatedCount++;

        // Prepare notifications for all participants
        for (const registration of registrations || []) {
          notifications.push({
            user_id: registration.user_id,
            type: 'tournament_bracket_ready',
            title: 'Bảng đấu đã sẵn sàng!',
            message: `Bảng đấu cho giải "${tournament.name}" đã được tạo tự động. Kiểm tra lịch thi đấu của bạn.`,
            priority: 'high',
            action_url: `/tournaments/${tournament.id}`,
            metadata: {
              tournament_id: tournament.id,
              tournament_name: tournament.name,
              participant_count: participantCount
            }
          });
        }
      } else {
        console.log(`⚠️ Failed to generate bracket for ${tournament.name}: ${bracketResult?.error || 'Unknown error'}`);
      }
    }

    // Send all notifications in batch
    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) {
        console.error('❌ Error sending notifications:', notifError);
      } else {
        console.log(`📢 Sent ${notifications.length} notifications to participants`);
      }
    }

    // Log the automation activity
    await supabase
      .from('system_logs')
      .insert({
        log_type: 'auto_bracket_generation',
        message: `Auto bracket generation completed`,
        metadata: {
          tournaments_processed: tournaments?.length || 0,
          brackets_generated: generatedCount,
          notifications_sent: notifications.length,
          execution_time: new Date().toISOString()
        }
      });

    const result = {
      success: true,
      tournaments_processed: tournaments?.length || 0,
      brackets_generated: generatedCount,
      notifications_sent: notifications.length,
      message: `Generated ${generatedCount} brackets and sent ${notifications.length} notifications`
    };

    console.log('🎉 Auto bracket generation completed:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('💥 Error in auto bracket generation:', error);
    
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