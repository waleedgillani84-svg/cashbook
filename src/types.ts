export type AppTheme = 'dark' | 'light' | 'blue' | 'green' | 'purple' | 'orange' | 'pink';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  theme?: AppTheme;
  activeAccountId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  icon: string;
  createdAt: string;
  updatedAt?: string;
}

export type EntryType = 'in' | 'out';

export interface Entry {
  id: string;
  userId: string;
  accountId: string;
  type: EntryType;
  amount: number;
  details?: string;
  date: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TrashItem {
  id: string;
  userId: string;
  originalId: string;
  itemType: 'entry' | 'account';
  name?: string;
  amount?: number;
  details?: string;
  type?: string;
  accountId?: string;
  date?: string;
  deletedAt: string;
  createdAt: string;
}

export interface FilterState {
  scope: 'current' | 'all';
  type: 'all' | 'in' | 'out';
  dateFrom: string;
  dateTo: string;
}
