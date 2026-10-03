import React, { useState } from 'react';
import { Account, Entry } from '../../types';
import { X, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { formatCurrency } from '../BalanceSummary';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  activeAccountId?: string;
  entries: Entry[];
  onSelectAccount: (accountId: string) => void;
  onCreateAccount: (name: string, icon: string) => Promise<void>;
  onEditAccount: (accountId: string, name: string, icon: string) => Promise<void>;
  onDeleteAccount: (account: Account) => Promise<void>;
}

const AVAILABLE_ICONS = ['💵', '👤', '💼', '🏦', '💰', '🪙', '💳', '🛒', '🏷️', '🏠'];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  accounts,
  activeAccountId,
  entries,
  onSelectAccount,
  onCreateAccount,
  onEditAccount,
  onDeleteAccount,
}) => {
  const [newAccName, setNewAccName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('💵');
  const [submitting, setSubmitting] = useState(false);
  const [editingAccId, setEditingAccId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState<Account | null>(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const calculateAccBalance = (accId: string) => {
    const accEntries = entries.filter((e) => e.accountId === accId);
    let totalIn = 0;
    let totalOut = 0;
    for (const e of accEntries) {
      if (e.type === 'in') totalIn += e.amount;
      else totalOut += e.amount;
    }
    return totalIn - totalOut;
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) {
      setError('Please enter an account name');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreateAccount(newAccName.trim(), selectedIcon);
      setNewAccName('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (accountId: string, icon: string) => {
    if (!editName.trim()) return;
    try {
      await onEditAccount(accountId, editName.trim(), icon);
      setEditingAccId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update account');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmAccount) return;
    if (confirmInput.trim() !== deleteConfirmAccount.name) {
      setError(`Please type "${deleteConfirmAccount.name}" exactly to confirm.`);
      return;
    }
    try {
      await onDeleteAccount(deleteConfirmAccount);
      setDeleteConfirmAccount(null);
      setConfirmInput('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="text-lg">💳</span>
            <h3 className="font-bold text-sm text-slate-100">Manage Accounts</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-3 p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Delete confirmation dialog view */}
        {deleteConfirmAccount ? (
          <div className="p-4 space-y-3">
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-200 space-y-2">
              <p className="font-bold">⚠️ Delete Account: {deleteConfirmAccount.name}?</p>
              <p className="text-slate-400">
                This account and all its transactions will be moved to the Recycle Bin. To confirm, please type the exact account name below:
              </p>
              <input
                type="text"
                autoFocus
                placeholder={deleteConfirmAccount.name}
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-rose-700 text-white font-medium text-xs outline-hidden"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmAccount(null);
                  setConfirmInput('');
                  setError(null);
                }}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-rose-950/40"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Accounts List */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Your Ledgers ({accounts.length})
              </span>
              {accounts.map((acc) => {
                const bal = calculateAccBalance(acc.id);
                const isActive = acc.id === activeAccountId;
                const isEditing = editingAccId === acc.id;

                return (
                  <div
                    key={acc.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-blue-950/30 border-blue-600/50 shadow-sm'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2 mr-2">
                        <span className="text-lg">{acc.icon}</span>
                        <input
                          type="text"
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-2 py-1 rounded bg-slate-900 border border-blue-500 text-xs text-white"
                        />
                        <button
                          onClick={() => handleSaveEdit(acc.id, acc.icon)}
                          className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          onSelectAccount(acc.id);
                          onClose();
                        }}
                        className="flex-1 flex items-center gap-2.5 min-w-0 cursor-pointer"
                      >
                        <span className="text-xl shrink-0">{acc.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-200 truncate flex items-center gap-1.5">
                            <span>{acc.name}</span>
                            {isActive && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                                Active
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-[11px] font-semibold mt-0.5 ${
                              bal >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            Net: {bal >= 0 ? '+' : '-'} {formatCurrency(bal)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={() => {
                          setEditingAccId(acc.id);
                          setEditName(acc.name);
                        }}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Edit Name"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {accounts.length > 1 && (
                        <button
                          onClick={() => {
                            setDeleteConfirmAccount(acc);
                            setConfirmInput('');
                            setError(null);
                          }}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add New Account Section */}
            <form onSubmit={handleAddAccount} className="pt-2 border-t border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                + Create New Account
              </span>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Account Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bank Account, Personal, Shop, Wallet..."
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1.5">Choose Icon</label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer ${
                        selectedIcon === icon
                          ? 'bg-blue-600 ring-2 ring-blue-400 text-white scale-105'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !newAccName.trim()}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-950/40 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{submitting ? 'Creating...' : 'Add Account'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
