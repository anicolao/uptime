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
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
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
