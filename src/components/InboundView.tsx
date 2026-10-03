import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { 
  ArrowDownLeft, 
  PlusCircle, 
  Search, 
  Calendar, 
  Trash2, 
  Download, 
  Truck, 
  FileText 
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const InboundView: React.FC = () => {
  const { 
    inbound, 
    deleteInbound, 
    openQuickInbound, 
    exportInboundCSV,
    stockSummaries,
    setSelectedItemForDetail
  } = useInventory();

  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [txToDelete, setTxToDelete] = useState<{ id: string; name: string } | null>(null);

  // Months available in data
  const availableMonths = useMemo(() => {
    const months = new Set(inbound.map((i) => i.date.slice(0, 7)));
    return Array.from(months).sort().reverse();
  }, [inbound]);

  // Filtered transactions
  const filteredInbound = useMemo(() => {
    return inbound
      .filter((tx) => {
        const q = search.toLowerCase();
        const matchSearch =
          tx.itemName.toLowerCase().includes(q) ||
          tx.supplierOrSource.toLowerCase().includes(q) ||
          (tx.documentNo && tx.documentNo.toLowerCase().includes(q)) ||
          (tx.notes && tx.notes.toLowerCase().includes(q));

        if (!matchSearch) return false;
        if (selectedMonth !== 'all' && !tx.date.startsWith(selectedMonth)) return false;

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [inbound, search, selectedMonth]);

  const totalFilteredQty = filteredInbound.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleDelete = (id: string, name: string) => {
    setTxToDelete({ id, name });
  };

  const handleConfirmDelete = () => {
    if (txToDelete) {
      deleteInbound(txToDelete.id);
      setTxToDelete(null);
    }
  };

  const handleItemClick = (itemId: string) => {
    const summary = stockSummaries.find((s) => s.id === itemId);
    if (summary) {
      setSelectedItemForDetail(summary);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            <span>Pencatatan Barang Masuk</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Daftar Penerimaan Barang
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mencatat tanggal penerimaan, nama barang, jumlah masuk, serta pemasok / dokumen pendukung.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportInboundCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs"
            title="Download CSV Riwayat Masuk"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => openQuickInbound()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>+ Catat Penerimaan</span>
          </button>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama barang, pemasok, no surat jalan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400 text-slate-800"
            />
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Periode</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  Periode {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick counter badge */}
        <div className="text-xs text-slate-500 flex items-center gap-3">
          <span>
            Total Transaksi: <strong className="font-mono text-slate-900">{filteredInbound.length}</strong>
          </span>
          <span>·</span>
          <span>
            Total Unit Masuk: <strong className="font-mono text-emerald-700 font-bold">+{totalFilteredQty}</strong>
          </span>
        </div>
      </div>

      {/* Inbound List: Desktop Table */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
              <th className="py-3 px-4">Tanggal Penerimaan</th>
              <th className="py-3 px-4">Nama Barang</th>
              <th className="py-3 px-4 text-right">Jumlah Masuk</th>
              <th className="py-3 px-4">Pemasok / Asal</th>
              <th className="py-3 px-4">No. Surat Jalan / Resi</th>
              <th className="py-3 px-4">Catatan</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInbound.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Tidak ada catatan penerimaan barang yang sesuai.
                </td>
              </tr>
            ) : (
              filteredInbound.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleItemClick(tx.itemId)}
                      className="font-semibold text-slate-900 hover:text-emerald-700 text-left hover:underline"
                    >
                      {tx.itemName}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-emerald-700">
                    +{tx.quantity}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <span className="inline-flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      {tx.supplierOrSource}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {tx.documentNo ? (
                      <span className="inline-flex items-center gap-1">
                        <FileText className="w-3 h-3 text-slate-400" />
                        {tx.documentNo}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                    {tx.notes || '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDelete(tx.id, tx.itemName)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Hapus Transaksi Penerimaan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {filteredInbound.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
            Tidak ada catatan penerimaan.
          </div>
        ) : (
          filteredInbound.map((tx) => (
            <div key={tx.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {tx.date}
                  </div>
                  <h3 
                    onClick={() => handleItemClick(tx.itemId)}
                    className="text-sm font-bold text-slate-900 mt-0.5 cursor-pointer hover:underline"
                  >
                    {tx.itemName}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="font-mono tabular-nums font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs">
                    +{tx.quantity}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pemasok: <strong>{tx.supplierOrSource}</strong></span>
                </div>
                {tx.documentNo && (
                  <div className="text-[11px] text-slate-500 font-mono">
                    Dokumen: {tx.documentNo}
                  </div>
                )}
                {tx.notes && (
                  <div className="text-[11px] text-slate-500 italic">
                    "{tx.notes}"
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleDelete(tx.id, tx.itemName)}
                  className="text-[11px] text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(txToDelete)}
        title="Hapus Catatan Penerimaan"
        message={txToDelete ? `Apakah Anda yakin ingin menghapus catatan penerimaan barang "${txToDelete.name}"? Sisa stok barang ini akan berkurang kembali.` : ''}
        confirmText="Hapus Catatan"
        cancelText="Batal"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTxToDelete(null)}
      />
    </div>
  );
};
