export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action_details: Json | null
          action_type: string
          admin_id: string
          created_at: string
          id: string
          reason: string | null
          target_user_id: string
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          admin_id: string
          created_at?: string
          id?: string
          reason?: string | null
          target_user_id: string
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          admin_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          target_user_id?: string
        }
        Relationships: []
      }
      approval_logs: {
        Row: {
          action: string
          approver_id: string
          comments: string | null
          created_at: string | null
          id: string
          registration_id: string
        }
        Insert: {
          action: string
          approver_id: string
          comments?: string | null
          created_at?: string | null
          id?: string
          registration_id: string
        }
        Update: {
          action?: string
          approver_id?: string
          comments?: string | null
          created_at?: string | null
          id?: string
          registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_logs_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "club_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          bet_points: number | null
          challenger_id: string
          club_id: string | null
          created_at: string
          expires_at: string | null
          handicap_05_rank: number | null
          handicap_1_rank: number | null
          id: string
          location: string | null
          message: string | null
          opponent_id: string
          race_to: number | null
          responded_at: string | null
          response_message: string | null
          scheduled_time: string | null
          stake_amount: number | null
          stake_type: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          bet_points?: number | null
          challenger_id: string
          club_id?: string | null
          created_at?: string
          expires_at?: string | null
          handicap_05_rank?: number | null
          handicap_1_rank?: number | null
          id?: string
          location?: string | null
          message?: string | null
          opponent_id: string
          race_to?: number | null
          responded_at?: string | null
          response_message?: string | null
          scheduled_time?: string | null
          stake_amount?: number | null
          stake_type?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          bet_points?: number | null
          challenger_id?: string
          club_id?: string | null
          created_at?: string
          expires_at?: string | null
          handicap_05_rank?: number | null
          handicap_1_rank?: number | null
          id?: string
          location?: string | null
          message?: string | null
          opponent_id?: string
          race_to?: number | null
          responded_at?: string | null
          response_message?: string | null
          scheduled_time?: string | null
          stake_amount?: number | null
          stake_type?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_accountability: {
        Row: {
          accuracy_percentage: number | null
          club_id: string
          created_at: string
          false_verification_reports: number | null
          id: string
          last_calculated_at: string | null
          restriction_end_date: string | null
          restriction_start_date: string | null
          restriction_status: string | null
          total_verifications: number | null
          updated_at: string
          warning_count: number | null
        }
        Insert: {
          accuracy_percentage?: number | null
          club_id: string
          created_at?: string
          false_verification_reports?: number | null
          id?: string
          last_calculated_at?: string | null
          restriction_end_date?: string | null
          restriction_start_date?: string | null
          restriction_status?: string | null
          total_verifications?: number | null
          updated_at?: string
          warning_count?: number | null
        }
        Update: {
          accuracy_percentage?: number | null
          club_id?: string
          created_at?: string
          false_verification_reports?: number | null
          id?: string
          last_calculated_at?: string | null
          restriction_end_date?: string | null
          restriction_start_date?: string | null
          restriction_status?: string | null
          total_verifications?: number | null
          updated_at?: string
          warning_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "club_accountability_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: true
            referencedRelation: "club_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      club_profiles: {
        Row: {
          address: string
          club_name: string
          created_at: string
          id: string
          number_of_tables: number | null
          operating_hours: Json | null
          phone: string
          updated_at: string
          user_id: string
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          address: string
          club_name: string
          created_at?: string
          id?: string
          number_of_tables?: number | null
          operating_hours?: Json | null
          phone: string
          updated_at?: string
          user_id: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          address?: string
          club_name?: string
          created_at?: string
          id?: string
          number_of_tables?: number | null
          operating_hours?: Json | null
          phone?: string
          updated_at?: string
          user_id?: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      club_registrations: {
        Row: {
          address: string
          amenities: Json | null
          approved_at: string | null
          approved_by: string | null
          basic_price: number
          business_license_url: string | null
          city: string
          closing_time: string
          club_name: string
          created_at: string | null
          district: string
          email: string | null
          facebook_url: string | null
          google_maps_url: string | null
          id: string
          manager_name: string | null
          manager_phone: string | null
          normal_hour_price: number | null
          opening_time: string
          peak_hour_price: number | null
          phone: string
          photos: string[] | null
          rejection_reason: string | null
          status: string | null
          table_count: number
          table_types: string[]
          updated_at: string | null
          user_id: string | null
          vip_table_price: number | null
          weekend_price: number | null
        }
        Insert: {
          address: string
          amenities?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          basic_price: number
          business_license_url?: string | null
          city: string
          closing_time: string
          club_name: string
          created_at?: string | null
          district: string
          email?: string | null
          facebook_url?: string | null
          google_maps_url?: string | null
          id?: string
          manager_name?: string | null
          manager_phone?: string | null
          normal_hour_price?: number | null
          opening_time: string
          peak_hour_price?: number | null
          phone: string
          photos?: string[] | null
          rejection_reason?: string | null
          status?: string | null
          table_count: number
          table_types: string[]
          updated_at?: string | null
          user_id?: string | null
          vip_table_price?: number | null
          weekend_price?: number | null
        }
        Update: {
          address?: string
          amenities?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          basic_price?: number
          business_license_url?: string | null
          city?: string
          closing_time?: string
          club_name?: string
          created_at?: string | null
          district?: string
          email?: string | null
          facebook_url?: string | null
          google_maps_url?: string | null
          id?: string
          manager_name?: string | null
          manager_phone?: string | null
          normal_hour_price?: number | null
          opening_time?: string
          peak_hour_price?: number | null
          phone?: string
          photos?: string[] | null
          rejection_reason?: string | null
          status?: string | null
          table_count?: number
          table_types?: string[]
          updated_at?: string | null
          user_id?: string | null
          vip_table_price?: number | null
          weekend_price?: number | null
        }
        Relationships: []
      }
      club_stats: {
        Row: {
          active_members: number | null
          avg_trust_score: number | null
          club_id: string
          created_at: string | null
          id: string
          month: number
          peak_hours: Json | null
          total_matches_hosted: number | null
          total_revenue: number | null
          updated_at: string | null
          verified_members: number | null
          year: number
        }
        Insert: {
          active_members?: number | null
          avg_trust_score?: number | null
          club_id: string
          created_at?: string | null
          id?: string
          month: number
          peak_hours?: Json | null
          total_matches_hosted?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          verified_members?: number | null
          year: number
        }
        Update: {
          active_members?: number | null
          avg_trust_score?: number | null
          club_id?: string
          created_at?: string | null
          id?: string
          month?: number
          peak_hours?: Json | null
          total_matches_hosted?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          verified_members?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "club_stats_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "club_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          status: string | null
          updated_at: string
          verified: boolean | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          status?: string | null
          updated_at?: string
          verified?: boolean | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          status?: string | null
          updated_at?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_opponents: {
        Row: {
          created_at: string | null
          id: string
          last_played: string | null
          losses: number | null
          matches_count: number | null
          opponent_id: string
          player_id: string
          updated_at: string | null
          wins: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_played?: string | null
          losses?: number | null
          matches_count?: number | null
          opponent_id: string
          player_id: string
          updated_at?: string | null
          wins?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_played?: string | null
          losses?: number | null
          matches_count?: number | null
          opponent_id?: string
          player_id?: string
          updated_at?: string | null
          wins?: number | null
        }
        Relationships: []
      }
      leaderboards: {
        Row: {
          city: string | null
          created_at: string | null
          district: string | null
          id: string
          month: number
          player_id: string
          position: number | null
          rank_category: string | null
          ranking_points: number | null
          total_matches: number | null
          total_wins: number | null
          updated_at: string | null
          win_rate: number | null
          year: number
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          district?: string | null
          id?: string
          month: number
          player_id: string
          position?: number | null
          rank_category?: string | null
          ranking_points?: number | null
          total_matches?: number | null
          total_wins?: number | null
          updated_at?: string | null
          win_rate?: number | null
          year: number
        }
        Update: {
          city?: string | null
          created_at?: string | null
          district?: string | null
          id?: string
          month?: number
          player_id?: string
          position?: number | null
          rank_category?: string | null
          ranking_points?: number | null
          total_matches?: number | null
          total_wins?: number | null
          updated_at?: string | null
          win_rate?: number | null
          year?: number
        }
        Relationships: []
      }
      live_streams: {
        Row: {
          club_id: string | null
          created_at: string | null
          description: string | null
          ended_at: string | null
          id: string
          is_featured: boolean | null
          match_id: string | null
          metadata: Json | null
          started_at: string | null
          status: string | null
          stream_key: string
          stream_url: string | null
          streamer_id: string
          title: string
          tournament_id: string | null
          updated_at: string | null
          viewer_count: number | null
        }
        Insert: {
          club_id?: string | null
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          is_featured?: boolean | null
          match_id?: string | null
          metadata?: Json | null
          started_at?: string | null
          status?: string | null
          stream_key: string
          stream_url?: string | null
          streamer_id: string
          title: string
          tournament_id?: string | null
          updated_at?: string | null
          viewer_count?: number | null
        }
        Update: {
          club_id?: string | null
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          is_featured?: boolean | null
          match_id?: string | null
          metadata?: Json | null
          started_at?: string | null
          status?: string | null
          stream_key?: string
          stream_url?: string | null
          streamer_id?: string
          title?: string
          tournament_id?: string | null
          updated_at?: string | null
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "live_streams_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_streams_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_streams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      match_history: {
        Row: {
          action_data: Json | null
          action_type: string
          created_at: string | null
          id: string
          match_id: string | null
          user_id: string | null
        }
        Insert: {
          action_data?: Json | null
          action_type: string
          created_at?: string | null
          id?: string
          match_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_data?: Json | null
          action_type?: string
          created_at?: string | null
          id?: string
          match_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_history_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          match_id: string
          rated_player_id: string
          rater_id: string
          skill_assessment: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          match_id: string
          rated_player_id: string
          rater_id: string
          skill_assessment: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          match_id?: string
          rated_player_id?: string
          rater_id?: string
          skill_assessment?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_ratings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          challenge_id: string | null
          club_id: string | null
          created_at: string
          id: string
          played_at: string | null
          player1_id: string
          player2_id: string
          score_player1: number | null
          score_player2: number | null
          status: string | null
          tournament_id: string | null
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          club_id?: string | null
          created_at?: string
          id?: string
          played_at?: string | null
          player1_id: string
          player2_id: string
          score_player1?: number | null
          score_player2?: number | null
          status?: string | null
          tournament_id?: string | null
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          club_id?: string | null
          created_at?: string
          id?: string
          played_at?: string | null
          player1_id?: string
          player2_id?: string
          score_player1?: number | null
          score_player2?: number | null
          status?: string | null
          tournament_id?: string | null
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          club_id: string
          created_at: string
          id: string
          joined_at: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          club_id: string
          created_at?: string
          id?: string
          joined_at?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          club_id?: string
          created_at?: string
          id?: string
          joined_at?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          deleted_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          priority: string | null
          sender_id: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          priority?: string | null
          sender_id?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          sender_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          seller_id: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          seller_id?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          seller_id?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string | null
          contact_info: Json
          created_at: string | null
          delivered_at: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          shipped_at: string | null
          shipping_address: Json
          status: string | null
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id?: string | null
          contact_info: Json
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipped_at?: string | null
          shipping_address: Json
          status?: string | null
          total_amount: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string | null
          contact_info?: Json
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipped_at?: string | null
          shipping_address?: Json
          status?: string | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      player_availability: {
        Row: {
          available_until: string | null
          created_at: string | null
          id: string
          location: string | null
          max_distance_km: number | null
          preferred_time: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_until?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          max_distance_km?: number | null
          preferred_time?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_until?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          max_distance_km?: number | null
          preferred_time?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      player_rankings: {
        Row: {
          created_at: string | null
          current_rank_id: string | null
          id: string
          player_id: string | null
          rank_points: number | null
          season_start: string | null
          spa_points: number | null
          total_matches: number | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
          wins: number | null
        }
        Insert: {
          created_at?: string | null
          current_rank_id?: string | null
          id?: string
          player_id?: string | null
          rank_points?: number | null
          season_start?: string | null
          spa_points?: number | null
          total_matches?: number | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          wins?: number | null
        }
        Update: {
          created_at?: string | null
          current_rank_id?: string | null
          id?: string
          player_id?: string | null
          rank_points?: number | null
          season_start?: string | null
          spa_points?: number | null
          total_matches?: number | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_rankings_current_rank_id_fkey"
            columns: ["current_rank_id"]
            isOneToOne: false
            referencedRelation: "ranks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_rankings_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "player_rankings_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "club_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_stats: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_match_date: string | null
          longest_streak: number | null
          matches_lost: number | null
          matches_played: number | null
          matches_won: number | null
          player_id: string
          total_points_lost: number | null
          total_points_won: number | null
          updated_at: string | null
          win_rate: number | null
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_match_date?: string | null
          longest_streak?: number | null
          matches_lost?: number | null
          matches_played?: number | null
          matches_won?: number | null
          player_id: string
          total_points_lost?: number | null
          total_points_won?: number | null
          updated_at?: string | null
          win_rate?: number | null
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_match_date?: string | null
          longest_streak?: number | null
          matches_lost?: number | null
          matches_played?: number | null
          matches_won?: number | null
          player_id?: string
          total_points_lost?: number | null
          total_points_won?: number | null
          updated_at?: string | null
          win_rate?: number | null
        }
        Relationships: []
      }
      player_trust_scores: {
        Row: {
          created_at: string
          flag_status: string | null
          id: string
          last_calculated_at: string | null
          negative_reports_count: number | null
          player_id: string
          positive_ratings: number | null
          total_ratings: number | null
          trust_percentage: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          flag_status?: string | null
          id?: string
          last_calculated_at?: string | null
          negative_reports_count?: number | null
          player_id: string
          positive_ratings?: number | null
          total_ratings?: number | null
          trust_percentage?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          flag_status?: string | null
          id?: string
          last_calculated_at?: string | null
          negative_reports_count?: number | null
          player_id?: string
          positive_ratings?: number | null
          total_ratings?: number | null
          trust_percentage?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          likes_count: number
          parent_comment_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes_count: number
          metadata: Json | null
          post_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          metadata?: Json | null
          post_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          metadata?: Json | null
          post_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          notes: string | null
          player1_id: string
          player2_id: string
          scheduled_time: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          player1_id: string
          player2_id: string
          scheduled_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          player1_id?: string
          player2_id?: string
          scheduled_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          helpful_votes: number | null
          id: string
          product_id: string | null
          rating: number
          reviewer_id: string | null
          title: string | null
          updated_at: string | null
          verified_purchase: boolean | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          product_id?: string | null
          rating: number
          reviewer_id?: string | null
          title?: string | null
          updated_at?: string | null
          verified_purchase?: boolean | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          product_id?: string | null
          rating?: number
          reviewer_id?: string | null
          title?: string | null
          updated_at?: string | null
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_wishlist: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category: string
          condition: string | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          name: string
          price: number
          seller_id: string | null
          specifications: Json | null
          status: string | null
          stock_quantity: number | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          category: string
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          name: string
          price: number
          seller_id?: string | null
          specifications?: Json | null
          status?: string | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          category?: string
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          name?: string
          price?: number
          seller_id?: string | null
          specifications?: Json | null
          status?: string | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_role: string | null
          avatar_url: string | null
          ban_expires_at: string | null
          ban_reason: string | null
          ban_status: string | null
          bio: string | null
          city: string | null
          club_id: string | null
          created_at: string
          display_name: string | null
          district: string | null
          elo: number | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          member_since: string | null
          nickname: string | null
          phone: string | null
          rank_verified_at: string | null
          rank_verified_by: string | null
          role: string | null
          skill_level: string | null
          updated_at: string
          user_id: string
          verified_rank: string | null
        }
        Insert: {
          active_role?: string | null
          avatar_url?: string | null
          ban_expires_at?: string | null
          ban_reason?: string | null
          ban_status?: string | null
          bio?: string | null
          city?: string | null
          club_id?: string | null
          created_at?: string
          display_name?: string | null
          district?: string | null
          elo?: number | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          member_since?: string | null
          nickname?: string | null
          phone?: string | null
          rank_verified_at?: string | null
          rank_verified_by?: string | null
          role?: string | null
          skill_level?: string | null
          updated_at?: string
          user_id: string
          verified_rank?: string | null
        }
        Update: {
          active_role?: string | null
          avatar_url?: string | null
          ban_expires_at?: string | null
          ban_reason?: string | null
          ban_status?: string | null
          bio?: string | null
          city?: string | null
          club_id?: string | null
          created_at?: string
          display_name?: string | null
          district?: string | null
          elo?: number | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          member_since?: string | null
          nickname?: string | null
          phone?: string | null
          rank_verified_at?: string | null
          rank_verified_by?: string | null
          role?: string | null
          skill_level?: string | null
          updated_at?: string
          user_id?: string
          verified_rank?: string | null
        }
        Relationships: []
      }
      rank_adjustments: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          club_id: string
          club_notes: string | null
          created_at: string
          current_rank: string
          id: string
          match_history: string | null
          player_id: string
          reason: string
          rejection_reason: string | null
          requested_rank: string
          status: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          club_id: string
          club_notes?: string | null
          created_at?: string
          current_rank: string
          id?: string
          match_history?: string | null
          player_id: string
          reason: string
          rejection_reason?: string | null
          requested_rank: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          club_id?: string
          club_notes?: string | null
          created_at?: string
          current_rank?: string
          id?: string
          match_history?: string | null
          player_id?: string
          reason?: string
          rejection_reason?: string | null
          requested_rank?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rank_adjustments_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "club_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rank_reports: {
        Row: {
          actual_skill_assessment: string | null
          admin_notes: string | null
          created_at: string
          description: string | null
          evidence_photos: string[] | null
          id: string
          match_id: string | null
          report_type: string | null
          reported_player_id: string
          reported_rank: string | null
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          actual_skill_assessment?: string | null
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          evidence_photos?: string[] | null
          id?: string
          match_id?: string | null
          report_type?: string | null
          reported_player_id: string
          reported_rank?: string | null
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          actual_skill_assessment?: string | null
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          evidence_photos?: string[] | null
          id?: string
          match_id?: string | null
          report_type?: string | null
          reported_player_id?: string
          reported_rank?: string | null
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rank_reports_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      rank_verifications: {
        Row: {
          club_id: string
          club_notes: string | null
          created_at: string
          current_rank: string | null
          id: string
          player_id: string
          proof_photos: string[] | null
          rejection_reason: string | null
          requested_rank: string
          status: string | null
          test_result: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          club_id: string
          club_notes?: string | null
          created_at?: string
          current_rank?: string | null
          id?: string
          player_id: string
          proof_photos?: string[] | null
          rejection_reason?: string | null
          requested_rank: string
          status?: string | null
          test_result?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          club_id?: string
          club_notes?: string | null
          created_at?: string
          current_rank?: string | null
          id?: string
          player_id?: string
          proof_photos?: string[] | null
          rejection_reason?: string | null
          requested_rank?: string
          status?: string | null
          test_result?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rank_verifications_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "club_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_history: {
        Row: {
          id: string
          new_rank_id: string | null
          old_rank_id: string | null
          player_id: string | null
          promotion_date: string | null
          season: number | null
          total_points_earned: number | null
        }
        Insert: {
          id?: string
          new_rank_id?: string | null
          old_rank_id?: string | null
          player_id?: string | null
          promotion_date?: string | null
          season?: number | null
          total_points_earned?: number | null
        }
        Update: {
          id?: string
          new_rank_id?: string | null
          old_rank_id?: string | null
          player_id?: string | null
          promotion_date?: string | null
          season?: number | null
          total_points_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ranking_history_new_rank_id_fkey"
            columns: ["new_rank_id"]
            isOneToOne: false
            referencedRelation: "ranks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_history_old_rank_id_fkey"
            columns: ["old_rank_id"]
            isOneToOne: false
            referencedRelation: "ranks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_history_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ranks: {
        Row: {
          code: string
          created_at: string | null
          id: string
          level: number
          name: string
          requirements: Json | null
          skill_description: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          level: number
          name: string
          requirements?: Json | null
          skill_description?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          level?: number
          name?: string
          requirements?: Json | null
          skill_description?: string | null
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          id: string
          points_cost: number
          redeemed_at: string | null
          reward_type: string
          reward_value: string
          status: string | null
          user_id: string
        }
        Insert: {
          id?: string
          points_cost: number
          redeemed_at?: string | null
          reward_type: string
          reward_value: string
          status?: string | null
          user_id: string
        }
        Update: {
          id?: string
          points_cost?: number
          redeemed_at?: string | null
          reward_type?: string
          reward_value?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      seller_profiles: {
        Row: {
          business_license: string | null
          business_name: string | null
          business_type: string | null
          contact_info: Json | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          rating: number | null
          return_policies: string | null
          shipping_policies: string | null
          social_links: Json | null
          tax_id: string | null
          total_reviews: number | null
          total_sales: number | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
        }
        Insert: {
          business_license?: string | null
          business_name?: string | null
          business_type?: string | null
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          rating?: number | null
          return_policies?: string | null
          shipping_policies?: string | null
          social_links?: Json | null
          tax_id?: string | null
          total_reviews?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
        }
        Update: {
          business_license?: string | null
          business_name?: string | null
          business_type?: string | null
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          rating?: number | null
          return_policies?: string | null
          shipping_policies?: string | null
          social_links?: Json | null
          tax_id?: string | null
          total_reviews?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      shopping_cart: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      spa_points_log: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          player_id: string | null
          points_earned: number
          source_id: string | null
          source_type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          player_id?: string | null
          points_earned: number
          source_id?: string | null
          source_type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          player_id?: string | null
          points_earned?: number
          source_id?: string | null
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spa_points_log_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      system_logs: {
        Row: {
          created_at: string | null
          id: string
          log_type: string
          message: string
          metadata: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          log_type: string
          message: string
          metadata?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          log_type?: string
          message?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      table_bookings: {
        Row: {
          booking_date: string
          check_in_time: string | null
          check_out_time: string | null
          club_id: string
          created_at: string | null
          duration_hours: number
          end_time: string
          hourly_rate: number
          id: string
          notes: string | null
          payment_status: string | null
          start_time: string
          status: string | null
          table_number: number
          total_cost: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_date: string
          check_in_time?: string | null
          check_out_time?: string | null
          club_id: string
          created_at?: string | null
          duration_hours: number
          end_time: string
          hourly_rate: number
          id?: string
          notes?: string | null
          payment_status?: string | null
          start_time: string
          status?: string | null
          table_number: number
          total_cost: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_date?: string
          check_in_time?: string | null
          check_out_time?: string | null
          club_id?: string
          created_at?: string | null
          duration_hours?: number
          end_time?: string
          hourly_rate?: number
          id?: string
          notes?: string | null
          payment_status?: string | null
          start_time?: string
          status?: string | null
          table_number?: number
          total_cost?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_bookings_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_brackets: {
        Row: {
          bracket_data: Json
          bracket_type: string | null
          created_at: string | null
          current_round: number | null
          id: string
          total_rounds: number
          tournament_id: string
          updated_at: string | null
        }
        Insert: {
          bracket_data: Json
          bracket_type?: string | null
          created_at?: string | null
          current_round?: number | null
          id?: string
          total_rounds: number
          tournament_id: string
          updated_at?: string | null
        }
        Update: {
          bracket_data?: Json
          bracket_type?: string | null
          created_at?: string | null
          current_round?: number | null
          id?: string
          total_rounds?: number
          tournament_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_brackets_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_matches: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          created_at: string | null
          id: string
          match_number: number
          notes: string | null
          player1_id: string | null
          player2_id: string | null
          round_number: number
          scheduled_time: string | null
          score_player1: number | null
          score_player2: number | null
          status: string | null
          tournament_id: string | null
          updated_at: string | null
          winner_id: string | null
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          created_at?: string | null
          id?: string
          match_number: number
          notes?: string | null
          player1_id?: string | null
          player2_id?: string | null
          round_number: number
          scheduled_time?: string | null
          score_player1?: number | null
          score_player2?: number | null
          status?: string | null
          tournament_id?: string | null
          updated_at?: string | null
          winner_id?: string | null
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          created_at?: string | null
          id?: string
          match_number?: number
          notes?: string | null
          player1_id?: string | null
          player2_id?: string | null
          round_number?: number
          scheduled_time?: string | null
          score_player1?: number | null
          score_player2?: number | null
          status?: string | null
          tournament_id?: string | null
          updated_at?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_registrations: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          payment_status: string | null
          player_id: string | null
          registration_date: string | null
          registration_status: string | null
          seed_number: number | null
          tournament_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          player_id?: string | null
          registration_date?: string | null
          registration_status?: string | null
          seed_number?: number | null
          tournament_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          player_id?: string | null
          registration_date?: string | null
          registration_status?: string | null
          seed_number?: number | null
          tournament_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_registrations_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_results: {
        Row: {
          created_at: string | null
          elo_points_earned: number | null
          final_position: number
          id: string
          matches_lost: number | null
          matches_played: number | null
          matches_won: number | null
          performance_rating: number | null
          player_id: string | null
          prize_money: number | null
          tournament_id: string | null
        }
        Insert: {
          created_at?: string | null
          elo_points_earned?: number | null
          final_position: number
          id?: string
          matches_lost?: number | null
          matches_played?: number | null
          matches_won?: number | null
          performance_rating?: number | null
          player_id?: string | null
          prize_money?: number | null
          tournament_id?: string | null
        }
        Update: {
          created_at?: string | null
          elo_points_earned?: number | null
          final_position?: number
          id?: string
          matches_lost?: number | null
          matches_played?: number | null
          matches_won?: number | null
          performance_rating?: number | null
          player_id?: string | null
          prize_money?: number | null
          tournament_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_results_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          banner_image: string | null
          club_id: string | null
          contact_info: Json | null
          created_at: string
          created_by: string | null
          current_participants: number | null
          description: string | null
          end_date: string | null
          entry_fee: number | null
          first_prize: number | null
          game_format: string | null
          id: string
          max_participants: number | null
          min_trust_score: number | null
          name: string
          prize_pool: number | null
          rank_requirement: string[] | null
          registration_deadline: string | null
          registration_start: string | null
          rules: string | null
          second_prize: number | null
          start_date: string | null
          status: string | null
          third_prize: number | null
          tournament_type: string | null
          updated_at: string
          venue_address: string | null
        }
        Insert: {
          banner_image?: string | null
          club_id?: string | null
          contact_info?: Json | null
          created_at?: string
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          entry_fee?: number | null
          first_prize?: number | null
          game_format?: string | null
          id?: string
          max_participants?: number | null
          min_trust_score?: number | null
          name: string
          prize_pool?: number | null
          rank_requirement?: string[] | null
          registration_deadline?: string | null
          registration_start?: string | null
          rules?: string | null
          second_prize?: number | null
          start_date?: string | null
          status?: string | null
          third_prize?: number | null
          tournament_type?: string | null
          updated_at?: string
          venue_address?: string | null
        }
        Update: {
          banner_image?: string | null
          club_id?: string | null
          contact_info?: Json | null
          created_at?: string
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          entry_fee?: number | null
          first_prize?: number | null
          game_format?: string | null
          id?: string
          max_participants?: number | null
          min_trust_score?: number | null
          name?: string
          prize_pool?: number | null
          rank_requirement?: string[] | null
          registration_deadline?: string | null
          registration_start?: string | null
          rules?: string | null
          second_prize?: number | null
          start_date?: string | null
          status?: string | null
          third_prize?: number | null
          tournament_type?: string | null
          updated_at?: string
          venue_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_penalties: {
        Row: {
          appeal_date: string | null
          appeal_decision: string | null
          appeal_decision_date: string | null
          appeal_reason: string | null
          appeal_reviewed_by: string | null
          created_at: string
          end_date: string | null
          id: string
          issued_by: string | null
          penalty_type: string
          reason: string
          severity: string
          start_date: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          appeal_date?: string | null
          appeal_decision?: string | null
          appeal_decision_date?: string | null
          appeal_reason?: string | null
          appeal_reviewed_by?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          issued_by?: string | null
          penalty_type: string
          reason: string
          severity: string
          start_date?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          appeal_date?: string | null
          appeal_decision?: string | null
          appeal_decision_date?: string | null
          appeal_reason?: string | null
          appeal_reviewed_by?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          issued_by?: string | null
          penalty_type?: string
          reason?: string
          severity?: string
          start_date?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          language: string | null
          notification_challenges: boolean | null
          notification_marketing: boolean | null
          notification_tournaments: boolean | null
          privacy_show_phone: boolean | null
          privacy_show_stats: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          language?: string | null
          notification_challenges?: boolean | null
          notification_marketing?: boolean | null
          notification_tournaments?: boolean | null
          privacy_show_phone?: boolean | null
          privacy_show_stats?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          language?: string | null
          notification_challenges?: boolean | null
          notification_marketing?: boolean | null
          notification_tournaments?: boolean | null
          privacy_show_phone?: boolean | null
          privacy_show_stats?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_checkin_date: string | null
          longest_streak: number | null
          milestone_30_claimed: boolean | null
          milestone_60_claimed: boolean | null
          milestone_90_claimed: boolean | null
          total_points: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_checkin_date?: string | null
          longest_streak?: number | null
          milestone_30_claimed?: boolean | null
          milestone_60_claimed?: boolean | null
          milestone_90_claimed?: boolean | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_checkin_date?: string | null
          longest_streak?: number | null
          milestone_30_claimed?: boolean | null
          milestone_60_claimed?: boolean | null
          milestone_90_claimed?: boolean | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          points_amount: number | null
          reference_id: string | null
          status: string | null
          transaction_type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          points_amount?: number | null
          reference_id?: string | null
          status?: string | null
          transaction_type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          points_amount?: number | null
          reference_id?: string | null
          status?: string | null
          transaction_type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          points_balance: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          points_balance?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          points_balance?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_dashboard_stats: {
        Row: {
          metric_type: string | null
          stats: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_automatic_penalty: {
        Args: { player_uuid: string }
        Returns: undefined
      }
      apply_points_decay: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      approve_club_registration: {
        Args: {
          registration_id: string
          approver_id: string
          approved: boolean
          comments?: string
        }
        Returns: Json
      }
      award_challenge_points: {
        Args: {
          p_winner_id: string
          p_loser_id: string
          p_wager_points: number
          p_rank_difference?: number
        }
        Returns: number
      }
      award_tournament_points: {
        Args: {
          p_tournament_id: string
          p_player_id: string
          p_position: number
          p_player_rank: string
        }
        Returns: number
      }
      calculate_tournament_spa: {
        Args: { p_position: number; p_rank_code: string }
        Returns: number
      }
      calculate_trust_score: {
        Args: { player_uuid: string }
        Returns: undefined
      }
      check_rank_promotion: {
        Args: { p_player_id: string }
        Returns: boolean
      }
      check_season_reset: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_challenges: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      complete_challenge_match: {
        Args: {
          p_match_id: string
          p_winner_id: string
          p_loser_id: string
          p_wager_points?: number
        }
        Returns: Json
      }
      create_bulk_notifications: {
        Args: { notifications: Json }
        Returns: undefined
      }
      create_notification: {
        Args: {
          target_user_id: string
          notification_type: string
          notification_title: string
          notification_message: string
          notification_action_url?: string
          notification_metadata?: Json
          notification_priority?: string
        }
        Returns: string
      }
      daily_checkin: {
        Args: { user_uuid: string }
        Returns: Json
      }
      delete_club_completely: {
        Args: { club_profile_id: string; admin_id: string }
        Returns: Json
      }
      expire_old_challenges: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_notification_summary: {
        Args: { target_user_id: string }
        Returns: Json
      }
      get_user_admin_status: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mark_notifications_read: {
        Args: { notification_ids: string[] }
        Returns: undefined
      }
      populate_initial_leaderboard_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      recalculate_rankings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      redeem_reward: {
        Args: {
          user_uuid: string
          reward_type: string
          reward_value: string
          points_cost: number
        }
        Returns: Json
      }
      refresh_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_current_month_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_daily_challenges: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_season: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_monthly_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
