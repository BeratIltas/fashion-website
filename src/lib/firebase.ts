import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
} from "firebase/auth";

const rawFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
] as const;

const missingKeys = requiredKeys.filter((key) => !rawFirebaseConfig[key]);

if (missingKeys.length > 0) {
  throw new Error(`Missing Firebase configuration keys: ${missingKeys.join(", ")}`);
}

const firebaseConfig = rawFirebaseConfig as {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

let persistencePromise: Promise<void> | null = null;

export function ensureAuthPersistence() {
  if (!persistencePromise) {
    persistencePromise = setPersistence(auth, browserLocalPersistence);
  }

  return persistencePromise;
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope("email");
facebookProvider.setCustomParameters({ display: "popup" });
