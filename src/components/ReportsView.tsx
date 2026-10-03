import React, { useRef, useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useGoogleAuth } from '../context/GoogleAuthContext';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Package,
  Calendar,
  Cloud,
  UploadCloud
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const ReportsView: React.FC = () => {
  const { 
    stockSummaries, 
    inbound, 
    outbound, 
    exportInventoryCSV, 
    exportInboundCSV, 
    exportOutboundCSV,
    exportBackupJSON,
    importBackupJSON,
    resetToDefaultData,
    items,
    setActiveTab
  } = useInventory();

  const { user, backupInventoryToDrive, isSyncing, signIn } = useGoogleAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupJSON(content);
        if (success) {
          setImportStatus({
            type: 'success',
            message: 'Data inventaris berhasil dipulihkan dari cadangan!',
          });
        } else {
          setImportStatus({
            type: 'error',
            message: 'Format file JSON tidak valid atau rusak.',
          });
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    resetToDefaultData();
    setIsResetConfirmOpen(false);
    setImportStatus({
      type: 'success',
      message: 'Data inventaris berhasil direset ke data contoh default.',
    });
  };

  const totalIn = inbound.reduce((a, b) => a + b.quantity, 0);
  const totalOut = outbound.reduce((a, b) => a + b.quantity, 0);
  const totalStock = stockSummaries.reduce((a, b) => a + b.currentStock, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <span>Laporan & Manajemen Data</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Rekap Inventaris & Ekspor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cetak rekap fisik, unduh file spreadsheet CSV, atau cadangkan data JSON untuk PC & HP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak / Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Import status notification */}
      {importStatus && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
          importStatus.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        } print:hidden`}>
          <div className="flex items-center gap-2">
            {importStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span className="font-semibold">{importStatus.message}</span>
          </div>
          <button
            onClick={() => setImportStatus(null)}
            className="text-slate-400 hover:text-slate-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* CSV Export & Backup Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        
        {/* Google Drive Cloud Sync */}
        <div className="bg-white border border-blue-200/80 rounded-2xl p-5 shadow-xs space-y-3 bg-gradient-to-b from-blue-50/30 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Google Drive Cloud</h3>
              <p className="text-[11px] text-slate-400">
                {user ? user.email : 'Cadangkan ke Cloud'}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            {user
              ? 'Simpan cadangan langsung ke folder Google Drive Anda agar data aman dan tersinkronisasi.'
              : 'Hubungkan dengan akun Google Anda untuk menyimpan cadangan di cloud.'}
          </p>

          <div className="space-y-1.5 pt-1">
            {user ? (
              <button
                onClick={() => backupInventoryToDrive({ items, inbound, outbound })}
                disabled={isSyncing}
                className="w-full py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{isSyncing ? 'Menyimpan...' : 'Simpan ke Drive'}</span>
              </button>
            ) : (
              <button
                onClick={signIn}
                className="w-full py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Hubungkan Google</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('drive')}
              className="w-full py-1.5 text-[11px] font-semibold text-blue-700 hover:underline text-center block"
            >
              Buka Pengelola Drive →
            </button>
          </div>
        </div>

        {/* CSV Downloads */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Ekspor File CSV (Excel)</h3>
              <p className="text-[11px] text-slate-400">Unduh data dalam format spreadsheet</p>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <button
              onClick={exportInventoryCSV}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between transition-colors"
            >
              <span>1. Laporan Sisa Stok Barang</span>
              <Download className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={exportInboundCSV}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between transition-colors"
            >
              <span>2. Riwayat Penerimaan Masuk</span>
              <Download className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={exportOutboundCSV}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between transition-colors"
            >
              <span>3. Riwayat Pengambilan Keluar</span>
              <Download className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* JSON Backup & Transfer between PC / HP */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Cadangkan & Pindah Data</h3>
              <p className="text-[11px] text-slate-400">Pindahkan data antar PC & HP</p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={exportBackupJSON}
              className="w-full py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Simpan File Cadangan (.json)</span>
            </button>

            <div>
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                id="import-backup-file"
              />
              <label
                htmlFor="import-backup-file"
                className="w-full py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer block text-center"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Pulihkan dari File (.json)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Reset / Default Demo Data */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Data Contoh / Reset</h3>
              <p className="text-[11px] text-slate-400">Kembalikan ke data demonstrasi</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            Gunakan opsi ini jika ingin mengeksplorasi kembali dengan data contoh awal (ATK, toner, lakban, masker).
          </p>

          <button
            onClick={handleReset}
            className="w-full py-2 text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Data Contoh</span>
          </button>
        </div>

      </div>

      {/* Printable Official Inventory Audit Report */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs print:border-none print:shadow-none print:p-0">
        
        {/* Printable Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-5 h-5 text-slate-900" />
              <h1 className="text-lg font-bold tracking-tight text-slate-900 uppercase">
                StokFlow — Laporan Rekapitulasi Inventaris Barang
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Penerimaan, Pengeluaran & Sisa Stok Akhir
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5">
            <div className="flex items-center sm:justify-end gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
            </div>
            <div>Status Sistem: Terverifikasi Otomatis</div>
          </div>
        </div>

        {/* High level figures summary */}
        <div className="grid grid-cols-3 gap-3 mb-6 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500">Total Akumulasi Masuk:</span>
            <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">+{totalIn} Unit</div>
          </div>
          <div>
            <span className="text-slate-500">Total Akumulasi Keluar:</span>
            <div className="text-base font-bold font-mono text-rose-700 mt-0.5">-{totalOut} Unit</div>
          </div>
          <div>
            <span className="text-slate-500">Total Sisa Stok Fisik:</span>
            <div className="text-base font-bold font-mono text-slate-900 mt-0.5">{totalStock} Unit</div>
          </div>
        </div>

        {/* Printable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-700 font-bold">
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">Kode SKU</th>
                <th className="py-2.5 px-3">Nama Barang</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3 text-right">Tot. Masuk</th>
                <th className="py-2.5 px-3 text-right">Tot. Keluar</th>
                <th className="py-2.5 px-3 text-right">Sisa Stok</th>
                <th className="py-2.5 px-3 text-center">Batas Min</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {stockSummaries.map((item, idx) => {
                const isZero = item.currentStock <= 0;
                const isLow = item.status === 'rendah';
                return (
                  <tr key={item.id} className="text-slate-800">
                    <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono font-semibold">{item.sku}</td>
                    <td className="py-2 px-3 font-semibold">{item.name}</td>
                    <td className="py-2 px-3 text-slate-600">{item.category}</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-700">+{item.totalIn}</td>
                    <td className="py-2 px-3 text-right font-mono text-rose-700">-{item.totalOut}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      {item.currentStock} {item.unit}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-slate-500">
                      {item.minStock} {item.unit}
                    </td>
                    <td className="py-2 px-3 text-center font-semibold">
                      {isZero ? (
                        <span className="text-rose-600">HABIS</span>
                      ) : isLow ? (
                        <span className="text-amber-700">MENIPIS</span>
                      ) : (
                        <span className="text-emerald-700">AMAN</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Printable Signatures */}
        <div className="hidden print:grid grid-cols-2 gap-12 mt-16 pt-8 text-xs text-center border-t border-slate-200">
          <div>
            <div className="text-slate-500 mb-16">Petugas Bagian Gudang / Inventaris,</div>
            <div className="font-bold text-slate-900 border-t border-slate-400 pt-1 inline-block min-w-[180px]">
              ( ............................................ )
            </div>
          </div>
          <div>
            <div className="text-slate-500 mb-16">Mengetahui, Kepala Operasional</div>
            <div className="font-bold text-slate-900 border-t border-slate-400 pt-1 inline-block min-w-[180px]">
              ( ............................................ )
            </div>
          </div>
        </div>

      </div>

      {/* Confirm Reset Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset Data ke Contoh Bawaan"
        message="Apakah Anda yakin ingin mengatur ulang data ke data demo bawaan? Semua barang dan mutasi yang telah Anda catat akan digantikan dengan data contoh default."
        confirmText="Reset Data"
        cancelText="Batal"
        variant="warning"
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
