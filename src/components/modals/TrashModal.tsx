import React from 'react';
import { TrashItem } from '../../types';
import { X, Trash2, Undo2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../BalanceSummary';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  trashItems: TrashItem[];
  onRestore: (item: TrashItem) => Promise<void>;
  onPermanentDelete: (trashId: string) => Promise<void>;
  onEmptyTrash: () => Promise<void>;
}

export const TrashModal: React.FC<TrashModalProps> = ({
  isOpen,
  onClose,
  trashItems,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
}) => {
  const [confirmEmpty, setConfirmEmpty] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-400" />
            <h3 className="font-bold text-sm text-slate-100">Recycle Bin ({trashItems.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {trashItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-2xl mx-auto mb-2 text-slate-400">
                🗑️
              </div>
              <p className="text-xs font-semibold text-slate-400">Recycle bin is empty</p>
              <p className="text-[10px] text-slate-500 mt-1">Deleted items will appear here and can be restored anytime.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {trashItems.map((item) => {
                const isAccount = item.itemType === 'account';
                const d = new Date(item.deletedAt);
                const dateStr = d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60"
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="text-xs font-bold text-slate-200 truncate flex items-center gap-1.5">
                        {isAccount ? (
                          <>
                            <span>{item.type || '💳'}</span>
                            <span>Account: {item.name}</span>
                          </>
                        ) : (
                          <>
                            <span className={item.type === 'in' ? 'text-emerald-400' : 'text-rose-400'}>
                              {item.type === 'in' ? '+' : '-'} {formatCurrency(item.amount || 0)}
                            </span>
                            <span className="text-slate-400 font-normal truncate">
                              • {item.details || 'No details'}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Deleted on {dateStr}</div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onRestore(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Restore item"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => onPermanentDelete(item.id)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete permanently"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {trashItems.length > 0 && (
            <div className="pt-2 border-t border-slate-800">
              {confirmEmpty ? (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200 space-y-2">
                  <p className="font-bold flex items-center gap-1 text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    Permanently empty recycle bin?
                  </p>
                  <p className="text-slate-400 text-[11px]">This action cannot be undone.</p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setConfirmEmpty(false)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        await onEmptyTrash();
                        setConfirmEmpty(false);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                    >
                      Yes, Empty Trash
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmEmpty(true)}
                  className="w-full py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-rose-300 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Empty Recycle Bin</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
