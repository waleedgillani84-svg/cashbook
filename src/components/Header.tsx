import React from 'react';
import { Menu, Search, Filter } from 'lucide-react';
import { Account } from '../types';

interface HeaderProps {
  onOpenSideMenu: () => void;
  onOpenAccountModal: () => void;
  onOpenFilterModal: () => void;
  activeAccount?: Account;
  syncStatus: 'synced' | 'saving' | 'offline';
  hasActiveFilters: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSideMenu,
  onOpenAccountModal,
  onOpenFilterModal,
  activeAccount,
  syncStatus,
  hasActiveFilters,
}) => {
  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-slate-700/60 bg-slate-900/90 backdrop-blur-md px-3 py-2.5">
      <div className="flex items-center gap-2 max-w-lg mx-auto">
        {/* Menu toggle button */}
        <button
          onClick={onOpenSideMenu}
          className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 flex items-center justify-center transition-all cursor-pointer border border-slate-700/50"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Account Selector */}
        <button
          onClick={onOpenAccountModal}
          className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-all active:scale-[0.98] cursor-pointer min-w-0"
          title="Switch Account"
        >
          <span className="text-lg shrink-0">{activeAccount?.icon || '💵'}</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-100 truncate">
              {activeAccount?.name || 'Select Account'}
            </div>
          </div>
          {/* Cloud Sync Status Badge */}
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 transition-colors ${
              syncStatus === 'synced'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                : syncStatus === 'saving'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                syncStatus === 'synced'
                  ? 'bg-emerald-400'
                  : syncStatus === 'saving'
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
            />
            {syncStatus === 'synced' ? 'Synced' : syncStatus === 'saving' ? 'Saving' : 'Offline'}
          </span>
        </button>

        {/* Search & Filter button */}
        <button
          onClick={onOpenFilterModal}
          className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer border ${
            hasActiveFilters
              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
              : 'bg-slate-800 text-slate-200 border-slate-700/50 hover:bg-slate-700'
          }`}
          title="Search & Filters"
        >
          <Search className="w-4 h-4" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-900" />
          )}
        </button>
      </div>
    </header>
  );
};
