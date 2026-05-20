import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserPreferences } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreError';

export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, path);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserPreferences;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const saveUserPreferences = async (userId: string, prefs: UserPreferences, isNew: boolean): Promise<void> => {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, path);
    if (isNew) {
      await setDoc(docRef, {
        ...prefs,
        createdAt: serverTimestamp()
      }, { merge: false });
    } else {
      await setDoc(docRef, {
        ...prefs,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};
