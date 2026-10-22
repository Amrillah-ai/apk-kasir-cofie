import React from 'react';
import {
  X,
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  PackagePlus,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatNumber, formatDateTime } from '../utils/formatters';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToInventory?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onNavigateToInventory,
}) => {
  const { stockAlerts, markAlertAsRead, clearAllAlerts } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Notifikasi Stok Otomatis</h3>
              <p className="text-[10px] text-slate-400">
                Peringatan dini saat bahan baku mendekati batas minimum (safety stock).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action sub-bar */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>{stockAlerts.length} Peringatan Aktif</span>
          {stockAlerts.length > 0 && (
            <button
              onClick={clearAllAlerts}
              className="text-[11px] text-slate-400 hover:text-amber-400 transition flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Bersihkan Notifikasi
            </button>
          )}
        </div>

        {/* Alerts List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {stockAlerts.length === 0 ? (
            <div className="p-10 text-center text-slate-500 space-y-2">
              <CheckCheck className="w-8 h-8 mx-auto text-emerald-400" />
              <p className="font-bold text-sm text-slate-300">Semua Stok Bahan Baku Aman</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Sistem akan memicu peringatan otomatis secara real-time apabila transaksi kasir menyebabkan stok bahan turun di bawah batas aman.
              </p>
            </div>
          ) : (
            stockAlerts.map(alert => {
              const isCrit = alert.severity === 'critical';

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition space-y-2 ${
                    isCrit
                      ? 'bg-rose-950/20 border-rose-800/50 shadow-sm'
                      : 'bg-amber-950/20 border-amber-800/40'
                  } ${alert.isRead ? 'opacity-70' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isCrit ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      />
                      <div>
                        <h4 className="font-bold text-xs text-white leading-tight">
                          {alert.ingredientName}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {alert.branchName}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        isCrit
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {isCrit ? 'Stok Kritis' : 'Mendekati Minimum'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs p-2 bg-slate-900/80 rounded-lg font-mono">
                    <span className="text-slate-400">Sisa Stok Real-Time:</span>
                    <span className={`font-bold ${isCrit ? 'text-rose-400' : 'text-amber-400'}`}>
                      {formatNumber(alert.currentStock)} {alert.unit} (Min: {formatNumber(alert.minThreshold)} {alert.unit})
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(alert.createdAt)}
                    </span>

                    <div className="flex items-center gap-2">
                      {!alert.isRead && (
                        <button
                          onClick={() => markAlertAsRead(alert.id)}
                          className="text-slate-400 hover:text-white transition flex items-center gap-0.5"
                        >
                          <Check className="w-3 h-3" />
                          Tandai dibaca
                        </button>
                      )}

                      {onNavigateToInventory && (
                        <button
                          onClick={() => {
                            onClose();
                            onNavigateToInventory();
                          }}
                          className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-bold transition flex items-center gap-1"
                        >
                          <PackagePlus className="w-3 h-3" />
                          Restok Sekarang
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-850 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl transition"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    </div>
  );
};
