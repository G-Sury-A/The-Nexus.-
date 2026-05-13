import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleFirestoreError, OperationType } from './firestoreError.js';
import { auth } from './firebase.js';

vi.mock('./firebase.js', () => ({
  auth: {
    currentUser: null,
  },
}));

describe('handleFirestoreError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Reset currentUser to null before each test
    (auth as any).currentUser = null;
  });

  it('should throw an error with user-friendly message for an Error object', () => {
    const mockError = new Error('Original error');
    const operation = OperationType.GET;
    const path = 'users/123';

    expect(() => handleFirestoreError(mockError, operation, path)).toThrow(
      'Database error during get at users/123: Original error'
    );
    expect(console.error).toHaveBeenCalled();
  });

  it('should throw an error with user-friendly message for a string error', () => {
    const mockError = 'String error';
    const operation = OperationType.UPDATE;
    const path = 'settings/global';

    expect(() => handleFirestoreError(mockError, operation, path)).toThrow(
      'Database error during update at settings/global: String error'
    );
  });

  it('should handle null path', () => {
    const mockError = new Error('Failed');
    const operation = OperationType.LIST;
    const path = null;

    expect(() => handleFirestoreError(mockError, operation, path)).toThrow(
      'Database error during list at unknown: Failed'
    );
  });

  it('should include auth info in console.error when user is logged in', () => {
    const mockUser = {
      uid: 'user-123',
      email: 'test@example.com',
      emailVerified: true,
      isAnonymous: false,
      tenantId: 'tenant-456',
      providerData: [
        { providerId: 'google.com', email: 'test@example.com' }
      ]
    };
    (auth as any).currentUser = mockUser;

    const mockError = new Error('Auth error');

    expect(() => handleFirestoreError(mockError, OperationType.GET, 'path')).toThrow();

    expect(console.error).toHaveBeenCalled();
    const lastCall = vi.mocked(console.error).mock.calls[0];
    expect(lastCall[0]).toBe('Firestore Error: ');
    const loggedJson = JSON.parse(lastCall[1]);

    expect(loggedJson.authInfo).toEqual({
      userId: 'user-123',
      email: 'test@example.com',
      emailVerified: true,
      isAnonymous: false,
      tenantId: 'tenant-456',
      providerInfo: [
        { providerId: 'google.com', email: 'test@example.com' }
      ]
    });
    expect(loggedJson.operationType).toBe(OperationType.GET);
    expect(loggedJson.path).toBe('path');
    expect(loggedJson.error).toBe('Auth error');
  });

  it('should handle missing providerData', () => {
    const mockUser = {
      uid: 'user-123',
      providerData: undefined
    };
    (auth as any).currentUser = mockUser;

    expect(() => handleFirestoreError('err', OperationType.GET, 'path')).toThrow();

    const lastCall = vi.mocked(console.error).mock.calls[0];
    const loggedJson = JSON.parse(lastCall[1]);
    expect(loggedJson.authInfo.providerInfo).toEqual([]);
  });

  it('should handle providerData with missing emails', () => {
    const mockUser = {
      uid: 'user-123',
      providerData: [
        { providerId: 'google.com', email: null },
        { providerId: 'phone' }
      ]
    };
    (auth as any).currentUser = mockUser;

    expect(() => handleFirestoreError('err', OperationType.GET, 'path')).toThrow();

    const lastCall = vi.mocked(console.error).mock.calls[0];
    const loggedJson = JSON.parse(lastCall[1]);
    // JSON.stringify removes undefined keys
    expect(loggedJson.authInfo.providerInfo).toEqual([
      { providerId: 'google.com', email: null },
      { providerId: 'phone' }
    ]);
  });

  it('should handle user not being logged in', () => {
    (auth as any).currentUser = null;

    expect(() => handleFirestoreError('err', OperationType.GET, 'path')).toThrow();

    const lastCall = vi.mocked(console.error).mock.calls[0];
    const loggedJson = JSON.parse(lastCall[1]);
    expect(loggedJson.authInfo).toEqual({
        providerInfo: []
    });
  });
});
