import React, { useState } from 'react';
import { useGoogleAuth } from '../context/GoogleAuthContext';
import { useInventory } from '../context/InventoryContext';
import { GoogleSignInButton } from './GoogleSignInButton';
import { ConfirmModal } from './ConfirmModal';
import { 
  Cloud, 
  UploadCloud, 
  DownloadCloud, 
  ExternalLink, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  FileJson, 
  FolderCheck, 
  LogOut,
  Calendar,
  HardDrive
} from 'lucide-react';
import { DriveFile } from '../services/googleDrive';

export const GoogleDriveView: React.FC = () => {
  const { 
    user, 
    signOut, 
    driveFiles, 
    isSyncing, 
    syncStatus, 
    setSyncStatus,
    refreshDriveFiles, 
    backupInventoryToDrive,
    uploadCsvToDrive,
    restoreInventoryFromDrive,
    deleteFileFromDrive 
  } = useGoogleAuth();

  const { items, inbound, outbound, stockSummaries } = useInventory();

  // Dialog states for user confirmation (MANDATORY for mutating/destructive operations)
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [fileToRestore, setFileToRestore] = useState<DriveFile | null>(null);

  // Helper to generate CSV strings
  const generateInventoryCsvContent = () => {
    const headers = ['Kode/SKU', 'Nama Barang', 'Kategori', 'Satuan', 'Batas Min Stok', 'Total Masuk', 'Total Keluar', 'Sisa Stok', 'Status'];
    const rows = stockSummaries.map((item) => [
      item.sku,
      item.name,
      item.category,
      item.unit,
      item.minStock,
      item.totalIn,
      item.totalOut,
      item.currentStock,
      item.status === 'aman' ? 'Stok Aman' : item.status === 'rendah' ? 'Stok Rendah' : 'Stok Habis',
    ]);
    return [headers, ...rows]
      .map((e) => e.map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
  };

  const generateInboundCsvContent = () => {
    const headers = ['Tanggal Penerimaan', 'Nama Barang', 'Jumlah Masuk', 'Pemasok / Asal', 'No. Dokumen/Surat Jalan', 'Catatan'];
    const rows = inbound.map((tx) => [
      tx.date,
      tx.itemName,
      tx.quantity,
      tx.supplierOrSource,
      tx.documentNo || '-',
      tx.notes || '-',
    ]);
    return [headers, ...rows]
      .map((e) => e.map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
  };

  const generateOutboundCsvContent = () => {
    const headers = ['Tanggal Pengambilan', 'Nama Barang', 'Nama Pengambil', 'Divisi / Keperluan', 'Jumlah Keluar', 'Catatan'];
    const rows = outbound.map((tx) => [
      tx.date,
      tx.itemName,
      tx.recipientName,
      tx.department,
      tx.quantity,
      tx.notes || '-',
    ]);
    return [headers, ...rows]
      .map((e) => e.map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
  };

  const handleBackupNow = async () => {
    await backupInventoryToDrive({ items, inbound, outbound });
  };

  const handleUploadInventoryCsv = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const fileName = `Laporan_Stok_Inventaris_${today}.csv`;
    const content = generateInventoryCsvContent();
    await uploadCsvToDrive(fileName, content);
  };

  const handleUploadInboundCsv = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const fileName = `Riwayat_Penerimaan_Masuk_${today}.csv`;
    const content = generateInboundCsvContent();
    await uploadCsvToDrive(fileName, content);
  };

  const handleUploadOutboundCsv = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const fileName = `Riwayat_Pengambilan_Keluar_${today}.csv`;
    const content = generateOutboundCsvContent();
    await uploadCsvToDrive(fileName, content);
  };

  const handleConfirmDeleteFile = async () => {
    if (fileToDelete) {
      const file = fileToDelete;
      setFileToDelete(null);
      await deleteFileFromDrive(file.id);
    }
  };

  const handleConfirmRestoreFile = async () => {
    if (fileToRestore) {
      const file = fileToRestore;
      setFileToRestore(null);
      const data = await restoreInventoryFromDrive(file.id);
      if (data && data.items) {
        localStorage.setItem('stokflow_items_v1', JSON.stringify(data.items));
        localStorage.setItem('stokflow_inbound_v1', JSON.stringify(data.inbound));
        localStorage.setItem('stokflow_outbound_v1', JSON.stringify(data.outbound));
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Cloud className="w-4 h-4 text-blue-500" />
            <span>Penyimpanan Google Drive</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Sinkronisasi & Cadangan Google Drive
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Simpan cadangan data dan laporan inventaris ke Google Drive Anda secara aman.
          </p>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px]">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-semibold text-slate-700 truncate max-w-[150px]">{user.displayName || user.email}</span>
            </div>

            <button
              onClick={signOut}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
              title="Keluar dari Google"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <GoogleSignInButton />
        )}
      </div>

      {/* Sync Status Alert */}
      {syncStatus && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
          syncStatus.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {syncStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{syncStatus.message}</span>
          </div>
          <button
            onClick={() => setSyncStatus(null)}
            className="text-slate-400 hover:text-slate-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Not Connected State */}
      {!user && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <Cloud className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">Hubungkan dengan Google Drive</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Masuk dengan akun Google Anda untuk menyimpan cadangan berkas inventaris, mengunggah laporan CSV ke folder khusus di Google Drive, serta memulihkan data kapan saja.
            </p>
          </div>
          <div className="pt-2">
            <GoogleSignInButton />
          </div>
        </div>
      )}

      {/* Connected State: Action Cards */}
      {user && (
        <>
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Full JSON Backup */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Cadangan Penuh (.json)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Menyimpan seluruh master barang, riwayat masuk, dan keluar ke folder Drive.
                </p>
              </div>
              <button
                onClick={handleBackupNow}
                disabled={isSyncing}
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{isSyncing ? 'Menyimpan...' : 'Simpan ke Drive'}</span>
              </button>
            </div>

            {/* Card 2: Export Inventory CSV */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Ekspor Stok CSV</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Unggah berkas tabel sisa stok saat ini ke Google Drive.
                </p>
              </div>
              <button
                onClick={handleUploadInventoryCsv}
                disabled={isSyncing}
                className="w-full py-2 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unggah CSV Stok</span>
              </button>
            </div>

            {/* Card 3: Export Inbound CSV */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <DownloadCloud className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Ekspor Masuk CSV</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Unggah seluruh riwayat penerimaan barang masuk ke Drive.
                </p>
              </div>
              <button
                onClick={handleUploadInboundCsv}
                disabled={isSyncing}
                className="w-full py-2 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unggah CSV Masuk</span>
              </button>
            </div>

            {/* Card 4: Export Outbound CSV */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Ekspor Keluar CSV</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Unggah seluruh riwayat pengambilan barang keluar ke Drive.
                </p>
              </div>
              <button
                onClick={handleUploadOutboundCsv}
                disabled={isSyncing}
                className="w-full py-2 px-3 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-rose-600" />
                <span>Unggah CSV Keluar</span>
              </button>
            </div>

          </div>

          {/* Google Drive Folder & File Explorer */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FolderCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Berkas di Folder: "StokFlow - Inventaris"
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Semua cadangan otomatis terorganisir rapi di akun Google Drive Anda
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={refreshDriveFiles}
                  disabled={isSyncing}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                  title="Segarkan daftar berkas"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Segarkan</span>
                </button>
              </div>
            </div>

            {/* Files List */}
            {driveFiles.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                Belum ada berkas cadangan di folder Google Drive. Klik tombol "Simpan ke Drive" di atas untuk membuat cadangan pertama.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {driveFiles.map((file) => {
                  const isJson = file.name.endsWith('.json') || file.mimeType.includes('json');
                  const isCsv = file.name.endsWith('.csv') || file.mimeType.includes('csv');

                  return (
                    <div key={file.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/60 transition-colors px-2 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isJson ? 'bg-indigo-50 text-indigo-600' : isCsv ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isJson ? <FileJson className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{file.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3" />
                              {new Date(file.modifiedTime).toLocaleDateString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                            {file.size && (
                              <>
                                <span>·</span>
                                <span className="font-mono">{Math.round(Number(file.size) / 1024)} KB</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                            <span>Buka di Drive</span>
                          </a>
                        )}

                        {isJson && (
                          <button
                            onClick={() => setFileToRestore(file)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <DownloadCloud className="w-3 h-3" />
                            <span>Pulihkan</span>
                          </button>
                        )}

                        <button
                          onClick={() => setFileToDelete(file)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus berkas dari Google Drive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Confirmation Dialog for Destructive Delete (MANDATORY User Confirmation) */}
      <ConfirmModal
        isOpen={Boolean(fileToDelete)}
        title="Hapus Berkas dari Google Drive"
        message={fileToDelete ? `Apakah Anda yakin ingin menghapus berkas "${fileToDelete.name}" dari akun Google Drive Anda? Tindakan ini akan menghapus berkas tersebut secara permanen.` : ''}
        confirmText="Hapus Berkas"
        cancelText="Batal"
        variant="danger"
        onConfirm={handleConfirmDeleteFile}
        onCancel={() => setFileToDelete(null)}
      />

      {/* Confirmation Dialog for Restoring Data from Google Drive */}
      <ConfirmModal
        isOpen={Boolean(fileToRestore)}
        title="Pulihkan Data dari Google Drive"
        message={fileToRestore ? `Apakah Anda yakin ingin memulihkan inventaris dari berkas cadangan "${fileToRestore.name}"? Data barang, mutasi masuk, dan mutasi keluar saat ini akan digantikan dengan data yang ada di dalam berkas cadangan ini.` : ''}
        confirmText="Ya, Pulihkan Sekarang"
        cancelText="Batal"
        variant="warning"
        onConfirm={handleConfirmRestoreFile}
        onCancel={() => setFileToRestore(null)}
      />

    </div>
  );
};
