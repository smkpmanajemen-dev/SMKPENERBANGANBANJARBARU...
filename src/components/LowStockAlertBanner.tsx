import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { AlertCircle, ArrowRight, PackagePlus } from 'lucide-react';

export const LowStockAlertBanner: React.FC = () => {
  const { 
    lowStockItems, 
    outOfStockItems, 
    setIsLowStockDrawerOpen, 
    openQuickInbound 
  } = useInventory();

  const totalCritical = lowStockItems.length + outOfStockItems.length;

  if (totalCritical === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3.5 sm:p-4 mb-6 transition-all shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 mt-0.5 sm:mt-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-amber-900 leading-tight">
              Peringatan Stok: {totalCritical} Barang Perlu Pengadaan
            </h4>
            <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
              {outOfStockItems.length > 0 && (
                <span className="font-semibold text-rose-700 mr-2">
                  {outOfStockItems.length} barang habis ({outOfStockItems.map(i => i.name).slice(0, 2).join(', ')}{outOfStockItems.length > 2 ? '...' : ''})
                </span>
              )}
              {lowStockItems.length > 0 && (
                <span>
                  {lowStockItems.length} barang berada di bawah batas minimum stok aman.
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            onClick={() => setIsLowStockDrawerOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-white hover:bg-amber-100/70 border border-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <span>Daftar Stok Rendah</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => openQuickInbound()}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>Restok Cepat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
