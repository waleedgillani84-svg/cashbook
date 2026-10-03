import React from 'react';
import { Entry, Account } from '../../types';
import { X, Edit2, ArrowRightLeft, Trash2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../BalanceSummary';

interface EntryActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: Entry | null;
  accounts: Account[];
  onEdit: (entry: Entry) => void;
  onMove: (entry: Entry, targetAccountId: string) => void;
  onDelete: (entry: Entry) => void;
}

export const EntryActionModal: React.FC<EntryActionModalProps> = ({
  isOpen,
  onClose,
  entry,
  accounts,
  onEdit,
  onMove,
  onDelete,
}) => {
  const [showMovePicker, setShowMovePicker] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setShowMovePicker(false);
    }
  }, [isOpen]);

  if (!isOpen || !entry) return null;

  const isIn = entry.type === 'in';
  const otherAccounts = accounts.filter((a) => a.id !== entry.accountId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/40">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
            {showMovePicker ? 'Move to Account' : 'Transaction Actions'}
          </h4>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Selected entry preview */}
        <div className="px-4 py-3 bg-slate-800/20 border-b border-slate-800/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                isIn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {isIn ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
            </div>
            <span
              className={`font-black text-sm ${
                isIn ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isIn ? '+' : '-'} {formatCurrency(entry.amount)}
            </span>
          </div>
          <span className="text-xs text-slate-300 font-medium truncate max-w-[120px]">
            {entry.details || 'No details'}
          </span>
        </div>

        {/* Action list or Move Account Selector */}
        {!showMovePicker ? (
          <div className="p-2 space-y-1">
            <button
              onClick={() => {
                onClose();
                onEdit(entry);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/90 text-left text-slate-200 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Edit2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-100">Edit Entry</div>
                <div className="text-[10px] text-slate-500">Change amount, description or date</div>
              </div>
            </button>

            <button
              onClick={() => setShowMovePicker(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/90 text-left text-slate-200 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-100">Move to Other Account</div>
                <div className="text-[10px] text-slate-500">Transfer entry to another ledger</div>
              </div>
            </button>

            <button
              onClick={() => {
                onClose();
                onDelete(entry);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-950/30 text-left text-rose-400 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-rose-300">Delete Entry</div>
                <div className="text-[10px] text-rose-500/80">Move to Recycle Bin (can be restored)</div>
              </div>
            </button>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            <p className="text-[11px] text-slate-400">Choose destination account:</p>
            {otherAccounts.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-500">
                No other accounts available. Create another account first.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {otherAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      onMove(entry, acc.id);
                      onClose();
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-left cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <span className="text-base">{acc.icon}</span>
                    <span className="text-xs font-semibold text-slate-200 flex-1 truncate">
                      {acc.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowMovePicker(false)}
              className="w-full mt-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
