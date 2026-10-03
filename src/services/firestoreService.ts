import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, Account, Entry, TrashItem, EntryType } from '../types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

// User Profile
export async function getOrCreateUserProfile(
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string
): Promise<UserProfile> {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as UserProfile;
      return data;
    }

    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      uid,
      email: email || '',
      displayName: displayName || 'User',
      photoURL: photoURL || '',
      theme: 'dark',
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, newProfile);

    // Also create initial default account
    const defaultAccId = generateId();
    const defaultAccount: Account = {
      id: defaultAccId,
      userId: uid,
      name: 'Main Cash',
      icon: '💵',
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, `users/${uid}/accounts`, defaultAccId), defaultAccount);
    await updateDoc(docRef, { activeAccountId: defaultAccId, updatedAt: now });
    newProfile.activeAccountId = defaultAccId;

    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<Pick<UserProfile, 'displayName' | 'photoURL' | 'theme' | 'activeAccountId'>>
): Promise<void> {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Accounts
export function subscribeAccounts(
  userId: string,
  onData: (accounts: Account[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const path = `users/${userId}/accounts`;
  const q = query(collection(db, path), orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const accounts: Account[] = [];
      snapshot.forEach((d) => {
        accounts.push(d.data() as Account);
      });
      onData(accounts);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function createAccount(userId: string, name: string, icon: string): Promise<Account> {
  const id = generateId();
  const path = `users/${userId}/accounts/${id}`;
  const now = new Date().toISOString();
  const newAccount: Account = {
    id,
    userId,
    name: name.trim(),
    icon: icon || '💵',
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, `users/${userId}/accounts`, id), newAccount);
    return newAccount;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateAccount(
  userId: string,
  accountId: string,
  name: string,
  icon: string
): Promise<void> {
  const path = `users/${userId}/accounts/${accountId}`;
  try {
    await updateDoc(doc(db, `users/${userId}/accounts`, accountId), {
      name: name.trim(),
      icon,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteAccountToTrash(
  userId: string,
  account: Account,
  associatedEntries: Entry[]
): Promise<void> {
  const now = new Date().toISOString();
  const batch = writeBatch(db);

  // Add account to trash
  const trashAccId = generateId();
  const trashAccItem: TrashItem = {
    id: trashAccId,
    userId,
    originalId: account.id,
    itemType: 'account',
    name: account.name,
    type: account.icon,
    deletedAt: now,
    createdAt: now,
  };
  batch.set(doc(db, `users/${userId}/trash`, trashAccId), trashAccItem);
  batch.delete(doc(db, `users/${userId}/accounts`, account.id));

  // Add associated entries to trash
  for (const entry of associatedEntries) {
    const trashEntryId = generateId();
    const trashEntryItem: TrashItem = {
      id: trashEntryId,
      userId,
      originalId: entry.id,
      itemType: 'entry',
      amount: entry.amount,
      details: entry.details || '',
      type: entry.type,
      accountId: entry.accountId,
      date: entry.date,
      deletedAt: now,
      createdAt: now,
    };
    batch.set(doc(db, `users/${userId}/trash`, trashEntryId), trashEntryItem);
    batch.delete(doc(db, `users/${userId}/entries`, entry.id));
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/accounts/${account.id}`);
  }
}

// Entries
export function subscribeEntries(
  userId: string,
  onData: (entries: Entry[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const path = `users/${userId}/entries`;
  const q = query(collection(db, path), orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const entries: Entry[] = [];
      snapshot.forEach((d) => {
        entries.push(d.data() as Entry);
      });
      onData(entries);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function createEntry(
  userId: string,
  accountId: string,
  type: EntryType,
  amount: number,
  details: string,
  dateISO?: string
): Promise<Entry> {
  const id = generateId();
  const path = `users/${userId}/entries/${id}`;
  const now = new Date().toISOString();
  const entryDate = dateISO || now;

  const newEntry: Entry = {
    id,
    userId,
    accountId,
    type,
    amount: Math.round(amount),
    details: details.trim(),
    date: entryDate,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, `users/${userId}/entries`, id), newEntry);
    return newEntry;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateEntry(
  userId: string,
  entryId: string,
  updates: Partial<Pick<Entry, 'accountId' | 'type' | 'amount' | 'details' | 'date'>>
): Promise<void> {
  const path = `users/${userId}/entries/${entryId}`;
  try {
    await updateDoc(doc(db, `users/${userId}/entries`, entryId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteEntryToTrash(userId: string, entry: Entry): Promise<void> {
  const now = new Date().toISOString();
  const trashId = generateId();
  const trashItem: TrashItem = {
    id: trashId,
    userId,
    originalId: entry.id,
    itemType: 'entry',
    amount: entry.amount,
    details: entry.details || '',
    type: entry.type,
    accountId: entry.accountId,
    date: entry.date,
    deletedAt: now,
    createdAt: now,
  };

  const batch = writeBatch(db);
  batch.set(doc(db, `users/${userId}/trash`, trashId), trashItem);
  batch.delete(doc(db, `users/${userId}/entries`, entry.id));

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/entries/${entry.id}`);
  }
}

// Trash
export function subscribeTrash(
  userId: string,
  onData: (trashItems: TrashItem[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const path = `users/${userId}/trash`;
  const q = query(collection(db, path), orderBy('deletedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: TrashItem[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as TrashItem);
      });
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function restoreTrashItem(userId: string, item: TrashItem): Promise<void> {
  const now = new Date().toISOString();
  const batch = writeBatch(db);

  if (item.itemType === 'account') {
    const restoredAccount: Account = {
      id: item.originalId,
      userId,
      name: item.name || 'Restored Account',
      icon: item.type || '💵',
      createdAt: now,
      updatedAt: now,
    };
    batch.set(doc(db, `users/${userId}/accounts`, item.originalId), restoredAccount);
  } else {
    const restoredEntry: Entry = {
      id: item.originalId,
      userId,
      accountId: item.accountId || '',
      type: (item.type as EntryType) || 'in',
      amount: item.amount || 0,
      details: item.details || '',
      date: item.date || now,
      createdAt: now,
      updatedAt: now,
    };
    batch.set(doc(db, `users/${userId}/entries`, item.originalId), restoredEntry);
  }

  batch.delete(doc(db, `users/${userId}/trash`, item.id));

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/trash/${item.id}`);
  }
}

export async function permanentlyDeleteTrashItem(userId: string, trashId: string): Promise<void> {
  const path = `users/${userId}/trash/${trashId}`;
  try {
    await deleteDoc(doc(db, `users/${userId}/trash`, trashId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function emptyTrash(userId: string, items: TrashItem[]): Promise<void> {
  const batch = writeBatch(db);
  for (const item of items) {
    batch.delete(doc(db, `users/${userId}/trash`, item.id));
  }
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/trash`);
  }
}
