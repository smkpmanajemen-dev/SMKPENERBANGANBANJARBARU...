import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { X, Package, AlertTriangle } from 'lucide-react';

const COMMON_CATEGORIES = [
  'Alat Tulis Kantor',
  'Elektronik & Cetak',
  'Perlengkapan Packing',
  'Kesehatan & Sanitasi',
  'Bahan Baku & Material',
  'Peralatan Kebersihan',
  'Suku Cadang & Perkakas',
  'Lainnya',
];

const COMMON_UNITS = [
  'Pcs',
  'Box (Kotak)',
  'Rim',
  'Roll',
  'Unit',
  'Botol',
  'Pak',
  'Lusin',
  'Kg',
  'Liter',
  'Meter',
];

export const ItemModal: React.FC = () => {
  const { 
    isItemModalOpen, 
    setIsItemModalOpen, 
    addItem, 
    updateItem, 
    selectedItemForEdit, 
    items 
  } = useInventory();

  const isEditing = Boolean(selectedItemForEdit);

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(COMMON_CATEGORIES[0]);
  const [unit, setUnit] = useState(COMMON_UNITS[0]);
  const [minStock, setMinStock] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isItemModalOpen) {
      setError('');
      if (selectedItemForEdit) {
        setSku(selectedItemForEdit.sku);
        setName(selectedItemForEdit.name);
        setCategory(selectedItemForEdit.category);
        setUnit(selectedItemForEdit.unit);
        setMinStock(selectedItemForEdit.minStock);
        setDescription(selectedItemForEdit.description || '');
      } else {
        // Auto-generate next suggested SKU code
        const nextIndex = items.length + 1;
        setSku(`BRG-${String(nextIndex).padStart(3, '0')}`);
        setName('');
        setCategory(COMMON_CATEGORIES[0]);
        setUnit(COMMON_UNITS[0]);
        setMinStock(10);
        setDescription('');
      }
    }
  }, [isItemModalOpen, selectedItemForEdit, items.length]);

  if (!isItemModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nama barang tidak boleh kosong.');
      return;
    }

    if (!sku.trim()) {
      setError('Kode/SKU barang tidak boleh kosong.');
      return;
    }

    // Check duplicate SKU if adding or changed
    const duplicateSku = items.find(
      (i) => i.sku.toLowerCase() === sku.trim().toLowerCase() && i.id !== selectedItemForEdit?.id
    );
    if (duplicateSku) {
      setError(`Kode SKU "${sku}" sudah digunakan oleh barang "${duplicateSku.name}".`);
      return;
    }

    if (isEditing && selectedItemForEdit) {
      updateItem(selectedItemForEdit.id, {
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        category,
        unit,
        minStock: Number(minStock) || 0,
        description: description.trim(),
      });
    } else {
      addItem({
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        category,
        unit,
        minStock: Number(minStock) || 0,
        description: description.trim(),
      });
    }

    setIsItemModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Package className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isEditing ? 'Ubah Data Master Barang' : 'Tambah Master Barang Baru'}
              </h3>
              <p className="text-xs text-slate-500">Kelola informasi barang dan ambang batas minimum stok</p>
            </div>
          </div>
          <button
            onClick={() => setIsItemModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* SKU */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode / SKU <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="BRG-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono uppercase border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Nama Barang */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Barang <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Kertas HVS A4 80gr"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Kategori */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Barang
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                {COMMON_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Satuan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Satuan Ukuran
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Batas Minimum Stok (Pemicu Notifikasi Stok Rendah) */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <label className="text-xs font-bold text-amber-900">
                Batas Minimum Stok (Peringatan Otomatis)
              </label>
            </div>
            <p className="text-[11px] text-amber-800/80 mb-2 leading-relaxed">
              Jika sisa stok barang mencapai atau berada di bawah angka ini, sistem akan otomatis mengirim notifikasi peringatan restok.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                required
                value={minStock}
                onChange={(e) => setMinStock(Math.max(0, Number(e.target.value)))}
                className="w-32 px-3 py-2 text-xs font-mono font-semibold border border-amber-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-xs font-medium text-amber-900">{unit}</span>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan / Spesifikasi
            </label>
            <textarea
              rows={2}
              placeholder="Catatan tambahan seperti merk, lokasi rak gudang, dll..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsItemModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              {isEditing ? 'Simpan Perubahan' : 'Tambah Barang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
