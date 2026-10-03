import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { X, ArrowDownLeft, Plus } from 'lucide-react';

export const InboundModal: React.FC = () => {
  const { 
    isInboundModalOpen, 
    setIsInboundModalOpen, 
    items, 
    stockSummaries, 
    addInbound, 
    preselectedItem, 
    setPreselectedItem,
    openCreateItem
  } = useInventory();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [supplierOrSource, setSupplierOrSource] = useState('');
  const [documentNo, setDocumentNo] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isInboundModalOpen) {
      setDate(new Date().toISOString().slice(0, 10));
      setFormError('');
      if (preselectedItem) {
        setSelectedItemId(preselectedItem.id);
      } else if (items.length > 0 && !selectedItemId) {
        setSelectedItemId(items[0].id);
      }
    }
  }, [isInboundModalOpen, preselectedItem, items]);

  if (!isInboundModalOpen) return null;

  const currentItemSummary = stockSummaries.find((s) => s.id === selectedItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedItemId) {
      setFormError('Silakan pilih nama barang.');
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      setFormError('Jumlah barang masuk harus lebih besar dari 0.');
      return;
    }

    const item = items.find((i) => i.id === selectedItemId);
    if (!item) {
      setFormError('Barang tidak ditemukan.');
      return;
    }

    addInbound({
      date,
      itemId: item.id,
      itemName: item.name,
      quantity: Number(quantity),
      supplierOrSource: supplierOrSource.trim() || 'Pemasok / Pengadaan Langsung',
      documentNo: documentNo.trim(),
      notes: notes.trim(),
    });

    // Reset and close
    setQuantity('');
    setSupplierOrSource('');
    setDocumentNo('');
    setNotes('');
    setPreselectedItem(null);
    setIsInboundModalOpen(false);
  };

  const handleAddNewItemClick = () => {
    setIsInboundModalOpen(false);
    openCreateItem();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Catat Penerimaan Barang Masuk</h3>
              <p className="text-xs text-slate-500">Menambah sisa stok inventaris gudang</p>
            </div>
          </div>
          <button
            onClick={() => setIsInboundModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700">
              {formError}
            </div>
          )}

          {/* Tanggal Penerimaan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Penerimaan <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Nama Barang */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Nama Barang <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddNewItemClick}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Barang Baru
              </button>
            </div>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  [{item.sku}] {item.name} ({item.unit})
                </option>
              ))}
            </select>

            {/* Current stock indicator */}
            {currentItemSummary && (
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>Sisa stok saat ini:</span>
                <span className="font-mono tabular-nums font-semibold text-slate-700">
                  {currentItemSummary.currentStock} {currentItemSummary.unit}
                </span>
              </div>
            )}
          </div>

          {/* Jumlah Barang Masuk */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jumlah Barang Masuk ({currentItemSummary?.unit || 'Satuan'}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="any"
              required
              placeholder="Contoh: 50"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Pemasok / Asal Barang & No. Dokumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pemasok / Asal Barang
              </label>
              <input
                type="text"
                placeholder="Misal: PT Graha Kertas Utama"
                value={supplierOrSource}
                onChange={(e) => setSupplierOrSource(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. Surat Jalan / Resi / PO
              </label>
              <input
                type="text"
                placeholder="Misal: SJ-2026/09/101"
                value={documentNo}
                onChange={(e) => setDocumentNo(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Keterangan
            </label>
            <input
              type="text"
              placeholder="Misal: Pengadaan bulanan divisi operasional"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsInboundModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              Simpan Penerimaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
