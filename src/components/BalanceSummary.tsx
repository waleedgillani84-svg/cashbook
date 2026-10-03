import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Scale } from 'lucide-react';

interface BalanceSummaryProps {
  totalIn: number;
  totalOut: number;
  netBalance: number;
  scopeLabel: string;
}

export function formatCurrency(amount: number): string {
  const abs = Math.abs(amount);
  return 'Rs ' + abs.toLocaleString('en-PK', { maximumFractionDigits: 0 });
}

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({
  totalIn,
  totalOut,
  netBalance,
  scopeLabel,
}) => {
  const isNetPositive = netBalance > 0;
  const isNetNegative = netBalance < 0;

  return (
    <div className="shrink-0 px-3 py-2.5 max-w-lg mx-auto w-full">
      <div className="grid grid-cols-3 gap-2">
        {/* Net Balance */}
        <div className="rounded-xl bg-slate-800/80 border border-slate-700/60 p-2.5 text-center flex flex-col justify-between shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-center gap-1">
            <Scale className="w-3 h-3 text-blue-400" />
            <span>Net Balance</span>
          </div>
          <div
            className={`text-sm sm:text-base font-extrabold truncate mt-1 ${
              isNetPositive
                ? 'text-emerald-400'
                : isNetNegative
                ? 'text-rose-400'
                : 'text-slate-200'
            }`}
          >
            {isNetPositive ? '+' : isNetNegative ? '-' : ''} {formatCurrency(netBalance)}
          </div>
          <div className="text-[9px] text-slate-500 truncate mt-0.5">{scopeLabel}</div>
        </div>

        {/* Total In */}
        <div className="rounded-xl bg-emerald-950/20 border border-emerald-800/30 p-2.5 text-center flex flex-col justify-between shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400/80 flex items-center justify-center gap-1">
            <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
            <span>Cash In (+)</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-emerald-400 truncate mt-1">
            {formatCurrency(totalIn)}
          </div>
          <div className="text-[9px] text-emerald-500/70 truncate mt-0.5">Total Income</div>
        </div>

        {/* Total Out */}
        <div className="rounded-xl bg-rose-950/20 border border-rose-800/30 p-2.5 text-center flex flex-col justify-between shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-wider text-rose-400/80 flex items-center justify-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-rose-400" />
            <span>Cash Out (-)</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-rose-400 truncate mt-1">
            {formatCurrency(totalOut)}
          </div>
          <div className="text-[9px] text-rose-500/70 truncate mt-0.5">Total Expense</div>
        </div>
      </div>
    </div>
  );
};
