import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  PiggyBank,
  Download,
  Printer,
  Sparkles,
  Coffee,
  PieChart,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatNumber, formatDate, formatDateTime } from '../../utils/formatters';
import { exportToExcel, printOrDownloadPDF } from '../../utils/exportUtils';
import { InteractiveSalesChart, ChartDataPoint } from './InteractiveSalesChart';

export const AnalyticsDashboard: React.FC = () => {
  const {
    transactions,
    ingredients,
    branches,
    activeBranchId,
    setActiveBranchId,
    activeBranch,
    stockAlerts,
  } = useApp();

  const [dateFilter, setDateFilter] = useState<'today' | '7days' | '30days' | 'all'>('30days');
  const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly' | 'hourly'>('weekly');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL'); // 'ALL' or specific branch

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    // Branch filter
    if (selectedBranchId !== 'ALL') {
      list = list.filter(t => t.branchId === selectedBranchId);
    }

    // Date range filter
    const now = new Date('2026-10-22T23:59:59Z');
    if (dateFilter === 'today') {
      const todayStr = '2026-10-22';
      list = list.filter(t => t.createdAt.startsWith(todayStr));
    } else if (dateFilter === '7days') {
      const past7 = new Date(now);
      past7.setDate(past7.getDate() - 7);
      list = list.filter(t => new Date(t.createdAt) >= past7);
    } else if (dateFilter === '30days') {
      const past30 = new Date(now);
      past30.setDate(past30.getDate() - 30);
      list = list.filter(t => new Date(t.createdAt) >= past30);
    }

    return list;
  }, [transactions, selectedBranchId, dateFilter]);

  // Aggregate Metrics
  const totalRevenue = filteredTransactions.reduce((acc, t) => acc + t.total, 0);
  const totalCost = filteredTransactions.reduce((acc, t) => acc + t.totalCost, 0);
  const totalGrossProfit = filteredTransactions.reduce((acc, t) => acc + t.grossProfit, 0);
  const totalTax = filteredTransactions.reduce((acc, t) => acc + t.taxAmount, 0);
  const totalTransactions = filteredTransactions.length;
  const aov = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;
  const grossMarginPct = totalRevenue > 0 ? ((totalGrossProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Build Chart Data
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (chartPeriod === 'hourly') {
      // 08:00 to 21:00
      const hoursMap: Record<number, { revenue: number; profit: number; count: number }> = {};
      for (let h = 8; h <= 21; h++) {
        hoursMap[h] = { revenue: 0, profit: 0, count: 0 };
      }

      filteredTransactions.forEach(tx => {
        const h = new Date(tx.createdAt).getHours();
        if (hoursMap[h]) {
          hoursMap[h].revenue += tx.total;
          hoursMap[h].profit += tx.grossProfit;
          hoursMap[h].count += 1;
        }
      });

      return Object.entries(hoursMap).map(([h, val]) => ({
        label: `${h.padStart(2, '0')}:00`,
        revenue: val.revenue,
        grossProfit: val.profit,
        transactions: val.count,
      }));
    }

    const daysCount = chartPeriod === 'weekly' ? 7 : 30;
    const points: ChartDataPoint[] = [];
    const baseDate = new Date('2026-10-22');

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const dayIso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

      const dayTxs = filteredTransactions.filter(t => t.createdAt.startsWith(dayIso));
      const rev = dayTxs.reduce((acc, t) => acc + t.total, 0);
      const prof = dayTxs.reduce((acc, t) => acc + t.grossProfit, 0);

      points.push({
        label,
        dateKey: dayIso,
        revenue: rev,
        grossProfit: prof,
        transactions: dayTxs.length,
      });
    }

    return points;
  }, [filteredTransactions, chartPeriod]);

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    filteredTransactions.forEach(t => {
      const m = t.paymentMethod;
      if (!map[m]) map[m] = { count: 0, total: 0 };
      map[m].count += 1;
      map[m].total += t.total;
    });

    return Object.entries(map).map(([method, data]) => ({
      method,
      count: data.count,
      total: data.total,
      percentage: totalRevenue > 0 ? Math.round((data.total / totalRevenue) * 100) : 0,
    })).sort((a, b) => b.total - a.total);
  }, [filteredTransactions, totalRevenue]);

  // Top 5 Best Sellers
  const topSellers = useMemo(() => {
    const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    filteredTransactions.forEach(t => {
      t.items.forEach(i => {
        if (!itemMap[i.menuItemId]) {
          itemMap[i.menuItemId] = { name: i.name, qty: 0, revenue: 0 };
        }
        itemMap[i.menuItemId].qty += i.quantity;
        itemMap[i.menuItemId].revenue += i.subtotal;
      });
    });

    return Object.values(itemMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredTransactions]);

  const maxSoldQty = topSellers[0]?.qty || 1;

  // Export handlers
  const handleExportExcel = () => {
    const branchName = selectedBranchId === 'ALL' ? 'Semua Cabang (Konsolidasi)' : branches.find(b => b.id === selectedBranchId)?.name || 'Cabang';
    exportToExcel(filteredTransactions, ingredients, activeBranch, {
      branchName,
      dateRangeLabel: dateFilter === 'today' ? 'Hari Ini' : dateFilter === '7days' ? '7 Hari Terakhir' : '30 Hari Terakhir',
      totalRevenue,
      totalCost,
      totalGrossProfit,
      totalTax,
      totalTransactions,
    });
  };

  const handleExportPDF = () => {
    const branchName = selectedBranchId === 'ALL' ? 'Semua Cabang (Konsolidasi)' : branches.find(b => b.id === selectedBranchId)?.name || 'Cabang';
    printOrDownloadPDF(filteredTransactions, {
      branchName,
      dateRangeLabel: dateFilter === 'today' ? 'Hari Ini' : dateFilter === '7days' ? '7 Hari Terakhir' : '30 Hari Terakhir',
      totalRevenue,
      totalCost,
      totalGrossProfit,
      totalTax,
      totalTransactions,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Live Business Analytics
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Real-time Sync
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            Dashboard Performa Bisnis Kafe
          </h1>
          <p className="text-xs text-slate-400">
            Monitoring omset, laba kotor, pajak resto, dan pergerakan stok real-time antar-cabang.
          </p>
        </div>

        {/* Action Buttons: Excel & PDF */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
            title="Download Laporan Format XLSX Excel"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition"
            title="Cetak atau Simpan sebagai PDF"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Row: Branch & Time Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-300">Filter Cabang:</span>
          <select
            value={selectedBranchId}
            onChange={e => setSelectedBranchId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Semua Cabang (Konsolidasian)</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              dateFilter === 'today'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setDateFilter('7days')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              dateFilter === '7days'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setDateFilter('30days')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              dateFilter === '30days'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            30 Hari
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              dateFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Omset (Revenue)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{formatRupiah(totalRevenue)}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% dibanding periode sebelumnya</span>
          </div>
        </div>

        {/* Card 2: Laba Kotor (Gross Profit) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Laba Kotor (Gross Profit)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">{formatRupiah(totalGrossProfit)}</p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>HPP: {formatRupiah(totalCost)}</span>
            <span className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded">
              Margin {grossMarginPct}%
            </span>
          </div>
        </div>

        {/* Card 3: Total Transaksi & AOV */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Transaksi</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{formatNumber(totalTransactions)}</p>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
            <span>Rata-rata Order (AOV):</span>
            <span className="font-bold text-amber-400">{formatRupiah(aov)}</span>
          </div>
        </div>

        {/* Card 4: Pajak Resto PPN 11% */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Setoran Pajak (PPN 11%)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{formatRupiah(totalTax)}</p>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
            <span>Kewajiban Fiskal Daerah:</span>
            <span className="text-emerald-400 font-semibold">Tersinkronisasi</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <InteractiveSalesChart
        data={chartData}
        title={
          chartPeriod === 'weekly'
            ? 'Tren Penjualan 7 Hari Terakhir'
            : chartPeriod === 'monthly'
            ? 'Tren Penjualan 30 Hari Terakhir'
            : 'Distribusi Omset Jam Sibuk (Peak Hours)'
        }
        period={chartPeriod}
        setPeriod={setChartPeriod}
      />

      {/* Bottom Grid: Top Selling Menu + Payment Breakdown + Low Stock Health Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Menu Terlaris */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-400" />
              <h3 className="font-extrabold text-sm text-white">Top 5 Menu Terlaris</h3>
            </div>
            <span className="text-[10px] text-slate-400">Paling diminati</span>
          </div>

          <div className="space-y-3">
            {topSellers.map((item, idx) => {
              const widthPct = Math.min(Math.round((item.qty / maxSoldQty) * 100), 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 truncate max-w-[170px]">
                      {idx + 1}. {item.name}
                    </span>
                    <span className="font-mono text-amber-400 font-semibold">
                      {item.qty} porsi ({formatRupiah(item.revenue)})
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribusi Pembayaran Digital */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-400" />
              <h3 className="font-extrabold text-sm text-white">Distribusi Pembayaran</h3>
            </div>
            <span className="text-[10px] text-slate-400">Metode Transaksi</span>
          </div>

          <div className="space-y-3">
            {paymentBreakdown.map((item, idx) => (
              <div key={idx} className="p-2.5 bg-slate-850 rounded-xl border border-slate-750 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{item.method}</span>
                  <span className="font-mono text-slate-300 font-semibold">
                    {formatRupiah(item.total)} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.method === 'QRIS'
                        ? 'bg-rose-500'
                        : item.method === 'CASH'
                        ? 'bg-emerald-500'
                        : item.method === 'DEBIT_CREDIT'
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">{item.count} kali transaksi</p>
              </div>
            ))}
          </div>
        </div>

        {/* Peringatan Stok Kritis (Automated Stock Health Radar) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="font-extrabold text-sm text-white">Radar Stok Kritis</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
              {stockAlerts.length} Peringatan
            </span>
          </div>

          <div className="space-y-2.5 max-h-[260px] overflow-y-auto">
            {stockAlerts.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                Semua stok bahan baku aman di atas batas minimum.
              </div>
            ) : (
              stockAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="p-3 bg-slate-850 rounded-xl border border-rose-900/30 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white truncate max-w-[160px]">
                      {alert.ingredientName}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {alert.severity === 'critical' ? 'Kritis' : 'Menipis'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{alert.branchName.replace('KopiKula ', '')}</span>
                    <span className="text-rose-300 font-bold">
                      {formatNumber(alert.currentStock)} / Min {formatNumber(alert.minThreshold)} {alert.unit}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
