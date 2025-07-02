import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface AvailablePlayer {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  verified_rank?: string;
  city?: string;
  district?: string;
  bio?: string;
}

const PracticeFinder = () => {
  const { user } = useAuth();
  const [selectedRank, setSelectedRank] = useState<string>('all');

  const { data: availablePlayers = [], isLoading } = useQuery({
    queryKey: ['available-players', selectedRank],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, verified_rank, city, district, bio')
        .neq('user_id', user.id)
        .not('verified_rank', 'is', null);

      // Filter by rank if selected
      if (selectedRank !== 'all') {
        query = query.eq('verified_rank', selectedRank);
      }

      const { data, error } = await query.limit(20);

      if (error) {
        console.error('Error fetching available players:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleInvitePlayer = (playerId: string, playerName: string) => {
    // For now, just show a toast - later we can implement actual invitations
    toast.success(`Đã gửi lời mời tập luyện đến ${playerName}!`);
  };

  const ranks = ['K1', 'K2', 'K3', 'H1', 'H2', 'H3', 'G1', 'G2', 'G3'];

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Vui lòng đăng nhập để tìm bạn tập</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Tìm bạn tập hôm nay
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rank Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedRank === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRank('all')}
          >
            Tất cả
          </Button>
          {ranks.map(rank => (
            <Button
              key={rank}
              variant={selectedRank === rank ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRank(rank)}
            >
              {rank}
            </Button>
          ))}
        </div>

        {/* Players List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="w-16 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : availablePlayers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Không tìm thấy người chơi nào</p>
            <p className="text-sm text-gray-400 mt-1">
              Thử thay đổi bộ lọc rank để tìm thêm người chơi
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availablePlayers.map(player => (
              <div
                key={player.user_id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={player.avatar_url} />
                  <AvatarFallback>
                    {player.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">
                      {player.full_name || 'Người chơi'}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {player.verified_rank || 'Chưa xác minh'}
                    </Badge>
                    {player.verified_rank && (
                      <Badge variant="outline" className="text-xs">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  
                  {(player.city || player.district) && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {[player.district, player.city].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  onClick={() => handleInvitePlayer(player.user_id, player.full_name)}
                  className="shrink-0"
                >
                  Mời tập
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3" />
            <span className="font-medium">Gợi ý:</span>
          </div>
          <p>
            Tìm người chơi cùng rank để tập luyện hiệu quả. 
            Lời mời sẽ được gửi qua thông báo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PracticeFinder;