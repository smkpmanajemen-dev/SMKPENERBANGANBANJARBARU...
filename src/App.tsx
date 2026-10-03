import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { GoogleAuthProvider } from './context/GoogleAuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { InboundView } from './components/InboundView';
import { OutboundView } from './components/OutboundView';
import { ReportsView } from './components/ReportsView';
import { GoogleDriveView } from './components/GoogleDriveView';
import { InboundModal } from './components/InboundModal';
import { OutboundModal } from './components/OutboundModal';
import { ItemModal } from './components/ItemModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { LowStockDrawer } from './components/LowStockDrawer';
import { 
  LayoutDashboard, 
  Boxes, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileSpreadsheet, 
  Plus, 
  X,
  Package,
  Cloud
} from 'lucide-react';
import { ActiveTab } from './types/inventory';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, openCreateItem, stockSummaries, lowStockItems, outOfStockItems } = useInventory();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalAlerts = lowStockItems.length + outOfStockItems.length;

  const handleMobileNavSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; count?: number }[] = [
    { id: 'dashboard', label: 'Dasbor Ringkasan', icon: LayoutDashboard },
    { id: 'inventory', label: 'Sisa Stok Inventaris', icon: Boxes, count: stockSummaries.length },
    { id: 'inbound', label: 'Penerimaan (Masuk)', icon: ArrowDownLeft },
    { id: 'outbound', label: 'Pengeluaran (Keluar)', icon: ArrowUpRight },
    { id: 'reports', label: 'Rekap & Cadangan', icon: FileSpreadsheet },
    { id: 'drive', label: 'Google Drive', icon: Cloud },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <Header 
        isMobileMenuOpen={isMobileMenuOpen} 
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />

      {/* Mobile Slide-out Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-slate-900/50 backdrop-blur-xs flex">
          <div className="w-72 max-w-[80vw] bg-white h-full shadow-2xl p-5 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                    <Package className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="font-bold text-slate-900">StokFlow</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav links */}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMobileNavSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-xl transition-colors text-left ${
                        isActive 
                          ? 'bg-slate-900 text-white font-semibold' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isActive ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openCreateItem();
                  }}
                  className="w-full py-2.5 px-3 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Master Barang</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
              Inventaris Penerimaan & Pengeluaran
            </div>
          </div>

          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Workspace: Sidebar + Viewport */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-12 overflow-x-hidden">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'inbound' && <InboundView />}
          {activeTab === 'outbound' && <OutboundView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'drive' && <GoogleDriveView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Modals & Drawers */}
      <InboundModal />
      <OutboundModal />
      <ItemModal />
      <ItemDetailModal />
      <LowStockDrawer />
    </div>
  );
};

export default function App() {
  return (
    <GoogleAuthProvider>
      <InventoryProvider>
        <AppContent />
      </InventoryProvider>
    </GoogleAuthProvider>
  );
}

