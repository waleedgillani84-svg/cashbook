import React, { useState, useEffect } from 'react';
import { FilterState } from '../../types';
import { X, Search, RotateCcw, Calendar, Layers } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  searchQuery: string;
  onApplyFilters: (newFilters: FilterState, newSearchQuery: string) => void;
  onResetFilters: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  searchQuery,
  onApplyFilters,
  onResetFilters,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    if (isOpen) {
      setLocalSearch(searchQuery);
      setLocalFilters(filters);
    }
  }, [isOpen, searchQuery, filters]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters(localFilters, localSearch);
    onClose();
  };

  const handleReset = () => {
    setLocalSearch('');
    setLocalFilters({
      scope: 'current',
      type: 'all',
      dateFrom: '',
      dateTo: '',
    });
    onResetFilters();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="text-base">🔍</span>
            <h3 className="font-bold text-sm text-slate-100">Search & Filters</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Search Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Search by Name or Amount
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                autoFocus
                placeholder="Search description or Rs amount..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white text-xs outline-hidden"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Account Scope */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              <span>Account Scope</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLocalFilters({ ...localFilters, scope: 'current' })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  localFilters.scope === 'current'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Current Account
              </button>
              <button
                type="button"
                onClick={() => setLocalFilters({ ...localFilters, scope: 'all' })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  localFilters.scope === 'all'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                All Accounts
              </button>
            </div>
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Transaction Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLocalFilters({ ...localFilters, type: 'all' })}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  localFilters.type === 'all'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                All Types
              </button>
              <button
                type="button"
                onClick={() => setLocalFilters({ ...localFilters, type: 'in' })}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  localFilters.type === 'in'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                + Cash In
              </button>
              <button
                type="button"
                onClick={() => setLocalFilters({ ...localFilters, type: 'out' })}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  localFilters.type === 'out'
                    ? 'bg-rose-600 text-white border-rose-500'
                    : 'bg-slate-800 text-rose-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                - Cash Out
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Date Range</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">From Date</span>
                <input
                  type="date"
                  value={localFilters.dateFrom}
                  onChange={(e) => setLocalFilters({ ...localFilters, dateFrom: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs outline-hidden"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">To Date</span>
                <input
                  type="date"
                  value={localFilters.dateTo}
                  onChange={(e) => setLocalFilters({ ...localFilters, dateTo: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-950/40 cursor-pointer transition-all active:scale-95"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
