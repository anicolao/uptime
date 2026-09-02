import { browser } from '$app/environment';
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getDatabase, connectDatabaseEmulator, type Database } from 'firebase/database';
import {
  GoogleAuthProvider,
  connectAuthEmulator,
  getAuth,
  signInAnonymously,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type Auth
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  throw new Error(`Missing Firebase configuration: ${missingKeys.join(', ')}`);
}

let app: FirebaseApp;
let rtdb: Database;
let auth: Auth;
let googleProvider: GoogleAuthProvider;

if (browser) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  rtdb = getDatabase(app);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();

  if (import.meta.env.VITE_FIREBASE_USE_EMULATORS === 'true') {
    const databasePort = Number(import.meta.env.VITE_FIREBASE_DATABASE_EMULATOR_PORT || 9000);
    const authPort = Number(import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT || 9099);
    connectDatabaseEmulator(rtdb, '127.0.0.1', databasePort);
    connectAuthEmulator(auth, `http://127.0.0.1:${authPort}`, { disableWarnings: true });

    window.signInTestUser = async () => {
      const credential = await signInAnonymously(auth);
      await updateProfile(credential.user, { displayName: 'Test User' });
    };
    window.firebaseAuth = auth;
  }
}

async function signIn(): Promise<void> {
  await signInWithPopup(auth, googleProvider);
}

async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export { app, rtdb, auth, signIn, signOut };
