import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';

// Firebase Configuration
// Replace these with your own Firebase project credentials from https://console.firebase.google.com
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyReplace',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'biocampus-ai.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'biocampus-ai',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'biocampus-ai.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

// ========== AUTH FUNCTIONS ==========

// Google Sign-In with Popup
export async function firebaseSignInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// Sign Out
export async function firebaseSignOut() {
  await signOut(auth);
}

// Listen for Auth State Changes
export function onFirebaseAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ========== FIRESTORE DATABASE FUNCTIONS ==========

// Save a plant record to Firestore
export async function savePlantToFirestore(record: Record<string, unknown>) {
  try {
    const docRef = await addDoc(collection(db, 'plants'), {
      ...record,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.warn('Firestore save error:', error);
    return null;
  }
}

// Fetch all plant records from Firestore
export async function fetchPlantsFromFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, 'plants'));
    const plants: Record<string, unknown>[] = [];
    querySnapshot.forEach((docSnap) => {
      plants.push({ id: docSnap.id, ...docSnap.data() });
    });
    return plants;
  } catch (error) {
    console.warn('Firestore fetch error:', error);
    return [];
  }
}

// Update a plant record in Firestore
export async function updatePlantInFirestore(plantId: string, data: Record<string, unknown>) {
  try {
    await updateDoc(doc(db, 'plants', plantId), data);
  } catch (error) {
    console.warn('Firestore update error:', error);
  }
}
