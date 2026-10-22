import React, { useState } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { MenuItem, CartItemOption } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface ProductCustomizerModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, options: CartItemOption, notes?: string) => void;
}

export const ProductCustomizerModal: React.FC<ProductCustomizerModalProps> = ({
  item,
  onClose,
  onAddToCart,
}) => {
  if (!item) return null;

  const [sugar, setSugar] = useState<string>(item.sugarOptions ? item.sugarOptions[0] : '');
  const [ice, setIce] = useState<string>(item.iceOptions ? item.iceOptions[0] : '');
  const [milk, setMilk] = useState<string>(item.milkOptions ? item.milkOptions[0].name : '');
  const [extraShot, setExtraShot] = useState<boolean>(false);
  const [size, setSize] = useState<string>(item.sizeOptions ? item.sizeOptions[0].name : '');
  const [notes, setNotes] = useState<string>('');

  // Calculate dynamic price
  let totalPrice = item.basePrice;
  if (milk.includes('Oat Milk')) totalPrice += 8000;
  if (extraShot) totalPrice += 6000;
  if (size.includes('Large')) totalPrice += 6000;

  const handleConfirm = () => {
    onAddToCart(
      item,
      {
        sugarLevel: sugar || undefined,
        iceLevel: ice || undefined,
        milkChoice: milk || undefined,
        extraShot,
        size: size || undefined,
      },
      notes.trim() || undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-800">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 backdrop-blur-sm transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-500/40 uppercase">
              {item.category}
            </span>
            <h3 className="text-xl font-bold text-white mt-1">{item.name}</h3>
            <p className="text-xs text-slate-300 line-clamp-1">{item.description}</p>
          </div>
        </div>

        {/* Options Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Sugar Level */}
          {item.sugarOptions && item.sugarOptions.length > 0 && (
            <div>
              <label className="block text-slate-400 font-semibold mb-2">Tingkat Manis (Gula)</label>
              <div className="grid grid-cols-2 gap-2">
                {item.sugarOptions.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSugar(opt)}
                    className={`p-2.5 rounded-xl border text-left font-medium transition flex items-center justify-between ${
                      sugar === opt
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{opt}</span>
                    {sugar === opt && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ice Level */}
          {item.iceOptions && item.iceOptions.length > 0 && (
            <div>
              <label className="block text-slate-400 font-semibold mb-2">Pilihan Es / Suhu</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {item.iceOptions.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setIce(opt)}
                    className={`p-2.5 rounded-xl border text-left font-medium transition flex items-center justify-between ${
                      ice === opt
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{opt}</span>
                    {ice === opt && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Milk Options */}
          {item.milkOptions && item.milkOptions.length > 0 && (
            <div>
              <label className="block text-slate-400 font-semibold mb-2">Pilihan Susu (Dairy / Plant-Based)</label>
              <div className="grid grid-cols-2 gap-2">
                {item.milkOptions.map(opt => (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setMilk(opt.name)}
                    className={`p-2.5 rounded-xl border text-left font-medium transition flex items-center justify-between ${
                      milk === opt.name
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <p>{opt.name}</p>
                      {opt.extraPrice > 0 && (
                        <p className="text-[10px] text-amber-400 font-mono">+{formatRupiah(opt.extraPrice)}</p>
                      )}
                    </div>
                    {milk === opt.name && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size / Extra Shot */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
            <span className="font-semibold text-slate-300">Tambah Extra Double Shot (+Rp 6.000)</span>
            <button
              type="button"
              onClick={() => setExtraShot(!extraShot)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                extraShot ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md transform"></span>
            </button>
          </div>

          {/* Special Notes */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Catatan Tambahan untuk Barista</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Contoh: Pisah es batu, sedikit sirup, ekstra foam..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-slate-400">Total Harga</p>
            <p className="text-lg font-bold text-amber-400 font-mono">{formatRupiah(totalPrice)}</p>
          </div>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Tambahkan ke Pesanan
          </button>
        </div>
      </div>
    </div>
  );
};
