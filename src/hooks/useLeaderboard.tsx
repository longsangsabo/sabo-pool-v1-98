
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export interface LeaderboardEntry {
  id: string;
  username: string;
  full_name: string;
  current_rank: string;
  ranking_points: number;
  total_matches: number;
  avatar_url: string;
  elo: number;
  wins: number;
  losses: number;
  matches_played: number;
  win_rate: number;
  rank: number;
  last_played: string;
  streak: number;
  country: string;
  city: string;
  location?: string;
  bio: string;
  user_id: string;
}

export interface LeaderboardFilters {
  sortBy: 'elo' | 'wins' | 'win_rate' | 'matches_played';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
  country?: string;
  city?: string;
  rankRange?: [number, number];
  eloRange?: [number, number];
  winRateRange?: [number, number];
  searchTerm?: string;
}

export interface LeaderboardStats {
  totalPlayers: number;
  averageElo: number;
  highestElo: number;
  lowestElo: number;
  activePlayers: number;
}

const defaultFilters: LeaderboardFilters = {
  sortBy: 'elo',
  sortOrder: 'desc',
  page: 1,
  pageSize: 20,
};

const initialStats: LeaderboardStats = {
  totalPlayers: 0,
  averageElo: 1500,
  highestElo: 2800,
  lowestElo: 800,
  activePlayers: 0,
};

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<LeaderboardFilters>(defaultFilters);
  const [stats, setStats] = useState<LeaderboardStats>(initialStats);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLeaderboard = async (
    currentFilters: LeaderboardFilters = filters
  ) => {
    setLoading(true);
    setError('');

    try {
      // Mock leaderboard data since profiles table doesn't have required fields
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          id: '1',
          username: 'ProPlayer1',
          full_name: 'Nguyễn Văn A',
          current_rank: 'A+',
          ranking_points: 1500,
          total_matches: 45,
          avatar_url: '',
          elo: 1600,
          wins: 35,
          losses: 10,
          matches_played: 45,
          win_rate: 77.8,
          rank: 1,
          last_played: new Date().toISOString(),
          streak: 5,
          country: 'Vietnam',
          city: 'Ho Chi Minh',
          location: 'Ho Chi Minh City',
          bio: 'Professional pool player',
          user_id: 'user1',
        },
        {
          id: '2',
          username: 'PoolMaster',
          full_name: 'Trần Văn B',
          current_rank: 'A',
          ranking_points: 1400,
          total_matches: 38,
          avatar_url: '',
          elo: 1500,
          wins: 28,
          losses: 10,
          matches_played: 38,
          win_rate: 73.7,
          rank: 2,
          last_played: new Date().toISOString(),
          streak: 3,
          country: 'Vietnam',
          city: 'Hanoi',
          location: 'Hanoi',
          bio: 'Pool enthusiast',
          user_id: 'user2',
        },
      ];

      setLeaderboard(mockLeaderboard);
      setTotalCount(mockLeaderboard.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
      setLeaderboard([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboardStats = async () => {
    try {
      // Mock implementation
      const mockStats: LeaderboardStats = {
        totalPlayers: 1500,
        averageElo: 1450,
        highestElo: 2500,
        lowestElo: 800,
        activePlayers: 875,
      };
      setStats(mockStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard stats');
      setStats(initialStats);
    }
  };

  useEffect(() => {
    fetchLeaderboard(filters);
    fetchLeaderboardStats();
  }, [filters]);

  const updateFilters = (newFilters: Partial<LeaderboardFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const goToPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const sortBy = (sortBy: LeaderboardFilters['sortBy']) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  };

  const search = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, searchTerm, page: 1 }));
  };

  return {
    leaderboard,
    loading,
    error,
    filters,
    stats,
    totalCount,
    updateFilters,
    goToPage,
    sortBy,
    search,
  };
};

// Fix the useQuery usage at line 381
export const useLeaderboardQuery = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('elo', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};
