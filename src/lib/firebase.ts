import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
// CRITICAL: The app will break without providing firestoreDatabaseId in getFirestore for Enterprise
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); 
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    // Check if we are in an environment that might block popups (like some mobile webview or certain sandboxes)
    // Using redirect as a more robust alternative if popup fails or as a default
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (popupError: any) {
      console.warn('Popup blocked or failed, trying redirect...', popupError);
      if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, provider);
        return null; // Will redirect
      }
      throw popupError;
    }
  } catch (error) {
    console.error('Error signing in with Google', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out', error);
    throw error;
  }
};

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
