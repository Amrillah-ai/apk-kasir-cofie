import React, { useState } from 'react';
import { formatRupiah, formatNumber } from '../../utils/formatters';

export interface ChartDataPoint {
  label: string;
  revenue: number;
  grossProfit: number;
  transactions: number;
  dateKey?: string;
}

interface InteractiveSalesChartProps {
  data: ChartDataPoint[];
  title: string;
  period: 'weekly' | 'monthly' | 'hourly';
  setPeriod: (p: 'weekly' | 'monthly' | 'hourly') => void;
}

export const InteractiveSalesChart: React.FC<InteractiveSalesChartProps> = ({
  data,
  title,
  period,
  setPeriod,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        Data grafik belum tersedia untuk rentang waktu ini.
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue), 100000);
  const chartHeight = 240;
  const chartWidth = 700;
  const paddingX = 40;
  const paddingY = 30;
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingY * 2;

  // Build SVG Points for Area & Line
  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * plotWidth;
    const y = chartHeight - paddingY - (d.revenue / maxRevenue) * plotHeight;
    const profitY = chartHeight - paddingY - (d.grossProfit / maxRevenue) * plotHeight;
    return { x, y, profitY, ...d };
  });

  const linePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  const profitLinePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.profitY}` : `${acc} L ${p.x} ${p.profitY}`;
  }, '');

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
            <span>{title}</span>
            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              Interaktif
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Arahkan kursor atau sentuh titik grafik untuk melihat rincian omset & laba kotor harian.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700/80 text-xs">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1 rounded-lg font-bold transition ${
              period === 'weekly'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1 rounded-lg font-bold transition ${
              period === 'monthly'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            30 Hari
          </button>
          <button
            onClick={() => setPeriod('hourly')}
            className={`px-3 py-1 rounded-lg font-bold transition ${
              period === 'hourly'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Jam Sibuk
          </button>
        </div>
      </div>

      {/* Floating Active Inspector Banner */}
      {activePoint && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-850 rounded-xl border border-slate-750">
          <div>
            <span className="text-[11px] text-slate-400">Waktu:</span>
            <p className="font-bold text-xs sm:text-sm text-white">{activePoint.label}</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Omset Penjualan:</span>
            <p className="font-bold text-xs sm:text-sm text-amber-400 font-mono">
              {formatRupiah(activePoint.revenue)}
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Laba Kotor (Gross Profit):</span>
            <p className="font-bold text-xs sm:text-sm text-emerald-400 font-mono">
              {formatRupiah(activePoint.grossProfit)}
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Volume:</span>
            <p className="font-bold text-xs sm:text-sm text-slate-200">
              {activePoint.transactions} Transaksi
            </p>
          </div>
        </div>
      )}

      {/* SVG Chart Area */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = chartHeight - paddingY - ratio * plotHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="4 4"
                  strokeWidth="0.8"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {formatNumber(Math.round(ratio * maxRevenue / 1000))}k
                </text>
              </g>
            );
          })}

          {/* Area under revenue */}
          <path d={areaPath} fill="url(#revenueGradient)" />

          {/* Profit Line (Emerald) */}
          <path
            d={profitLinePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="3 3"
          />

          {/* Revenue Main Line (Amber) */}
          <path
            d={linePath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive points */}
          {points.map((p, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <g key={i}>
                {/* Vertical hover indicator */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={paddingY}
                    x2={p.x}
                    y2={chartHeight - paddingY}
                    stroke="#f59e0b"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Point dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 3.5}
                  fill={isHovered ? '#f59e0b' : '#0f172a'}
                  stroke="#f59e0b"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-150 cursor-pointer"
                />

                {/* Profit Point dot */}
                <circle
                  cx={p.x}
                  cy={p.profitY}
                  r={isHovered ? 4.5 : 2.5}
                  fill="#10b981"
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  className="transition-all duration-150 cursor-pointer"
                />

                {/* X axis Label */}
                {(data.length <= 12 || i % Math.ceil(data.length / 8) === 0 || i === data.length - 1) && (
                  <text
                    x={p.x}
                    y={chartHeight - paddingY + 16}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="500"
                  >
                    {p.label}
                  </text>
                )}

                {/* Transparent hover capture zone */}
                <rect
                  x={p.x - plotWidth / (points.length * 2)}
                  y={paddingY}
                  width={plotWidth / points.length}
                  height={plotHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend & Summary Info */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-white font-medium">Omset Penjualan (Revenue)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-emerald-400 font-medium">Laba Kotor (Gross Profit)</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-500">
          Kalkulasi real-time HPP bahan baku otomatis
        </span>
      </div>
    </div>
  );
};
