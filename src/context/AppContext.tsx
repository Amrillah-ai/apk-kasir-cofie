import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Branch,
  RawIngredient,
  MenuItem,
  Transaction,
  CartItem,
  CartItemOption,
  OrderType,
  PaymentMethod,
  StockAlert,
  StockLog,
  InterBranchTransfer,
} from '../types';
import {
  INITIAL_BRANCHES,
  INITIAL_USERS,
  INITIAL_INGREDIENTS,
  INITIAL_MENU_ITEMS,
  generateSeedTransactions,
  INITIAL_STOCK_ALERTS,
} from '../data/mockData';
import { generateReceiptNumber } from '../utils/formatters';

interface AppContextType {
  currentUser: User;
  currentRole: UserRole;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  branches: Branch[];
  activeBranchId: string; // branch id or 'ALL'
  setActiveBranchId: (id: string) => void;
  activeBranch: Branch | null;
  
  // Ingredients & Stock
  ingredients: RawIngredient[];
  stockAlerts: StockAlert[];
  stockLogs: StockLog[];
  interBranchTransfers: InterBranchTransfer[];
  restockIngredient: (ingredientId: string, branchId: string, amount: number, supplier?: string, notes?: string) => void;
  transferStock: (fromBranchId: string, toBranchId: string, ingredientId: string, amount: number, notes?: string) => void;
  adjustStockManual: (ingredientId: string, branchId: string, newStock: number, reasonText: string) => void;
  markAlertAsRead: (alertId: string) => void;
  clearAllAlerts: () => void;

  // Catalog
  menuItems: MenuItem[];

