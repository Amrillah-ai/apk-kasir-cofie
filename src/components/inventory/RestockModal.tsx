import React, { useState } from 'react';
import { X, Plus, PackageCheck } from 'lucide-react';
import { RawIngredient } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatNumber } from '../../utils/formatters';

interface RestockModalProps {
  ingredient: RawIngredient | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  ingredient,
  isOpen,
  onClose,
}) => {
  const { activeBranchId, activeBranch, restockIngredient } = useApp();

  const [quantity, setQuantity] = useState<number>(1000);
  const [supplier, setSupplier] = useState<string>('');
  const [notes, setNotes] = useState<string>('Penerimaan PO Bahan Baku Masuk');

  if (!isOpen || !ingredient) return null;

  const currentStock = ingredient.stockByBranch[activeBranchId] ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    restockIngredient(
      ingredient.id,
      activeBranchId,
      quantity,
      supplier || ingredient.supplier,
      notes
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-sm">Penerimaan & Restok Bahan</h3>
              <p className="text-[10px] text-slate-400">Cabang: {activeBranch?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <p className="text-[11px] text-slate-400 font-semibold">Bahan yang Direstok:</p>
            <p className="text-sm font-bold text-white mt-0.5">{ingredient.name}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700 text-slate-300 font-mono">
              <span>Stok Saat Ini:</span>
              <span className="font-bold text-amber-400">
                {formatNumber(currentStock)} {ingredient.unit}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              Jumlah Penambahan Stok ({ingredient.unit})
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value) || 0)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Nama Pemasok / Supplier</label>
            <input
              type="text"
              defaultValue={ingredient.supplier}
              onChange={e => setSupplier(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              placeholder="Nama vendor supplier..."
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Keterangan / Nomor Surat Jalan (PO)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              placeholder="Contoh: No. PO-2026/10/88"
            />
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 font-mono flex items-center justify-between">
            <span>Estimasi Stok Baru:</span>
            <span className="font-bold text-sm">
              {formatNumber(currentStock + quantity)} {ingredient.unit}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Simpan Penambahan Stok
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
