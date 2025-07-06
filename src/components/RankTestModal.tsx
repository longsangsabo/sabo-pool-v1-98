import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Upload,
  Camera,
  Timer,
  User,
  PlayCircle,
  StopCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface RankTestModalProps {
  request: {
    id: string;
    player_id: string;
    requested_rank: string;
    status: string;
    profiles?: {
      full_name: string;
      phone: string;
    };
  };
  onStartTest: (id: string) => void;
  onCompleteTest: (id: string, status: 'approved' | 'rejected', result: TestResult) => void;
  processing: boolean;
}

interface TestResult {
  testDuration: number;
  testScore: number;
  skillLevel: 'excellent' | 'good' | 'average' | 'below_average';
  checklist: {
    technique: boolean;
    strategy: boolean;
    consistency: boolean;
    pressure_handling: boolean;
  };
  notes: string;
  proofPhotos?: string[];
}

const RankTestModal = ({ request, onStartTest, onCompleteTest, processing }: RankTestModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [testPhase, setTestPhase] = useState<'confirm' | 'testing' | 'result'>('confirm');
  const [testStartTime, setTestStartTime] = useState<number | null>(null);
  const [testDuration, setTestDuration] = useState(0);
  
  // Test result form state
  const [testScore, setTestScore] = useState<number>(0);
  const [skillLevel, setSkillLevel] = useState<'excellent' | 'good' | 'average' | 'below_average'>('average');
  const [checklist, setChecklist] = useState({
    technique: false,
    strategy: false,
    consistency: false,
    pressure_handling: false
  });
  const [notes, setNotes] = useState('');
  const [proofPhotos, setProofPhotos] = useState<string[]>([]);

  // Timer for test duration
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (testPhase === 'testing' && testStartTime) {
      interval = setInterval(() => {
        setTestDuration(Math.floor((Date.now() - testStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [testPhase, testStartTime]);

  const handleStartTest = () => {
    setTestStartTime(Date.now());
    setTestPhase('testing');
    onStartTest(request.id);
    toast.success('Đã bắt đầu test hạng. Hãy quan sát kỹ kỹ năng của người chơi!');
  };

  const handleStopTest = () => {
    if (testStartTime) {
      const finalDuration = Math.floor((Date.now() - testStartTime) / 1000);
      setTestDuration(finalDuration);
      setTestPhase('result');
    }
  };

  const handleCompleteTest = (status: 'approved' | 'rejected') => {
    const result: TestResult = {
      testDuration,
      testScore,
      skillLevel,
      checklist,
      notes,
      proofPhotos
    };

    onCompleteTest(request.id, status, result);
    setIsOpen(false);
    resetModal();
  };

  const resetModal = () => {
    setTestPhase('confirm');
    setTestStartTime(null);
    setTestDuration(0);
    setTestScore(0);
    setSkillLevel('average');
    setChecklist({
      technique: false,
      strategy: false,
      consistency: false,
      pressure_handling: false
    });
    setNotes('');
    setProofPhotos([]);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankInfo = (rank: string) => {
    const rankInfo: Record<string, { name: string; description: string; requirements: string[] }> = {
      'K': { 
        name: 'Hạng K (Mới học)', 
        description: 'Người chơi mới bắt đầu học bi-a',
        requirements: ['Biết cầm cơ đúng cách', 'Đánh được bi cơ bản', 'Hiểu luật chơi cơ bản']
      },
      'J': { 
        name: 'Hạng J (Sơ cấp)', 
        description: 'Người chơi đã nắm vững các kỹ thuật cơ bản',
        requirements: ['Đánh chính xác 7/10 bi dễ', 'Biết tính toán đường bi cơ bản', 'Có thể chơi liên tục 5-10 bi', 'Hiểu luật và phạm vi di chuyển bi']
      },
      'I': { 
        name: 'Hạng I (Trung bình thấp)', 
        description: 'Kỹ năng ổn định, bắt đầu áp dụng chiến thuật',
        requirements: ['Đánh chính xác 8/10 bi trung bình', 'Biết các kỹ thuật xoáy cơ bản', 'Có thể chơi liên tục 15-25 bi', 'Tính toán được 2-3 nước đi']
      },
      'I+': { 
        name: 'Hạng I+ (Trung bình)', 
        description: 'Người chơi có kỹ năng trung bình ổn định',
        requirements: ['Đánh chính xác 8.5/10 bi trung bình', 'Thành thạo kỹ thuật xoáy', 'Chơi liên tục 25-40 bi', 'Có chiến thuật phòng thủ tốt']
      },
      'H': { 
        name: 'Hạng H (Trung bình khá)', 
        description: 'Người chơi bắt đầu thể hiện kỹ năng tốt',
        requirements: ['Đánh chính xác 9/10 bi khó', 'Thành thạo nhiều kỹ thuật xoáy', 'Chơi liên tục 40-60 bi', 'Biết áp dụng chiến thuật tấn công']
      },
      'H+': { 
        name: 'Hạng H+ (Trung bình cao)', 
        description: 'Người chơi có kỹ năng khá ổn định',
        requirements: ['Đánh chính xác 9/10 bi khó', 'Thành thạo kỹ thuật safety', 'Chơi liên tục 60-80 bi', 'Có khả năng đọc bàn tốt']
      },
      'G': { 
        name: 'Hạng G (Khá)', 
        description: 'Người chơi có kỹ năng khá tốt, ít sai sót',
        requirements: ['Đánh chính xác 9.5/10 bi khó', 'Thành thạo break shot', 'Chơi liên tục 80-100 bi', 'Kiểm soát tốt tình huống khó']
      },
      'G+': { 
        name: 'Hạng G+ (Khá cao)', 
        description: 'Người chơi gần đạt trình độ giỏi',
        requirements: ['Đánh chính xác 9.5/10 bi rất khó', 'Thành thạo jump shot', 'Chơi liên tục 100+ bi', 'Có khả năng comeback mạnh']
      },
      'F': { 
        name: 'Hạng F (Giỏi)', 
        description: 'Người chơi có trình độ giỏi, ít khi sai sót',
        requirements: ['Đánh chính xác 95% các tình huống', 'Thành thạo masse shot', 'Run out table thường xuyên', 'Kiểm soát tuyệt đối cue ball']
      },
      'F+': { 
        name: 'Hạng F+ (Giỏi cao)', 
        description: 'Người chơi trình độ rất giỏi, gần như không sai sót',
        requirements: ['Đánh chính xác gần 98% tình huống', 'Thành thạo mọi kỹ thuật', 'Run out table > 80%', 'Có khả năng áp lực cao']
      },
      'E': { 
        name: 'Hạng E (Xuất sắc)', 
        description: 'Người chơi trình độ xuất sắc, gần như hoàn hảo',
        requirements: ['Đánh chính xác 98%+ mọi tình huống', 'Thành thạo trick shots', 'Run out table > 90%', 'Thống trị mọi đối thủ cùng hạng']
      },
      'E+': { 
        name: 'Hạng E+ (Chuyên nghiệp)', 
        description: 'Người chơi trình độ chuyên nghiệp, đỉnh cao kỹ thuật',
        requirements: ['Đánh chính xác gần 100%', 'Sáng tạo ra trick shots', 'Run out table > 95%', 'Có thể thi đấu chuyên nghiệp']
      }
    };

    return rankInfo[rank] || { name: rank, description: 'Hạng không xác định', requirements: [] };
  };

  const rankInfo = getRankInfo(request.requested_rank);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={processing}
          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          <PlayCircle className="w-4 h-4 mr-1" />
          Bắt đầu test
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-blue-600" />
            Test xác thực hạng {request.requested_rank}
          </DialogTitle>
        </DialogHeader>

        {/* Confirm Phase */}
        {testPhase === 'confirm' && (
          <div className="space-y-6">
            {/* Player Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Thông tin người chơi</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tên:</span>
                  <span className="font-medium ml-2">{request.profiles?.full_name || 'Chưa cập nhật'}</span>
                </div>
                <div>
                  <span className="text-gray-600">SĐT:</span>
                  <span className="font-medium ml-2">{request.profiles?.phone || 'Chưa cập nhật'}</span>
                </div>
              </div>
            </div>

            {/* Rank Requirements */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">{rankInfo.name}</h3>
              <p className="text-gray-600 mb-3">{rankInfo.description}</p>
              <div>
                <h4 className="font-medium mb-2">Yêu cầu kiểm tra:</h4>
                <ul className="space-y-1">
                  {rankInfo.requirements.map((req, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <strong className="text-yellow-800">Lưu ý quan trọng:</strong>
                  <ul className="mt-2 space-y-1 text-yellow-700">
                    <li>• Test kỹ lưỡng trước khi quyết định</li>
                    <li>• Ghi chú chi tiết quá trình test</li>
                    <li>• Chụp ảnh/quay video làm bằng chứng nếu cần</li>
                    <li>• Xác thực sai nhiều sẽ ảnh hưởng uy tín CLB</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleStartTest} className="bg-blue-600 hover:bg-blue-700">
                <PlayCircle className="w-4 h-4 mr-2" />
                Bắt đầu test ngay
              </Button>
            </div>
          </div>
        )}

        {/* Testing Phase */}
        {testPhase === 'testing' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <Timer className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-blue-600 mb-2">
                {formatDuration(testDuration)}
              </h3>
              <p className="text-gray-600">Đang test hạng {request.requested_rank}</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Đang quan sát:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                {rankInfo.requirements.map((req, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    {req}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Button 
                onClick={handleStopTest}
                className="bg-red-600 hover:bg-red-700"
                size="lg"
              >
                <StopCircle className="w-5 h-5 mr-2" />
                Kết thúc test
              </Button>
            </div>
          </div>
        )}

        {/* Result Phase */}
        {testPhase === 'result' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">Kết quả test</h3>
              <div className="text-lg text-blue-600">
                Thời gian test: {formatDuration(testDuration)}
              </div>
            </div>

            {/* Test Score */}
            <div>
              <Label className="text-base font-semibold">Điểm số test (0-100)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={testScore}
                onChange={(e) => setTestScore(Number(e.target.value))}
                className="mt-2"
                placeholder="Nhập điểm từ 0-100"
              />
            </div>

            {/* Skill Level */}
            <div>
              <Label className="text-base font-semibold">Đánh giá tổng thể</Label>
              <RadioGroup value={skillLevel} onValueChange={(value: any) => setSkillLevel(value)} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excellent" id="excellent" />
                  <Label htmlFor="excellent">Xuất sắc (≥90 điểm)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="good" id="good" />
                  <Label htmlFor="good">Tốt (70-89 điểm)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="average" id="average" />
                  <Label htmlFor="average">Trung bình (50-69 điểm)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="below_average" id="below_average" />
                  <Label htmlFor="below_average">Dưới trung bình (&lt;50 điểm)</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Checklist */}
            <div>
              <Label className="text-base font-semibold">Checklist kỹ năng</Label>
              <div className="mt-2 space-y-3">
                {Object.entries({
                  technique: 'Kỹ thuật cầm cơ và đánh bi',
                  strategy: 'Tư duy chiến thuật và tính toán',
                  consistency: 'Tính ổn định trong từng cú đánh',
                  pressure_handling: 'Xử lý tình huống khó và áp lực'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={checklist[key as keyof typeof checklist]}
                      onCheckedChange={(checked) => 
                        setChecklist(prev => ({ ...prev, [key]: !!checked }))
                      }
                    />
                    <Label htmlFor={key}>{label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-base font-semibold">Ghi chú chi tiết (bắt buộc)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mô tả chi tiết quá trình test, điểm mạnh/yếu của người chơi, lý do quyết định..."
                className="mt-2 min-h-[100px]"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setTestPhase('testing')}
                className="border-gray-300"
              >
                Quay lại
              </Button>
              <Button
                onClick={() => handleCompleteTest('rejected')}
                disabled={processing || !notes.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Từ chối
              </Button>
              <Button
                onClick={() => handleCompleteTest('approved')}
                disabled={processing || !notes.trim() || testScore < 50}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Duyệt hạng
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RankTestModal;