import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Trophy,
  Users,
  Calendar,
  MapPin,
  ChevronRight,
  ChevronDown,
  Play,
  Check,
  X,
} from 'lucide-react';

interface Player {
  id: string;
  username: string;
  avatar_url?: string;
  rank: string;
  seed?: number;
}

interface Match {
  id: string;
  round: number;
  match_number: number;
  player1?: Player;
  player2?: Player;
  player1_score?: number;
  player2_score?: number;
  winner?: string;
  status: 'pending' | 'ongoing' | 'completed';
  scheduled_time?: Date;
  location?: string;
}

interface TournamentBracketProps {
  tournamentId: string;
  onMatchClick?: (match: Match) => void;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  tournamentId,
  onMatchClick,
}) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState<number>(1);

  useEffect(() => {
    fetchBracket();
  }, [tournamentId]);

  const fetchBracket = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock bracket data
      const mockMatches: Match[] = [
        // Round 1 (Quarter Finals)
        {
          id: '1-1',
          round: 1,
          match_number: 1,
          player1: { id: '1', username: 'player1', rank: 'A+', seed: 1 },
          player2: { id: '2', username: 'player2', rank: 'B+', seed: 8 },
          player1_score: 7,
          player2_score: 3,
          winner: '1',
          status: 'completed',
          scheduled_time: new Date(Date.now() - 1000 * 60 * 60 * 2),
        },
        {
          id: '1-2',
          round: 1,
          match_number: 2,
          player1: { id: '3', username: 'player3', rank: 'F+', seed: 4 },
          player2: { id: '4', username: 'player4', rank: 'F', seed: 5 },
          player1_score: 5,
          player2_score: 7,
          winner: '4',
          status: 'completed',
          scheduled_time: new Date(Date.now() - 1000 * 60 * 60 * 1),
        },
        {
          id: '1-3',
          round: 1,
          match_number: 3,
          player1: { id: '5', username: 'player5', rank: 'E+', seed: 3 },
          player2: { id: '6', username: 'player6', rank: 'I', seed: 6 },
          player1_score: 7,
          player2_score: 2,
          winner: '5',
          status: 'completed',
          scheduled_time: new Date(Date.now() - 1000 * 60 * 30),
        },
        {
          id: '1-4',
          round: 1,
          match_number: 4,
          player1: { id: '7', username: 'player7', rank: 'G+', seed: 2 },
          player2: { id: '8', username: 'player8', rank: 'G', seed: 7 },
          player1_score: 4,
          player2_score: 7,
          winner: '8',
          status: 'completed',
          scheduled_time: new Date(Date.now() - 1000 * 60 * 15),
        },

        // Round 2 (Semi Finals)
        {
          id: '2-1',
          round: 2,
          match_number: 1,
          player1: { id: '1', username: 'player1', rank: 'E+', seed: 1 },
          player2: { id: '4', username: 'player4', rank: 'F', seed: 5 },
          player1_score: 7,
          player2_score: 5,
          winner: '1',
          status: 'completed',
          scheduled_time: new Date(Date.now() + 1000 * 60 * 60 * 2),
        },
        {
          id: '2-2',
          round: 2,
          match_number: 2,
          player1: { id: '5', username: 'player5', rank: 'E+', seed: 3 },
          player2: { id: '8', username: 'player8', rank: 'G', seed: 7 },
          player1_score: 6,
          player2_score: 6,
          winner: undefined,
          status: 'ongoing',
          scheduled_time: new Date(Date.now() + 1000 * 60 * 30),
        },

        // Round 3 (Finals)
        {
          id: '3-1',
          round: 3,
          match_number: 1,
          player1: { id: '1', username: 'player1', rank: 'A+', seed: 1 },
          player2: undefined,
          status: 'pending',
          scheduled_time: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      ];

      setMatches(mockMatches);
    } catch (error) {
      console.error('Failed to fetch bracket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoundName = (round: number) => {
    switch (round) {
      case 1:
        return 'Tứ kết';
      case 2:
        return 'Bán kết';
      case 3:
        return 'Chung kết';
      default:
        return `Vòng ${round}`;
    }
  };

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchStatusName = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'ongoing':
        return 'Đang diễn ra';
      case 'pending':
        return 'Chờ đấu';
      default:
        return status;
    }
  };

  const getWinnerStyle = (playerId: string, winnerId?: string) => {
    if (!winnerId) return '';
    return playerId === winnerId
      ? 'bg-green-50 border-green-200'
      : 'bg-gray-50 border-gray-200';
  };

  const rounds = Array.from(new Set(matches.map(m => m.round))).sort(
    (a, b) => a - b
  );

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Round Navigation */}
      <div className='flex items-center gap-2 overflow-x-auto'>
        {rounds.map(round => (
          <Button
            key={round}
            variant={selectedRound === round ? 'default' : 'outline'}
            onClick={() => setSelectedRound(round)}
            className='whitespace-nowrap'
          >
            {getRoundName(round)}
          </Button>
        ))}
      </div>

      {/* Bracket Display */}
      <div className='space-y-4'>
        {matches
          .filter(match => match.round === selectedRound)
          .map(match => (
            <Card
              key={match.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                match.status === 'ongoing' ? 'ring-2 ring-yellow-500' : ''
              }`}
              onClick={() => onMatchClick?.(match)}
            >
              <CardContent className='p-4'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-2'>
                    <Badge className={getMatchStatusColor(match.status)}>
                      {getMatchStatusName(match.status)}
                    </Badge>
                    <span className='text-sm text-gray-600'>
                      Trận {match.match_number}
                    </span>
                  </div>

                  {match.scheduled_time && (
                    <div className='text-sm text-gray-600'>
                      {match.scheduled_time.toLocaleDateString('vi-VN')}
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  {/* Player 1 */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border ${getWinnerStyle(
                      match.player1?.id || '',
                      match.winner
                    )}`}
                  >
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src={match.player1?.avatar_url} />
                        <AvatarFallback>
                          {match.player1?.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='font-medium'>
                          {match.player1?.username || 'TBD'}
                        </div>
                        <div className='text-sm text-gray-600'>
                          Hạng {match.player1?.rank}{' '}
                          {match.player1?.seed && `(#${match.player1.seed})`}
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      {match.player1_score !== undefined && (
                        <span className='text-lg font-bold'>
                          {match.player1_score}
                        </span>
                      )}
                      {match.winner === match.player1?.id && (
                        <Check className='h-5 w-5 text-green-600' />
                      )}
                    </div>
                  </div>

                  {/* VS */}
                  <div className='text-center py-2'>
                    <div className='text-lg font-bold text-gray-400'>VS</div>
                  </div>

                  {/* Player 2 */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border ${getWinnerStyle(
                      match.player2?.id || '',
                      match.winner
                    )}`}
                  >
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src={match.player2?.avatar_url} />
                        <AvatarFallback>
                          {match.player2?.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='font-medium'>
                          {match.player2?.username || 'TBD'}
                        </div>
                        <div className='text-sm text-gray-600'>
                          Hạng {match.player2?.rank}{' '}
                          {match.player2?.seed && `(#${match.player2.seed})`}
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      {match.player2_score !== undefined && (
                        <span className='text-lg font-bold'>
                          {match.player2_score}
                        </span>
                      )}
                      {match.winner === match.player2?.id && (
                        <Check className='h-5 w-5 text-green-600' />
                      )}
                    </div>
                  </div>
                </div>

                {/* Match Actions */}
                {match.status === 'ongoing' && (
                  <div className='flex gap-2 mt-3 pt-3 border-t'>
                    <Button size='sm' className='flex-1'>
                      <Play className='h-4 w-4 mr-2' />
                      Theo dõi trực tiếp
                    </Button>
                    <Button variant='outline' size='sm'>
                      Cập nhật kết quả
                    </Button>
                  </div>
                )}

                {match.status === 'pending' &&
                  match.player1 &&
                  match.player2 && (
                    <div className='flex gap-2 mt-3 pt-3 border-t'>
                      <Button size='sm' className='flex-1'>
                        Bắt đầu trận đấu
                      </Button>
                      <Button variant='outline' size='sm'>
                        Lên lịch lại
                      </Button>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Tournament Progress */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Tiến độ giải đấu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {rounds.map(round => {
              const roundMatches = matches.filter(m => m.round === round);
              const completedMatches = roundMatches.filter(
                m => m.status === 'completed'
              );
              const progress =
                (completedMatches.length / roundMatches.length) * 100;

              return (
                <div key={round} className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>{getRoundName(round)}</span>
                    <span>
                      {completedMatches.length}/{roundMatches.length} trận
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-500 h-2 rounded-full transition-all'
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
