import React from 'react';
import {
  Trash2,
  Plus,
  Minus,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Tag,
  CreditCard,
  User,
  Coffee,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { OrderType } from '../../types';

interface CartDrawerProps {
  onOpenPayment: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenPayment }) => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    orderType,
    setOrderType,
    tableNumber,
    setTableNumber,
    customerName,
    setCustomerName,
    discountRate,
    setDiscountRate,
    cartSubtotal,
    cartDiscountAmount,
    cartTaxAmount,
    cartServiceAmount,
    cartTotal,
  } = useApp();

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-850">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-white">Pesanan Saat Ini</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {cart.reduce((a, b) => a + b.quantity, 0)} item
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Kosongkan
            </button>
          )}
        </div>

        {/* Order Type Tabs */}
        <div className="grid grid-cols-3 p-1 bg-slate-900 rounded-xl border border-slate-750 gap-1 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setOrderType('dine_in')}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              orderType === 'dine_in'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Dine In</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderType('takeaway')}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              orderType === 'takeaway'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Takeaway</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderType('delivery')}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              orderType === 'delivery'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Ojol</span>
          </button>
        </div>

        {/* Customer & Table details */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-[10px] text-slate-400 font-semibold mb-1">Nama Pelanggan</label>
            <div className="relative">
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Pelanggan..."
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          {orderType === 'dine_in' ? (
            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Nomor Meja</label>
              <select
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500 font-mono font-bold"
              >
                {Array.from({ length: 20 }, (_, i) => {
                  const num = String(i + 1).padStart(2, '0');
                  return (
                    <option key={num} value={`Meja ${num}`}>
                      Meja {num}
                    </option>
                  );
                })}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Catatan Struk</label>
              <input
                type="text"
                placeholder="Misal: Kantong ramah..."
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-3 text-slate-600">
              <Coffee className="w-7 h-7" />
            </div>
            <p className="font-bold text-sm text-slate-400">Keranjang Masih Kosong</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              Klik pada menu kopi, minuman, atau makanan di sebelah kiri untuk menambah ke pesanan.
            </p>
          </div>
        ) : (
          cart.map(item => (
            <div
              key={item.cartItemId}
              className="p-3 bg-slate-850 border border-slate-750 rounded-xl space-y-2 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs text-white leading-tight">
                    {item.menuItem.name}
                  </h4>
                  <p className="text-[11px] font-mono text-amber-400 font-semibold">
                    {formatRupiah(item.unitPrice)}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.cartItemId)}
                  className="p-1 rounded-md text-slate-500 hover:text-rose-400 transition"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Options badge */}
              {(item.options.sugarLevel ||
                item.options.iceLevel ||
                item.options.milkChoice ||
                item.options.extraShot ||
                item.notes) && (
                <div className="text-[10px] text-slate-400 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 space-y-0.5">
                  {item.options.sugarLevel && <div>• Gula: {item.options.sugarLevel}</div>}
                  {item.options.iceLevel && <div>• Es: {item.options.iceLevel}</div>}
                  {item.options.milkChoice && <div>• Susu: {item.options.milkChoice}</div>}
                  {item.options.extraShot && <div className="text-amber-400 font-semibold">• Extra Double Shot</div>}
                  {item.notes && <div className="text-amber-300 italic">• "{item.notes}"</div>}
                </div>
              )}

              {/* Stepper & Subtotal */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-750">
                  <button
                    onClick={() => updateCartQuantity(item.cartItemId, -1)}
                    className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono font-bold text-xs w-6 text-center text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(item.cartItemId, 1)}
                    className="w-6 h-6 rounded flex items-center justify-center bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <span className="font-mono font-bold text-xs text-white">
                  {formatRupiah(item.subtotal)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer & Payment Calculation */}
      {cart.length > 0 && (
        <div className="p-4 bg-slate-850 border-t border-slate-800 space-y-3">
          {/* Discount selector pills */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-400" />
                Voucher / Diskon
              </span>
              {discountRate > 0 && (
                <span className="text-emerald-400 font-bold">Hemat {formatRupiah(cartDiscountAmount)}</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
              {[0, 10, 15, 20].map(rate => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setDiscountRate(rate)}
                  className={`py-1 rounded-md border transition ${
                    discountRate === rate
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {rate === 0 ? 'Tanpa' : `${rate}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800 pt-2 font-mono">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatRupiah(cartSubtotal)}</span>
            </div>
            {cartDiscountAmount > 0 && (
              <div className="flex justify-between text-rose-400">
                <span>Diskon ({discountRate}%):</span>
                <span>-{formatRupiah(cartDiscountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>PPN Restoran (11%):</span>
              <span>{formatRupiah(cartTaxAmount)}</span>
            </div>
            {cartServiceAmount > 0 && (
              <div className="flex justify-between">
                <span>Service Charge (5%):</span>
                <span>{formatRupiah(cartServiceAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-white border-t border-slate-750 pt-1.5 mt-1">
              <span>Total Akhir:</span>
              <span className="text-amber-400">{formatRupiah(cartTotal)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={onOpenPayment}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition transform active:scale-[0.98]"
          >
            <CreditCard className="w-5 h-5" />
            <span>Bayar {formatRupiah(cartTotal)}</span>
          </button>
        </div>
      )}
    </div>
  );
};
