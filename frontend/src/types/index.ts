export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Customer {
  id: string;
  customerName: string;
  mobileNumber: string;
  email: string | null;
  businessName: string;
  gstNumber: string | null;
  customerType: 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
  address: string | null;
  status: 'LEAD' | 'ACTIVE' | 'INACTIVE';
  followUpDate: string | null;
  createdAt: string;
  followups?: Followup[];
}

export interface Followup {
  id: string;
  note: string;
  followUpDate: string;
  createdAt: string;
  user: { name: string };
}

export interface Product {
  id: string;
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouseLocation: string;
}

export interface StockMovement {
  id: string;
  quantity: number;
  movementType: 'IN' | 'OUT';
  reason: string | null;
  createdAt: string;
  product: { productName: string; sku: string };
  user: { name: string };
}

export interface ChallanItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  totalQuantity: number;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  customer: { customerName: string; businessName: string };
  user: { name: string };
  items?: ChallanItem[];
}
