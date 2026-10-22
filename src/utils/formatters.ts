export const formatRupiah = (value: number): string => {
  if (isNaN(value)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  if (isNaN(value)) return '0';
  return new Intl.NumberFormat('id-ID').format(value);
};

export const formatDate = (dateStr: string | Date): string => {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

export const formatDateTime = (dateStr: string | Date): string => {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatTime = (dateStr: string | Date): string => {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d);
};

export const getStockHealth = (current: number, minThreshold: number): {
  status: 'critical' | 'warning' | 'healthy';
  label: string;
  badgeClass: string;
  percentage: number;
} => {
  if (minThreshold <= 0) {
    return {
      status: 'healthy',
      label: 'Aman',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      percentage: 100,
    };
  }

  const ratio = current / minThreshold;
  const percentage = Math.min(Math.round(ratio * 100), 200);

  if (current <= minThreshold * 0.5) {
    return {
      status: 'critical',
      label: 'Kritis (Segera Restok)',
      badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      percentage,
    };
  } else if (current <= minThreshold) {
    return {
      status: 'warning',
      label: 'Menipis',
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      percentage,
    };
  } else {
    return {
      status: 'healthy',
      label: 'Cukup',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      percentage,
    };
  }
};

export const generateReceiptNumber = (branchCode: string): string => {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${branchCode}-${y}${m}${d}-${rand}`;
};
