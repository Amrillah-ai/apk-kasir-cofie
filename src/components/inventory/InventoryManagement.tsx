import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  ArrowRightLeft,
  AlertTriangle,
  Search,
  BookOpen,
  History,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RawIngredient } from '../../types';
import { formatNumber, formatRupiah, formatDateTime, getStockHealth } from '../../utils/formatters';
import { RestockModal } from './RestockModal';
import { TransferStockModal } from './TransferStockModal';

export const InventoryManagement: React.FC = () => {
  const {
    ingredients,
    branches,
    activeBranchId,
    activeBranch,
    menuItems,
    stockLogs,
    adjustStockManual,
    currentRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'stocks' | 'recipes' | 'logs'>('stocks');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Modals state
  const [restockItem, setRestockItem] = useState<RawIngredient | null>(null);
  const [transferItem, setTransferItem] = useState<RawIngredient | null>(null);

  // Quick Opname Adjustment prompt
  const handleQuickOpname = (ing: RawIngredient) => {
    const current = ing.stockByBranch[activeBranchId] ?? 0;
    const input = prompt(
      `Audit Opname Stok untuk: ${ing.name}\nStok sistem saat ini: ${formatNumber(current)} ${ing.unit}\n\nMasukkan jumlah fisik riil saat ini (${ing.unit}):`,
      current.toString()
    );
    if (input !== null) {
      const val = parseFloat(input);
      if (!isNaN(val) && val >= 0) {
        const reason = prompt('Masukkan alasan penyesuaian (contoh: Tumpah, Basi, Selisih Timbangan):', 'Audit Fisik Berkala');
        adjustStockManual(ing.id, activeBranchId, val, reason || 'Audit Fisik');
      }
    }
  };

  const categories = [
    'Semua',
    'Kopi & Biji',
    'Susu & Dairy',
    'Sirup & Gula',
    'Teh & Powder',
    'Bakery & Dapur',
    'Packaging',
  ];

  const filteredIngredients = ingredients.filter(ing => {
    const matchesSearch =
      ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || ing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Automated Recipe Inventory
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
              BOM Auto-Deduction
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            Manajemen Stok Bahan Baku Kafe
          </h1>
          <p className="text-xs text-slate-400">
            Pemotongan bahan otomatis setiap transaksi kasir, deteksi stok kritis, dan mutasi multi-cabang.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-800 p-1.5 rounded-xl border border-slate-700 text-xs font-bold">
          <button
            onClick={() => setActiveTab('stocks')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'stocks'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Stok Bahan Cabang</span>
          </button>

          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'recipes'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Resep & BOM Menu</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'logs'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat & Kartu Stok</span>
          </button>
        </div>
      </div>

      {/* TAB 1: STOK BAHAN BAKU CABANG */}
      {activeTab === 'stocks' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari bahan baku (kopi, susu, sirup, cup, daging)..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
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

          {/* Ingredients Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-850 text-slate-400 uppercase font-semibold tracking-wider text-[10px] border-b border-slate-800">
                    <th className="py-3 px-4">Bahan Baku & SKU</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4 text-right">Stok {activeBranch?.name.replace('KopiKula ', '')}</th>
                    <th className="py-3 px-4 text-right">Batas Minimum</th>
                    <th className="py-3 px-4 text-center">Status Kesehatan</th>
                    <th className="py-3 px-4 text-right">HPP Satuan</th>
                    <th className="py-3 px-4 text-center">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredIngredients.map(ing => {
                    const branchStock = ing.stockByBranch[activeBranchId] ?? 0;
                    const health = getStockHealth(branchStock, ing.minStockThreshold);

                    return (
                      <tr key={ing.id} className="hover:bg-slate-850/50 transition">
                        <td className="py-3 px-4">
                          <p className="font-bold text-white text-xs">{ing.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {ing.sku} • {ing.supplier}
                          </p>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {ing.category}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right font-mono">
                          <span className="font-extrabold text-sm text-white">
                            {formatNumber(branchStock)}
                          </span>{' '}
                          <span className="text-slate-400 text-[11px]">{ing.unit}</span>
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-slate-400 text-[11px]">
                          {formatNumber(ing.minStockThreshold)} {ing.unit}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${health.badgeClass}`}
                          >
                            {health.label}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                          {formatRupiah(ing.costPerUnit)} / {ing.unit}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setRestockItem(ing)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-[10px] transition border border-amber-500/30 flex items-center gap-1"
                              title="Restok Tambah Bahan Masuk"
                            >
                              <Plus className="w-3 h-3" />
                              Restok
                            </button>

                            <button
                              onClick={() => setTransferItem(ing)}
                              className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white font-bold text-[10px] transition border border-blue-500/30 flex items-center gap-1"
                              title="Transfer Stok Antar-Cabang"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              Transfer
                            </button>

                            {currentRole !== 'kasir' && (
                              <button
                                onClick={() => handleQuickOpname(ing)}
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition border border-slate-700"
                                title="Audit Opname Fisik"
                              >
                                Opname
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOM & RESEP MENU */}
      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map(item => {
            // Calculate dynamic cost from ingredients
            const cost = item.recipe.reduce((acc, r) => {
              const ing = ingredients.find(i => i.id === r.ingredientId);
              return acc + (ing ? ing.costPerUnit * r.quantity : 0);
            }, 0);

            const profit = item.basePrice - cost;
            const margin = item.basePrice > 0 ? ((profit / item.basePrice) * 100).toFixed(0) : '0';

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 uppercase">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-sm text-white mt-1.5">{item.name}</h4>
                    </div>
                    <span className="font-mono font-bold text-amber-400 text-xs">
                      {formatRupiah(item.basePrice)}
                    </span>
                  </div>

                  {/* Recipe items list */}
                  <div className="mt-3 p-3 bg-slate-850 rounded-xl border border-slate-750 space-y-1.5 text-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-amber-400" />
                      Komposisi Resep (BOM):
                    </p>
                    {item.recipe.map((r, i) => {
                      const ing = ingredients.find(ig => ig.id === r.ingredientId);
                      const subCost = ing ? ing.costPerUnit * r.quantity : 0;
                      return (
                        <div key={i} className="flex items-center justify-between text-[11px] text-slate-300">
                          <span>
                            • {r.ingredientName} ({r.quantity} {r.unit})
                          </span>
                          <span className="font-mono text-slate-500">{formatRupiah(subCost)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Economics */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500">Estimasi HPP:</span>
                    <p className="font-bold text-slate-200">{formatRupiah(cost)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Laba Bersih:</span>
                    <p className="font-bold text-emerald-400">{formatRupiah(profit)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500">Margin:</span>
                    <p className="font-bold text-amber-400">{margin}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: KARTU STOK & LOGS RIWAYAT */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm">Kartu Stok & Audit Ledger Real-Time</h3>
              <p className="text-xs text-slate-400">
                Mencatat setiap pemotongan otomatis transaksi POS, penambahan restok, dan mutasi antar-cabang.
              </p>
            </div>
            <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 font-mono">
              {stockLogs.length} Entri Log
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-850 text-slate-400 uppercase font-semibold tracking-wider text-[10px] border-b border-slate-800">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Bahan Baku</th>
                  <th className="py-2.5 px-3">Tipe Aktivitas</th>
                  <th className="py-2.5 px-3 text-right">Perubahan Stok</th>
                  <th className="py-2.5 px-3 text-right">Sisa Stok Akhir</th>
                  <th className="py-2.5 px-3">Petugas & Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {stockLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-850/40 transition">
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">{log.ingredientName}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          log.reason === 'sale_deduction'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : log.reason === 'restock'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {log.reason === 'sale_deduction'
                          ? 'Pemotongan POS'
                          : log.reason === 'restock'
                          ? 'Restok Masuk'
                          : log.reason === 'branch_transfer'
                          ? 'Mutasi Cabang'
                          : 'Opname Koreksi'}
                      </span>
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono font-bold ${
                        log.changeAmount < 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {log.changeAmount > 0 ? `+${formatNumber(log.changeAmount)}` : formatNumber(log.changeAmount)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-white font-semibold">
                      {formatNumber(log.resultingStock)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      <span className="font-semibold text-slate-300">{log.actorName}</span> •{' '}
                      {log.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <RestockModal
        ingredient={restockItem}
        isOpen={!!restockItem}
        onClose={() => setRestockItem(null)}
      />

      <TransferStockModal
        ingredient={transferItem}
        isOpen={!!transferItem}
        onClose={() => setTransferItem(null)}
      />
    </div>
  );
};
