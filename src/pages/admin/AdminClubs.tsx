
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminClubRegistrations from '@/pages/admin/AdminClubRegistrations';
import AdminApprovedClubs from '@/pages/admin/AdminApprovedClubs';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, CheckCircle, Clock } from 'lucide-react';

const AdminClubs = () => {
  const { data: isAdmin, isLoading: adminLoading } = useAdminCheck();
  const [activeTab, setActiveTab] = useState('pending');

  if (adminLoading) {
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Building className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Quản lý câu lạc bộ</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Đăng ký chờ duyệt
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              CLB đã duyệt
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4">
            <AdminClubRegistrations />
          </TabsContent>
          
          <TabsContent value="approved" className="space-y-4">
            <AdminApprovedClubs />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminClubs;
