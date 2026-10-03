import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { 
  LayoutDashboard, 
  Boxes, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileSpreadsheet, 
  Plus, 
  AlertTriangle,
  ChevronRight,
  Cloud
} from 'lucide-react';
import { ActiveTab } from '../types/inventory';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    lowStockItems, 
    outOfStockItems, 
    setIsLowStockDrawerOpen,
    openCreateItem,
    stockSummaries
  } = useInventory();

  const totalAlerts = lowStockItems.length + outOfStockItems.length;

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; count?: number }[] = [
    { id: 'dashboard', label: 'Dasbor Ringkasan', icon: LayoutDashboard },
    { id: 'inventory', label: 'Sisa Stok Inventaris', icon: Boxes, count: stockSummaries.length },
    { id: 'inbound', label: 'Penerimaan (Masuk)', icon: ArrowDownLeft },
    { id: 'outbound', label: 'Pengeluaran (Keluar)', icon: ArrowUpRight },
    { id: 'reports', label: 'Rekap & Cadangan', icon: FileSpreadsheet },
    { id: 'drive', label: 'Google Drive', icon: Cloud },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        
        {/* Navigation list */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu Utama
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick action: Add new item */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={openCreateItem}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            <span>Tambah Master Barang</span>
          </button>
        </div>

        {/* Low Stock Watcher Box */}
        {totalAlerts > 0 && (
          <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-bold text-amber-900">
                  {totalAlerts} Stok Perlu Atensi
                </div>
                <div className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  {outOfStockItems.length > 0 && `${outOfStockItems.length} stok habis.`}{' '}
                  {lowStockItems.length > 0 && `${lowStockItems.length} di bawah batas minimum.`}
                </div>
                <button
                  onClick={() => setIsLowStockDrawerOpen(true)}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 hover:text-amber-950 underline decoration-amber-400 underline-offset-2"
                >
                  Tinjau & Restok <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 leading-tight">
        <div className="font-medium text-slate-600">StokFlow v1.0</div>
        <div className="mt-0.5">Sisa stok otomatis & real-time</div>
      </div>
    </aside>
  );
};
