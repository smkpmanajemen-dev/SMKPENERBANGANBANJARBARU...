import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { useGoogleAuth } from '../context/GoogleAuthContext';
import { 
  Bell, 
  PlusCircle, 
  MinusCircle, 
  Package, 
  Search,
  Menu,
  X,
  Cloud
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { 
    lowStockItems, 
    outOfStockItems, 
    setIsLowStockDrawerOpen, 
    openQuickInbound, 
    openQuickOutbound,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab
  } = useInventory();

  const { user } = useGoogleAuth();

  const totalAlerts = lowStockItems.length + outOfStockItems.length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              aria-label="Menu navigasi"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
                <Package className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
                  StokFlow
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-normal">
                  Sistem Inventaris Barang
                </span>
              </div>
            </button>
          </div>

          {/* Quick Search */}
          <div className="hidden sm:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama barang, kode SKU, atau pengambil..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 hover:bg-slate-200/60 focus:bg-white border border-transparent focus:border-slate-300 rounded-lg transition-colors placeholder:text-slate-400 text-slate-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Actions & Alerts */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Google Drive Status Button */}
            <button
              onClick={() => setActiveTab('drive')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                activeTab === 'drive'
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : user
                  ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
              title={user ? `Google Drive terhubung: ${user.email}` : 'Buka Google Drive'}
            >
              <Cloud className={`w-4 h-4 ${user ? 'text-blue-500' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Drive</span>
              {user && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
              )}
            </button>

            {/* Low Stock Notification Bell */}
            <button
              onClick={() => setIsLowStockDrawerOpen(true)}
              className={`relative p-2 rounded-lg border transition-colors ${
                totalAlerts > 0
                  ? 'border-amber-200 bg-amber-50/80 text-amber-800 hover:bg-amber-100'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={totalAlerts > 0 ? `${totalAlerts} barang perlu restok!` : 'Semua stok aman'}
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Quick Action: Inbound (Penerimaan) */}
            <button
              onClick={() => openQuickInbound()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap active:scale-[0.98]"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden xs:inline">Penerimaan</span>
              <span className="xs:hidden">+ Masuk</span>
            </button>

            {/* Quick Action: Outbound (Pengeluaran) */}
            <button
              onClick={() => openQuickOutbound()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap active:scale-[0.98]"
            >
              <MinusCircle className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden xs:inline">Pengeluaran</span>
              <span className="xs:hidden">- Keluar</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
