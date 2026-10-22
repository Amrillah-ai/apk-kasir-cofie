import React, { useState, useEffect } from 'react';
import {
  Coffee,
  Store,
  Bell,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  RefreshCw,
  Clock,
  Sparkles,
  LayoutGrid,
  BarChart3,
  Boxes,
  FileSpreadsheet,
  Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface NavbarProps {
  activeTab: 'pos' | 'dashboard' | 'inventory' | 'reports' | 'branches';
  setActiveTab: (tab: 'pos' | 'dashboard' | 'inventory' | 'reports' | 'branches') => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNotifications,
}) => {
  const {
    currentUser,
    currentRole,
    switchRole,
    branches,
    activeBranchId,
    setActiveBranchId,
    stockAlerts,
    resetData,
  } = useApp();

  const [timeStr, setTimeStr] = useState<string>('');
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadAlertsCount = stockAlerts.filter(a => !a.isRead).length;

  const currentBranch = branches.find(b => b.id === activeBranchId);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/25 ring-1 ring-amber-300/30">
              <Coffee className="w-5 h-5 text-slate-950 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-white bg-clip-text text-transparent">
                  KopiKula
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest">
                  POS PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-amber-400" />
                {timeStr || 'Memuat waktu...'}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'pos'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Kasir (POS)
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard & Analitik
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Boxes className="w-4 h-4" />
              Inventaris & Resep
              {unreadAlertsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'reports'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Laporan & Excel/PDF
            </button>

            {currentRole === 'admin_pusat' && (
              <button
                onClick={() => setActiveTab('branches')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'branches'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Multi-Cabang
              </button>
            )}
          </nav>

          {/* Right Action Controls: Branch Switcher + Notification Bell + Role Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Branch Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowBranchDropdown(!showBranchDropdown);
                  setShowRoleDropdown(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 hover:bg-slate-750 hover:border-slate-600 transition"
                title="Pilih Cabang Aktif"
              >
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline max-w-[130px] truncate">
                  {currentBranch?.name.replace('KopiKula ', '')}
                </span>
                <span className="sm:hidden font-mono font-bold text-amber-400">
                  {currentBranch?.code}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showBranchDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Pilih Cabang Operasional
                  </div>
                  <div className="mt-1 space-y-1">
                    {branches.map(b => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setActiveBranchId(b.id);
                          setShowBranchDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                          activeBranchId === b.id
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{b.name}</p>
                          <p className="text-[10px] text-slate-400">{b.city} • Mgr: {b.managerName}</p>
                        </div>
                        {b.isHQ && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                            Pusat
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750 transition"
              title="Notifikasi Peringatan Stok"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-md animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Role & User Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRoleDropdown(!showRoleDropdown);
                  setShowBranchDropdown(false);
                }}
                className="flex items-center gap-2 p-1 pl-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold leading-tight text-white">{currentUser.name}</p>
                  <p className="text-[10px] font-medium text-amber-400">
                    {currentRole === 'admin_pusat' && 'Admin Pusat'}
                    {currentRole === 'manajer_toko' && 'Manajer Toko'}
                    {currentRole === 'kasir' && 'Kasir / Barista'}
                  </p>
                </div>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-md object-cover border border-slate-600"
                />
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400">Ganti Hak Akses Akun (RBAC):</p>
                  </div>
                  <div className="mt-2 space-y-1">
                    <button
                      onClick={() => {
                        switchRole('admin_pusat');
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center gap-2.5 transition ${
                        currentRole === 'admin_pusat'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="font-semibold text-white">Admin Pusat (Headquarters)</p>
                        <p className="text-[10px] text-slate-400">Akses penuh multi-cabang, HPP, keuangan & master data</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        switchRole('manajer_toko');
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center gap-2.5 transition ${
                        currentRole === 'manajer_toko'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <Store className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="font-semibold text-white">Manajer Toko (Store Manager)</p>
                        <p className="text-[10px] text-slate-400">Pengelolaan stok cabang, restok & audit opname</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        switchRole('kasir');
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center gap-2.5 transition ${
                        currentRole === 'kasir'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="font-semibold text-white">Kasir / Barista</p>
                        <p className="text-[10px] text-slate-400">Fokus transaksi POS cepat & pencetakan struk</p>
                      </div>
                    </button>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (confirm('Reset ulang data simulasi kasir ke awal?')) {
                          resetData();
                          setShowRoleDropdown(false);
                        }
                      }}
                      className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset Data Demo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center overflow-x-auto py-2 gap-1 border-t border-slate-800/80 no-scrollbar">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === 'pos' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Kasir (POS)
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === 'inventory' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Inventaris
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === 'reports' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Laporan
          </button>
          {currentRole === 'admin_pusat' && (
            <button
              onClick={() => setActiveTab('branches')}
              className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium ${
                activeTab === 'branches' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Multi-Cabang
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
