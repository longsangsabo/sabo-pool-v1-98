import { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

// Use Supabase's User type directly to avoid conflicts
export type User = SupabaseUser;

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  session: SupabaseSession | null;
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, fullName: string, referralCode?: string) => Promise<{ data?: any; error?: any }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: any }>;
  signInWithPhone: (phone: string, password: string) => Promise<{ error?: any }>;
  signUpWithEmail: (email: string, password: string, fullName: string, referralCode?: string) => Promise<{ data?: any; error?: any }>;
  signUpWithPhone: (phone: string, password: string, fullName: string, referralCode?: string) => Promise<{ data?: any; error?: any }>;
  signInWithFacebook: () => Promise<{ data?: any; error?: any }>;
  signInWithGoogle: () => Promise<{ data?: any; error?: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  full_name: string;
  nickname?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  bio?: string;
  avatar_url?: string;
  experience_years?: number;
  favorite_game_types?: string[];
  achievements?: string[];
  social_media_links?: Record<string, string>;
  privacy_settings?: Record<string, boolean>;
  notification_preferences?: Record<string, boolean>;
  current_rank: string;
  ranking_points: number;
  location?: string;
  club_id?: string;
  total_matches: number;
  wins: number;
  losses: number;
  current_streak: number;
  matches_played: number;
  matches_won: number;
  preferred_play_times?: string[];
  min_bet_points: number;
  max_bet_points: number;
  age?: number;
  preferred_club?: {
    name: string;
    address: string;
  };
  created_at: string;
  updated_at: string;
  clbVerified?: boolean;
  elo?: number;
  welcome_email_sent?: boolean;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  post_type: 'general' | 'match_result' | 'achievement' | 'tournament_win';
  type?: 'general' | 'match_result' | 'achievement' | 'tournament_win';
  stats?: {
    score?: string;
    opponent?: string;
    achievement?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  transaction_type: string;
  amount: number;
  description?: string;
  status: string;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
}

export interface TransactionMetadata {
  bank_account?: string;
  bank_name?: string;
  account_holder?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read_at?: string;
  created_at: string;
  priority?: 'low' | 'medium' | 'high';
  action_url?: string;
  metadata?: any;
  deleted_at?: string;
}

export interface Challenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  bet_points: number;
  message?: string;
  proposed_datetime?: string;
  confirmed_datetime?: string;
  proposed_club_id?: string;
  confirmed_club_id?: string;
  club_id?: string;
  challenger_profile?: UserProfile;
  challenged_profile?: UserProfile;
  club?: {
    id: string;
    name: string;
    address: string;
  };
  challenger?: {
    user_id: string;
    full_name: string;
    avatar_url?: string;
    current_rank: string;
  };
  challenged?: {
    user_id: string;
    full_name: string;
    avatar_url?: string;
    current_rank: string;
  };
}

export interface CreateChallengeData {
  challenged_id: string;
  bet_points: number;
  message?: string;
  proposed_datetime?: string;
}

export interface ChallengeProposal {
  proposed_datetime?: string;
  club_id?: string;
  message?: string;
}

export interface PlayerStats {
  id: string;
  user_id: string;
  username: string;
  current_rating: number;
  wins: number;
  losses: number;
  draws: number;
  total_games: number;
  matches_played: number;
  win_rate: number;
  current_streak: number;
  best_streak: number;
  elo_rating: number;
  rank: string;
  recent_form?: number;
  consistency_score?: number;
  rating_volatility?: number;
  highest_rating?: number;
  lowest_rating?: number;
  average_opponent_rating?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ProfileFormData {
  full_name: string;
  nickname?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  club_id?: string;
}

export interface Club {
  id: string;
  name: string;
  address: string;
  phone?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  location?: UserLocation;
  owner_id?: string;
  is_sabo_owned?: boolean;
  available_tables?: number;
  priority_score?: number;
  hourly_rate?: number;
  logo_url?: string;
  email?: string;
  table_count?: number;
  latitude?: number;
  longitude?: number;
}

export interface DiscoveryItem {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  distance?: number;
  location?: UserLocation;
  rank?: string;
  points?: number;
  type: 'player' | 'club' | 'tournament';
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  full_name: string;
  nickname?: string;
  current_rank: string;
  ranking_points: number;
  total_matches: number;
  wins: number;
  losses: number;
  location?: string;
  avatar_url?: string;
  win_rate?: number;
  current_streak?: number;
  club_name?: string;
  username?: string;
  elo?: number;
  matches_played?: number;
  rank?: number;
  last_played?: string;
  streak?: number;
  country?: string;
  city?: string;
  bio?: string;
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  tournament_type: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  game_format: '8_ball' | '9_ball' | '10_ball' | 'straight_pool';
  max_participants: number;
  current_participants: number;
  entry_fee: number;
  prize_pool: number;
  first_prize: number;
  second_prize: number;
  third_prize: number;
  status: 'upcoming' | 'registration_open' | 'registration_closed' | 'ongoing' | 'completed' | 'cancelled';
  tournament_start: string;
  tournament_end: string;
  registration_start: string;
  registration_end: string;
  venue_name?: string;
  venue_address?: string;
  rules?: string;
  organizer_id: string;
  club_id: string;
  created_at: string;
  updated_at: string;
  club?: Club;
  distance_km?: number;
  total_prize_pool?: number;
  venue?: string;
  match_type?: string;
  start_date?: string;
  clubs?: { name: string };
}

export interface TournamentFormData {
  name: string;
  description?: string;
  tournament_type: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  game_format: '8_ball' | '9_ball' | '10_ball' | 'straight_pool';
  max_participants: number;
  entry_fee: number;
  prize_pool: number;
  tournament_start: string;
  tournament_end: string;
  registration_start: string;
  registration_end: string;
  venue_name?: string;
  venue_address?: string;
  rules?: string;
  club_id?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
  max_distance_km?: number;
}

export interface Season {
  id: string;
  name: string;
  year: number;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  description?: string;
  total_prize_pool: number;
  total_tournaments: number;
  total_participants: number;
  current_participants?: number;
  max_participants?: number;
  type?: string;
  created_at: string;
  updated_at: string;
}

export interface SeasonStanding {
  id: string;
  season_id: string;
  user_id: string;
  total_elo_points: number;
  tournaments_played: number;
  best_finish: number;
  total_prize_money: number;
  current_rank: number;
  previous_rank?: number;
  rank_change?: number;
  created_at: string;
  updated_at: string;
  season?: Season;
  user?: UserProfile;
}

export interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  winner_id?: string;
  status: 'pending' | 'ongoing' | 'completed' | 'cancelled';
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  frames: number;
  created_at: string;
  updated_at: string;
  player1?: {
    id: string;
    username: string;
    avatar_url?: string;
    rank: string;
    elo_rating: number;
  };
  player2?: {
    id: string;
    username: string;
    avatar_url?: string;
    rank: string;
    elo_rating: number;
  };
}
