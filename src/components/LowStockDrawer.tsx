import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { X, AlertTriangle, AlertOctagon, CheckCircle2, PlusCircle, ArrowRight } from 'lucide-react';
import { ItemStockSummary } from '../types/inventory';

export const LowStockDrawer: React.FC = () => {
  const { 
    isLowStockDrawerOpen, 
    setIsLowStockDrawerOpen, 
    lowStockItems, 
    outOfStockItems,
    openQuickInbound,
    setSelectedItemForDetail
  } = useInventory();

  if (!isLowStockDrawerOpen) return null;

  const allAlertItems = [...outOfStockItems, ...lowStockItems];

  const handleRestock = (item: ItemStockSummary) => {
    setIsLowStockDrawerOpen(false);
    openQuickInbound(item);
  };

  const handleViewDetail = (item: ItemStockSummary) => {
    setIsLowStockDrawerOpen(false);
    setSelectedItemForDetail(item);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end transition-opacity">
      <div 
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-200 ease-out"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 id="drawer-title" className="text-sm font-bold text-slate-900 leading-tight">
                Notifikasi Stok Rendah & Habis
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {allAlertItems.length > 0 
                  ? `${allAlertItems.length} barang butuh pengadaan barang masuk segera` 
                  : 'Inventaris terpantau aman'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLowStockDrawerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
          {allAlertItems.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Semua Stok Mencukupi</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                Tidak ada barang dengan stok di bawah batas minimum saat ini. Semua barang siap digunakan.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 flex items-center justify-between pb-1">
                <span>Daftar item di bawah ambang batas</span>
                <span className="font-mono tabular-nums text-slate-400">{allAlertItems.length} Barang</span>
              </div>

              {allAlertItems.map((item) => {
                const isZero = item.currentStock <= 0;
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isZero 
                        ? 'border-rose-200 bg-rose-50/50' 
                        : 'border-amber-200 bg-amber-50/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-500 uppercase">{item.sku}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-[11px] text-slate-500">{item.category}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5">
                          {item.name}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        {isZero ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-md">
                            <AlertOctagon className="w-3 h-3" />
                            Habis
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-md">
                            <AlertTriangle className="w-3 h-3" />
                            Menipis
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock Math Breakdown */}
                    <div className="mt-3 grid grid-cols-3 gap-2 py-2 px-3 bg-white/80 rounded-lg border border-slate-200/60 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400">Total Masuk</div>
                        <div className="font-mono tabular-nums font-semibold text-slate-700">
                          {item.totalIn} <span className="text-[10px] font-normal text-slate-400">{item.unit}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Total Keluar</div>
                        <div className="font-mono tabular-nums font-semibold text-slate-700">
                          {item.totalOut} <span className="text-[10px] font-normal text-slate-400">{item.unit}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Sisa Stok</div>
                        <div className={`font-mono tabular-nums font-bold ${isZero ? 'text-rose-600' : 'text-amber-600'}`}>
                          {item.currentStock} <span className="text-[10px] font-normal text-slate-400">/ min {item.minStock}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-3 flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => handleViewDetail(item)}
                        className="text-[11px] font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                      >
                        Lihat Riwayat <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleRestock(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors shadow-xs active:scale-[0.98]"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Catat Penerimaan</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Batas minimum dapat disesuaikan pada edit barang.
          </span>
          <button
            onClick={() => setIsLowStockDrawerOpen(false)}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
