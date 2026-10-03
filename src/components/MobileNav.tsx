import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { 
  LayoutDashboard, 
  Boxes, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileSpreadsheet,
  Cloud
} from 'lucide-react';
import { ActiveTab } from '../types/inventory';

export const MobileNav: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    lowStockItems, 
    outOfStockItems 
  } = useInventory();

  const totalAlerts = lowStockItems.length + outOfStockItems.length;

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dasbor', icon: LayoutDashboard },
    { id: 'inventory', label: 'Stok', icon: Boxes, badge: totalAlerts > 0 ? totalAlerts : undefined },
    { id: 'inbound', label: 'Masuk', icon: ArrowDownLeft },
    { id: 'outbound', label: 'Keluar', icon: ArrowUpRight },
    { id: 'reports', label: 'Rekap', icon: FileSpreadsheet },
    { id: 'drive', label: 'Drive', icon: Cloud },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden safe-area-bottom">
      <div className="grid grid-cols-6 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px] ${
                isActive ? 'text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-slate-900 stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-slate-900 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
