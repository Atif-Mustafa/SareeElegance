import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Layers,
  Truck,
  RotateCcw,
  AlertTriangle,
  History,
  Store,
  LogOut,
  Shield,
  Navigation
} from 'lucide-react';

export type AdminTab = 'catalog' | 'inventory' | 'fulfillment' | 'shipping' | 'returns' | 'reconciliation' | 'audit';

interface AdminLayoutProps {
  admin: any;
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  admin,
  activeTab,
  onSelectTab,
  onLogout,
  children
}) => {
  const tabs = [
    { id: 'catalog' as AdminTab, label: 'Catalog', icon: Package },
    { id: 'inventory' as AdminTab, label: 'Inventory', icon: Layers },
    { id: 'fulfillment' as AdminTab, label: 'Fulfillment', icon: Navigation },
    { id: 'shipping' as AdminTab, label: 'Shipping', icon: Truck },
    { id: 'returns' as AdminTab, label: 'Returns Desk', icon: RotateCcw },
    { id: 'reconciliation' as AdminTab, label: 'Reconciliation', icon: AlertTriangle },
    { id: 'audit' as AdminTab, label: 'Audit Trail', icon: History }
  ];

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex flex-col">
      {/* Top Operations Header */}
      <header className="bg-[#241A16] text-[#FAF7F2] border-b border-[#3D2E28] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-wide text-amber-200">
                SAREE ELEGANCE
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#7A1E3A] text-white font-mono tracking-wider font-semibold">
                OPS CONSOLE
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs">
              <Shield className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-amber-200 font-medium">{admin.role || 'ADMIN'}</span>
              <span className="text-stone-400">({admin.email})</span>
            </div>

            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white transition-colors px-2.5 py-1 rounded bg-white/5 hover:bg-white/10"
              title="Return to Customer Storefront"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Storefront</span>
            </Link>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-100 transition-colors px-2.5 py-1 rounded bg-rose-900/30 hover:bg-rose-900/50"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto scrollbar-none gap-1 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#F7F4EE] text-[#2C221E] shadow-sm font-semibold'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#7A1E3A]' : 'text-stone-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};
