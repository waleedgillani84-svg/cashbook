import React from 'react';
import { UserProfile, AppTheme } from '../../types';
import { X, Palette, Cloud, LogOut, CheckCircle2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  onLogout: () => void;
}

const THEMES: { id: AppTheme; name: string; bg: string; border: string }[] = [
  { id: 'dark', name: 'Dark Slate', bg: '#0f172a', border: '#334155' },
  { id: 'light', name: 'Light Clean', bg: '#f8fafc', border: '#cbd5e1' },
  { id: 'blue', name: 'Ocean Blue', bg: '#0c1e3e', border: '#1e40af' },
  { id: 'green', name: 'Emerald Forest', bg: '#052e16', border: '#15803d' },
  { id: 'purple', name: 'Royal Indigo', bg: '#1e1b4b', border: '#4f46e5' },
  { id: 'orange', name: 'Amber Sunset', bg: '#431407', border: '#c2410c' },
  { id: 'pink', name: 'Ruby Blossom', bg: '#4a0428', border: '#be185d' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  currentTheme,
  onSelectTheme,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="text-base">⚙️</span>
            <h3 className="font-bold text-sm text-slate-100">Settings & Appearance</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Color Theme Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-blue-400" />
              <span>Color Theme</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEMES.map((t) => {
                const isActive = currentTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSelectTheme(t.id)}
                    style={{ backgroundColor: t.bg, borderColor: t.border }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isActive ? 'ring-2 ring-blue-400 shadow-md scale-[1.02]' : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100">{t.name}</span>
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cloud Database Info */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>Firebase Cloud Database</span>
            </label>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Account:</span>
                <span className="font-semibold text-slate-200">{userProfile?.displayName || 'User'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-slate-200 truncate max-w-[180px]">{userProfile?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">User ID:</span>
                <span className="font-mono text-[10px] text-slate-400 truncate max-w-[150px]">{userProfile?.uid}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-700/50">
                <span className="text-slate-400">Cloud Sync:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active (Real-time Firestore)
                </span>
              </div>
            </div>
          </div>

          {/* Logout Action */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out from Cash Book Pro</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
