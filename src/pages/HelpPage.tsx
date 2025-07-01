import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Search,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Phone,
  Mail,
  HelpCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      // Mock FAQs data since faqs table doesn't exist
      const mockFaqs = [
        {
          id: '1',
          question: 'Làm thế nào để đăng ký tài khoản?',
          answer: 'Bạn có thể đăng ký tài khoản bằng cách nhấp vào nút "Đăng ký" và điền thông tin cần thiết.',
          category: 'account',
          status: 'active',
          order_index: 1,
        },
        {
          id: '2',
          question: 'Cách tham gia giải đấu?',
          answer: 'Để tham gia giải đấu, bạn cần có tài khoản và đăng ký trong thời gian quy định.',
          category: 'tournament',
          status: 'active',
          order_index: 2,
        },
      ];

      return mockFaqs;
    },
  });

  const filteredFaqs = faqs?.filter(faq => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'account', label: 'Tài khoản' },
    { value: 'ranking', label: 'Xếp hạng' },
    { value: 'challenges', label: 'Thách đấu' },
    { value: 'tournaments', label: 'Giải đấu' },
    { value: 'membership', label: 'Hội viên' },
    { value: 'clubs', label: 'CLB' },
    { value: 'points', label: 'Điểm số' },
    { value: 'profile', label: 'Hồ sơ' },
  ];

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Navigation />
        <div className='container mx-auto px-4 py-8 pt-24'>
          <div className='flex items-center justify-center h-64'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600'></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navigation />

      <main className='container mx-auto px-4 py-8 pt-24'>
        <div className='mb-8 text-center'>
          <div className='flex justify-center mb-4'>
            <div className='w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center'>
              <HelpCircle className='w-8 h-8 text-black' />
            </div>
          </div>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            Trung Tâm Trợ Giúp
          </h1>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            Tìm câu trả lời cho các câu hỏi thường gặp hoặc liên hệ với chúng
            tôi để được hỗ trợ
          </p>
        </div>

        {/* Search and Filter */}
        <Card className='mb-8'>
          <CardContent className='p-6'>
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <Input
                  placeholder='Tìm kiếm câu hỏi...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
              <div className='flex gap-2 flex-wrap'>
                {categories.map(category => (
                  <Button
                    key={category.value}
                    variant={
                      selectedCategory === category.value
                        ? 'default'
                        : 'outline'
                    }
                    size='sm'
                    onClick={() => setSelectedCategory(category.value)}
                    className={
                      selectedCategory === category.value
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black'
                        : ''
                    }
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='grid lg:grid-cols-3 gap-8'>
          {/* FAQ Section */}
          <div className='lg:col-span-2'>
            <h2 className='text-2xl font-bold mb-6'>Câu Hỏi Thường Gặp</h2>

            <div className='space-y-4'>
              {filteredFaqs?.map(faq => (
                <Card key={faq.id}>
                  <Collapsible
                    open={openItems.includes(faq.id)}
                    onOpenChange={() => toggleItem(faq.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className='cursor-pointer hover:bg-gray-50 transition-colors'>
                        <div className='flex justify-between items-start'>
                          <div className='flex-1'>
                            <CardTitle className='text-lg text-left'>
                              {faq.question}
                            </CardTitle>
                            <div className='flex items-center mt-2'>
                              <Badge variant='outline' className='mr-2'>
                                {
                                  categories.find(c => c.value === faq.category)
                                    ?.label
                                }
                              </Badge>
                            </div>
                          </div>
                          {openItems.includes(faq.id) ? (
                            <ChevronUp className='w-5 h-5 text-gray-400 ml-2' />
                          ) : (
                            <ChevronDown className='w-5 h-5 text-gray-400 ml-2' />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className='pt-0'>
                        <p className='text-gray-700 leading-relaxed'>
                          {faq.answer}
                        </p>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>

            {filteredFaqs?.length === 0 && (
              <Card className='text-center py-12'>
                <CardContent>
                  <Search className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    Không tìm thấy kết quả
                  </h3>
                  <p className='text-gray-600'>
                    Thử tìm kiếm với từ khóa khác hoặc liên hệ với chúng tôi để
                    được hỗ trợ
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contact Section */}
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <MessageCircle className='w-5 h-5 mr-2' />
                  Liên Hệ Hỗ Trợ
                </CardTitle>
                <CardDescription>
                  Không tìm thấy câu trả lời? Chúng tôi sẵn sàng giúp bạn!
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-4'>
                <div className='flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors'>
                  <Phone className='w-5 h-5 text-yellow-600' />
                  <div>
                    <div className='font-semibold'>Hotline</div>
                    <div className='text-sm text-gray-600'>
                      1900-SABO (7226)
                    </div>
                  </div>
                </div>

                <div className='flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors'>
                  <Mail className='w-5 h-5 text-yellow-600' />
                  <div>
                    <div className='font-semibold'>Email</div>
                    <div className='text-sm text-gray-600'>
                      support@sabopoolarena.com
                    </div>
                  </div>
                </div>

                <Button className='w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold'>
                  <MessageCircle className='w-4 h-4 mr-2' />
                  Chat Trực Tuyến
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Giờ Hỗ Trợ</CardTitle>
              </CardHeader>

              <CardContent className='space-y-2'>
                <div className='flex justify-between'>
                  <span>Thứ 2 - Thứ 6:</span>
                  <span className='font-semibold'>8:00 - 22:00</span>
                </div>
                <div className='flex justify-between'>
                  <span>Thứ 7 - Chủ nhật:</span>
                  <span className='font-semibold'>9:00 - 21:00</span>
                </div>
                <div className='text-sm text-gray-600 mt-3'>
                  * Hỗ trợ qua email 24/7
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HelpPage;
