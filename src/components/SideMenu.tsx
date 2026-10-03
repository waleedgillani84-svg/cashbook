import React from 'react';
import { UserProfile } from '../types';
import {
  TrendingUp,
  Settings,
  Trash2,
  Wallet,
  FileText,
  LogOut,
  X,
  CloudCheck,
  User,
} from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onOpenAnalytics: () => void;
  onOpenSettings: () => void;
  onOpenTrash: () => void;
  onOpenAccounts: () => void;
  onOpenStatementExport: () => void;
  onLogout: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  userProfile,
  onOpenAnalytics,
  onOpenSettings,
  onOpenTrash,
  onOpenAccounts,
  onOpenStatementExport,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Side Drawer */}
      <div className="fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-lg shadow-sm">
                💳
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Cash Book Pro</h3>
                <p className="text-[10px] text-slate-400">Multi-Account Ledger</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-3.5 mx-3 mt-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center gap-3">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt="Avatar"
                className="w-10 h-10 rounded-full border border-blue-500/40 object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                <User className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-100 truncate">
                {userProfile?.displayName || 'User'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {userProfile?.email || 'Logged In'}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-3 space-y-1">
            <button
              onClick={() => {
                onClose();
                onOpenAnalytics();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/90 text-left text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Financial Analytics</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenAccounts();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/90 text-left text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Manage Accounts</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenStatementExport();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/90 text-left text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Export Statement</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenTrash();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/90 text-left text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4 text-amber-400" />
              <span>Recycle Bin</span>
            </button>

            <div className="my-2 border-t border-slate-800" />

            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/90 text-left text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings & Appearance</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-950/40 text-left text-rose-400 text-xs font-semibold cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 text-center">
          <div className="text-[10px] text-slate-400 leading-relaxed font-medium">
            Cash Book Pro<br />
            App Creator: <span className="text-slate-200">Junaid Gillani</span><br />
            📞 <span className="font-mono text-slate-300">03176407904</span>
          </div>
        </div>
      </div>
    </>
  );
};
