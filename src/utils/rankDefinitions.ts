export interface RankInfo {
  name: string;
  description: string;
  requirements: string[];
}

export const RANK_DEFINITIONS: Record<string, RankInfo> = {
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

export const getRankInfo = (rank: string): RankInfo => {
  return RANK_DEFINITIONS[rank] || { 
    name: rank, 
    description: 'Hạng không xác định', 
    requirements: [] 
  };
};

export const getAllRanks = (): string[] => {
  return Object.keys(RANK_DEFINITIONS);
};

export const getRanksByGroup = () => {
  return {
    beginner: ['K', 'J'],
    novice: ['I', 'I+'],
    intermediate: ['H', 'H+'],
    advanced: ['G', 'G+'],
    expert: ['F', 'F+'],
    master: ['E', 'E+']
  };
};