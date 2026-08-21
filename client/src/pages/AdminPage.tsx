import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { adminApi } from '../features/admin/api/adminApi';
import { AdminLogin } from '../features/admin/components/AdminLogin';
import { AdminLayout, AdminTab } from '../features/admin/components/AdminLayout';
import { CatalogTab } from '../features/admin/components/CatalogTab';
import { InventoryTab } from '../features/admin/components/InventoryTab';
import { FulfillmentTab } from '../features/admin/components/FulfillmentTab';
import { ShippingTab } from '../features/admin/components/ShippingTab';
import { ReturnsTab } from '../features/admin/components/ReturnsTab';
import { ReconciliationTab } from '../features/admin/components/ReconciliationTab';
import { AuditTab } from '../features/admin/components/AuditTab';

export const AdminPage: React.FC = () => {
  const { logoutUser, setCurrentUser } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('catalog');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  const checkAdminAuth = async () => {
    setCheckingAuth(true);
    try {
      const user = await adminApi.getMe();
      if (user && (user.role === 'ADMIN' || user.role === 'OPERATIONS')) {
        setAdminUser(user);
        setCurrentUser(user);
      } else {
        setAdminUser(null);
      }
    } catch {
      setAdminUser(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const handleLoginSuccess = (admin: any) => {
    setAdminUser(admin);
    setCurrentUser(admin);
  };

  const handleLogout = async () => {
    await logoutUser();
    setAdminUser(null);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#7A1E3A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#6E5D53] font-medium tracking-wide uppercase">Verifying Operational Credentials...</p>
        </div>
      </div>
    );
  }

  if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'OPERATIONS')) {
    return <AdminLogin onSuccess={handleLoginSuccess} />;
  }

  return (
    <AdminLayout
      admin={adminUser}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onLogout={handleLogout}
    >
      {activeTab === 'catalog' && <CatalogTab />}
      {activeTab === 'inventory' && <InventoryTab />}
      {activeTab === 'fulfillment' && <FulfillmentTab />}
      {activeTab === 'shipping' && <ShippingTab />}
      {activeTab === 'returns' && <ReturnsTab />}
      {activeTab === 'reconciliation' && <ReconciliationTab />}
      {activeTab === 'audit' && <AuditTab />}
    </AdminLayout>
  );
};
