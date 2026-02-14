import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getDatabase, type Database } from "firebase/database";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, type Auth } from 'firebase/auth';
import { browser } from '$app/environment';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
};


let app: FirebaseApp | undefined;
let db: Firestore;
let rtdb: Database;
let auth: Auth;
let googleProvider: GoogleAuthProvider;

if (browser) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        db = getFirestore(app);
        rtdb = getDatabase(app);
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();

        if (import.meta.env.VITE_FIREBASE_USE_EMULATORS === 'true') {
            const { connectFirestoreEmulator } = await import('firebase/firestore');
            const { connectDatabaseEmulator } = await import('firebase/database');
            const { connectAuthEmulator } = await import('firebase/auth');

            console.log('[FIREBASE] Connecting to Emulators...');
            connectFirestoreEmulator(db, 'localhost', 8080);
            connectDatabaseEmulator(rtdb, 'localhost', 9000);
            connectAuthEmulator(auth, 'http://localhost:9099');
        }
    } catch (e) {
        console.error('[FIREBASE] Initialization failed', e);
    }
}

async function signIn() {
    if (!auth || !googleProvider) return;
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (e) {
        console.error('Sign in failed', e);
    }
}

async function signOut() {
    if (!auth) return;
    try {
        await firebaseSignOut(auth);
    } catch (e) {
        console.error('Sign out failed', e);
    }
}

export { app, db, rtdb, auth, googleProvider, signIn, signOut };