  // Cart & POS
  cart: CartItem[];
  orderType: OrderType;
  setOrderType: (t: OrderType) => void;
  tableNumber: string;
  setTableNumber: (s: string) => void;
  customerName: string;
  setCustomerName: (s: string) => void;
  discountRate: number;
  setDiscountRate: (n: number) => void;
  addToCart: (item: MenuItem, options?: CartItemOption, notes?: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDiscountAmount: number;
  cartTaxAmount: number;
  cartServiceAmount: number;
  cartTotal: number;

  // Transactions
  transactions: Transaction[];
  lastCompletedTransaction: Transaction | null;
  completeCheckout: (
    paymentMethod: PaymentMethod,
    cashTendered?: number,
    paymentReference?: string
  ) => Transaction;
  
  // Reset
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'kopikula_pos_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or defaults
  const loadInitialData = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load local storage:', e);
    }
    return null;
  };

  const initialCached = loadInitialData();

  const [branches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (initialCached?.currentUser) return initialCached.currentUser;
    return INITIAL_USERS[0]; // Admin Pusat
  });
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return initialCached?.currentRole || 'admin_pusat';
  });
  const [activeBranchId, setActiveBranchId] = useState<string>(() => {
    return initialCached?.activeBranchId || 'b-senopati';
  });

  const [ingredients, setIngredients] = useState<RawIngredient[]>(() => {
    return initialCached?.ingredients || INITIAL_INGREDIENTS;
  });

  const [menuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return initialCached?.transactions || generateSeedTransactions();
  });

  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>(() => {
    return initialCached?.stockAlerts || INITIAL_STOCK_ALERTS;
  });

  const [stockLogs, setStockLogs] = useState<StockLog[]>(() => {
    return initialCached?.stockLogs || [];
  });

  const [interBranchTransfers, setInterBranchTransfers] = useState<InterBranchTransfer[]>(() => {
    return initialCached?.interBranchTransfers || [];
  });

  // POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [tableNumber, setTableNumber] = useState<string>('01');
  const [customerName, setCustomerName] = useState<string>('Tamu Kafe');
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [lastCompletedTransaction, setLastCompletedTransaction] = useState<Transaction | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      const stateToSave = {
        currentUser,
        currentRole,
        activeBranchId,
        ingredients,
        transactions: transactions.slice(0, 150), // keep performant
        stockAlerts,
        stockLogs: stockLogs.slice(0, 100),
        interBranchTransfers,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [currentUser, currentRole, activeBranchId, ingredients, transactions, stockAlerts, stockLogs, interBranchTransfers]);

  const activeBranch = branches.find(b => b.id === activeBranchId) || branches[0];

  const switchUser = (userId: string) => {
    const user = INITIAL_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setCurrentRole(user.role);
      if (user.branchId) {
        setActiveBranchId(user.branchId);
      }
    }
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'admin_pusat') {
      setCurrentUser(INITIAL_USERS[0]);
    } else if (role === 'manajer_toko') {
      setCurrentUser(INITIAL_USERS[1]);
      setActiveBranchId('b-senopati');
    } else {
      setCurrentUser(INITIAL_USERS[2]);
      setActiveBranchId('b-senopati');
    }
  };

  // Cart operations
  const addToCart = (item: MenuItem, options: CartItemOption = {}, notes?: string) => {
    let unitPrice = item.basePrice;
    if (options.milkChoice?.includes('+Rp 8.000') || options.milkChoice?.includes('Oat Milk')) {
      unitPrice += 8000;
    }
    if (options.size?.includes('+Rp 6.000') || options.size?.includes('Large')) {
      unitPrice += 6000;
    }
    if (options.extraShot) {
      unitPrice += 6000;
    }

    const cartItemId = `${item.id}-${JSON.stringify(options)}-${notes || ''}`;

    setCart(prev => {
      const existing = prev.find(ci => ci.cartItemId === cartItemId);
      if (existing) {
        return prev.map(ci =>
          ci.cartItemId === cartItemId
            ? { ...ci, quantity: ci.quantity + 1, subtotal: (ci.quantity + 1) * ci.unitPrice }
            : ci
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          menuItem: item,
          quantity: 1,
          options,
          notes,
          unitPrice,
          subtotal: unitPrice,
        },
      ];
    });
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(ci => {
          if (ci.cartItemId === cartItemId) {
            const newQty = ci.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...ci,
              quantity: newQty,
              subtotal: newQty * ci.unitPrice,
            };
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(ci => ci.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountRate(0);
  };

  // Cart calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const cartDiscountAmount = Math.round((cartSubtotal * discountRate) / 100);
  const taxableSubtotal = cartSubtotal - cartDiscountAmount;
  const cartTaxAmount = Math.round((taxableSubtotal * 11) / 100); // PPN 11%
  const cartServiceAmount = orderType === 'dine_in' ? Math.round((taxableSubtotal * 5) / 100) : 0; // 5% service for dine-in
  const cartTotal = taxableSubtotal + cartTaxAmount + cartServiceAmount;

  // Checkout and AUTOMATIC RECIPE / BOM STOCK DEDUCTION
  const completeCheckout = (
    paymentMethod: PaymentMethod,
    cashTendered?: number,
    paymentReference?: string
  ): Transaction => {
    const branchForTx = activeBranch || branches[0];
    const branchCode = branchForTx.code;
    const branchId = branchForTx.id;

    // 1. Calculate items & HPP
    let totalCost = 0;
    const txItems = cart.map(ci => {
      // Calculate recipe cost
      const itemCost = ci.menuItem.recipe.reduce((cAcc, r) => {
        const ing = ingredients.find(ig => ig.id === r.ingredientId);
        return cAcc + (ing ? ing.costPerUnit * r.quantity : 2500);
      }, 0);

      totalCost += itemCost * ci.quantity;

      const opts: string[] = [];
      if (ci.options.sugarLevel) opts.push(ci.options.sugarLevel);
      if (ci.options.iceLevel) opts.push(ci.options.iceLevel);
      if (ci.options.milkChoice) opts.push(ci.options.milkChoice);
      if (ci.options.extraShot) opts.push('+1 Shot');
      if (ci.options.size) opts.push(ci.options.size);

      return {
        menuItemId: ci.menuItem.id,
        name: ci.menuItem.name,
        quantity: ci.quantity,
        unitPrice: ci.unitPrice,
        costPrice: itemCost,
        optionsSummary: opts.join(', '),
        notes: ci.notes,
        subtotal: ci.subtotal,
      };
    });

    const grossProfit = cartTotal - cartTaxAmount - cartServiceAmount - totalCost;
    const nowIso = new Date().toISOString();
    const receiptNumber = generateReceiptNumber(branchCode);
    const txId = `TR-${Date.now().toString().slice(-8)}`;

    const newTransaction: Transaction = {
      id: txId,
      receiptNumber,
      branchId,
      branchName: branchForTx.name,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      orderType,
      tableNumber: orderType === 'dine_in' ? (tableNumber || '01') : undefined,
      customerName: customerName || 'Pelanggan Walk-in',
      items: txItems,
      subtotal: cartSubtotal,
      discountRate,
      discountAmount: cartDiscountAmount,
      taxRate: 11,
      taxAmount: cartTaxAmount,
      serviceChargeRate: orderType === 'dine_in' ? 5 : 0,
      serviceChargeAmount: cartServiceAmount,
      total: cartTotal,
      totalCost,
      grossProfit,
      paymentMethod,
      paymentStatus: 'paid',
      cashTendered,
      changeAmount: cashTendered ? Math.max(0, cashTendered - cartTotal) : undefined,
      paymentReference,
      createdAt: nowIso,
    };

    // 2. AUTOMATIC RECIPE BOM INGREDIENT DEDUCTION & LOW STOCK ALERTS
    const stockDeductionMap: Record<string, number> = {};
    cart.forEach(ci => {
      ci.menuItem.recipe.forEach(recipeItem => {
        const consumed = recipeItem.quantity * ci.quantity;
        stockDeductionMap[recipeItem.ingredientId] = (stockDeductionMap[recipeItem.ingredientId] || 0) + consumed;
      });
    });

    const newLogs: StockLog[] = [];
    const newAlerts: StockAlert[] = [];

    setIngredients(prevIngredients => {
      return prevIngredients.map(ing => {
        const deduction = stockDeductionMap[ing.id];
        if (!deduction) return ing;

        const currentBranchStock = ing.stockByBranch[branchId] ?? 0;
        const newStock = Math.max(0, currentBranchStock - deduction);

        // Record stock log
        newLogs.push({
          id: `log-${Date.now()}-${ing.id}`,
          timestamp: nowIso,
          branchId,
          ingredientId: ing.id,
          ingredientName: ing.name,
          changeAmount: -deduction,
          resultingStock: newStock,
          reason: 'sale_deduction',
          referenceId: receiptNumber,
          actorName: currentUser.name,
          notes: `Pengurangan otomatis dari pesanan ${receiptNumber}`,
        });

        // Trigger automatic low stock threshold notification
        if (newStock <= ing.minStockThreshold) {
          const isCritical = newStock <= ing.minStockThreshold * 0.4;
          newAlerts.push({
            id: `alert-${Date.now()}-${ing.id}`,
            ingredientId: ing.id,
            ingredientName: ing.name,
            branchId,
            branchName: branchForTx.name,
            currentStock: newStock,
            minThreshold: ing.minStockThreshold,
            unit: ing.unit,
            severity: isCritical ? 'critical' : 'warning',
            createdAt: nowIso,
            isRead: false,
          });
        }

        return {
          ...ing,
          stockByBranch: {
            ...ing.stockByBranch,
            [branchId]: newStock,
          },
        };
      });
    });

    // Update stock logs and alerts
    if (newLogs.length > 0) {
      setStockLogs(prev => [...newLogs, ...prev]);
    }
    if (newAlerts.length > 0) {
      setStockAlerts(prev => [...newAlerts, ...prev]);
    }

    // Add transaction to history
    setTransactions(prev => [newTransaction, ...prev]);
    setLastCompletedTransaction(newTransaction);

    // Clear cart
    clearCart();

    return newTransaction;
  };

  // Restock action
  const restockIngredient = (
    ingredientId: string,
    branchId: string,
    amount: number,
    supplier?: string,
    notes?: string
  ) => {
    const nowIso = new Date().toISOString();
    const branchObj = branches.find(b => b.id === branchId);

    setIngredients(prev =>
      prev.map(ing => {
        if (ing.id !== ingredientId) return ing;
        const current = ing.stockByBranch[branchId] ?? 0;
        const resulting = current + amount;

        setStockLogs(l => [
          {
            id: `log-restock-${Date.now()}`,
            timestamp: nowIso,
            branchId,
            ingredientId: ing.id,
            ingredientName: ing.name,
            changeAmount: amount,
            resultingStock: resulting,
            reason: 'restock',
            actorName: currentUser.name,
            notes: notes || `Restok bahan masuk dari ${supplier || ing.supplier}`,
          },
          ...l,
        ]);

        return {
          ...ing,
          supplier: supplier || ing.supplier,
          lastRestockedAt: nowIso,
          stockByBranch: {
            ...ing.stockByBranch,
            [branchId]: resulting,
          },
        };
      })
    );
  };

  // Manual stock opname adjustment
  const adjustStockManual = (
    ingredientId: string,
    branchId: string,
    newStock: number,
    reasonText: string
  ) => {
    const nowIso = new Date().toISOString();
    setIngredients(prev =>
      prev.map(ing => {
        if (ing.id !== ingredientId) return ing;
        const oldStock = ing.stockByBranch[branchId] ?? 0;
        const diff = newStock - oldStock;

        setStockLogs(l => [
          {
            id: `log-adj-${Date.now()}`,
            timestamp: nowIso,
            branchId,
            ingredientId: ing.id,
            ingredientName: ing.name,
            changeAmount: diff,
            resultingStock: newStock,
            reason: 'manual_adjustment',
            actorName: currentUser.name,
            notes: `Penyesuaian stok opname: ${reasonText}`,
          },
          ...l,
        ]);

        return {
          ...ing,
          stockByBranch: {
            ...ing.stockByBranch,
            [branchId]: newStock,
          },
        };
      })
    );
  };

  // Inter-branch stock transfer
  const transferStock = (
    fromBranchId: string,
    toBranchId: string,
    ingredientId: string,
    amount: number,
    notes?: string
  ) => {
    const ing = ingredients.find(i => i.id === ingredientId);
    if (!ing) return;

    const fromBranch = branches.find(b => b.id === fromBranchId);
    const toBranch = branches.find(b => b.id === toBranchId);
    const nowIso = new Date().toISOString();

    setIngredients(prev =>
      prev.map(item => {
        if (item.id !== ingredientId) return item;
        const currentFrom = item.stockByBranch[fromBranchId] ?? 0;
        const currentTo = item.stockByBranch[toBranchId] ?? 0;

        return {
          ...item,
          stockByBranch: {
            ...item.stockByBranch,
            [fromBranchId]: Math.max(0, currentFrom - amount),
            [toBranchId]: currentTo + amount,
          },
        };
      })
    );

    const transferRecord: InterBranchTransfer = {
      id: `trf-${Date.now()}`,
      fromBranchId,
      toBranchId,
      ingredientId,
      ingredientName: ing.name,
      quantity: amount,
      unit: ing.unit,
      status: 'completed',
      requestedBy: currentUser.name,
      createdAt: nowIso,
      completedAt: nowIso,
      notes: notes || `Transfer stok antar-cabang dari ${fromBranch?.name} ke ${toBranch?.name}`,
    };

    setInterBranchTransfers(prev => [transferRecord, ...prev]);

    setStockLogs(prev => [
      {
        id: `log-trf-out-${Date.now()}`,
        timestamp: nowIso,
        branchId: fromBranchId,
        ingredientId,
        ingredientName: ing.name,
        changeAmount: -amount,
        resultingStock: Math.max(0, (ing.stockByBranch[fromBranchId] ?? 0) - amount),
        reason: 'branch_transfer',
        actorName: currentUser.name,
        notes: `Transfer keluar ke ${toBranch?.name}`,
      },
      {
        id: `log-trf-in-${Date.now()}`,
        timestamp: nowIso,
        branchId: toBranchId,
        ingredientId,
        ingredientName: ing.name,
        changeAmount: amount,
        resultingStock: (ing.stockByBranch[toBranchId] ?? 0) + amount,
        reason: 'branch_transfer',
        actorName: currentUser.name,
        notes: `Transfer masuk dari ${fromBranch?.name}`,
      },
      ...prev,
    ]);
  };

  const markAlertAsRead = (alertId: string) => {
    setStockAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, isRead: true } : a)));
  };

  const clearAllAlerts = () => {
    setStockAlerts([]);
  };

  const resetData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setIngredients(INITIAL_INGREDIENTS);
    setTransactions(generateSeedTransactions());
    setStockAlerts(INITIAL_STOCK_ALERTS);
    setStockLogs([]);
    setInterBranchTransfers([]);
    setCart([]);
    setCurrentUser(INITIAL_USERS[0]);
    setCurrentRole('admin_pusat');
    setActiveBranchId('b-senopati');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        switchUser,
        switchRole,
        branches,
        activeBranchId,
        setActiveBranchId,
        activeBranch,
        ingredients,
        stockAlerts,
        stockLogs,
        interBranchTransfers,
        restockIngredient,
        transferStock,
        adjustStockManual,
        markAlertAsRead,
        clearAllAlerts,
        menuItems,
        cart,
        orderType,
        setOrderType,
        tableNumber,
        setTableNumber,
        customerName,
        setCustomerName,
        discountRate,
        setDiscountRate,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartDiscountAmount,
        cartTaxAmount,
        cartServiceAmount,
        cartTotal,
        transactions,
        lastCompletedTransaction,
        completeCheckout,
        resetData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
