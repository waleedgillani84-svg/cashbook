import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, testConnection, logOut } from './firebase';
import {
  UserProfile,
  Account,
  Entry,
  TrashItem,
  FilterState,
  EntryType,
  AppTheme,
} from './types';
import {
  getOrCreateUserProfile,
  updateUserProfile,
  subscribeAccounts,
  subscribeEntries,
  subscribeTrash,
  createAccount,
  updateAccount,
  deleteAccountToTrash,
  createEntry,
  updateEntry,
  deleteEntryToTrash,
  restoreTrashItem,
  permanentlyDeleteTrashItem,
  emptyTrash,
} from './services/firestoreService';

import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { BalanceSummary } from './components/BalanceSummary';
import { EntriesList } from './components/EntriesList';
import { SideMenu } from './components/SideMenu';
import { EntryModal } from './components/modals/EntryModal';
import { EntryActionModal } from './components/modals/EntryActionModal';
import { AccountModal } from './components/modals/AccountModal';
import { FilterModal } from './components/modals/FilterModal';
import { StatementExportModal } from './components/modals/StatementExportModal';
import { AnalyticsModal } from './components/modals/AnalyticsModal';
import { TrashModal } from './components/modals/TrashModal';
import { SettingsModal } from './components/modals/SettingsModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isCloudOnline, setIsCloudOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');

  // Ledger state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [trash, setTrash] = useState<TrashItem[]>([]);

  // Filter & Search state
  const [filters, setFilters] = useState<FilterState>({
    scope: 'current',
    type: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryModalType, setEntryModalType] = useState<EntryType>('in');
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedActionEntry, setSelectedActionEntry] = useState<Entry | null>(null);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isStatementExportModalOpen, setIsStatementExportModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Floating Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  // 1. Initial boot: Test connection & listen to Firebase Auth
  useEffect(() => {
    testConnection().then((online) => {
      setIsCloudOnline(online);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          setSyncStatus('saving');
          const profile = await getOrCreateUserProfile(
            user.uid,
            user.email || '',
            user.displayName || 'User',
            user.photoURL || undefined
          );
          setUserProfile(profile);
          if (profile.activeAccountId) {
            setActiveAccountId(profile.activeAccountId);
          }
          if (profile.theme) {
            applyTheme(profile.theme);
          }
          setSyncStatus('synced');
        } catch (err) {
          console.error('Failed to load user profile:', err);
          setSyncStatus('offline');
        }
      } else {
        setUserProfile(null);
        setAccounts([]);
        setEntries([]);
        setTrash([]);
        setActiveAccountId(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Real-time subscriptions for accounts, entries, trash
  useEffect(() => {
    if (!currentUser) return;

    const uid = currentUser.uid;

    const unsubAccounts = subscribeAccounts(
      uid,
      (accs) => {
        setAccounts(accs);
        if (accs.length > 0) {
          setActiveAccountId((prev) => {
            if (prev && accs.some((a) => a.id === prev)) return prev;
            return accs[0].id;
          });
        }
        setSyncStatus('synced');
      },
      () => setSyncStatus('offline')
    );

    const unsubEntries = subscribeEntries(
      uid,
      (ents) => {
        setEntries(ents);
        setSyncStatus('synced');
      },
      () => setSyncStatus('offline')
    );

    const unsubTrash = subscribeTrash(
      uid,
      (items) => {
        setTrash(items);
        setSyncStatus('synced');
      },
      () => setSyncStatus('offline')
    );

    return () => {
      unsubAccounts();
      unsubEntries();
      unsubTrash();
    };
  }, [currentUser]);

  // Apply Theme helper
  const applyTheme = (theme: AppTheme) => {
    document.body.className = '';
    if (theme && theme !== 'dark') {
      document.body.classList.add(`theme-${theme}`);
    }
  };

  const handleSelectTheme = async (theme: AppTheme) => {
    applyTheme(theme);
    if (userProfile && currentUser) {
      setUserProfile({ ...userProfile, theme });
      await updateUserProfile(currentUser.uid, { theme });
      showToast(`Theme switched to ${theme}`);
    }
  };

  const handleSelectAccount = async (accId: string) => {
    setActiveAccountId(accId);
    if (currentUser && userProfile) {
      setUserProfile({ ...userProfile, activeAccountId: accId });
      await updateUserProfile(currentUser.uid, { activeAccountId: accId });
      showToast('Switched account');
    }
  };

  // Active account
  const activeAccount = useMemo(() => {
    return accounts.find((a) => a.id === activeAccountId) || accounts[0];
  }, [accounts, activeAccountId]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    let result = entries;

    // Scope filter
    if (filters.scope === 'current' && activeAccount) {
      result = result.filter((e) => e.accountId === activeAccount.id);
    }

    // Type filter
    if (filters.type !== 'all') {
      result = result.filter((e) => e.type === filters.type);
    }

    // Date range
    if (filters.dateFrom) {
      result = result.filter((e) => e.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      result = result.filter((e) => e.date <= filters.dateTo + 'T23:59:59');
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          (e.details && e.details.toLowerCase().includes(q)) ||
          e.amount.toString().includes(q)
      );
    }

    return result;
  }, [entries, filters, activeAccount, searchQuery]);

  // Balance calculation for current scope
  const { totalIn, totalOut, netBalance } = useMemo(() => {
    let inSum = 0;
    let outSum = 0;
    for (const e of filteredEntries) {
      if (e.type === 'in') inSum += e.amount;
      else outSum += e.amount;
    }
    return {
      totalIn: inSum,
      totalOut: outSum,
      netBalance: inSum - outSum,
    };
  }, [filteredEntries]);

  // Recent details suggestions for quick chip autocompletion
  const recentDetailsSuggestions = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();
    for (const e of entries) {
      if (e.details && e.details.trim()) {
        const d = e.details.trim();
        const lower = d.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          list.push(d);
          if (list.length >= 8) break;
        }
      }
    }
    return list;
  }, [entries]);

  // Has active non-default filters
  const hasActiveFilters = useMemo(() => {
    return (
      Boolean(searchQuery.trim()) ||
      filters.scope !== 'current' ||
      filters.type !== 'all' ||
      Boolean(filters.dateFrom) ||
      Boolean(filters.dateTo)
    );
  }, [searchQuery, filters]);

  // Handlers for Entry CRUD
  const handleOpenEntryModal = (type: EntryType, entryToEdit?: Entry) => {
    setEntryModalType(type);
    setEditingEntry(entryToEdit || null);
    setIsEntryModalOpen(true);
  };

  const handleSaveEntry = async (
    type: EntryType,
    amount: number,
    details: string,
    dateISO: string
  ) => {
    if (!currentUser || !activeAccount) return;
    setSyncStatus('saving');
    try {
      if (editingEntry) {
        await updateEntry(currentUser.uid, editingEntry.id, {
          type,
          amount,
          details,
          date: dateISO,
        });
        showToast('Transaction updated');
      } else {
        await createEntry(
          currentUser.uid,
          activeAccount.id,
          type,
          amount,
          details,
          dateISO
        );
        showToast(type === 'in' ? 'Cash In recorded (+)' : 'Cash Out recorded (-)');
      }
      setSyncStatus('synced');
    } catch (err) {
      console.error(err);
      setSyncStatus('offline');
      throw err;
    }
  };

  const handleOpenActionModal = (entry: Entry) => {
    setSelectedActionEntry(entry);
    setIsActionModalOpen(true);
  };

  const handleMoveEntry = async (entry: Entry, targetAccountId: string) => {
    if (!currentUser) return;
    setSyncStatus('saving');
    try {
      await updateEntry(currentUser.uid, entry.id, { accountId: targetAccountId });
      showToast('Transaction moved successfully');
      setSyncStatus('synced');
    } catch (err) {
      console.error(err);
      setSyncStatus('offline');
    }
  };

  const handleDeleteEntry = async (entry: Entry) => {
    if (!currentUser) return;
    setSyncStatus('saving');
    try {
      await deleteEntryToTrash(currentUser.uid, entry);
      showToast('Moved to Recycle Bin');
      setSyncStatus('synced');
    } catch (err) {
      console.error(err);
      setSyncStatus('offline');
    }
  };

  // Handlers for Account CRUD
  const handleCreateAccount = async (name: string, icon: string) => {
    if (!currentUser) return;
    setSyncStatus('saving');
    try {
      const newAcc = await createAccount(currentUser.uid, name, icon);
      await handleSelectAccount(newAcc.id);
      showToast(`Account "${name}" created`);
      setSyncStatus('synced');
    } catch (err) {
      console.error(err);
      setSyncStatus('offline');
      throw err;
    }
  };

  const handleEditAccount = async (accountId: string, name: string, icon: string) => {
    if (!currentUser) return;
    setSyncStatus('saving');
    try {
      await updateAccount(currentUser.uid, accountId, name, icon);
      showToast('Account updated');
      setSyncStatus('synced');
    } catch (err) {
      console.error(err);
      setSyncStatus('offline');
      throw err;
    }
  };

  const handleDeleteAccount = async (acc: Account) => {
    if (!currentUser) return;
    if (accounts.length <= 1) {
      showToast('Cannot delete your only account');
      return;
    }
    setSyncStatus('saving');
    try {
      const accEntries = entries.filter((e) => e.accountId === acc.id);
      await deleteAccountToTrash(currentUser.uid, acc, accEntries);
      const remaining = accounts.filter((a) => a.id !== acc.id);
      if (remaining.length > 0) {
        await handleSelectAccount(remaining[0].id);
      }
      showToast(`Account "${acc.name}" moved to Recycle Bin`);
      setSyncStatus('synced');
    } catch (err) {
      console.error(err);
      setSyncStatus('offline');
      throw err;
    }
  };

  // Trash handlers
  const handleRestoreTrash = async (item: TrashItem) => {
    if (!currentUser) return;
    setSyncStatus('saving');
    try {
      await restoreTrashItem(currentUser.uid, item);
      showToast('Item restored from Recycle Bin');
      setSyncStatus('synced');
    } catch (err) {
      console.error(err);
      setSyncStatus('offline');
    }
  };

  const handlePermanentDeleteTrash = async (trashId: string) => {
    if (!currentUser) return;
    setSyncStatus('saving');
    try {
      await permanentlyDeleteTrashItem(currentUser.uid, trashId);
      showToast('Item permanently deleted');
      setSyncStatus('synced');
    } catch (err) {
      console.error(err);
      setSyncStatus('offline');
    }
  };

  const handleEmptyTrash = async () => {
    if (!currentUser) return;
    setSyncStatus('saving');
    try {
      await emptyTrash(currentUser.uid, trash);
      showToast('Recycle Bin emptied');
      setSyncStatus('synced');
    } catch (err) {
      console.error(err);
      setSyncStatus('offline');
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      showToast('Signed out');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-400 font-medium">Connecting to Cash Book Pro...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--app-bg,#0f172a)] text-[var(--app-text,#f1f5f9)] selection:bg-blue-500 selection:text-white">
      {/* If user is not authenticated, show modern Google Login screen */}
      {!currentUser && (
        <LoginScreen
          onLoginSuccess={() => showToast('Signed in successfully!')}
          isOnline={isCloudOnline}
        />
      )}

      {/* Main App Container */}
      <Header
        onOpenSideMenu={() => setIsSideMenuOpen(true)}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        onOpenFilterModal={() => setIsFilterModalOpen(true)}
        activeAccount={activeAccount}
        syncStatus={syncStatus}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Balance Summary Header Cards */}
      <BalanceSummary
        totalIn={totalIn}
        totalOut={totalOut}
        netBalance={netBalance}
        scopeLabel={filters.scope === 'all' ? 'All Accounts' : activeAccount?.name || 'Main Cash'}
      />

      {/* Entries List and Bottom Actions */}
      <EntriesList
        entries={filteredEntries}
        accounts={accounts}
        onOpenActionModal={handleOpenActionModal}
        onOpenEntryModal={handleOpenEntryModal}
        scopeLabel={filters.scope === 'all' ? 'All Accounts' : activeAccount?.name || 'Current'}
      />

      {/* Modals */}
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        userProfile={userProfile}
        onOpenAnalytics={() => setIsAnalyticsModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenTrash={() => setIsTrashModalOpen(true)}
        onOpenAccounts={() => setIsAccountModalOpen(true)}
        onOpenStatementExport={() => setIsStatementExportModalOpen(true)}
        onLogout={handleLogout}
      />

      <EntryModal
        isOpen={isEntryModalOpen}
        onClose={() => {
          setIsEntryModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEntry}
        type={entryModalType}
        editingEntry={editingEntry}
        recentDetailsSuggestions={recentDetailsSuggestions}
      />

      <EntryActionModal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false);
          setSelectedActionEntry(null);
        }}
        entry={selectedActionEntry}
        accounts={accounts}
        onEdit={(entry) => handleOpenEntryModal(entry.type, entry)}
        onMove={handleMoveEntry}
        onDelete={handleDeleteEntry}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accounts={accounts}
        activeAccountId={activeAccountId || undefined}
        entries={entries}
        onSelectAccount={handleSelectAccount}
        onCreateAccount={handleCreateAccount}
        onEditAccount={handleEditAccount}
        onDeleteAccount={handleDeleteAccount}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        searchQuery={searchQuery}
        onApplyFilters={(newFilters, newSearch) => {
          setFilters(newFilters);
          setSearchQuery(newSearch);
          showToast('Filters applied');
        }}
        onResetFilters={() => {
          setFilters({
            scope: 'current',
            type: 'all',
            dateFrom: '',
            dateTo: '',
          });
          setSearchQuery('');
          showToast('Filters cleared');
        }}
      />

      <StatementExportModal
        isOpen={isStatementExportModalOpen}
        onClose={() => setIsStatementExportModalOpen(false)}
        entries={filteredEntries}
        activeAccount={activeAccount}
        userName={userProfile?.displayName}
      />

      <AnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        entries={filteredEntries}
        accountLabel={filters.scope === 'all' ? 'All Accounts' : activeAccount?.name || 'Current'}
      />

      <TrashModal
        isOpen={isTrashModalOpen}
        onClose={() => setIsTrashModalOpen(false)}
        trashItems={trash}
        onRestore={handleRestoreTrash}
        onPermanentDelete={handlePermanentDeleteTrash}
        onEmptyTrash={handleEmptyTrash}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        userProfile={userProfile}
        currentTheme={userProfile?.theme || 'dark'}
        onSelectTheme={handleSelectTheme}
        onLogout={handleLogout}
      />

      {/* Global floating toast notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-800/95 text-slate-100 px-4 py-2 rounded-full text-xs font-semibold shadow-xl border border-slate-700/80 backdrop-blur-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
