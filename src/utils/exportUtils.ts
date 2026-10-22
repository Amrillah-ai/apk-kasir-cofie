import * as XLSX from 'xlsx';
import { Transaction, RawIngredient, Branch } from '../types';
import { formatRupiah, formatDateTime, formatDate } from './formatters';

export interface ExportFilterOptions {
  branchName: string;
  dateRangeLabel: string;
  totalRevenue: number;
  totalCost: number;
  totalGrossProfit: number;
  totalTax: number;
  totalTransactions: number;
}

export const exportToExcel = (
  transactions: Transaction[],
  ingredients: RawIngredient[],
  activeBranch: Branch | null,
  options: ExportFilterOptions
) => {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Ringkasan Keuangan (Financial Summary)
  const summaryData = [
    ['LAPORAN KEUANGAN & PENJUALAN KOPIKULA CAFE POS'],
    ['Generated at:', formatDateTime(new Date())],
    ['Cabang:', options.branchName],
    ['Periode:', options.dateRangeLabel],
    [''],
    ['RINGKASAN METRIK BISNIS', 'NILAI'],
    ['Total Transaksi Selesai', options.totalTransactions],
    ['Total Omset Bruto (Revenue)', options.totalRevenue],
    ['Total Biaya Bahan Baku (HPP / COGS)', options.totalCost],
    ['Laba Kotor (Gross Profit)', options.totalGrossProfit],
    ['Margin Keuntungan Kotor', `${options.totalRevenue > 0 ? ((options.totalGrossProfit / options.totalRevenue) * 100).toFixed(1) : 0}%`],
    ['Total Setoran Pajak Restoran (PPN 11%)', options.totalTax],
    ['Rata-rata Nilai Transaksi (AOV)', options.totalTransactions > 0 ? Math.round(options.totalRevenue / options.totalTransactions) : 0],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Eksekutif');

  // 2. Sheet Transaksi Lengkap (Ledger Detail)
  const txHeaders = [
    'No',
    'ID Transaksi',
    'No Struk',
    'Waktu Transaksi',
    'Cabang',
    'Kasir',
    'Pelanggan',
    'Tipe Pesanan',
    'Meja',
    'Metode Bayar',
    'Item Pesanan',
    'Subtotal (Rp)',
    'Diskon (Rp)',
    'PPN 11% (Rp)',
    'Service Charge (Rp)',
    'Total Pembayaran (Rp)',
    'Total HPP (Rp)',
    'Laba Kotor (Rp)',
  ];

  const txRows = transactions.map((tx, idx) => [
    idx + 1,
    tx.id,
    tx.receiptNumber,
    formatDateTime(tx.createdAt),
    tx.branchName,
    tx.cashierName,
    tx.customerName || 'Pelanggan Umum',
    tx.orderType === 'dine_in' ? 'Dine In' : tx.orderType === 'takeaway' ? 'Take Away' : 'Delivery',
    tx.tableNumber || '-',
    tx.paymentMethod,
    tx.items.map(i => `${i.name} (x${i.quantity})`).join(', '),
    tx.subtotal,
    tx.discountAmount,
    tx.taxAmount,
    tx.serviceChargeAmount,
    tx.total,
    tx.totalCost,
    tx.grossProfit,
  ]);

  const wsTransactions = XLSX.utils.aoa_to_sheet([txHeaders, ...txRows]);
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Daftar Transaksi');

  // 3. Sheet Penjualan Menu (Menu Sales Breakdown)
  const menuAgg: Record<string, { name: string; qty: number; revenue: number; cost: number }> = {};
  transactions.forEach(tx => {
    tx.items.forEach(item => {
      if (!menuAgg[item.menuItemId]) {
        menuAgg[item.menuItemId] = {
          name: item.name,
          qty: 0,
          revenue: 0,
          cost: 0,
        };
      }
      menuAgg[item.menuItemId].qty += item.quantity;
      menuAgg[item.menuItemId].revenue += item.subtotal;
      menuAgg[item.menuItemId].cost += (item.costPrice || 0) * item.quantity;
    });
  });

  const menuHeaders = ['No', 'Nama Menu', 'Porsi Terjual', 'Total Omset (Rp)', 'Total HPP (Rp)', 'Laba Kotor (Rp)', 'Margin (%)'];
  const menuRows = Object.values(menuAgg)
    .sort((a, b) => b.qty - a.qty)
    .map((m, idx) => {
      const profit = m.revenue - m.cost;
      const margin = m.revenue > 0 ? ((profit / m.revenue) * 100).toFixed(1) : '0';
      return [idx + 1, m.name, m.qty, m.revenue, m.cost, profit, `${margin}%`];
    });

  const wsMenu = XLSX.utils.aoa_to_sheet([menuHeaders, ...menuRows]);
  XLSX.utils.book_append_sheet(wb, wsMenu, 'Analisis Menu');

  // 4. Sheet Stok Inventaris
  const stockHeaders = ['SKU', 'Nama Bahan Baku', 'Kategori', 'Satuan', 'Batas Minimum', 'Stok Senopati', 'Stok Dago', 'Stok Canggu', 'HPP per Satuan (Rp)', 'Supplier'];
  const stockRows = ingredients.map(ing => [
    ing.sku,
    ing.name,
    ing.category,
    ing.unit,
    ing.minStockThreshold,
    ing.stockByBranch['b-senopati'] || 0,
    ing.stockByBranch['b-dago'] || 0,
    ing.stockByBranch['b-canggu'] || 0,
    ing.costPerUnit,
    ing.supplier,
  ]);

  const wsStock = XLSX.utils.aoa_to_sheet([stockHeaders, ...stockRows]);
  XLSX.utils.book_append_sheet(wb, wsStock, 'Status Inventaris Bahan');

  // Write file
  const fileName = `Laporan_Akuntansi_KopiKula_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const printOrDownloadPDF = (
  transactions: Transaction[],
  options: ExportFilterOptions
) => {
  // Opens a styled print window for PDF saving/printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Harap izinkan popup browser untuk mengunduh laporan PDF.');
    return;
  }

  const topItems = transactions.slice(0, 30); // representative rows for clean multi-page PDF

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Laporan Keuangan & Penjualan - KopiKula</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
          * { box-sizing: border-box; }
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 30px;
            font-size: 11px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .brand-title {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 4px 0;
          }
          .brand-subtitle {
            font-size: 11px;
            color: #64748b;
            margin: 0;
          }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }
          .kpi-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            background: #f8fafc;
          }
          .kpi-label {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 600;
            color: #64748b;
          }
          .kpi-val {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 4px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          th {
            background: #0f172a;
            color: white;
            text-align: left;
            padding: 8px 10px;
            font-size: 10px;
            text-transform: uppercase;
          }
          td {
            padding: 7px 10px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 10px;
          }
          tr:nth-child(even) td {
            background: #f8fafc;
          }
          .text-right { text-align: right; }
          .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            padding: 0 20px;
          }
          .sig-box {
            text-align: center;
            width: 180px;
          }
          .sig-line {
            margin-top: 60px;
            border-top: 1px solid #94a3b8;
          }
          @media print {
            body { padding: 0; }
            @page { margin: 1.5cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="brand-title">KOPIKULA COFFEE ROASTERS</h1>
            <p class="brand-subtitle">LAPORAN PEMBUKUAN AKUNTANSI & REKAP PENJUALAN</p>
            <p class="brand-subtitle">Cabang: ${options.branchName} | Periode: ${options.dateRangeLabel}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-weight: 700; font-size: 13px;">DOKUMEN RESMI</p>
            <p style="margin: 3px 0 0 0; color: #64748b;">Tanggal Cetak: ${formatDateTime(new Date())}</p>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Total Omset (Revenue)</div>
            <div class="kpi-val">${formatRupiah(options.totalRevenue)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">HPP Bahan Baku</div>
            <div class="kpi-val">${formatRupiah(options.totalCost)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Laba Kotor (Gross Profit)</div>
            <div class="kpi-val" style="color: #059669;">${formatRupiah(options.totalGrossProfit)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total Transaksi</div>
            <div class="kpi-val">${options.totalTransactions} Pesanan</div>
          </div>
        </div>

        <h3 style="font-size: 12px; margin-bottom: 8px;">Jurnal Transaksi Kasir</h3>
        <table>
          <thead>
            <tr>
              <th>Waktu</th>
              <th>No. Struk</th>
              <th>Pelanggan</th>
              <th>Tipe</th>
              <th>Metode</th>
              <th class="text-right">Subtotal</th>
              <th class="text-right">PPN 11%</th>
              <th class="text-right">Total Akhir</th>
            </tr>
          </thead>
          <tbody>
            ${topItems.map(tx => `
              <tr>
                <td>${formatDateTime(tx.createdAt)}</td>
                <td><strong>${tx.receiptNumber}</strong></td>
                <td>${tx.customerName || 'Pelanggan Umum'}</td>
                <td>${tx.orderType === 'dine_in' ? 'Dine In' : 'Takeaway'}</td>
                <td>${tx.paymentMethod}</td>
                <td class="text-right">${formatRupiah(tx.subtotal)}</td>
                <td class="text-right">${formatRupiah(tx.taxAmount)}</td>
                <td class="text-right"><strong>${formatRupiah(tx.total)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="signature-section">
          <div class="sig-box">
            <p>Dibuat Oleh (Kasir / Barista):</p>
            <div class="sig-line"></div>
            <p style="margin-top: 4px; font-weight: 600;">Petugas Kasir</p>
          </div>
          <div class="sig-box">
            <p>Diperiksa Oleh (Store Manager):</p>
            <div class="sig-line"></div>
            <p style="margin-top: 4px; font-weight: 600;">Manajer Toko</p>
          </div>
          <div class="sig-box">
            <p>Disetujui Oleh (Headquarters):</p>
            <div class="sig-line"></div>
            <p style="margin-top: 4px; font-weight: 600;">Admin Pusat / Finance</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
