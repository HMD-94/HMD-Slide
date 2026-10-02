import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { Presentation } from '../types/slides';

// User's provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCch8aIfqD5dqRh1dqNWHsFBMlfbgv8ls",
  authDomain: "hmd-slide.firebaseapp.com",
  databaseURL: "https://hmd-slide-default-rtdb.firebaseio.com",
  projectId: "hmd-slide",
  storageBucket: "hmd-slide.firebasestorage.app",
  messagingSenderId: "1097175610245",
  appId: "1:1097175610245:web:840b89b6c0e55733218aec",
  measurementId: "G-Q4PY0D4CT3",
};

// Initialize Firebase safely (avoid duplicate app init)
export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(firebaseApp);

const COLLECTION_NAME = 'presentations';

/**
 * Saves a presentation to Firebase Firestore Cloud
 */
export async function savePresentationToFirebase(presentation: Presentation): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTION_NAME, presentation.id);
    const dataToSave = {
      ...presentation,
      updatedAt: Date.now(),
    };
    await setDoc(docRef, dataToSave, { merge: true });
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde Firebase:', error);
    // Fallback: save in local storage mirror
    try {
      const cloudMirror = JSON.parse(localStorage.getItem('hmd_cloud_mirror') || '{}');
      cloudMirror[presentation.id] = { ...presentation, updatedAt: Date.now() };
      localStorage.setItem('hmd_cloud_mirror', JSON.stringify(cloudMirror));
    } catch {}
    return false;
  }
}

/**
 * Loads all presentations stored in Firebase Firestore Cloud
 */
export async function loadPresentationsFromFirebase(): Promise<Presentation[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    const list: Presentation[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Presentation;
      if (data && data.slides) {
        list.push(data);
      }
    });
    return list;
  } catch (error) {
    console.warn('Erreur lecture Firebase (tentative miroir local):', error);
    try {
      const cloudMirror = JSON.parse(localStorage.getItem('hmd_cloud_mirror') || '{}');
      return Object.values(cloudMirror) as Presentation[];
    } catch {
      return [];
    }
  }
}

/**
 * Deletes a presentation from Firebase Firestore Cloud
 */
export async function deletePresentationFromFirebase(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    try {
      const cloudMirror = JSON.parse(localStorage.getItem('hmd_cloud_mirror') || '{}');
      delete cloudMirror[id];
      localStorage.setItem('hmd_cloud_mirror', JSON.stringify(cloudMirror));
    } catch {}
    return true;
  } catch (error) {
    console.error('Erreur suppression Firebase:', error);
    return false;
  }
}

/**
 * Fetches a single presentation by ID from Firebase
 */
export async function getPresentationByIdFromFirebase(id: string): Promise<Presentation | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Presentation;
    }
  } catch (error) {
    console.error('Erreur chargement diapo Firebase:', error);
  }
  return null;
}
