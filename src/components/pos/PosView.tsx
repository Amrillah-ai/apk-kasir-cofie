import React, { useState, useMemo } from 'react';
import {
  Search,
  Coffee,
  Sparkles,
  Layers,
  Flame,
  AlertTriangle,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenuItem, Transaction } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { ProductCustomizerModal } from './ProductCustomizerModal';
import { CartDrawer } from './CartDrawer';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';

export const PosView: React.FC = () => {
  const { menuItems, ingredients, activeBranchId, addToCart } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);

  const categories = ['Semua', 'Signature', 'Kopi', 'Non-Kopi', 'Makanan', 'Pastry & Snack'];

  // Check ingredient availability per branch for automatic out-of-stock badge
  const checkItemAvailability = (item: MenuItem): { isAvailable: boolean; missingIngredient?: string } => {
    for (const r of item.recipe) {
      const ing = ingredients.find(i => i.id === r.ingredientId);
      if (ing) {
        const branchStock = ing.stockByBranch[activeBranchId] ?? 0;
        if (branchStock < r.quantity) {
          return { isAvailable: false, missingIngredient: ing.name };
        }
      }
    }
    return { isAvailable: true };
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  const handleItemClick = (item: MenuItem) => {
    const avail = checkItemAvailability(item);
    if (!avail.isAvailable) return;

    // If item has customizable options, open customizer modal
    if (item.sugarOptions || item.iceOptions || item.milkOptions) {
      setCustomizingItem(item);
    } else {
      addToCart(item);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 cols: Catalog, Search, Categories & Menu Grid */}
        <div className="lg:col-span-8 space-y-5">
          {/* Search & Category Filter */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari kopi, pastry, makanan, atau kode SKU menu..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Bersihkan
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {filteredItems.map(item => {
              const { isAvailable, missingIngredient } = checkItemAvailability(item);

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`group relative bg-slate-900 border rounded-2xl overflow-hidden shadow-lg transition-all duration-200 flex flex-col ${
                    isAvailable
                      ? 'border-slate-800 hover:border-amber-500/50 hover:shadow-amber-500/5 cursor-pointer active:scale-[0.98]'
                      : 'border-rose-900/40 opacity-60 cursor-not-allowed bg-slate-950/60'
                  }`}
                >
                  {/* Image container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                    {/* Category pill */}
                    <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-slate-200 border border-slate-700">
                      {item.category}
                    </span>

                    {/* Featured / Star */}
                    {item.isFeatured && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow flex items-center gap-0.5">
                        <Flame className="w-3 h-3 fill-slate-950" />
                        Best
                      </span>
                    )}

                    {/* Out of stock overlay */}
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-2 text-center">
                        <AlertTriangle className="w-6 h-6 text-rose-400 mb-1" />
                        <span className="text-[11px] font-bold text-rose-300">Bahan Habis</span>
                        <span className="text-[9px] text-slate-400 line-clamp-1">{missingIngredient}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="font-mono font-extrabold text-xs sm:text-sm text-amber-400">
                        {formatRupiah(item.basePrice)}
                      </span>
                      
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center transition">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
              <Coffee className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 font-bold text-sm">Tidak ada menu yang sesuai</p>
              <p className="text-slate-500 text-xs mt-1">Coba kata kunci lain atau ubah kategori pilihan.</p>
            </div>
          )}
        </div>

        {/* Right 4 cols: Cart Drawer */}
        <div className="lg:col-span-4 sticky top-20 h-[calc(100vh-6.5rem)]">
          <CartDrawer onOpenPayment={() => setIsPaymentOpen(true)} />
        </div>
      </div>

      {/* Modals */}
      <ProductCustomizerModal
        item={customizingItem}
        onClose={() => setCustomizingItem(null)}
        onAddToCart={addToCart}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onPaymentSuccess={tx => setReceiptTx(tx)}
      />

      <ReceiptModal
        isOpen={!!receiptTx}
        transaction={receiptTx}
        onClose={() => setReceiptTx(null)}
      />
    </div>
  );
};
