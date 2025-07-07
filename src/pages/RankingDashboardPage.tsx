import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ELORankingDashboard from '@/components/ranking/ELORankingDashboard';
import { SEOHead } from '@/components/SEOHead';

const RankingDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Hệ Thống Ranking ELO - SABO Pool Arena"
        description="Theo dõi và phân tích chi tiết thứ hạng ELO, lịch sử thay đổi ranking và thống kê hiệu suất thi đấu tại SABO Pool Arena"
        keywords="ELO ranking, bảng xếp hạng, thống kê billiards, SABO Pool Arena, phân tích ELO"
      />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <ELORankingDashboard />
      </main>
      
      <Footer />
    </div>
  );
};

export default RankingDashboardPage;