import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  Filter,
  Eye,
  Receipt,
  Calendar,
  CheckCircle2,
  DollarSign,
  Coffee,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';
import { formatRupiah, formatDateTime, formatNumber } from '../../utils/formatters';
import { exportToExcel, printOrDownloadPDF } from '../../utils/exportUtils';
import { ReceiptModal } from '../pos/ReceiptModal';

export const SalesReportView: React.FC = () => {
  const { transactions, ingredients, branches, activeBranch } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'today' | '7days' | '30days' | 'all'>('30days');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('ALL');

  // Modal detail transaction / reprint receipt
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [reprintTx, setReprintTx] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch =
        t.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.cashierName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch = selectedBranchId === 'ALL' || t.branchId === selectedBranchId;
      const matchesPayment = paymentFilter === 'ALL' || t.paymentMethod === paymentFilter;
      const matchesOrderType = orderTypeFilter === 'ALL' || t.orderType === orderTypeFilter;

      let matchesDate = true;
      const now = new Date('2026-10-22T23:59:59Z');
      if (dateFilter === 'today') {
        matchesDate = t.createdAt.startsWith('2026-10-22');
      } else if (dateFilter === '7days') {
        const past7 = new Date(now);
        past7.setDate(past7.getDate() - 7);
        matchesDate = new Date(t.createdAt) >= past7;
      } else if (dateFilter === '30days') {
        const past30 = new Date(now);
        past30.setDate(past30.getDate() - 30);
        matchesDate = new Date(t.createdAt) >= past30;
      }

      return matchesSearch && matchesBranch && matchesPayment && matchesOrderType && matchesDate;
    });
  }, [transactions, searchQuery, selectedBranchId, paymentFilter, orderTypeFilter, dateFilter]);

  // Aggregate sums
  const totalRevenue = filteredTransactions.reduce((acc, t) => acc + t.total, 0);
  const totalCost = filteredTransactions.reduce((acc, t) => acc + t.totalCost, 0);
  const totalGrossProfit = filteredTransactions.reduce((acc, t) => acc + t.grossProfit, 0);
  const totalTax = filteredTransactions.reduce((acc, t) => acc + t.taxAmount, 0);
  const totalTransactions = filteredTransactions.length;

  const handleExportExcel = () => {
    const branchName =
      selectedBranchId === 'ALL'
        ? 'Semua Cabang (Konsolidasian)'
        : branches.find(b => b.id === selectedBranchId)?.name || 'Cabang';

    exportToExcel(filteredTransactions, ingredients, activeBranch, {
      branchName,
      dateRangeLabel:
        dateFilter === 'today'
          ? 'Hari Ini'
          : dateFilter === '7days'
          ? '7 Hari Terakhir'
          : '30 Hari Terakhir',
      totalRevenue,
      totalCost,
      totalGrossProfit,
      totalTax,
      totalTransactions,
    });
  };

  const handleExportPDF = () => {
    const branchName =
      selectedBranchId === 'ALL'
        ? 'Semua Cabang (Konsolidasian)'
        : branches.find(b => b.id === selectedBranchId)?.name || 'Cabang';

    printOrDownloadPDF(filteredTransactions, {
      branchName,
      dateRangeLabel:
        dateFilter === 'today'
          ? 'Hari Ini'
          : dateFilter === '7days'
          ? '7 Hari Terakhir'
          : '30 Hari Terakhir',
      totalRevenue,
      totalCost,
      totalGrossProfit,
      totalTax,
      totalTransactions,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Export CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Laporan Akuntansi & Penjualan
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
              Live Real-Time Sync
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            Rekap Jurnal & Transaksi Kasir
          </h1>
          <p className="text-xs text-slate-400">
            Audit rincian tagihan, rekapitulasi PPN 11%, dan cetak struk ulang transaksi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Cetak PDF Akuntansi</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Mini Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-[11px] text-slate-400 font-semibold">Total Omset Bruto</p>
          <p className="text-lg font-bold text-amber-400 font-mono mt-0.5">
            {formatRupiah(totalRevenue)}
          </p>
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-[11px] text-slate-400 font-semibold">Total Laba Kotor</p>
          <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
            {formatRupiah(totalGrossProfit)}
          </p>
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-[11px] text-slate-400 font-semibold">Total PPN 11% Resto</p>
          <p className="text-lg font-bold text-purple-400 font-mono mt-0.5">
            {formatRupiah(totalTax)}
          </p>
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-[11px] text-slate-400 font-semibold">Volume Transaksi</p>
          <p className="text-lg font-bold text-white font-mono mt-0.5">
            {formatNumber(totalTransactions)} Struk
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari No. Struk, Pelanggan, Kasir..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Branch filter */}
          <div>
            <select
              value={selectedBranchId}
              onChange={e => setSelectedBranchId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Semua Cabang</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name.replace('KopiKula ', '')}
                </option>
              ))}
            </select>
          </div>

          {/* Payment filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Semua Pembayaran</option>
              <option value="QRIS">QRIS Dinamis</option>
              <option value="CASH">Tunai (Cash)</option>
              <option value="GOPAY">GoPay</option>
              <option value="OVO">OVO</option>
              <option value="DEBIT_CREDIT">Debit/Kredit EDC</option>
            </select>
          </div>

          {/* Date range filter */}
          <div>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="today">Hari Ini</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="30days">30 Hari Terakhir</option>
              <option value="all">Semua Riwayat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-850 text-slate-400 uppercase font-semibold tracking-wider text-[10px] border-b border-slate-800">
                <th className="py-3 px-4">No. Struk & Waktu</th>
                <th className="py-3 px-4">Cabang</th>
                <th className="py-3 px-4">Pelanggan & Tipe</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">PPN 11%</th>
                <th className="py-3 px-4 text-right">Total Akhir</th>
                <th className="py-3 px-4 text-right">Laba Kotor</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-850/50 transition">
                  <td className="py-3 px-4">
                    <p className="font-bold text-white font-mono">{tx.receiptNumber}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {formatDateTime(tx.createdAt)} • Kasir: {tx.cashierName}
                    </p>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-[11px] text-slate-300">
                      {tx.branchName.replace('KopiKula ', '')}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-bold text-white text-xs">{tx.customerName}</p>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {tx.orderType === 'dine_in' ? `Dine In (${tx.tableNumber})` : 'Takeaway'}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        tx.paymentMethod === 'QRIS'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : tx.paymentMethod === 'CASH'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {tx.paymentMethod}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {formatRupiah(tx.subtotal)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-slate-400">
                    {formatRupiah(tx.taxAmount)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-white">
                    {formatRupiah(tx.total)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    {formatRupiah(tx.grossProfit)}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition"
                        title="Lihat Rincian Item"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setReprintTx(tx)}
                        className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 transition"
                        title="Cetak Ulang Struk"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Inspector Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase">
                  Rincian Transaksi
                </span>
                <h3 className="text-base font-bold text-white font-mono">
                  {selectedTx.receiptNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-850 rounded-xl space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Waktu:</span>
                  <span>{formatDateTime(selectedTx.createdAt)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Cabang:</span>
                  <span>{selectedTx.branchName}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Petugas Kasir:</span>
                  <span>{selectedTx.cashierName}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-850 rounded-xl space-y-2">
                <p className="font-bold text-slate-300 border-b border-slate-750 pb-1">Item Pesanan:</p>
                {selectedTx.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <div>
                      <p className="font-semibold text-white">{i.name} (x{i.quantity})</p>
                      {i.optionsSummary && <p className="text-[10px] text-slate-400">{i.optionsSummary}</p>}
                    </div>
                    <span className="font-mono text-white">{formatRupiah(i.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-850 rounded-xl space-y-1 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>{formatRupiah(selectedTx.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>PPN 11%:</span>
                  <span>{formatRupiah(selectedTx.taxAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-amber-400 text-sm border-t border-slate-700 pt-1 mt-1">
                  <span>Total Tagihan:</span>
                  <span>{formatRupiah(selectedTx.total)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 text-xs">
                  <span>Estimasi Laba Kotor:</span>
                  <span>{formatRupiah(selectedTx.grossProfit)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setReprintTx(selectedTx);
                  setSelectedTx(null);
                }}
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" />
                Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thermal Receipt Reprint Modal */}
      <ReceiptModal
        isOpen={!!reprintTx}
        transaction={reprintTx}
        onClose={() => setReprintTx(null)}
      />
    </div>
  );
};
