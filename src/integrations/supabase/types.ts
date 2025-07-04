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
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          priority: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          priority?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_automatic_penalty: {
        Args: { player_uuid: string }
        Returns: undefined
      }
      calculate_trust_score: {
        Args: { player_uuid: string }
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
      expire_old_challenges: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      populate_initial_leaderboard_data: {
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
      refresh_current_month_leaderboard: {
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
