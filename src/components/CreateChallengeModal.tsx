import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Search, Trophy, DollarSign, MapPin, Clock } from 'lucide-react';

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChallengeCreated: () => void;
}

interface Player {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  current_rank?: string;
  spa_points?: number;
}

interface Club {
  id: string;
  club_name: string;
  address: string;
}

const BET_CONFIGURATIONS = [
  { points: 100, raceTO: 8, description: 'Thách đấu sơ cấp - Race to 8' },
  { points: 200, raceTO: 12, description: 'Thách đấu cơ bản - Race to 12' },
  { points: 300, raceTO: 14, description: 'Thách đấu trung bình - Race to 14' },
  { points: 400, raceTO: 16, description: 'Thách đấu trung cấp - Race to 16' },
  { points: 500, raceTO: 18, description: 'Thách đấu trung cao - Race to 18' },
  { points: 600, raceTO: 22, description: 'Thách đấu cao cấp - Race to 22' },
];

const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({
  isOpen,
  onClose,
  onChallengeCreated,
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedClub, setSelectedClub] = useState('');
  const [betPoints, setBetPoints] = useState(300);
  const [message, setMessage] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchClubs();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchPlayers();
    } else {
      setPlayers([]);
    }
  }, [searchTerm]);

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('club_profiles')
        .select('id, club_name, address')
        .eq('verification_status', 'approved')
        .order('club_name');

      if (error) throw error;
      setClubs(data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const searchPlayers = async () => {
    if (!user) return;
    
    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          avatar_url,
          player_rankings(current_rank_id, spa_points, ranks(code))
        `)
        .neq('user_id', user.id)
        .ilike('full_name', `%${searchTerm}%`)
        .limit(10);

      if (error) throw error;

      const formattedPlayers = data?.map(player => ({
        user_id: player.user_id,
        full_name: player.full_name || 'Người chơi',
        avatar_url: player.avatar_url,
        current_rank: player.player_rankings?.[0]?.ranks?.code || 'K',
        spa_points: player.player_rankings?.[0]?.spa_points || 0,
      })) || [];

      setPlayers(formattedPlayers);
    } catch (error) {
      console.error('Error searching players:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCreateChallenge = async () => {
    if (!user || !selectedPlayer) {
      toast.error('Vui lòng chọn đối thủ');
      return;
    }

    setLoading(true);
    try {
      const selectedConfig = BET_CONFIGURATIONS.find(config => config.points === betPoints);
      
      const { error } = await supabase
        .from('challenges')
        .insert({
          challenger_id: user.id,
          opponent_id: selectedPlayer.user_id,
          club_id: selectedClub || null,
          bet_points: betPoints,
          race_to: selectedConfig?.raceTO || 8,
          message: message || null,
          scheduled_time: scheduledTime ? new Date(scheduledTime).toISOString() : null,
          status: 'pending',
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
        });

      if (error) throw error;

      toast.success('Thách đấu đã được gửi thành công!');
      onChallengeCreated();
      handleClose();
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      toast.error('Lỗi khi tạo thách đấu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setPlayers([]);
    setSelectedPlayer(null);
    setSelectedClub('');
    setBetPoints(300);
    setMessage('');
    setScheduledTime('');
    onClose();
  };

  const selectedConfig = BET_CONFIGURATIONS.find(config => config.points === betPoints);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Tạo thách đấu mới
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Player Search */}
          <div className="space-y-2">
            <Label>Tìm kiếm đối thủ</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Nhập tên người chơi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {searchLoading && (
              <div className="text-sm text-gray-500">Đang tìm kiếm...</div>
            )}

            {players.length > 0 && (
              <div className="max-h-40 overflow-y-auto border rounded-lg">
                {players.map((player) => (
                  <div
                    key={player.user_id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 flex items-center gap-3 ${
                      selectedPlayer?.user_id === player.user_id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={player.avatar_url} />
                      <AvatarFallback>{player.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{player.full_name}</div>
                      <div className="text-sm text-gray-500">
                        Hạng {player.current_rank} • {player.spa_points} SPA
                      </div>
                    </div>
                    {selectedPlayer?.user_id === player.user_id && (
                      <Badge variant="default">Đã chọn</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedPlayer && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedPlayer.avatar_url} />
                    <AvatarFallback>{selectedPlayer.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Đối thủ: {selectedPlayer.full_name}</div>
                    <div className="text-sm text-gray-600">
                      Hạng {selectedPlayer.current_rank} • {selectedPlayer.spa_points} điểm SPA
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bet Configuration */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Mức cược & Luật chơi
            </Label>
            <Select value={betPoints.toString()} onValueChange={(value) => setBetPoints(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BET_CONFIGURATIONS.map((config) => (
                  <SelectItem key={config.points} value={config.points.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{config.points} điểm</span>
                      <span className="text-sm text-gray-500">{config.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedConfig && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-sm">
                  <strong>Luật chơi:</strong> Race to {selectedConfig.raceTO}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Người thắng nhận {selectedConfig.points} điểm, người thua mất {Math.floor(selectedConfig.points * 0.5)} điểm
                </div>
              </div>
            )}
          </div>

          {/* Club Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Câu lạc bộ (tùy chọn)
            </Label>
            <Select value={selectedClub} onValueChange={setSelectedClub}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn câu lạc bộ..." />
              </SelectTrigger>
              <SelectContent>
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    <div>
                      <div className="font-medium">{club.club_name}</div>
                      <div className="text-sm text-gray-500">{club.address}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scheduled Time */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Thời gian đề xuất (tùy chọn)
            </Label>
            <Input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label>Lời nhắn (tùy chọn)</Label>
            <Textarea
              placeholder="Thêm lời nhắn cho đối thủ..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Hủy
            </Button>
            <Button
              onClick={handleCreateChallenge}
              disabled={loading || !selectedPlayer}
              className="flex-1"
            >
              {loading ? 'Đang tạo...' : 'Tạo thách đấu'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChallengeModal;