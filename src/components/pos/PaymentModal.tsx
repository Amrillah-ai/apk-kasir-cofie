import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Banknote,
  Smartphone,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentMethod, Transaction } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (transaction: Transaction) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const {
    cartTotal,
    cartTaxAmount,
    cartServiceAmount,
    cartSubtotal,
    activeBranch,
    completeCheckout,
    orderType,
    tableNumber,
    customerName,
  } = useApp();

  const [method, setMethod] = useState<PaymentMethod>('QRIS');
  const [cashTendered, setCashTendered] = useState<number>(cartTotal);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [qrisCountdown, setQrisCountdown] = useState<number>(300); // 5 minutes
  const [edcApprovalCode, setEdcApprovalCode] = useState<string>('APV-882910');
  const [selectedWallet, setSelectedWallet] = useState<'GOPAY' | 'OVO' | 'DANA' | 'SHOPEEPAY'>('GOPAY');

  useEffect(() => {
    if (isOpen) {
      setCashTendered(cartTotal);
      setQrisCountdown(300);
    }
  }, [isOpen, cartTotal]);

  useEffect(() => {
    if (!isOpen || method !== 'QRIS') return;
    const interval = setInterval(() => {
      setQrisCountdown(c => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, method]);

  if (!isOpen) return null;

  const changeAmount = Math.max(0, cashTendered - cartTotal);
  const isCashInsufficient = method === 'CASH' && cashTendered < cartTotal;

  const handleExecutePayment = (chosenMethod: PaymentMethod = method) => {
    setIsProcessing(true);

    setTimeout(() => {
      let refStr: string | undefined;
      if (chosenMethod === 'QRIS') {
        refStr = `NMID-ID${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      } else if (chosenMethod === 'DEBIT_CREDIT') {
        refStr = `EDC-${edcApprovalCode}`;
      } else if (chosenMethod !== 'CASH') {
        refStr = `${chosenMethod}-${Math.floor(100000 + Math.random() * 900000)}`;
      }

      const tx = completeCheckout(
        chosenMethod,
        chosenMethod === 'CASH' ? cashTendered : undefined,
        refStr
      );

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore if not supported
      }

      setIsProcessing(false);
      onPaymentSuccess(tx);
      onClose();
    }, 600);
  };

  const minutes = Math.floor(qrisCountdown / 60);
  const seconds = qrisCountdown % 60;
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Kasir & Pembayaran Digital
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                {orderType === 'dine_in' ? `Dine In (${tableNumber})` : 'Take Away'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-0.5">
              Tagihan: {formatRupiah(cartTotal)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method Switcher Tabs */}
        <div className="grid grid-cols-4 p-2 bg-slate-950/50 gap-1 border-b border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setMethod('QRIS')}
            className={`p-2.5 rounded-xl font-semibold flex flex-col items-center gap-1.5 transition ${
              method === 'QRIS'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span>QRIS Dinamis</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('CASH')}
            className={`p-2.5 rounded-xl font-semibold flex flex-col items-center gap-1.5 transition ${
              method === 'CASH'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Banknote className="w-5 h-5" />
            <span>Tunai (Cash)</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod(selectedWallet)}
            className={`p-2.5 rounded-xl font-semibold flex flex-col items-center gap-1.5 transition ${
              ['GOPAY', 'OVO', 'DANA', 'SHOPEEPAY'].includes(method)
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            <span>E-Wallet</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('DEBIT_CREDIT')}
            className={`p-2.5 rounded-xl font-semibold flex flex-col items-center gap-1.5 transition ${
              method === 'DEBIT_CREDIT'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Kartu EDC</span>
          </button>
        </div>

        {/* Content Body Based on Method */}
        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
          {/* TAB 1: QRIS */}
          {method === 'QRIS' && (
            <div className="flex flex-col items-center text-center">
              <div className="bg-white p-4 rounded-2xl shadow-xl border-4 border-amber-500/30 flex flex-col items-center">
                <div className="flex items-center justify-between w-full px-2 mb-2 border-b pb-1 text-slate-800">
                  <span className="font-extrabold text-xs tracking-wider text-rose-600">QRIS</span>
                  <span className="text-[10px] font-mono text-slate-500">STANDAR PEMBAYARAN NASIONAL</span>
                </div>

                {/* Simulated SVG QR Code */}
                <div className="relative p-2 bg-white rounded-lg">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-44 h-44 sm:w-52 sm:h-52 text-slate-900"
                    fill="currentColor"
                  >
                    {/* QR Code Position markers */}
                    <rect x="0" y="0" width="30" height="30" rx="3" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="9" y="9" width="12" height="12" />

                    <rect x="70" y="0" width="30" height="30" rx="3" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="79" y="9" width="12" height="12" />

                    <rect x="0" y="70" width="30" height="30" rx="3" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="9" y="79" width="12" height="12" />

                    {/* QR Grid pattern dots */}
                    <circle cx="45" cy="15" r="3" />
                    <circle cx="55" cy="20" r="2.5" />
                    <circle cx="40" cy="30" r="3" />
                    <circle cx="50" cy="40" r="4" />
                    <circle cx="35" cy="45" r="2.5" />
                    <circle cx="65" cy="45" r="3" />
                    <circle cx="45" cy="55" r="3.5" />
                    <circle cx="55" cy="65" r="2.5" />
                    <circle cx="75" cy="55" r="3" />
                    <circle cx="85" cy="45" r="3.5" />
                    <circle cx="45" cy="75" r="3" />
                    <circle cx="55" cy="85" r="2.5" />
                    <circle cx="70" cy="75" r="3" />
                    <circle cx="85" cy="80" r="3.5" />
                    <circle cx="20" cy="45" r="3" />
                    <circle cx="25" cy="55" r="3" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-amber-500 text-slate-950 p-1.5 rounded-lg shadow-md font-black text-[10px]">
                      KOPIKULA
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-slate-800 text-center">
                  <p className="font-bold text-xs">{activeBranch?.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">NMID: ID1029384756201</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-amber-400 font-mono">
                <span>Berlaku hingga:</span>
                <span className="font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                  {timerStr}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-1">
                Arahkan aplikasi BCA, Mandiri, GoPay, OVO, ShopeePay, atau DANA pelanggan ke kode QR di atas.
              </p>

              <button
                type="button"
                onClick={() => handleExecutePayment('QRIS')}
                disabled={isProcessing}
                className="mt-4 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isProcessing ? 'Memverifikasi Pembayaran...' : '⚡ Simulasi Scan Pembeli Sukses (Verifikasi Otomatis)'}
              </button>
            </div>
          )}

          {/* TAB 2: CASH (TUNAI) */}
          {method === 'CASH' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nominal Uang Diterima dari Pelanggan
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={cashTendered || ''}
                    onChange={e => setCashTendered(Number(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold text-lg focus:outline-none focus:border-amber-500"
                    placeholder="Masukkan jumlah uang tunai..."
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div>
                <p className="text-[11px] text-slate-400 font-semibold mb-2">Pilihan Cepat Nominal Uang Pas / Pecahan:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setCashTendered(cartTotal)}
                    className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-amber-400 hover:bg-slate-750 transition"
                  >
                    Uang Pas
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashTendered(50000)}
                    className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:bg-slate-750 transition"
                  >
                    Rp 50.000
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashTendered(100000)}
                    className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:bg-slate-750 transition"
                  >
                    Rp 100.000
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashTendered(200000)}
                    className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:bg-slate-750 transition"
                  >
                    Rp 200.000
                  </button>
                </div>
              </div>

              {/* Kembalian Box */}
              <div
                className={`p-4 rounded-xl border ${
                  isCashInsufficient
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : 'bg-emerald-500/10 border-emerald-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    {isCashInsufficient ? 'Uang Masih Kurang' : 'Kembalian Pelanggan'}
                  </span>
                  <span
                    className={`text-xl font-bold font-mono ${
                      isCashInsufficient ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {isCashInsufficient
                      ? `- ${formatRupiah(cartTotal - cashTendered)}`
                      : formatRupiah(changeAmount)}
                  </span>
                </div>
                {isCashInsufficient && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Nominal pembayaran belum mencukupi total tagihan.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleExecutePayment('CASH')}
                disabled={isCashInsufficient || isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isProcessing ? 'Menyimpan Transaksi...' : 'Konfirmasi Pembayaran Tunai & Cetak Struk'}
              </button>
            </div>
          )}

          {/* TAB 3: E-WALLET */}
          {['GOPAY', 'OVO', 'DANA', 'SHOPEEPAY'].includes(method) && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Pilih Saluran Dompet Digital:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['GOPAY', 'OVO', 'DANA', 'SHOPEEPAY'] as const).map(wallet => (
                    <button
                      key={wallet}
                      type="button"
                      onClick={() => {
                        setSelectedWallet(wallet);
                        setMethod(wallet);
                      }}
                      className={`p-3 rounded-xl border text-left font-bold text-xs flex items-center justify-between transition ${
                        method === wallet
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      <span>{wallet}</span>
                      {method === wallet && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nomor HP Pelanggan ({method})
                </label>
                <input
                  type="tel"
                  defaultValue="081298765432"
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-400">
                Notifikasi push pembayaran instan akan dikirimkan ke aplikasi smartphone pelanggan secara otomatis.
              </div>

              <button
                type="button"
                onClick={() => handleExecutePayment(method)}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isProcessing ? 'Menunggu Konfirmasi Pelanggan...' : `Kirim & Konfirmasi Pembayaran ${method}`}
              </button>
            </div>
          )}

          {/* TAB 4: DEBIT / CREDIT CARD EDC */}
          {method === 'DEBIT_CREDIT' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-850 rounded-xl border border-slate-750 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Terminal EDC Cafe</span>
                  <span className="text-xs font-mono font-bold text-amber-400">EDC-BCA-01</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                    Kode Otorisasi EDC (Approval Code)
                  </label>
                  <input
                    type="text"
                    value={edcApprovalCode}
                    onChange={e => setEdcApprovalCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleExecutePayment('DEBIT_CREDIT')}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isProcessing ? 'Memproses Kartu...' : 'Selesaikan Transaksi Kartu EDC'}
              </button>
            </div>
          )}
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Subtotal: {formatRupiah(cartSubtotal)} • PPN 11%: {formatRupiah(cartTaxAmount)}</span>
          <span className="font-semibold text-white">Laba Kotor Terestimasi: Otomatis dihitung</span>
        </div>
      </div>
    </div>
  );
};
