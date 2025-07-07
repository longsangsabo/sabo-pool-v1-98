import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trophy, 
  Users, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Shuffle, 
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import { useBracketGeneration, type SeedingOptions } from '@/hooks/useBracketGeneration';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface BracketGeneratorProps {
  tournamentId: string;
  onBracketGenerated?: () => void;
  className?: string;
}

export const BracketGenerator: React.FC<BracketGeneratorProps> = ({
  tournamentId,
  onBracketGenerated,
  className
}) => {
  const {
    isGenerating,
    isValidating,
    validateTournament,
    generateBracket,
    reseedTournament,
    fetchSeeding
  } = useBracketGeneration();

  const [validation, setValidation] = useState<any>(null);
  const [seedingMethod, setSeedingMethod] = useState<'elo_ranking' | 'registration_order' | 'random'>('elo_ranking');
  const [seeding, setSeeding] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    checkValidation();
    loadSeeding();
  }, [tournamentId]);

  const checkValidation = async () => {
    const result = await validateTournament(tournamentId);
    setValidation(result);
  };

  const loadSeeding = async () => {
    const seedingData = await fetchSeeding(tournamentId);
    setSeeding(seedingData);
  };

  const handleGenerateBracket = async (forceRegenerate = false) => {
    const options: SeedingOptions = {
      method: seedingMethod,
      forceRegenerate
    };

    const result = await generateBracket(tournamentId, options);
    
    if (result.success) {
      await checkValidation();
      await loadSeeding();
      onBracketGenerated?.();
    }
  };

  const handleReseed = async () => {
    const result = await reseedTournament(tournamentId, seedingMethod);
    
    if (result.success) {
      await loadSeeding();
      onBracketGenerated?.();
    }
  };

  const getSeedingMethodIcon = (method: string) => {
    switch (method) {
      case 'elo_ranking': return <TrendingUp className="h-4 w-4" />;
      case 'registration_order': return <Clock className="h-4 w-4" />;
      case 'random': return <Shuffle className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getSeedingMethodDescription = (method: string) => {
    switch (method) {
      case 'elo_ranking': return 'Xếp hạng theo điểm ELO (khuyến nghị)';
      case 'registration_order': return 'Theo thứ tự đăng ký';
      case 'random': return 'Ngẫu nhiên';
      default: return '';
    }
  };

  if (isValidating && !validation) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-2">Đang kiểm tra điều kiện...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Tạo Bảng Đấu Tự Động
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Validation Status */}
        {validation && (
          <Alert className={validation.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center gap-2">
              {validation.valid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={validation.valid ? 'text-green-800' : 'text-red-800'}>
                {validation.valid ? (
                  <div className="space-y-1">
                    <div>✓ Sẵn sàng tạo bảng đấu</div>
                    <div className="text-sm">
                      • {validation.participant_count} người tham gia
                      • Loại giải: {validation.tournament_type}
                      {validation.bracket_exists && ' • Bảng đấu đã tồn tại'}
                    </div>
                  </div>
                ) : (
                  validation.reason
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Seeding Method Selection */}
        {validation?.valid && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Phương thức xếp hạng
              </label>
              <Select value={seedingMethod} onValueChange={(value: any) => setSeedingMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elo_ranking">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <div>
                        <div>Điểm ELO</div>
                        <div className="text-xs text-muted-foreground">Khuyến nghị</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="registration_order">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <div>
                        <div>Thứ tự đăng ký</div>
                        <div className="text-xs text-muted-foreground">First come, first served</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="random">
                    <div className="flex items-center gap-2">
                      <Shuffle className="h-4 w-4" />
                      <div>
                        <div>Ngẫu nhiên</div>
                        <div className="text-xs text-muted-foreground">Công bằng nhất</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                {getSeedingMethodDescription(seedingMethod)}
              </p>
            </div>

            {/* Current Seeding Preview */}
            {seeding.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Thứ tự hiện tại</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? 'Ẩn' : 'Xem chi tiết'}
                  </Button>
                </div>
                
                {showAdvanced && (
                  <div className="border rounded-lg p-4 max-h-60 overflow-y-auto bg-muted/30">
                    <div className="space-y-2">
                      {seeding.map((seed) => (
                        <div key={seed.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="w-8 justify-center">
                              {seed.seed_position}
                            </Badge>
                            <span className={seed.is_bye ? 'text-muted-foreground' : ''}>
                              {seed.is_bye ? 'BYE' : seed.player?.full_name || seed.player?.display_name || 'Unknown'}
                            </span>
                          </div>
                          {!seed.is_bye && (
                            <Badge variant="secondary">
                              ELO: {seed.elo_rating}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {validation?.valid && (
          <div className="flex flex-col gap-3">
            {!validation.bracket_exists ? (
              <Button 
                onClick={() => handleGenerateBracket(false)}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Đang tạo bảng đấu...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Tạo Bảng Đấu
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-2">
                <Button 
                  onClick={() => handleGenerateBracket(true)}
                  disabled={isGenerating}
                  variant="destructive"
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Đang tạo lại...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Tạo Lại Bảng Đấu
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleReseed}
                  disabled={isGenerating}
                  variant="outline"
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Đang sắp xếp...</span>
                    </>
                  ) : (
                    <>
                      {getSeedingMethodIcon(seedingMethod)}
                      <span className="ml-2">Sắp Xếp Lại</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Algorithm Info */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <div className="font-medium mb-1">🔧 Thuật toán bracket:</div>
          <ul className="space-y-1 ml-2">
            <li>• Tự động tính toán kích thước bracket (power of 2)</li>
            <li>• Thêm bye slots nếu cần thiết</li>
            <li>• Hỗ trợ Single/Double Elimination, Round Robin</li>
            <li>• Thời gian tạo &lt; 500ms cho 64 người</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};