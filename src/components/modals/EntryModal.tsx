import React, { useState, useEffect } from 'react';
import { Entry, EntryType } from '../../types';
import { X, ArrowDownLeft, ArrowUpRight, Clock, Tag } from 'lucide-react';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (type: EntryType, amount: number, details: string, dateISO: string) => Promise<void>;
  type: EntryType;
  editingEntry?: Entry | null;
  recentDetailsSuggestions: string[];
}

export const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  type,
  editingEntry,
  recentDetailsSuggestions,
}) => {
  const [amountStr, setAmountStr] = useState('');
  const [details, setDetails] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingEntry) {
        setAmountStr(String(editingEntry.amount));
        setDetails(editingEntry.details || '');
        // format for datetime-local input: YYYY-MM-DDTHH:mm
        const d = new Date(editingEntry.date);
        const pad = (n: number) => String(n).padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
          d.getHours()
        )}:${pad(d.getMinutes())}`;
        setDateStr(formatted);
      } else {
        setAmountStr('');
        setDetails('');
        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
          d.getHours()
        )}:${pad(d.getMinutes())}`;
        setDateStr(formatted);
      }
      setError(null);
    }
  }, [isOpen, editingEntry]);

  if (!isOpen) return null;

  const isIn = type === 'in';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const isoDate = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();
      await onSave(type, amount, details, isoDate);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChipClick = (suggestion: string) => {
    setDetails(suggestion);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isIn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {isIn ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
            </div>
            <h3 className="font-bold text-sm text-slate-100">
              {editingEntry ? 'Edit Transaction' : isIn ? '+ Cash IN (Income)' : '- Cash OUT (Expense)'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-800/60 text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Amount input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Amount (Rs) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                Rs
              </span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                autoFocus
                placeholder="0"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white font-bold text-lg outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Name / Details input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>Name / Description (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Grocery, Client Payment, Fuel, Salary..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white text-sm outline-hidden transition-all"
            />

            {/* Quick Suggestions Chips */}
            {recentDetailsSuggestions.length > 0 && (
              <div className="mt-2">
                <span className="text-[10px] text-slate-500 block mb-1">Recent suggestions:</span>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {recentDetailsSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChipClick(suggestion)}
                      className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-blue-600 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white text-[11px] transition-colors cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Date and time input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Date & Time</span>
            </label>
            <input
              type="datetime-local"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-300 text-xs outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${
                isIn
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40'
              }`}
            >
              {submitting ? 'Saving...' : editingEntry ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
