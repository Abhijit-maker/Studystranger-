import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, type User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, query, where, orderBy, limit, Timestamp, addDoc, updateDoc, deleteDoc, getDocFromServer, getDocs, writeBatch } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Error handling helper
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
  const errMsg = errInfo.error.toLowerCase();
  const isPermissionDenied = errMsg.includes("permission-denied") || 
                             errMsg.includes("insufficient permissions") || 
                             errMsg.includes("missing or insufficient permissions");
                             
  if (isPermissionDenied) {
    throw new Error(JSON.stringify(errInfo));
  } else {
    console.warn(`Firestore network fallback warning [${operationType}] on [${path}]:`, errInfo.error);
  }
}

// Test connection
async function testConnection() {
  try {
    // Softly attempt connection check with cache fallback
    await getDoc(doc(db, 'test', 'connection'));
  } catch (error) {
    const errStr = String(error).toLowerCase();
    if (errStr.includes('offline') || errStr.includes('unavailable') || errStr.includes('could not reach')) {
      console.warn("Firestore running in offline/cache mode. Will auto-reconnect when network is stable.");
    } else {
      console.warn("Firestore connection check note:", error);
    }
  }
}
testConnection();

export { 
  signInWithPopup, 
  signInAnonymously,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch
};
