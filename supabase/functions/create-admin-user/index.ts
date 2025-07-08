import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  skillLevel: string;
  autoConfirm: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const {
      email,
      password,
      fullName,
      phone,
      skillLevel,
      autoConfirm
    }: CreateUserRequest = await req.json();

    console.log(`Creating user: ${email}`);

    // Create user with admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName,
        phone: phone,
      },
      email_confirm: autoConfirm
    });

    if (authError) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'User creation failed' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`User created successfully: ${authData.user.id}`);

    // Create profile
    const { error: profileError } = await supabaseAdmin
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
      console.error('Profile error:', profileError);
      return new Response(
        JSON.stringify({ error: `Profile creation failed: ${profileError.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create initial ranking
    const { error: rankingError } = await supabaseAdmin
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
      console.error('Ranking error:', rankingError);
      // Don't fail for ranking error, it's optional
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          phone: phone,
          full_name: fullName,
          skill_level: skillLevel,
          confirmed: autoConfirm
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});