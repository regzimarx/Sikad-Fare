import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration from your .env.local file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase for Server-Side Rendering (SSR), prevents re-initialization on hot reloads
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize and export Firebase services
const db = getFirestore(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, db, analytics };
