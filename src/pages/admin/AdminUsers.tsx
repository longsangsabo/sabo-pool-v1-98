
import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, UserCheck, UserX, Crown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/AdminLayout';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useAdminUsers, type AdminUser } from '@/hooks/useAdminUsers';

const AdminUsers = () => {
  const { data: isAdmin, isLoading: adminLoading } = useAdminCheck();
  const { users, isLoading: usersLoading, updateUserBan, updateUserRole, isUpdatingBan, isUpdatingRole } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState('');

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.ban_status !== 'banned') ||
      (statusFilter === 'banned' && user.ban_status === 'banned') ||
      (statusFilter === 'inactive' && user.ban_status === 'inactive');
    
    return matchesSearch && matchesStatus;
  });

  const handleBanUser = (user: AdminUser) => {
    setSelectedUser(user);
    setBanDialogOpen(true);
  };

  const confirmBanUser = () => {
    if (selectedUser) {
      updateUserBan({
        userId: selectedUser.user_id,
        banStatus: 'banned',
        banReason: banReason,
        banExpiresAt: null,
      });
      setBanDialogOpen(false);
      setBanReason('');
      setSelectedUser(null);
    }
  };

  const handleUnbanUser = (user: AdminUser) => {
    updateUserBan({
      userId: user.user_id,
      banStatus: 'active',
      banReason: null,
      banExpiresAt: null,
    });
  };

  const handleChangeRole = (user: AdminUser, newRole: string) => {
    updateUserRole({
      userId: user.user_id,
      role: newRole,
    });
  };

  if (adminLoading || usersLoading) {
    return (
      <AdminLayout>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>Access Denied</h2>
            <p className='text-gray-600'>You don't have permission to access this page.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const getStatusColor = (banStatus: string | null) => {
    switch (banStatus) {
      case 'banned':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusText = (banStatus: string | null) => {
    switch (banStatus) {
      case 'banned':
        return 'Đã khóa';
      case 'inactive':
        return 'Không hoạt động';
      default:
        return 'Hoạt động';
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'premium' ? <Crown className='w-4 h-4' /> : null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <AdminLayout>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Quản Lý Người Dùng</h1>
            <p className='text-gray-600'>Quản lý thông tin và trạng thái người dùng</p>
          </div>
        </div>

        <div className='flex gap-4'>
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <Input
              placeholder='Tìm kiếm người dùng...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-48'>
              <SelectValue placeholder='Trạng thái' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả</SelectItem>
              <SelectItem value='active'>Hoạt động</SelectItem>
              <SelectItem value='inactive'>Không hoạt động</SelectItem>
              <SelectItem value='banned'>Đã khóa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách người dùng</CardTitle>
            <CardDescription>Tổng cộng {filteredUsers.length} người dùng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {filteredUsers.map((user) => (
                <div
                  key={user.user_id}
                  className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'
                >
                  <div className='flex items-center space-x-4'>
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name || 'User'}`} />
                      <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className='flex items-center space-x-2'>
                        <h3 className='font-medium'>{user.full_name || 'Chưa cập nhật'}</h3>
                        {getRoleIcon(user.role)}
                        {user.is_admin && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                      </div>
                      <p className='text-sm text-gray-500'>{user.user_id}</p>
                      <p className='text-sm text-gray-500'>{user.phone || 'Chưa có SĐT'}</p>
                      {user.ban_reason && (
                        <p className='text-sm text-red-500 flex items-center'>
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {user.ban_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center space-x-4'>
                    <div className='text-right'>
                      <Badge className='mb-1'>{user.verified_rank || 'Chưa xác thực'}</Badge>
                      <p className='text-sm text-gray-500'>{user.city || 'Chưa cập nhật'}</p>
                    </div>
                    <Badge className={getStatusColor(user.ban_status)}>
                      {getStatusText(user.ban_status)}
                    </Badge>
                    <div className='text-right text-sm text-gray-500'>
                      <p>Tham gia: {formatDate(user.created_at)}</p>
                      <p>Cập nhật: {formatDate(user.updated_at)}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm' disabled={isUpdatingBan || isUpdatingRole}>
                          <MoreHorizontal className='w-4 h-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => console.log('View details', user.user_id)}>
                          <UserCheck className='w-4 h-4 mr-2' />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.ban_status === 'banned' ? (
                          <DropdownMenuItem onClick={() => handleUnbanUser(user)}>
                            <UserCheck className='w-4 h-4 mr-2' />
                            Mở khóa tài khoản
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleBanUser(user)}>
                            <UserX className='w-4 h-4 mr-2' />
                            Khóa tài khoản
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleChangeRole(user, user.role === 'premium' ? 'player' : 'premium')}>
                          <Crown className='w-4 h-4 mr-2' />
                          {user.role === 'premium' ? 'Hủy Premium' : 'Nâng cấp Premium'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Không tìm thấy người dùng nào
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ban User Dialog */}
        <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Khóa tài khoản người dùng</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn khóa tài khoản của {selectedUser?.full_name}?
                Vui lòng nhập lý do khóa tài khoản.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Nhập lý do khóa tài khoản..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
                Hủy
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmBanUser}
                disabled={!banReason.trim() || isUpdatingBan}
              >
                {isUpdatingBan ? 'Đang xử lý...' : 'Khóa tài khoản'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
