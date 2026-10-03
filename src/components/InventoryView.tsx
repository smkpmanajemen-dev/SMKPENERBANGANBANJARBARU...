import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  History, 
  Download,
  Boxes
} from 'lucide-react';
import { ItemStockSummary } from '../types/inventory';
import { ConfirmModal } from './ConfirmModal';

export const InventoryView: React.FC = () => {
  const { 
    stockSummaries, 
    openCreateItem, 
    openEditItem, 
    deleteItem, 
    openQuickInbound, 
    openQuickOutbound, 
    setSelectedItemForDetail,
    exportInventoryCSV,
    searchQuery,
    setSearchQuery
  } = useInventory();

  const [statusFilter, setStatusFilter] = useState<'all' | 'alert' | 'aman' | 'habis'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock_asc' | 'stock_desc'>('stock_asc');
  const [itemToDelete, setItemToDelete] = useState<ItemStockSummary | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(stockSummaries.map((i) => i.category));
    return Array.from(set);
  }, [stockSummaries]);

  // Filtered & sorted items
  const filteredItems = useMemo(() => {
    return stockSummaries.filter((item) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchSearch = 
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      
      if (!matchSearch) return false;

      // Status
      if (statusFilter === 'alert' && item.status === 'aman') return false;
      if (statusFilter === 'habis' && item.status !== 'habis') return false;
      if (statusFilter === 'aman' && item.status !== 'aman') return false;

      // Category
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stock_asc') return a.currentStock - b.currentStock;
      if (sortBy === 'stock_desc') return b.currentStock - a.currentStock;
      return 0;
    });
  }, [stockSummaries, searchQuery, statusFilter, categoryFilter, sortBy]);

  const handleDelete = (item: ItemStockSummary) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4 text-emerald-600" />
            <span>Master Inventaris</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Sisa Stok Otomatis Barang
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dihitung otomatis: <span className="font-mono text-slate-700 font-semibold">Sisa = Total Masuk - Total Keluar</span>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportInventoryCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={openCreateItem}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Tambah Barang</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode SKU, nama barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400 text-slate-800"
            />
          </div>

          {/* Category Dropdown & Sort */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <span className="text-slate-400">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="stock_asc">Stok Paling Sedikit</option>
                <option value="stock_desc">Stok Paling Banyak</option>
                <option value="name">Nama (A - Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs (Segmented control) */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Semua Status ({stockSummaries.length})
          </button>
          
          <button
            onClick={() => setStatusFilter('alert')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'alert'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Perlu Restok ({stockSummaries.filter(s => s.status !== 'aman').length})</span>
          </button>

          <button
            onClick={() => setStatusFilter('habis')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'habis'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Stok Habis ({stockSummaries.filter(s => s.status === 'habis').length})</span>
          </button>

          <button
            onClick={() => setStatusFilter('aman')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'aman'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Stok Aman ({stockSummaries.filter(s => s.status === 'aman').length})</span>
          </button>
        </div>
      </div>

      {/* Items List: Desktop Table View */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
              <th className="py-3 px-4">SKU / Kode</th>
              <th className="py-3 px-4">Nama Barang & Kategori</th>
              <th className="py-3 px-4 text-right">Total Masuk</th>
              <th className="py-3 px-4 text-right">Total Keluar</th>
              <th className="py-3 px-4 text-right">Sisa Stok</th>
              <th className="py-3 px-4 text-center">Batas Min</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Aksi Cepat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  Tidak ditemukan barang yang sesuai filter pencarian.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isZero = item.currentStock <= 0;
                const isLow = item.status === 'rendah';
                return (
                  <tr 
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* SKU */}
                    <td className="py-3 px-4 font-mono font-semibold text-slate-500">
                      {item.sku}
                    </td>

                    {/* Name & Category */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedItemForDetail(item)}
                        className="font-semibold text-slate-900 hover:text-indigo-600 text-left transition-colors font-medium hover:underline"
                      >
                        {item.name}
                      </button>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.category}</div>
                    </td>

                    {/* Total In */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700">
                      +{item.totalIn} <span className="text-[10px] font-normal text-slate-400">{item.unit}</span>
                    </td>

                    {/* Total Out */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-rose-700">
                      -{item.totalOut} <span className="text-[10px] font-normal text-slate-400">{item.unit}</span>
                    </td>

                    {/* Remaining Stock (Otomatis) */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                      <span className={`px-2 py-0.5 rounded-md inline-block ${
                        isZero 
                          ? 'bg-rose-100 text-rose-700' 
                          : isLow 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.currentStock} {item.unit}
                      </span>
                    </td>

                    {/* Minimum Stock Threshold */}
                    <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-500">
                      {item.minStock} {item.unit}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {isZero ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
                          <AlertOctagon className="w-3 h-3" /> Habis
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-md">
                          <AlertTriangle className="w-3 h-3" /> Menipis
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> Aman
                        </span>
                      )}
                    </td>

                    {/* Quick Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openQuickInbound(item)}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                          title="Catat Barang Masuk (+)"
                        >
                          <ArrowDownLeft className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openQuickOutbound(item)}
                          disabled={item.currentStock <= 0}
                          className={`p-1.5 rounded-md transition-colors ${
                            item.currentStock <= 0 
                              ? 'text-slate-300 cursor-not-allowed' 
                              : 'text-rose-700 hover:bg-rose-50'
                          }`}
                          title={item.currentStock <= 0 ? 'Stok habis' : 'Catat Barang Keluar (-)'}
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setSelectedItemForDetail(item)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Lihat Riwayat & Mutasi"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openEditItem(item)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Barang"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Hapus Barang"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (For smartphone screen) */}
      <div className="md:hidden space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
            Tidak ditemukan barang yang sesuai filter.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isZero = item.currentStock <= 0;
            const isLow = item.status === 'rendah';
            return (
              <div 
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                      <span>{item.sku}</span>
                      <span>·</span>
                      <span className="font-sans">{item.category}</span>
                    </div>
                    <h3 
                      onClick={() => setSelectedItemForDetail(item)}
                      className="text-sm font-bold text-slate-900 mt-0.5 cursor-pointer hover:underline"
                    >
                      {item.name}
                    </h3>
                  </div>

                  <div>
                    {isZero ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                        <AlertOctagon className="w-3 h-3" /> Habis
                      </span>
                    ) : isLow ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        <AlertTriangle className="w-3 h-3" /> Menipis
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Aman
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock Math Grid */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-lg text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">Masuk</div>
                    <div className="font-mono tabular-nums font-semibold text-emerald-700">
                      +{item.totalIn}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Keluar</div>
                    <div className="font-mono tabular-nums font-semibold text-rose-700">
                      -{item.totalOut}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Sisa Stok</div>
                    <div className={`font-mono tabular-nums font-bold ${
                      isZero ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'
                    }`}>
                      {item.currentStock} {item.unit}
                    </div>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="text-[11px] text-slate-400">
                    Batas min: <span className="font-mono text-slate-600">{item.minStock} {item.unit}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openQuickInbound(item)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1"
                    >
                      <ArrowDownLeft className="w-3 h-3" />
                      <span>Masuk</span>
                    </button>

                    <button
                      onClick={() => openQuickOutbound(item)}
                      disabled={item.currentStock <= 0}
                      className={`px-2.5 py-1 text-xs font-semibold border rounded-lg flex items-center gap-1 ${
                        item.currentStock <= 0
                          ? 'border-slate-200 bg-slate-100 text-slate-400'
                          : 'text-rose-800 bg-rose-50 hover:bg-rose-100 border-rose-200'
                      }`}
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      <span>Keluar</span>
                    </button>

                    <button
                      onClick={() => setSelectedItemForDetail(item)}
                      className="p-1.5 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg"
                      title="Detail Riwayat"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        title="Hapus Master Barang"
        message={itemToDelete ? `Apakah Anda yakin ingin menghapus "${itemToDelete.name}" (${itemToDelete.sku})? Seluruh riwayat transaksi masuk dan keluar untuk barang ini juga akan dihapus.` : ''}
        confirmText="Hapus Barang"
        cancelText="Batal"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
