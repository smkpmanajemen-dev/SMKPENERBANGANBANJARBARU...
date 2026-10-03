import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Item, InboundTransaction, OutboundTransaction, ItemStockSummary, ActiveTab } from '../types/inventory';
import { INITIAL_ITEMS, INITIAL_INBOUND, INITIAL_OUTBOUND } from '../data/initialData';

interface InventoryContextType {
  items: Item[];
  inbound: InboundTransaction[];
  outbound: OutboundTransaction[];
  stockSummaries: ItemStockSummary[];
  lowStockItems: ItemStockSummary[];
  outOfStockItems: ItemStockSummary[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Modals & Drawers state
  isInboundModalOpen: boolean;
  setIsInboundModalOpen: (open: boolean) => void;
  isOutboundModalOpen: boolean;
  setIsOutboundModalOpen: (open: boolean) => void;
  isItemModalOpen: boolean;
  setIsItemModalOpen: (open: boolean) => void;
  isLowStockDrawerOpen: boolean;
  setIsLowStockDrawerOpen: (open: boolean) => void;
  selectedItemForDetail: ItemStockSummary | null;
  setSelectedItemForDetail: (item: ItemStockSummary | null) => void;
  selectedItemForEdit: Item | null;
  setSelectedItemForEdit: (item: Item | null) => void;
  preselectedItem: Item | null;
  setPreselectedItem: (item: Item | null) => void;

  // Actions
  addInbound: (tx: Omit<InboundTransaction, 'id' | 'createdAt'>) => void;
  deleteInbound: (id: string) => void;
  addOutbound: (tx: Omit<OutboundTransaction, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  deleteOutbound: (id: string) => void;
  addItem: (item: Omit<Item, 'id' | 'createdAt'>) => Item;
  updateItem: (id: string, data: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  
  // Shortcuts
  openQuickInbound: (item?: Item) => void;
  openQuickOutbound: (item?: Item) => void;
  openCreateItem: () => void;
  openEditItem: (item: Item) => void;

  // Backup & Export
  resetToDefaultData: () => void;
  exportInventoryCSV: () => void;
  exportInboundCSV: () => void;
  exportOutboundCSV: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonData: string) => boolean;
}

const STORAGE_KEYS = {
  ITEMS: 'stokflow_items_v1',
  INBOUND: 'stokflow_inbound_v1',
  OUTBOUND: 'stokflow_outbound_v1',
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
      return saved ? JSON.parse(saved) : INITIAL_ITEMS;
    } catch {
      return INITIAL_ITEMS;
    }
  });

  const [inbound, setInbound] = useState<InboundTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INBOUND);
      return saved ? JSON.parse(saved) : INITIAL_INBOUND;
    } catch {
      return INITIAL_INBOUND;
    }
  });

  const [outbound, setOutbound] = useState<OutboundTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OUTBOUND);
      return saved ? JSON.parse(saved) : INITIAL_OUTBOUND;
    } catch {
      return INITIAL_OUTBOUND;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isInboundModalOpen, setIsInboundModalOpen] = useState(false);
  const [isOutboundModalOpen, setIsOutboundModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isLowStockDrawerOpen, setIsLowStockDrawerOpen] = useState(false);
  
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<ItemStockSummary | null>(null);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<Item | null>(null);
  const [preselectedItem, setPreselectedItem] = useState<Item | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save items', err);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INBOUND, JSON.stringify(inbound));
    } catch (err) {
      console.error('Failed to save inbound', err);
    }
  }, [inbound]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.OUTBOUND, JSON.stringify(outbound));
    } catch (err) {
      console.error('Failed to save outbound', err);
    }
  }, [outbound]);

  // Real-time calculation of stock summaries
  const stockSummaries = useMemo<ItemStockSummary[]>(() => {
    // Map transactions by itemId
    const inMap = new Map<string, number>();
    const outMap = new Map<string, number>();

    for (const inTx of inbound) {
      inMap.set(inTx.itemId, (inMap.get(inTx.itemId) || 0) + inTx.quantity);
    }

    for (const outTx of outbound) {
      outMap.set(outTx.itemId, (outMap.get(outTx.itemId) || 0) + outTx.quantity);
    }

    return items.map((item) => {
      const totalIn = inMap.get(item.id) || 0;
      const totalOut = outMap.get(item.id) || 0;
      const currentStock = totalIn - totalOut;

      let status: 'aman' | 'rendah' | 'habis' = 'aman';
      if (currentStock <= 0) {
        status = 'habis';
      } else if (currentStock <= item.minStock) {
        status = 'rendah';
      }

      return {
        ...item,
        totalIn,
        totalOut,
        currentStock,
        status,
      };
    });
  }, [items, inbound, outbound]);

  // Derived low stock items (critical attention)
  const lowStockItems = useMemo(() => {
    return stockSummaries.filter((item) => item.status === 'rendah');
  }, [stockSummaries]);

  const outOfStockItems = useMemo(() => {
    return stockSummaries.filter((item) => item.status === 'habis');
  }, [stockSummaries]);

  // Update selectedItemForDetail if stock changed
  useEffect(() => {
    if (selectedItemForDetail) {
      const updated = stockSummaries.find((s) => s.id === selectedItemForDetail.id);
      if (updated) {
        setSelectedItemForDetail(updated);
      }
    }
  }, [stockSummaries, selectedItemForDetail?.id]);

  // CRUD operations
  const addInbound = (tx: Omit<InboundTransaction, 'id' | 'createdAt'>) => {
    const newTx: InboundTransaction = {
      ...tx,
      id: `in-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setInbound((prev) => [newTx, ...prev]);
  };

  const deleteInbound = (id: string) => {
    setInbound((prev) => prev.filter((item) => item.id !== id));
  };

  const addOutbound = (tx: Omit<OutboundTransaction, 'id' | 'createdAt'>): { success: boolean; error?: string } => {
    // Check remaining stock
    const summary = stockSummaries.find((s) => s.id === tx.itemId);
    if (!summary) {
      return { success: false, error: 'Barang tidak ditemukan.' };
    }

    if (tx.quantity > summary.currentStock) {
      return {
        success: false,
        error: `Stok tidak mencukupi! Sisa stok saat ini hanya ${summary.currentStock} ${summary.unit}, sedangkan yang diminta ${tx.quantity} ${summary.unit}.`,
      };
    }

    const newTx: OutboundTransaction = {
      ...tx,
      id: `out-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setOutbound((prev) => [newTx, ...prev]);
    return { success: true };
  };

  const deleteOutbound = (id: string) => {
    setOutbound((prev) => prev.filter((item) => item.id !== id));
  };

  const addItem = (itemData: Omit<Item, 'id' | 'createdAt'>): Item => {
    const newItem: Item = {
      ...itemData,
      id: `item-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => [...prev, newItem]);
    return newItem;
  };

  const updateItem = (id: string, data: Partial<Item>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...data };
          // If name changed, keep transactions aligned
          if (data.name && data.name !== item.name) {
            setInbound((inList) =>
              inList.map((t) => (t.itemId === id ? { ...t, itemName: data.name! } : t))
            );
            setOutbound((outList) =>
              outList.map((t) => (t.itemId === id ? { ...t, itemName: data.name! } : t))
            );
          }
          return updated;
        }
        return item;
      })
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    // Also remove related inbound & outbound
    setInbound((prev) => prev.filter((item) => item.itemId !== id));
    setOutbound((prev) => prev.filter((item) => item.itemId !== id));
    if (selectedItemForDetail?.id === id) {
      setSelectedItemForDetail(null);
    }
  };

  // Shortcuts
  const openQuickInbound = (item?: Item) => {
    setPreselectedItem(item || null);
    setIsInboundModalOpen(true);
  };

  const openQuickOutbound = (item?: Item) => {
    setPreselectedItem(item || null);
    setIsOutboundModalOpen(true);
  };

  const openCreateItem = () => {
    setSelectedItemForEdit(null);
    setIsItemModalOpen(true);
  };

  const openEditItem = (item: Item) => {
    setSelectedItemForEdit(item);
    setIsItemModalOpen(true);
  };

  const resetToDefaultData = () => {
    setItems(INITIAL_ITEMS);
    setInbound(INITIAL_INBOUND);
    setOutbound(INITIAL_OUTBOUND);
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.INBOUND);
    localStorage.removeItem(STORAGE_KEYS.OUTBOUND);
  };

  // CSV Helpers
  const downloadCSV = (filename: string, rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      rows
        .map((e) =>
          e
            .map((val) => {
              const str = String(val ?? '').replace(/"/g, '""');
              return `"${str}"`;
            })
            .join(',')
        )
        .join('\r\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportInventoryCSV = () => {
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
    downloadCSV(`Laporan_Inventaris_Stok_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  };

  const exportInboundCSV = () => {
    const headers = ['Tanggal Penerimaan', 'Nama Barang', 'Jumlah Masuk', 'Pemasok / Asal', 'No. Dokumen/Surat Jalan', 'Catatan'];
    const rows = inbound.map((tx) => [
      tx.date,
      tx.itemName,
      tx.quantity,
      tx.supplierOrSource,
      tx.documentNo || '-',
      tx.notes || '-',
    ]);
    downloadCSV(`Riwayat_Penerimaan_Barang_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  };

  const exportOutboundCSV = () => {
    const headers = ['Tanggal Pengambilan', 'Nama Barang', 'Nama Pengambil', 'Divisi / Keperluan', 'Jumlah Keluar', 'Catatan'];
    const rows = outbound.map((tx) => [
      tx.date,
      tx.itemName,
      tx.recipientName,
      tx.department,
      tx.quantity,
      tx.notes || '-',
    ]);
    downloadCSV(`Riwayat_Pengeluaran_Barang_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  };

  const exportBackupJSON = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      items,
      inbound,
      outbound,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stokflow_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importBackupJSON = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed.items) && Array.isArray(parsed.inbound) && Array.isArray(parsed.outbound)) {
        setItems(parsed.items);
        setInbound(parsed.inbound);
        setOutbound(parsed.outbound);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        inbound,
        outbound,
        stockSummaries,
        lowStockItems,
        outOfStockItems,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isInboundModalOpen,
        setIsInboundModalOpen,
        isOutboundModalOpen,
        setIsOutboundModalOpen,
        isItemModalOpen,
        setIsItemModalOpen,
        isLowStockDrawerOpen,
        setIsLowStockDrawerOpen,
        selectedItemForDetail,
        setSelectedItemForDetail,
        selectedItemForEdit,
        setSelectedItemForEdit,
        preselectedItem,
        setPreselectedItem,
        addInbound,
        deleteInbound,
        addOutbound,
        deleteOutbound,
        addItem,
        updateItem,
        deleteItem,
        openQuickInbound,
        openQuickOutbound,
        openCreateItem,
        openEditItem,
        resetToDefaultData,
        exportInventoryCSV,
        exportInboundCSV,
        exportOutboundCSV,
        exportBackupJSON,
        importBackupJSON,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
