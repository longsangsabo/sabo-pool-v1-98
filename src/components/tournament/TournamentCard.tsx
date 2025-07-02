import React from 'react';
import { Calendar, MapPin, Users, Trophy, DollarSign, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tournament } from '@/types/tournament';

interface TournamentCardProps {
  tournament: Tournament;
  onRegister?: (tournamentId: string) => void;
  onView?: (tournamentId: string) => void;
  isRegistering?: boolean;
  isRegistered?: boolean;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  onRegister,
  onView,
  isRegistering,
  isRegistered,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'registration_open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Sắp diễn ra';
      case 'registration_open':
        return 'Đang mở đăng ký';
      case 'in_progress':
        return 'Đang thi đấu';
      case 'completed':
        return 'Đã kết thúc';
      default:
        return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrize = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getGameFormatText = (format: string) => {
    switch (format) {
      case '8_ball':
        return '8 Ball';
      case '9_ball':
        return '9 Ball';
      case '10_ball':
        return '10 Ball';
      case 'straight_pool':
        return 'Straight Pool';
      default:
        return format;
    }
  };

  const getTournamentTypeText = (type: string) => {
    switch (type) {
      case 'single_elimination':
        return 'Loại trực tiếp';
      case 'double_elimination':
        return 'Loại kép';
      case 'round_robin':
        return 'Vòng tròn';
      case 'handicap':
        return 'Handicap';
      default:
        return type;
    }
  };

  const isRegistrationOpen = tournament.status === 'registration_open';
  const isRegistrationClosed = new Date(tournament.registration_end || '') < new Date();
  const isFull = tournament.current_participants >= tournament.max_participants;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      {tournament.banner_image && (
        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 relative overflow-hidden">
          <img
            src={tournament.banner_image}
            alt={tournament.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge className={getStatusColor(tournament.status)}>
              {getStatusText(tournament.status)}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        {!tournament.banner_image && (
          <div className="flex justify-between items-start mb-2">
            <Badge className={getStatusColor(tournament.status)}>
              {getStatusText(tournament.status)}
            </Badge>
          </div>
        )}
        <CardTitle className="text-lg line-clamp-2">{tournament.name}</CardTitle>
        {tournament.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {tournament.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tournament Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs">{formatDate(tournament.tournament_start)}</span>
          </div>
          
          {tournament.venue_address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs truncate">{tournament.venue_address}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs">
              {tournament.current_participants}/{tournament.max_participants}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-primary">
              {formatPrize(tournament.prize_pool)}
            </span>
          </div>
        </div>

        {/* Tournament Details */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {getGameFormatText(tournament.game_format)}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {getTournamentTypeText(tournament.tournament_type)}
          </Badge>
          {tournament.entry_fee > 0 && (
            <Badge variant="outline" className="text-xs">
              <DollarSign className="w-3 h-3 mr-1" />
              {formatPrize(tournament.entry_fee)}
            </Badge>
          )}
        </div>

        {/* Registration Info */}
        {isRegistrationOpen && tournament.registration_end && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              Đóng đăng ký: {formatDate(tournament.registration_end)}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(tournament.id)}
            className="flex-1"
          >
            Xem chi tiết
          </Button>
          
          {isRegistrationOpen && !isRegistered && !isRegistrationClosed && !isFull && (
            <Button
              size="sm"
              onClick={() => onRegister?.(tournament.id)}
              disabled={isRegistering}
              className="flex-1"
            >
              {isRegistering ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          )}

          {isRegistered && (
            <Button size="sm" variant="secondary" disabled className="flex-1">
              Đã đăng ký
            </Button>
          )}

          {isRegistrationClosed && !isRegistered && (
            <Button size="sm" variant="secondary" disabled className="flex-1">
              Hết hạn đăng ký
            </Button>
          )}

          {isFull && !isRegistered && (
            <Button size="sm" variant="secondary" disabled className="flex-1">
              Đã đủ người
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentCard;