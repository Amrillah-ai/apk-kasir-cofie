import React from 'react';
import {
  Building2,
  ShieldCheck,
  Store,
  UserCheck,
  Check,
  X,
  Phone,
  MapPin,
  TrendingUp,
  Boxes,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INITIAL_USERS } from '../../data/mockData';
import { formatRupiah, formatNumber } from '../../utils/formatters';

export const BranchManagementView: React.FC = () => {
  const { branches, transactions, ingredients, switchUser, currentUser, currentRole } = useApp();

  // Compute metrics per branch
  const branchMetrics = branches.map(branch => {
    const branchTxs = transactions.filter(t => t.branchId === branch.id);
    const revenue = branchTxs.reduce((acc, t) => acc + t.total, 0);
    const totalOrders = branchTxs.length;

    // Calculate total inventory value in this branch
    const inventoryValue = ingredients.reduce((acc, ing) => {
      const stock = ing.stockByBranch[branch.id] ?? 0;
      return acc + stock * ing.costPerUnit;
    }, 0);

    return {
      branch,
      revenue,
      totalOrders,
      inventoryValue,
    };
  });

  const permissions = [
    {
      feature: 'Akses POS Kasir & Transaksi Cepat',
      admin: true,
      manager: true,
      cashier: true,
    },
    {
      feature: 'Pencetakan Struk Thermal & QRIS Dinamis',
      admin: true,
      manager: true,
      cashier: true,
    },
    {
      feature: 'Input Penerimaan Restok Bahan Baku',
      admin: true,
      manager: true,
      cashier: false,
    },
    {
      feature: 'Audit Opname Fisik & Koreksi Stok',
      admin: true,
      manager: true,
      cashier: false,
    },
    {
      feature: 'Pengiriman Mutasi Transfer Antar-Cabang',
      admin: true,
      manager: true,
      cashier: false,
    },
    {
      feature: 'Pengaturan Komposisi Resep & BOM Menu',
      admin: true,
      manager: false,
      cashier: false,
    },
    {
      feature: 'Konsolidasi Laporan Keuangan Seluruh Cabang',
      admin: true,
      manager: false,
      cashier: false,
    },
    {
      feature: 'Ekspor Data Akuntansi Excel (.xlsx) & PDF Pajak',
      admin: true,
      manager: true,
      cashier: false,
    },
    {
      feature: 'Manajemen Hak Akses & Akun Karyawan (RBAC)',
      admin: true,
      manager: false,
      cashier: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            Enterprise Architecture
          </span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
            Multi-Branch & RBAC
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
          Pengelolaan Jaringan Multi-Cabang & Otoritas Peran
        </h1>
        <p className="text-xs text-slate-400">
          Sinkronisasi operasional terpusat antara Kantor Pusat (HQ) dan cabang gerai daerah.
        </p>
      </div>

      {/* Multi-Branch Performance Cards */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>Status Jaringan Cabang KopiKula</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branchMetrics.map(({ branch, revenue, totalOrders, inventoryValue }) => (
            <div
              key={branch.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden"
            >
              {branch.isHQ && (
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                  KANTOR PUSAT (HQ)
                </div>
              )}

              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold">
                  KODE CABANG: {branch.code}
                </span>
                <h4 className="text-base font-extrabold text-white mt-0.5">{branch.name}</h4>
                <div className="mt-2 text-xs text-slate-400 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{branch.address}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{branch.phone}</span>
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-850 rounded-xl space-y-2 border border-slate-750 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Omset Cabang:</span>
                  <span className="font-bold text-amber-400">{formatRupiah(revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jumlah Transaksi:</span>
                  <span className="font-semibold text-white">{formatNumber(totalOrders)} pesanan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nilai Aset Stok Bahan:</span>
                  <span className="font-semibold text-emerald-400">{formatRupiah(inventoryValue)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-400">
                  Manajer: <strong className="text-white">{branch.managerName}</strong>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Operasional Aktif
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Matriks Otoritas Hak Akses Pengguna (Role-Based Access Control)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Setiap peran memiliki batasan hak akses sesuai standar kepatuhan tata kelola POS & audit akuntansi.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-850 text-slate-300 border-b border-slate-800 text-[11px]">
                <th className="py-3 px-4 font-bold">Fitur & Modul Sistem</th>
                <th className="py-3 px-4 text-center font-bold text-amber-400">
                  👑 Admin Pusat (HQ)
                </th>
                <th className="py-3 px-4 text-center font-bold text-blue-400">
                  🏪 Manajer Toko
                </th>
                <th className="py-3 px-4 text-center font-bold text-emerald-400">
                  ☕ Kasir / Barista
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {permissions.map((p, i) => (
                <tr key={i} className="hover:bg-slate-850/40 transition">
                  <td className="py-3 px-4 font-medium text-slate-200">{p.feature}</td>

                  {/* Admin Pusat */}
                  <td className="py-3 px-4 text-center">
                    {p.admin ? (
                      <span className="inline-flex p-1 rounded-full bg-amber-500/20 text-amber-400">
                        <Check className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-slate-800 text-slate-600">
                        <X className="w-4 h-4" />
                      </span>
                    )}
                  </td>

                  {/* Manajer Toko */}
                  <td className="py-3 px-4 text-center">
                    {p.manager ? (
                      <span className="inline-flex p-1 rounded-full bg-blue-500/20 text-blue-400">
                        <Check className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-slate-800 text-slate-600">
                        <X className="w-4 h-4" />
                      </span>
                    )}
                  </td>

                  {/* Kasir / Barista */}
                  <td className="py-3 px-4 text-center">
                    {p.cashier ? (
                      <span className="inline-flex p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                        <Check className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-slate-800 text-slate-600">
                        <X className="w-4 h-4" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Accounts Demonstration Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Daftar Akun Pengguna & Personel Karyawan</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Klik tombol "Beralih ke Akun Ini" untuk menguji langsung pengalaman antarmuka tiap peran.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {INITIAL_USERS.map(user => {
            const isCurrent = currentUser.id === user.id;

            return (
              <div
                key={user.id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-500/10'
                    : 'bg-slate-850 border-slate-750 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-white leading-tight">{user.name}</h4>
                      <p className="text-[10px] font-semibold text-amber-400 uppercase mt-0.5">
                        {user.role === 'admin_pusat'
                          ? 'Admin Pusat (HQ)'
                          : user.role === 'manajer_toko'
                          ? 'Manajer Toko'
                          : 'Kasir / Barista'}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    PIN Keamanan: <strong className="text-slate-200">****</strong>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-750">
                  {isCurrent ? (
                    <span className="w-full py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Akun Aktif Sekarang
                    </span>
                  ) : (
                    <button
                      onClick={() => switchUser(user.id)}
                      className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] transition"
                    >
                      Beralih ke Akun Ini
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
