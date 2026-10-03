import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { X, ArrowUpRight, AlertTriangle, AlertCircle } from 'lucide-react';

export const OutboundModal: React.FC = () => {
  const { 
    isOutboundModalOpen, 
    setIsOutboundModalOpen, 
    items, 
    stockSummaries, 
    addOutbound, 
    preselectedItem, 
    setPreselectedItem 
  } = useInventory();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedItemId, setSelectedItemId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [department, setDepartment] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOutboundModalOpen) {
      setDate(new Date().toISOString().slice(0, 10));
      setFormError('');
      if (preselectedItem) {
        setSelectedItemId(preselectedItem.id);
      } else if (items.length > 0 && !selectedItemId) {
        setSelectedItemId(items[0].id);
      }
    }
  }, [isOutboundModalOpen, preselectedItem, items]);

  if (!isOutboundModalOpen) return null;

  const currentSummary = stockSummaries.find((s) => s.id === selectedItemId);
  const currentStock = currentSummary?.currentStock ?? 0;
  const numQty = Number(quantity) || 0;
  const projectedStock = currentStock - numQty;
  const isOverStock = numQty > currentStock;
  const willBeLowStock = projectedStock > 0 && currentSummary && projectedStock <= currentSummary.minStock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedItemId) {
      setFormError('Silakan pilih barang yang akan dikeluarkan.');
      return;
    }

    if (!recipientName.trim()) {
      setFormError('Silakan masukkan nama pengambil barang.');
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      setFormError('Jumlah barang yang keluar harus lebih besar dari 0.');
      return;
    }

    if (isOverStock) {
      setFormError(`Stok tidak mencukupi! Sisa stok barang hanya ${currentStock} ${currentSummary?.unit || ''}.`);
      return;
    }

    const item = items.find((i) => i.id === selectedItemId);
    if (!item) {
      setFormError('Barang tidak ditemukan.');
      return;
    }

    const res = addOutbound({
      date,
      itemId: item.id,
      itemName: item.name,
      recipientName: recipientName.trim(),
      department: department.trim() || 'Umum / Operasional',
      quantity: Number(quantity),
      notes: notes.trim(),
    });

    if (!res.success) {
      setFormError(res.error || 'Gagal mencatat pengeluaran barang.');
      return;
    }

    // Reset and close
    setQuantity('');
    setRecipientName('');
    setDepartment('');
    setNotes('');
    setPreselectedItem(null);
    setIsOutboundModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Catat Pengeluaran Barang (Ambil)</h3>
              <p className="text-xs text-slate-500">Mencatat pengambil dan mengurangi sisa stok</p>
            </div>
          </div>
          <button
            onClick={() => setIsOutboundModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Tanggal Pengambilan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Pengambilan <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Pilih Barang */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Barang <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              {items.map((item) => {
                const s = stockSummaries.find((st) => st.id === item.id);
                const stock = s ? s.currentStock : 0;
                return (
                  <option key={item.id} value={item.id}>
                    [{item.sku}] {item.name} — Sisa: {stock} {item.unit}
                  </option>
                );
              })}
            </select>

            {/* Current Stock Feedback pill */}
            {currentSummary && (
              <div className="mt-1.5 flex items-center justify-between text-[11px] px-1">
                <span className="text-slate-500">Sisa stok siap diambil:</span>
                <span className={`font-mono tabular-nums font-bold ${
                  currentStock <= 0 ? 'text-rose-600' : currentStock <= currentSummary.minStock ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {currentStock} {currentSummary.unit}
                </span>
              </div>
            )}
          </div>

          {/* Nama Pengambil & Divisi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Pengambil <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Divisi / Unit Kerja / Keperluan
              </label>
              <input
                type="text"
                placeholder="Contoh: Keuangan / HRD / Lapangan"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Jumlah Keluar */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jumlah yang Keluar ({currentSummary?.unit || 'Satuan'}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max={currentStock > 0 ? currentStock : undefined}
              step="any"
              required
              placeholder="Contoh: 5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              className={`w-full px-3 py-2 text-xs font-mono border rounded-lg focus:outline-none focus:ring-2 ${
                isOverStock ? 'border-rose-400 bg-rose-50/50 focus:ring-rose-500' : 'border-slate-200 focus:ring-slate-900'
              }`}
            />

            {/* Validation & Low Stock Alerts */}
            {isOverStock && (
              <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Jumlah melebihi stok yang ada (Maksimal: {currentStock} {currentSummary?.unit})
              </p>
            )}

            {!isOverStock && willBeLowStock && (
              <p className="mt-1 text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Perhatian: Setelah pengambilan, sisa stok menjadi {projectedStock} {currentSummary?.unit} (di bawah batas min {currentSummary?.minStock})
              </p>
            )}

            {!isOverStock && numQty > 0 && !willBeLowStock && (
              <p className="mt-1 text-[11px] text-slate-500">
                Estimasi sisa stok setelah pengeluaran: <strong className="font-mono text-slate-800">{projectedStock} {currentSummary?.unit}</strong>
              </p>
            )}
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan Pengambilan
            </label>
            <input
              type="text"
              placeholder="Misal: Kebutuhan cetak laporan akhir kuartal"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOutboundModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isOverStock || (currentStock <= 0 && numQty > 0)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
                isOverStock || (currentStock <= 0 && numQty > 0)
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'text-white bg-slate-900 hover:bg-slate-800'
              }`}
            >
              Simpan Pengeluaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
