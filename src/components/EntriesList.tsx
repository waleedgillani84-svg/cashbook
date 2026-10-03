import React from 'react';
import { Entry, Account } from '../types';
import { MoreVertical, Inbox, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from './BalanceSummary';

interface EntriesListProps {
  entries: Entry[];
  accounts: Account[];
  onOpenActionModal: (entry: Entry) => void;
  onOpenEntryModal: (type: 'in' | 'out', entryToEdit?: Entry) => void;
  scopeLabel: string;
}

export const EntriesList: React.FC<EntriesListProps> = ({
  entries,
  accounts,
  onOpenActionModal,
  onOpenEntryModal,
  scopeLabel,
}) => {
  const getAccountName = (accId: string) => {
    const acc = accounts.find((a) => a.id === accId);
    return acc ? `${acc.icon} ${acc.name}` : '';
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return {
        dateStr: d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short' }),
        timeStr: d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
      };
    } catch {
      return { dateStr: '', timeStr: '' };
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 max-w-lg mx-auto w-full px-3 pb-20">
      {/* Statement header */}
      <div className="flex items-center justify-between py-1.5 px-1 shrink-0 text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-1.5">
          <span>📄 Statement</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300 border border-slate-700/50">
            {scopeLabel}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-normal">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Entries Scrollable Area */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
        {entries.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl text-slate-500 mb-3 shadow-inner">
              <Inbox className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No transactions found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Tap + CASH IN or - CASH OUT at the bottom to add your first transaction.
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onOpenEntryModal('in')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>+ Cash IN</span>
              </button>
              <button
                onClick={() => onOpenEntryModal('out')}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>- Cash OUT</span>
              </button>
            </div>
          </div>
        ) : (
          entries.map((entry) => {
            const { dateStr, timeStr } = formatDate(entry.date);
            const isIn = entry.type === 'in';
            const accName = getAccountName(entry.accountId);

            return (
              <div
                key={entry.id}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border transition-all active:scale-[0.99] select-none ${
                  isIn
                    ? 'border-emerald-900/30 hover:border-emerald-600/40 bg-gradient-to-r from-emerald-950/20 via-slate-800/80 to-slate-800/80'
                    : 'border-rose-900/30 hover:border-rose-600/40 bg-gradient-to-r from-rose-950/20 via-slate-800/80 to-slate-800/80'
                }`}
              >
                {/* Left color pill indicator */}
                <div
                  className={`w-1 h-8 rounded-full shrink-0 ${
                    isIn ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />

                {/* Amount and description click targets edit modal */}
                <div
                  className="flex-1 flex items-center justify-between min-w-0 cursor-pointer"
                  onClick={() => onOpenEntryModal(entry.type, entry)}
                >
                  {/* Amount with bold colored styling */}
                  <div className="shrink-0 text-left mr-2">
                    <span
                      className={`text-sm font-black tracking-tight ${
                        isIn
                          ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                          : 'text-rose-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                      }`}
                    >
                      {isIn ? '+' : '-'} {formatCurrency(entry.amount)}
                    </span>
                    {scopeLabel === 'All Accounts' && accName && (
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {accName}
                      </div>
                    )}
                  </div>

                  {/* Details & Name */}
                  <div className="flex-1 text-right min-w-0 pr-1">
                    <div
                      className={`text-xs font-semibold truncate ${
                        entry.details ? 'text-slate-100' : 'text-slate-500 italic'
                      }`}
                    >
                      {entry.details || 'No details'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono tracking-tight mt-0.5">
                      {dateStr} • {timeStr}
                    </div>
                  </div>
                </div>

                {/* Quick actions button (3 dots) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenActionModal(entry);
                  }}
                  className="w-7 h-7 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center shrink-0 transition-all cursor-pointer active:scale-90"
                  title="Entry Actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bottom Fixed Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 p-2.5">
        <div className="max-w-lg mx-auto flex gap-2.5">
          <button
            onClick={() => onOpenEntryModal('in')}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-sm font-bold shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ CASH IN</span>
          </button>
          <button
            onClick={() => onOpenEntryModal('out')}
            className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white text-sm font-bold shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>- CASH OUT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
