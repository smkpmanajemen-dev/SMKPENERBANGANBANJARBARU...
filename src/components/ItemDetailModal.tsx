import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  Edit3, 
  Calendar, 
  User, 
  Truck,
  PlusCircle,
  MinusCircle
} from 'lucide-react';

export const ItemDetailModal: React.FC = () => {
  const { 
    selectedItemForDetail, 
    setSelectedItemForDetail, 
    inbound, 
    outbound,
    openQuickInbound,
    openQuickOutbound,
    openEditItem
  } = useInventory();

  if (!selectedItemForDetail) return null;

  const item = selectedItemForDetail;

  // Filter in and out transactions for this item
  const itemInbound = inbound.filter((t) => t.itemId === item.id);
  const itemOutbound = outbound.filter((t) => t.itemId === item.id);

  // Combine into single sorted timeline
  type TimelineEntry = 
    | { type: 'in'; date: string; qty: number; who: string; ref?: string; notes?: string; id: string }
    | { type: 'out'; date: string; qty: number; who: string; dept?: string; notes?: string; id: string };

  const timeline: TimelineEntry[] = [
    ...itemInbound.map((i): TimelineEntry => ({
      type: 'in',
      date: i.date,
      qty: i.quantity,
      who: i.supplierOrSource,
      ref: i.documentNo,
      notes: i.notes,
      id: i.id,
    })),
    ...itemOutbound.map((o): TimelineEntry => ({
      type: 'out',
      date: o.date,
      qty: o.quantity,
      who: o.recipientName,
      dept: o.department,
      notes: o.notes,
      id: o.id,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const isZero = item.currentStock <= 0;
  const isLow = item.status === 'rendah';

  const handleEditClick = () => {
    setSelectedItemForDetail(null);
    openEditItem(item);
  };

  const handleInboundClick = () => {
    openQuickInbound(item);
  };

  const handleOutboundClick = () => {
    openQuickOutbound(item);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase">{item.sku}</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500">{item.category}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{item.name}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEditClick}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="Ubah data barang"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedItemForDetail(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-[11px] text-slate-500">Total Diterima</div>
              <div className="text-lg font-bold font-mono tabular-nums text-emerald-700 mt-0.5">
                +{item.totalIn} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-[11px] text-slate-500">Total Dikeluarkan</div>
              <div className="text-lg font-bold font-mono tabular-nums text-rose-700 mt-0.5">
                -{item.totalOut} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${
              isZero 
                ? 'bg-rose-50/80 border-rose-200' 
                : isLow 
                ? 'bg-amber-50/80 border-amber-200' 
                : 'bg-emerald-50/80 border-emerald-200'
            }`}>
              <div className="text-[11px] font-semibold text-slate-700">Sisa Stok Otomatis</div>
              <div className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${
                isZero ? 'text-rose-700' : isLow ? 'text-amber-800' : 'text-emerald-800'
              }`}>
                {item.currentStock} <span className="text-xs font-normal text-slate-600">{item.unit}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-[11px] text-slate-500">Batas Min Stok</div>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-700 mt-0.5">
                {item.minStock} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
              </div>
            </div>
          </div>

          {/* Status Badge Explanation */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium">Status Ketersediaan:</span>
            {isZero ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-rose-700">
                <AlertOctagon className="w-4 h-4" /> Stok Habis (Perlu Pengadaan Darurat)
              </span>
            ) : isLow ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-amber-700">
                <AlertTriangle className="w-4 h-4" /> Stok Menipis (Di Bawah Batas Minimum {item.minStock} {item.unit})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" /> Stok Aman & Siap Digunakan
              </span>
            )}
          </div>

          {item.description && (
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-700">Keterangan:</span> {item.description}
            </div>
          )}

          {/* Quick Action Buttons for this item */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleInboundClick}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Catat Penerimaan ({item.name})</span>
            </button>

            <button
              onClick={handleOutboundClick}
              disabled={item.currentStock <= 0}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
                item.currentStock <= 0
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300'
              }`}
            >
              <MinusCircle className={`w-4 h-4 ${item.currentStock <= 0 ? 'text-slate-400' : 'text-rose-600'}`} />
              <span>Catat Pengeluaran (Ambil)</span>
            </button>
          </div>

          {/* Full Transaction History Ledger */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Riwayat Transaksi Masuk & Keluar ({timeline.length} Transaksi)
            </h4>

            {timeline.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                Belum ada mutasi penerimaan atau pengeluaran untuk barang ini.
              </div>
            ) : (
              <div className="space-y-2">
                {timeline.map((entry) => {
                  const isIn = entry.type === 'in';
                  return (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-colors ${
                        isIn ? 'bg-emerald-50/40 border-emerald-100' : 'bg-rose-50/40 border-rose-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isIn ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {isIn ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${isIn ? 'text-emerald-800' : 'text-rose-800'}`}>
                              {isIn ? 'Penerimaan (Masuk)' : 'Pengambilan (Keluar)'}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-500 font-mono flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" /> {entry.date}
                            </span>
                          </div>
                          
                          <div className="text-slate-600 mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                            {isIn ? (
                              <span className="flex items-center gap-1">
                                <Truck className="w-3 h-3 text-slate-400" /> Sumber: <strong>{entry.who}</strong>
                                {entry.ref && <span className="text-slate-400">({entry.ref})</span>}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400" /> Pengambil: <strong>{entry.who}</strong>
                                {'dept' in entry && entry.dept && <span className="text-slate-400">({entry.dept})</span>}
                              </span>
                            )}
                          </div>

                          {entry.notes && (
                            <p className="text-[11px] text-slate-500 italic mt-0.5">
                              "{entry.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="sm:text-right pl-10 sm:pl-0 shrink-0">
                        <span className={`text-sm font-bold font-mono tabular-nums ${
                          isIn ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {isIn ? '+' : '-'}{entry.qty} {item.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={() => setSelectedItemForDetail(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
