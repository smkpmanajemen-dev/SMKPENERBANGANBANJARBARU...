export interface Item {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  minStock: number;
  description?: string;
  createdAt: string;
}

export interface InboundTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  itemId: string;
  itemName: string;
  quantity: number;
  supplierOrSource: string;
  documentNo?: string;
  notes?: string;
  createdAt: string;
}

export interface OutboundTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  itemId: string;
  itemName: string;
  recipientName: string;
  department: string;
  quantity: number;
  notes?: string;
  createdAt: string;
}

export interface ItemStockSummary extends Item {
  totalIn: number;
  totalOut: number;
  currentStock: number;
  status: 'aman' | 'rendah' | 'habis';
}

export type ActiveTab = 'dashboard' | 'inventory' | 'inbound' | 'outbound' | 'reports' | 'drive';
