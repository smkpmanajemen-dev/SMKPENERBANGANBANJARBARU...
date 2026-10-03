import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { 
  ArrowUpRight, 
  MinusCircle, 
  Search, 
  Calendar, 
  Trash2, 
  Download, 
  User, 
  Building2 
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const OutboundView: React.FC = () => {
  const { 
    outbound, 
    deleteOutbound, 
    openQuickOutbound, 
    exportOutboundCSV,
    stockSummaries,
    setSelectedItemForDetail
  } = useInventory();

  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [txToDelete, setTxToDelete] = useState<{ id: string; name: string } | null>(null);

  // Months in dataset
  const availableMonths = useMemo(() => {
    const months = new Set(outbound.map((o) => o.date.slice(0, 7)));
    return Array.from(months).sort().reverse();
  }, [outbound]);

  // Filtered transactions
  const filteredOutbound = useMemo(() => {
    return outbound
      .filter((tx) => {
        const q = search.toLowerCase();
        const matchSearch =
          tx.itemName.toLowerCase().includes(q) ||
          tx.recipientName.toLowerCase().includes(q) ||
          tx.department.toLowerCase().includes(q) ||
          (tx.notes && tx.notes.toLowerCase().includes(q));

        if (!matchSearch) return false;
        if (selectedMonth !== 'all' && !tx.date.startsWith(selectedMonth)) return false;

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [outbound, search, selectedMonth]);

  const totalFilteredQty = filteredOutbound.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleDelete = (id: string, name: string) => {
    setTxToDelete({ id, name });
  };

  const handleConfirmDelete = () => {
    if (txToDelete) {
      deleteOutbound(txToDelete.id);
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
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1">
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
            <span>Pencatatan Barang Keluar</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Daftar Pengeluaran & Pengambilan Barang
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mencatat tanggal pengambilan, nama pengambil, divisi, serta jumlah unit yang keluar.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportOutboundCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs"
            title="Download CSV Riwayat Keluar"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => openQuickOutbound()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs active:scale-[0.98]"
          >
            <MinusCircle className="w-4 h-4 text-rose-400" />
            <span>- Catat Pengambilan</span>
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
              placeholder="Cari nama barang, nama pengambil, divisi..."
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
            Total Transaksi: <strong className="font-mono text-slate-900">{filteredOutbound.length}</strong>
          </span>
          <span>·</span>
          <span>
            Total Unit Keluar: <strong className="font-mono text-rose-700 font-bold">-{totalFilteredQty}</strong>
          </span>
        </div>
      </div>

      {/* Outbound List: Desktop Table */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
              <th className="py-3 px-4">Tanggal Pengambilan</th>
              <th className="py-3 px-4">Nama Barang</th>
              <th className="py-3 px-4 text-right">Jumlah Keluar</th>
              <th className="py-3 px-4">Nama Pengambil</th>
              <th className="py-3 px-4">Divisi / Unit Kerja</th>
              <th className="py-3 px-4">Keterangan / Keperluan</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOutbound.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Tidak ada catatan pengambilan barang yang sesuai.
                </td>
              </tr>
            ) : (
              filteredOutbound.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleItemClick(tx.itemId)}
                      className="font-semibold text-slate-900 hover:text-rose-700 text-left hover:underline"
                    >
                      {tx.itemName}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-rose-700">
                    -{tx.quantity}
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {tx.recipientName}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {tx.department}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                    {tx.notes || '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDelete(tx.id, tx.itemName)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Hapus Transaksi Pengeluaran"
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
        {filteredOutbound.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
            Tidak ada catatan pengeluaran barang.
          </div>
        ) : (
          filteredOutbound.map((tx) => (
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
                  <span className="font-mono tabular-nums font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md text-xs">
                    -{tx.quantity}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pengambil: <strong>{tx.recipientName}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span>Divisi: {tx.department}</span>
                </div>
                {tx.notes && (
                  <div className="text-[11px] text-slate-500 italic">
                    Keperluan: "{tx.notes}"
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
        title="Hapus Catatan Pengambilan"
        message={txToDelete ? `Apakah Anda yakin ingin menghapus catatan pengeluaran barang "${txToDelete.name}"? Sisa stok barang ini akan bertambah kembali.` : ''}
        confirmText="Hapus Catatan"
        cancelText="Batal"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTxToDelete(null)}
      />
    </div>
  );
};
