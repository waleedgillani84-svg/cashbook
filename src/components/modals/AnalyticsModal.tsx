import React from 'react';
import { Entry } from '../../types';
import { X, TrendingUp, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../BalanceSummary';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: Entry[];
  accountLabel: string;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  entries,
  accountLabel,
}) => {
  if (!isOpen) return null;

  let totalIn = 0;
  let totalOut = 0;
  for (const e of entries) {
    if (e.type === 'in') totalIn += e.amount;
    else totalOut += e.amount;
  }
  const net = totalIn - totalOut;

  // Build last 7 days metrics
  const last7Days: { dateStr: string; label: string; in: number; out: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-PK', { weekday: 'short' });
    last7Days.push({ dateStr, label, in: 0, out: 0 });
  }

  entries.forEach((e) => {
    const eDate = e.date.split('T')[0];
    const dayObj = last7Days.find((d) => d.dateStr === eDate);
    if (dayObj) {
      if (e.type === 'in') dayObj.in += e.amount;
      else dayObj.out += e.amount;
    }
  });

  const maxVal = Math.max(...last7Days.map((d) => Math.max(d.in, d.out)), 100);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm text-slate-100">Financial Analytics</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="text-[11px] text-slate-400">
            Analytics for: <b className="text-slate-200">{accountLabel}</b>
          </div>

          {/* Balance Cards Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-center">
              <span className="text-[10px] text-emerald-400 block font-bold uppercase">Total In</span>
              <span className="text-xs font-extrabold text-emerald-400 mt-1 block truncate">
                +{formatCurrency(totalIn)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-800/30 text-center">
              <span className="text-[10px] text-rose-400 block font-bold uppercase">Total Out</span>
              <span className="text-xs font-extrabold text-rose-400 mt-1 block truncate">
                -{formatCurrency(totalOut)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/60 text-center">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Net</span>
              <span
                className={`text-xs font-extrabold mt-1 block truncate ${
                  net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {net >= 0 ? '+' : '-'} {formatCurrency(net)}
              </span>
            </div>
          </div>

          {/* 7-Day Bar Chart */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300">Last 7 Days Activity</span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  In
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  Out
                </span>
              </div>
            </div>

            {/* Visual Bars Container */}
            <div className="flex items-end justify-between gap-1.5 h-36 pt-4 pb-2 border-b border-slate-700/60">
              {last7Days.map((d, idx) => {
                const inHeightPct = Math.round((d.in / maxVal) * 100);
                const outHeightPct = Math.round((d.out / maxVal) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      {/* Cash in bar */}
                      <div
                        style={{ height: `${Math.max(inHeightPct, d.in > 0 ? 8 : 0)}%` }}
                        className="w-2 rounded-t-sm bg-emerald-400 transition-all group-hover:brightness-125"
                        title={`In: Rs ${d.in.toLocaleString()}`}
                      />
                      {/* Cash out bar */}
                      <div
                        style={{ height: `${Math.max(outHeightPct, d.out > 0 ? 8 : 0)}%` }}
                        className="w-2 rounded-t-sm bg-rose-400 transition-all group-hover:brightness-125"
                        title={`Out: Rs ${d.out.toLocaleString()}`}
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1.5 font-medium">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
