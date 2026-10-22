import React, { useState } from 'react';
import { X, ArrowRightLeft, Building2 } from 'lucide-react';
import { RawIngredient } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatNumber } from '../../utils/formatters';

interface TransferStockModalProps {
  ingredient: RawIngredient | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransferStockModal: React.FC<TransferStockModalProps> = ({
  ingredient,
  isOpen,
  onClose,
}) => {
  const { branches, activeBranchId, transferStock } = useApp();

  const [fromBranchId, setFromBranchId] = useState<string>(activeBranchId);
  const [toBranchId, setToBranchId] = useState<string>(() => {
    const other = branches.find(b => b.id !== activeBranchId);
    return other ? other.id : branches[0].id;
  });
  const [amount, setAmount] = useState<number>(500);
  const [notes, setNotes] = useState<string>('Bantuan mutasi stok antar-cabang');

  if (!isOpen || !ingredient) return null;

  const currentOriginStock = ingredient.stockByBranch[fromBranchId] ?? 0;
  const currentDestStock = ingredient.stockByBranch[toBranchId] ?? 0;

  const isExceedingStock = amount > currentOriginStock;

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromBranchId === toBranchId || amount <= 0 || isExceedingStock) return;

    transferStock(fromBranchId, toBranchId, ingredient.id, amount, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-sm">Transfer Stok Antar-Cabang</h3>
              <p className="text-[10px] text-slate-400">Sinkronisasi Logistik Real-Time</p>
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
        <form onSubmit={handleTransfer} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <p className="text-[11px] text-slate-400 font-semibold">Bahan Baku Ditransfer:</p>
            <p className="text-sm font-bold text-white mt-0.5">{ingredient.name}</p>
          </div>

          {/* Branch Origin & Destination */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Dari Cabang Asal</label>
              <select
                value={fromBranchId}
                onChange={e => setFromBranchId(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 font-semibold"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id} disabled={b.id === toBranchId}>
                    {b.name.replace('KopiKula ', '')}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                Stok Asal: {formatNumber(currentOriginStock)} {ingredient.unit}
              </p>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Ke Cabang Tujuan</label>
              <select
                value={toBranchId}
                onChange={e => setToBranchId(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 font-semibold"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id} disabled={b.id === fromBranchId}>
                    {b.name.replace('KopiKula ', '')}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                Stok Tujuan: {formatNumber(currentDestStock)} {ingredient.unit}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              Jumlah Transfer ({ingredient.unit})
            </label>
            <input
              type="number"
              min="1"
              max={currentOriginStock}
              value={amount}
              onChange={e => setAmount(Number(e.target.value) || 0)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:border-amber-500"
              required
            />
            {isExceedingStock && (
              <p className="text-rose-400 text-[10px] mt-1">
                Jumlah transfer melebihi stok yang tersedia di cabang asal ({formatNumber(currentOriginStock)} {ingredient.unit}).
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Catatan Dokumen Mutasi</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              placeholder="Catatan pengiriman kurir internal..."
            />
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
              disabled={isExceedingStock || fromBranchId === toBranchId || amount <= 0}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Kirim Mutasi Stok
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
