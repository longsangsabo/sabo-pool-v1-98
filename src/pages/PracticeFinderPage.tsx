import React from 'react';
import { Helmet } from 'react-helmet-async';
import PracticeFinder from '@/components/PracticeFinder';

const PracticeFinderPage = () => {
  return (
    <>
      <Helmet>
        <title>Tìm bạn tập - SABO Pool Arena</title>
        <meta name="description" content="Tìm kiếm bạn tập luyện bi-a cùng trình độ" />
      </Helmet>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Tìm bạn tập hôm nay
          </h1>
          <p className="text-gray-600">
            Kết nối với người chơi cùng trình độ để tập luyện và nâng cao kỹ năng
          </p>
        </div>

        <PracticeFinder />
      </div>
    </>
  );
};

export default PracticeFinderPage;