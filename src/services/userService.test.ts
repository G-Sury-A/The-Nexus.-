import { describe, it, expect, vi } from 'vitest';
import { getUserPreferences } from './userService.js';
import { getDoc, doc } from 'firebase/firestore';
import { handleFirestoreError } from '../lib/firestoreError.js';

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(),
}));

vi.mock('../lib/firebase.js', () => ({
  db: {},
}));

vi.mock('../lib/firestoreError.js', () => ({
  handleFirestoreError: vi.fn(),
  OperationType: {
    GET: 'get',
    WRITE: 'write',
  },
}));

describe('userService', () => {
  describe('getUserPreferences', () => {
    it('should return user preferences when document exists', async () => {
      const mockData = { name: 'Test User' };
      const mockDocSnap = {
        exists: () => true,
        data: () => mockData,
      };
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);

      const result = await getUserPreferences('user123');

      expect(result).toEqual(mockData);
      expect(doc).toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalled();
    });

    it('should return null when document does not exist', async () => {
      const mockDocSnap = {
        exists: () => false,
      };
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);

      const result = await getUserPreferences('user123');

      expect(result).toBeNull();
    });

    it('should call handleFirestoreError and return null when getDoc fails and handleFirestoreError does not throw', async () => {
      const mockError = new Error('Firestore error');
      vi.mocked(getDoc).mockRejectedValue(mockError);

      const result = await getUserPreferences('user123');

      expect(handleFirestoreError).toHaveBeenCalledWith(
        mockError,
        'get',
        'users/user123'
      );
      expect(result).toBeNull();
    });

    it('should throw if handleFirestoreError throws', async () => {
      const mockError = new Error('Firestore error');
      vi.mocked(getDoc).mockRejectedValue(mockError);
      vi.mocked(handleFirestoreError).mockImplementation(() => {
        throw new Error('Handled error');
      });

      await expect(getUserPreferences('user123')).rejects.toThrow('Handled error');
    });
  });
});
