import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Running tournament status automation...');

    // Call the tournament status update function
    const { data, error } = await supabaseClient.rpc('auto_update_tournament_status');

    if (error) {
      console.error('Error updating tournament status:', error);
      throw error;
    }

    console.log('Tournament status automation completed successfully');

    // Get updated tournament counts for logging
    const { data: stats } = await supabaseClient
      .from('tournaments')
      .select('status')
      .then(result => ({
        data: result.data?.reduce((acc: any, t: any) => {
          acc[t.status] = (acc[t.status] || 0) + 1;
          return acc;
        }, {})
      }));

    const response = {
      success: true,
      message: 'Tournament status automation completed',
      stats: stats || {},
      timestamp: new Date().toISOString()
    };

    console.log('Automation result:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Tournament automation error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});