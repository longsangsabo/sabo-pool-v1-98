import React, { useState, useEffect } from 'react';
import { useMarketplace } from '@/hooks/useMarketplace';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Heart,
  ShoppingCart,
  Star,
  MapPin,
  Truck,
  MessageCircle,
  Shield,
  Award,
  Clock,
  Eye,
  TrendingUp,
  Users,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

const EnhancedMarketplacePage = () => {
  const { items, loading, fetchItems } = useMarketplace();
  const [filteredItems, setFilteredItems] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    province_id: '',
    club_id: '',
    condition: '',
    price_range: '',
    seller_type: '',
    has_shipping: false,
    trusted_seller: false,
  });

  const categories = [
    { id: 'all', name: 'Tất cả', icon: '🎯' },
    { id: 'cue_stick', name: 'Gậy Cơ', icon: '🎱' },
    { id: 'accessories', name: 'Phụ Kiện', icon: '⚙️' },
    { id: 'table', name: 'Bàn Bida', icon: '🟢' },
    { id: 'case', name: 'Hộp Đựng', icon: '💼' },
    { id: 'chalk', name: 'Phấn', icon: '🧊' },
    { id: 'cloth', name: 'Nỉ Bàn', icon: '🟩' },
  ];

  const conditions = [
    { id: 'new', name: 'Mới 100%', color: 'bg-green-100 text-green-800' },
    { id: 'like_new', name: 'Như mới', color: 'bg-blue-100 text-blue-800' },
    { id: 'good', name: 'Tốt', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'fair', name: 'Khá', color: 'bg-orange-100 text-orange-800' },
    { id: 'poor', name: 'Cũ', color: 'bg-red-100 text-red-800' },
  ];

  const priceRanges = [
    { id: '', name: 'Tất cả mức giá' },
    { id: '0-1000000', name: 'Dưới 1 triệu' },
    { id: '1000000-5000000', name: '1 - 5 triệu' },
    { id: '5000000-10000000', name: '5 - 10 triệu' },
    { id: '10000000-50000000', name: '10 - 50 triệu' },
    { id: '50000000-999999999', name: 'Trên 50 triệu' },
  ];

  useEffect(() => {
    fetchProvinces();
    fetchClubs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, searchTerm, filters]);

  const fetchProvinces = async () => {
    try {
      // Mock provinces data since provinces table doesn't exist
      const mockProvinces = [
        { id: '1', name: 'Hà Nội', code: 'HN', region: 'north' },
        { id: '2', name: 'Hồ Chí Minh', code: 'HCM', region: 'south' },
        { id: '3', name: 'Đà Nẵng', code: 'DN', region: 'central' },
      ];

      setProvinces(mockProvinces);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const fetchClubs = async () => {
    try {
      const { data } = await supabase
        .from('clubs')
        .select('id, name, province_id')
        .eq('status', 'active')
        .order('name');

      setClubs(data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        item =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    // Condition filter
    if (filters.condition) {
      filtered = filtered.filter(item => item.condition === filters.condition);
    }

    // Price range filter
    if (filters.price_range) {
      const [min, max] = filters.price_range.split('-').map(Number);
      filtered = filtered.filter(
        item => item.price >= min && item.price <= max
      );
    }

    setFilteredItems(filtered);
  };

  const getConditionColor = condition => {
    const conditionObj = conditions.find(
      c => c.id === condition.toLowerCase().replace(' ', '_')
    );
    return conditionObj?.color || 'bg-gray-100 text-gray-800';
  };

  const getConditionText = condition => {
    const conditionObj = conditions.find(
      c => c.id === condition.toLowerCase().replace(' ', '_')
    );
    return conditionObj?.name || condition;
  };

  const getItemTags = item => {
    const tags = [];

    // Hot item (high views/favorites)
    if (item.views_count > 100 || item.favorites_count > 10) {
      tags.push({
        icon: '🔥',
        text: 'Hot',
        color: 'bg-red-100 text-red-800',
      });
    }

    // New listing
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceCreated <= 3) {
      tags.push({
        icon: '✨',
        text: 'Mới',
        color: 'bg-green-100 text-green-800',
      });
    }

    // Price drop
    if (item.original_price && item.original_price > item.price) {
      const discount = Math.round(
        ((item.original_price - item.price) / item.original_price) * 100
      );
      if (discount >= 20) {
        tags.push({
          icon: '💰',
          text: `-${discount}%`,
          color: 'bg-purple-100 text-purple-800',
        });
      }
    }

    // Brand item
    if (
      item.brand &&
      ['Predator', 'Diamond', 'Mezz', 'McDermott'].includes(item.brand)
    ) {
      tags.push({
        icon: '⭐',
        text: 'Hãng nổi tiếng',
        color: 'bg-yellow-100 text-yellow-800',
      });
    }

    return tags;
  };

  const getSellerBadges = item => {
    const badges = [];

    // Verified seller (has club_id)
    if (item.seller?.club_id) {
      badges.push({
        icon: <Shield className='w-3 h-3' />,
        text: 'Uy tín',
        color: 'bg-blue-100 text-blue-800',
      });
    }

    // Active seller (many items)
    if (item.seller?.total_items > 5) {
      badges.push({
        icon: <Award className='w-3 h-3' />,
        text: 'Người bán tích cực',
        color: 'bg-green-100 text-green-800',
      });
    }

    // Fast responder
    if (item.seller?.avg_response_time < 2) {
      badges.push({
        icon: <Clock className='w-3 h-3' />,
        text: 'Phản hồi nhanh',
        color: 'bg-indigo-100 text-indigo-800',
      });
    }

    return badges;
  };

  const formatPrice = price => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const ItemCard = ({ item }) => {
    const itemTags = getItemTags(item);
    const sellerBadges = getSellerBadges(item);

    return (
      <Card className='hover:shadow-lg transition-shadow cursor-pointer'>
        {/* Image Section */}
        <div className='relative'>
          <img
            src={item.images?.[0] || '/placeholder.svg'}
            alt={item.title}
            className='w-full h-48 object-cover rounded-t-lg'
          />

          {/* Condition Badge */}
          <div className='absolute top-2 left-2'>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}
            >
              {getConditionText(item.condition)}
            </span>
          </div>

          {/* Favorite Button */}
          <button className='absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50'>
            <Heart className='w-4 h-4 text-gray-600' />
          </button>

          {/* Multiple Images Indicator */}
          {item.images && item.images.length > 1 && (
            <div className='absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs'>
              +{item.images.length - 1} ảnh
            </div>
          )}
        </div>

        <CardContent className='p-4'>
          {/* Title & Price */}
          <div className='mb-2'>
            <h3 className='text-sm font-medium text-gray-900 line-clamp-2 mb-1'>
              {item.title}
            </h3>
            <div className='flex items-center justify-between'>
              <p className='text-lg font-bold text-blue-600'>
                {formatPrice(item.price)}
              </p>
              {item.original_price && item.original_price > item.price && (
                <p className='text-sm text-gray-500 line-through'>
                  {formatPrice(item.original_price)}
                </p>
              )}
            </div>
          </div>

          {/* Item Tags */}
          {itemTags.length > 0 && (
            <div className='flex flex-wrap gap-1 mb-3'>
              {itemTags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tag.color}`}
                >
                  <span className='mr-1'>{tag.icon}</span>
                  {tag.text}
                </span>
              ))}
              {itemTags.length > 2 && (
                <span className='text-xs text-gray-500'>
                  +{itemTags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Seller Info */}
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center space-x-2'>
              <div className='w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center'>
                {item.seller?.avatar_url ? (
                  <img
                    src={item.seller.avatar_url}
                    alt='Seller'
                    className='w-6 h-6 rounded-full object-cover'
                  />
                ) : (
                  <span className='text-white text-xs font-medium'>
                    {item.seller?.full_name?.charAt(0) || '?'}
                  </span>
                )}
              </div>
              <div>
                <p className='text-xs font-medium text-gray-900'>
                  {item.seller?.nickname || item.seller?.full_name || 'Unknown'}
                </p>
                <p className='text-xs text-gray-500'>
                  {item.location || 'Chưa rõ khu vực'}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className='flex items-center space-x-2 text-xs text-gray-500'>
              <span className='flex items-center'>
                <Eye className='w-3 h-3 mr-1' />
                {item.views_count}
              </span>
              <span className='flex items-center'>
                <Heart className='w-3 h-3 mr-1' />
                {item.favorites_count}
              </span>
            </div>
          </div>

          {/* Seller Badges */}
          {sellerBadges.length > 0 && (
            <div className='flex flex-wrap gap-1 mb-3'>
              {sellerBadges.map((badge, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
                >
                  {badge.icon}
                  <span className='ml-1'>{badge.text}</span>
                </span>
              ))}
            </div>
          )}

          {/* Location & Shipping */}
          <div className='flex items-center justify-between text-xs text-gray-500 mb-3'>
            <div className='flex items-center'>
              <MapPin className='w-3 h-3 mr-1' />
              {item.location || 'Chưa rõ'}
            </div>
            {item.shipping_available && (
              <div className='flex items-center'>
                <Truck className='w-3 h-3 mr-1' />
                Ship toàn quốc
              </div>
            )}
          </div>

          {/* Actions */}
          <div className='flex space-x-2'>
            <Button className='flex-1' size='sm'>
              Xem chi tiết
            </Button>
            <Button variant='outline' size='sm'>
              <MessageCircle className='w-4 h-4' />
            </Button>
          </div>

          {/* Posted Time */}
          <p className='text-xs text-gray-400 mt-2 text-center'>
            Đăng {new Date(item.created_at).toLocaleDateString('vi-VN')}
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className='container mx-auto px-4 py-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Chợ Bida Online
        </h1>
        <p className='text-gray-600'>
          Mua bán thiết bị bida chất lượng cao với hệ thống uy tín
        </p>
      </div>

      {/* Filters */}
      <div className='mb-6 space-y-4'>
        {/* Search Bar */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            placeholder='Tìm kiếm thiết bị bida...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>

        {/* Filter Row */}
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
          <Select
            value={filters.category}
            onValueChange={value =>
              setFilters(prev => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Danh mục' />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  <span className='flex items-center'>
                    <span className='mr-2'>{category.icon}</span>
                    {category.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.condition}
            onValueChange={value =>
              setFilters(prev => ({ ...prev, condition: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Tình trạng' />
            </SelectTrigger>
            <SelectContent>
              {conditions.map(condition => (
                <SelectItem key={condition.id} value={condition.id}>
                  {condition.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.price_range}
            onValueChange={value =>
              setFilters(prev => ({ ...prev, price_range: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Khoảng giá' />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map(range => (
                <SelectItem key={range.id} value={range.id}>
                  {range.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.province_id}
            onValueChange={value =>
              setFilters(prev => ({ ...prev, province_id: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Tỉnh/thành' />
            </SelectTrigger>
            <SelectContent>
              {provinces.map(province => (
                <SelectItem key={province.id} value={province.id}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant='outline' className='flex items-center gap-2'>
            <Filter className='w-4 h-4' />
            Bộ lọc
          </Button>

          <Button className='flex items-center gap-2'>
            <TrendingUp className='w-4 h-4' />
            Sắp xếp
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className='bg-white rounded-lg border p-4 mb-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-6'>
            <span className='text-sm text-gray-600'>
              Tìm thấy <strong>{filteredItems.length}</strong> sản phẩm
            </span>
            <div className='flex items-center space-x-4 text-sm text-gray-500'>
              <span className='flex items-center'>
                <Shield className='w-4 h-4 mr-1 text-blue-600' />
                {filteredItems.filter(item => item.seller?.club_id).length} từ
                người bán uy tín
              </span>
              <span className='flex items-center'>
                <Truck className='w-4 h-4 mr-1 text-green-600' />
                {
                  filteredItems.filter(item => item.shipping_available).length
                }{' '}
                hỗ trợ ship
              </span>
            </div>
          </div>

          <Button className='bg-blue-600 hover:bg-blue-700'>
            <span className='text-xl mr-2'>+</span>
            Đăng bán
          </Button>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {[...Array(8)].map((_, i) => (
            <Card key={i} className='animate-pulse'>
              <div className='h-48 bg-gray-200 rounded-t-lg'></div>
              <CardContent className='p-4 space-y-3'>
                <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                <div className='h-6 bg-gray-200 rounded w-1/2'></div>
                <div className='h-3 bg-gray-200 rounded w-full'></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className='text-center py-16'>
          <ShoppingCart className='w-16 h-16 mx-auto text-gray-400 mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Không tìm thấy sản phẩm
          </h3>
          <p className='text-gray-600 mb-6'>
            Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
          </p>
          <Button>
            <span className='text-xl mr-2'>+</span>
            Đăng bán sản phẩm đầu tiên
          </Button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Load More */}
      {filteredItems.length > 0 && (
        <div className='text-center mt-8'>
          <Button variant='outline' size='lg'>
            Xem thêm sản phẩm
          </Button>
        </div>
      )}
    </div>
  );
};

export default EnhancedMarketplacePage;
