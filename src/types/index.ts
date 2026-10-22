export type UserRole = 'admin_pusat' | 'manajer_toko' | 'kasir';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  branchId: string;
  avatar: string;
  pin: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  managerName: string;
  isHQ: boolean;
  isActive: boolean;
}

export type IngredientUnit = 'gram' | 'ml' | 'pcs' | 'porsi';

export interface RawIngredient {
  id: string;
  name: string;
  sku: string;
  category: 'Kopi & Biji' | 'Susu & Dairy' | 'Sirup & Gula' | 'Teh & Powder' | 'Bakery & Dapur' | 'Packaging';
  unit: IngredientUnit;
  minStockThreshold: number; // Safety stock limit
  costPerUnit: number; // Harga Pokok Pembelian (HPP) per unit
  stockByBranch: Record<string, number>; // branchId -> stock amount
  supplier: string;
  lastRestockedAt?: string;
}

export interface RecipeItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: IngredientUnit;
}

export interface MenuItem {
  id: string;
  name: string;
  sku: string;
  category: 'Kopi' | 'Non-Kopi' | 'Makanan' | 'Pastry & Snack' | 'Signature';
  basePrice: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  recipe: RecipeItem[];
  sugarOptions?: string[];
  iceOptions?: string[];
  milkOptions?: { name: string; extraPrice: number }[];
  sizeOptions?: { name: string; extraPrice: number }[];
}

export interface CartItemOption {
  sugarLevel?: string;
  iceLevel?: string;
  milkChoice?: string;
  extraShot?: boolean;
  size?: string;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  options: CartItemOption;
  notes?: string;
  unitPrice: number;
  subtotal: number;
}

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';

export type PaymentMethod = 'QRIS' | 'CASH' | 'GOPAY' | 'OVO' | 'DANA' | 'SHOPEEPAY' | 'DEBIT_CREDIT';

export interface TransactionItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  costPrice: number; // for gross profit calculation
  optionsSummary?: string;
  notes?: string;
  subtotal: number;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  branchId: string;
  branchName: string;
  cashierId: string;
  cashierName: string;
  orderType: OrderType;
  tableNumber?: string;
  customerName: string;
  items: TransactionItem[];
  subtotal: number;
  discountRate: number; // 0 - 100%
  discountAmount: number;
  taxRate: number; // 11% PPN
  taxAmount: number;
  serviceChargeRate: number; // 5%
  serviceChargeAmount: number;
  total: number;
  totalCost: number; // total HPP
  grossProfit: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending' | 'cancelled';
  cashTendered?: number;
  changeAmount?: number;
  paymentReference?: string;
  createdAt: string; // ISO string
  notes?: string;
}

export interface StockAlert {
  id: string;
  ingredientId: string;
  ingredientName: string;
  branchId: string;
  branchName: string;
  currentStock: number;
  minThreshold: number;
  unit: IngredientUnit;
  severity: 'critical' | 'warning';
  createdAt: string;
  isRead: boolean;
}

export interface StockLog {
  id: string;
  timestamp: string;
  branchId: string;
  ingredientId: string;
  ingredientName: string;
  changeAmount: number; // negative for deduction, positive for restock
  resultingStock: number;
  reason: 'sale_deduction' | 'restock' | 'manual_adjustment' | 'branch_transfer' | 'waste';
  referenceId?: string; // transaction id or PO number
  actorName: string;
  notes?: string;
}

export interface InterBranchTransfer {
  id: string;
  fromBranchId: string;
  toBranchId: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: IngredientUnit;
  status: 'pending' | 'completed' | 'cancelled';
  requestedBy: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface DailySummary {
  date: string;
  totalRevenue: number;
  totalTransactions: number;
  totalGrossProfit: number;
  averageOrderValue: number;
}
