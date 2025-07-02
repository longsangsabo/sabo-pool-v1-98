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
          handicap_05_rank: number | null
          handicap_1_rank: number | null
          id: string
          opponent_id: string
          race_to: number | null
          scheduled_time: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          bet_points?: number | null
          challenger_id: string
          club_id?: string | null
          created_at?: string
          handicap_05_rank?: number | null
          handicap_1_rank?: number | null
          id?: string
          opponent_id: string
          race_to?: number | null
          scheduled_time?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          bet_points?: number | null
          challenger_id?: string
          club_id?: string | null
          created_at?: string
          handicap_05_rank?: number | null
          handicap_1_rank?: number | null
          id?: string
          opponent_id?: string
          race_to?: number | null
          scheduled_time?: string | null
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
      tournaments: {
        Row: {
          club_id: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          club_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          club_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
