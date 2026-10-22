import React from 'react';
import { X, Printer, Share2, CheckCircle2, Coffee, Download } from 'lucide-react';
import { Transaction } from '../../types';
import { formatRupiah, formatDateTime } from '../../utils/formatters';

interface ReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const textLines = [
      `*STRUK PEMBAYARAN KOPIKULA CAFE*`,
      `No. Struk: ${transaction.receiptNumber}`,
      `Cabang: ${transaction.branchName}`,
      `Waktu: ${formatDateTime(transaction.createdAt)}`,
      `Pelanggan: ${transaction.customerName} (${transaction.orderType === 'dine_in' ? transaction.tableNumber : 'Takeaway'})`,
      `--------------------------------`,
      ...transaction.items.map(i => `${i.name} (x${i.quantity}) - ${formatRupiah(i.subtotal)}`),
      `--------------------------------`,
      `Subtotal: ${formatRupiah(transaction.subtotal)}`,
      transaction.discountAmount > 0 ? `Diskon (${transaction.discountRate}%): -${formatRupiah(transaction.discountAmount)}` : null,
      `PPN (11%): ${formatRupiah(transaction.taxAmount)}`,
      transaction.serviceChargeAmount > 0 ? `Service Charge (5%): ${formatRupiah(transaction.serviceChargeAmount)}` : null,
      `*TOTAL: ${formatRupiah(transaction.total)}*`,
      `Metode: ${transaction.paymentMethod}`,
      transaction.cashTendered ? `Tunai: ${formatRupiah(transaction.cashTendered)} | Kembali: ${formatRupiah(transaction.changeAmount || 0)}` : null,
      `--------------------------------`,
      `Terima kasih atas kunjungan Anda! Selamat menikmati kopi terbaik kami.`,
    ].filter(Boolean).join('\n');

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textLines)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white text-sm">Transaksi Berhasil Disimpan</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Receipt Paper Container */}
        <div className="p-4 overflow-y-auto bg-slate-950/70 flex justify-center">
          <div
            id="thermal-receipt-print-area"
            className="w-full max-w-[320px] bg-white text-slate-900 font-mono text-[11px] p-5 rounded-lg shadow-2xl border border-slate-300 leading-relaxed"
          >
            {/* Cafe Logo & Header */}
            <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-3">
              <div className="flex justify-center mb-1">
                <Coffee className="w-6 h-6 text-slate-900" />
              </div>
              <h2 className="text-base font-black tracking-wider uppercase">KOPIKULA COFFEE</h2>
              <p className="text-[10px] text-slate-600 font-bold">{transaction.branchName}</p>
              <p className="text-[9px] text-slate-500">Jl. Senopati No. 42, Jakarta</p>
              <p className="text-[9px] text-slate-500">Telp: 021-57892341</p>
            </div>

            {/* Receipt Meta */}
            <div className="space-y-0.5 border-b border-dashed border-slate-400 pb-2 mb-2 text-[10px]">
              <div className="flex justify-between">
                <span>No. Struk:</span>
                <span className="font-bold">{transaction.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{formatDateTime(transaction.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir / Barista:</span>
                <span>{transaction.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span className="font-semibold">{transaction.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Tipe Order:</span>
                <span className="font-bold uppercase">
                  {transaction.orderType === 'dine_in'
                    ? `DINE IN (${transaction.tableNumber})`
                    : transaction.orderType === 'takeaway'
                    ? 'TAKE AWAY'
                    : 'DELIVERY'}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-b border-dashed border-slate-400 pb-2 mb-2">
              <div className="grid grid-cols-12 font-bold mb-1 border-b border-slate-200 pb-1 text-[9px] uppercase">
                <span className="col-span-6">Item</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-4 text-right">Harga</span>
              </div>
              <div className="space-y-1.5">
                {transaction.items.map((item, idx) => (
                  <div key={idx} className="text-[10px]">
                    <div className="grid grid-cols-12">
                      <span className="col-span-6 font-semibold truncate">{item.name}</span>
                      <span className="col-span-2 text-center">x{item.quantity}</span>
                      <span className="col-span-4 text-right font-medium">
                        {formatRupiah(item.subtotal)}
                      </span>
                    </div>
                    {item.optionsSummary && (
                      <p className="text-[9px] text-slate-500 pl-1">{item.optionsSummary}</p>
                    )}
                    {item.notes && (
                      <p className="text-[9px] text-amber-700 italic pl-1">*{item.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-1 border-b border-dashed border-slate-400 pb-2 mb-2 text-[10px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatRupiah(transaction.subtotal)}</span>
              </div>
              {transaction.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon ({transaction.discountRate}%):</span>
                  <span>-{formatRupiah(transaction.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>PPN Restoran (11%):</span>
                <span>{formatRupiah(transaction.taxAmount)}</span>
              </div>
              {transaction.serviceChargeAmount > 0 && (
                <div className="flex justify-between">
                  <span>Service Charge (5%):</span>
                  <span>{formatRupiah(transaction.serviceChargeAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-black border-t border-slate-300 pt-1 mt-1">
                <span>TOTAL AKHIR:</span>
                <span>{formatRupiah(transaction.total)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-0.5 border-b border-dashed border-slate-400 pb-2 mb-2 text-[10px]">
              <div className="flex justify-between">
                <span>Metode Bayar:</span>
                <span className="font-bold">{transaction.paymentMethod}</span>
              </div>
              {transaction.paymentReference && (
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>Ref:</span>
                  <span>{transaction.paymentReference}</span>
                </div>
              )}
              {transaction.cashTendered !== undefined && (
                <>
                  <div className="flex justify-between">
                    <span>Uang Diterima:</span>
                    <span>{formatRupiah(transaction.cashTendered)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Kembalian:</span>
                    <span>{formatRupiah(transaction.changeAmount || 0)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer QR & Greetings */}
            <div className="text-center pt-2 space-y-1">
              <p className="text-[9px] text-slate-500 font-semibold">
                Stok bahan baku resep telah dipotong otomatis.
              </p>
              <p className="text-[10px] font-bold">Terima Kasih Atas Kunjungan Anda!</p>
              <p className="text-[9px] text-slate-400">Wi-Fi: KopiKula_Free • Pass: kopisejati</p>
              
              {/* Barcode line simulation */}
              <div className="mt-2 flex justify-center items-center gap-[2px] h-6 px-4">
                {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 3, 1, 2].map((w, i) => (
                  <span
                    key={i}
                    style={{ width: `${w}px` }}
                    className="h-full bg-slate-900 inline-block"
                  />
                ))}
              </div>
              <p className="text-[8px] text-slate-500 tracking-widest">{transaction.id}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              Cetak Struk Thermal
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-500/30 transition"
            >
              <Share2 className="w-4 h-4" />
              Kirim via WhatsApp
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
          >
            Transaksi Baru Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
};
