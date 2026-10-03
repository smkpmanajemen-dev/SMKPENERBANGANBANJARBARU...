import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { LowStockAlertBanner } from './LowStockAlertBanner';
import { 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Boxes, 
  AlertTriangle, 
  PlusCircle, 
  MinusCircle, 
  Plus, 
  Clock, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  AlertOctagon,
  Calendar,
  User,
  Truck
} from 'lucide-react';
import { ItemStockSummary } from '../types/inventory';

export const DashboardView: React.FC = () => {
  const { 
    stockSummaries, 
    lowStockItems, 
    outOfStockItems, 
    inbound, 
    outbound, 
    setActiveTab, 
    openQuickInbound, 
    openQuickOutbound, 
    openCreateItem,
    setSelectedItemForDetail,
    setIsLowStockDrawerOpen
  } = useInventory();

  // Stats calculation
  const totalItems = stockSummaries.length;
  const totalInboundUnits = inbound.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalOutboundUnits = outbound.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCurrentStockUnits = stockSummaries.reduce((acc, curr) => acc + curr.currentStock, 0);
  const totalAlertCount = lowStockItems.length + outOfStockItems.length;

  // Recent 5 inbound and outbound
  const recentInbound = [...inbound]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const recentOutbound = [...outbound]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Critical items requiring attention
  const criticalItems = [...outOfStockItems, ...lowStockItems].slice(0, 4);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner Alert if low stock exists */}
      <LowStockAlertBanner />

      {/* Hero Welcome & Quick Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Dasbor Inventaris & Mutasi Barang
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau penerimaan, pengeluaran barang, serta perhitungan sisa stok secara real-time dan akurat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => openQuickInbound()}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors shadow-xs active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>+ Catat Penerimaan</span>
          </button>

          <button
            onClick={() => openQuickOutbound()}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl transition-colors shadow-xs active:scale-[0.98]"
          >
            <MinusCircle className="w-4 h-4 text-rose-600" />
            <span>- Catat Pengambilan</span>
          </button>

          <button
            onClick={openCreateItem}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span>+ Master Barang</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Card 1: Total SKU / Jenis Barang */}
        <div 
          onClick={() => setActiveTab('inventory')}
          className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 sm:p-5 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Jenis Barang</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {totalItems}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-slate-600">
              <span>Kelola inventaris</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Card 2: Total Penerimaan Masuk */}
        <div 
          onClick={() => setActiveTab('inbound')}
          className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 sm:p-5 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Masuk</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
              +{totalInboundUnits}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span>{inbound.length} transaksi penerimaan</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Pengeluaran Keluar */}
        <div 
          onClick={() => setActiveTab('outbound')}
          className="bg-white border border-slate-200 hover:border-rose-300 rounded-2xl p-4 sm:p-5 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Keluar</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-rose-700">
              -{totalOutboundUnits}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-rose-500" />
              <span>{outbound.length} transaksi pengambilan</span>
            </div>
          </div>
        </div>

        {/* Card 4: Sisa Stok Otomatis (Net Remaining) */}
        <div 
          onClick={() => setActiveTab('inventory')}
          className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 sm:p-5 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Sisa Stok</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {totalCurrentStockUnits}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>Unit barang tersedia di gudang</span>
            </div>
          </div>
        </div>

        {/* Card 5: Low Stock Warning */}
        <div 
          onClick={() => setIsLowStockDrawerOpen(true)}
          className={`col-span-2 lg:col-span-1 rounded-2xl p-4 sm:p-5 transition-all shadow-xs cursor-pointer border ${
            totalAlertCount > 0 
              ? 'bg-amber-50/80 border-amber-300 hover:bg-amber-100/70' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900">Perlu Restok</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              totalAlertCount > 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold font-mono tabular-nums ${
              totalAlertCount > 0 ? 'text-amber-800' : 'text-slate-700'
            }`}>
              {totalAlertCount}
            </div>
            <div className="text-[11px] text-amber-800/80 mt-1 flex items-center gap-1 font-medium">
              <span>{outOfStockItems.length} habis · {lowStockItems.length} menipis</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>

      </div>

      {/* Critical Stock Spotlight (If any items are low or zero) */}
      {criticalItems.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Daftar Barang Stok Rendah (Prioritas Restok)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sisa stok telah menyentuh atau berada di bawah ambang batas minimum aman.
              </p>
            </div>
            <button
              onClick={() => setIsLowStockDrawerOpen(true)}
              className="text-xs font-semibold text-amber-900 hover:text-amber-950 inline-flex items-center gap-1"
            >
              Lihat Semua ({totalAlertCount}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {criticalItems.map((item) => {
              const isZero = item.currentStock <= 0;
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isZero 
                      ? 'border-rose-200 bg-rose-50/40' 
                      : 'border-amber-200 bg-amber-50/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-500">{item.sku}</span>
                      <span className={`font-bold flex items-center gap-1 ${
                        isZero ? 'text-rose-700' : 'text-amber-700'
                      }`}>
                        {isZero ? <AlertOctagon className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {isZero ? 'Stok Habis' : 'Menipis'}
                      </span>
                    </div>
                    <h4 
                      onClick={() => setSelectedItemForDetail(item)}
                      className="text-xs font-bold text-slate-900 mt-1 cursor-pointer hover:underline line-clamp-1"
                      title={item.name}
                    >
                      {item.name}
                    </h4>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {item.category}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400">Sisa / Min:</div>
                      <div className="text-xs font-mono font-bold text-slate-900">
                        <span className={isZero ? 'text-rose-600' : 'text-amber-600'}>
                          {item.currentStock}
                        </span>
                        <span className="text-slate-400 font-normal"> / {item.minStock} {item.unit}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => openQuickInbound(item)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3 h-3 text-emerald-600" />
                      <span>Masuk</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two-Column Activity Feeds: Inbound & Outbound Recent Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Inbound (Penerimaan Terbaru) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Penerimaan Terbaru (Barang Masuk)
                  </h3>
                  <p className="text-[11px] text-slate-400">Pemasok & tanggal masuk barang</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('inbound')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                Lihat Semua <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {recentInbound.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                Belum ada transaksi penerimaan barang.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentInbound.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{item.itemName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                          <Calendar className="w-3 h-3" /> {item.date}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3 text-slate-400" /> {item.supplierOrSource}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono tabular-nums font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        +{item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3">
            <button
              onClick={() => openQuickInbound()}
              className="w-full py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Catat Penerimaan Baru</span>
            </button>
          </div>
        </div>

        {/* Recent Outbound (Pengeluaran Terbaru) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Pengambilan Terbaru (Barang Keluar)
                  </h3>
                  <p className="text-[11px] text-slate-400">Nama pengambil & keperluan divisi</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('outbound')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                Lihat Semua <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {recentOutbound.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                Belum ada transaksi pengeluaran barang.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentOutbound.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{item.itemName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                          <Calendar className="w-3 h-3" /> {item.date}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" /> {item.recipientName}
                          <span className="text-slate-400">({item.department})</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono tabular-nums font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                        -{item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3">
            <button
              onClick={() => openQuickOutbound()}
              className="w-full py-2 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <MinusCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Catat Pengambilan Baru</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
