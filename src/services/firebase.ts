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
import {
  getDatabase,
  ref as rtdbRef,
  set as rtdbSet,
  get as rtdbGet,
  remove as rtdbRemove,
} from 'firebase/database';
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
export const rtdb = getDatabase(firebaseApp);

const COLLECTION_NAME = 'presentations';

/**
 * Saves a presentation to Firebase (Firestore & Realtime Database)
 */
export async function savePresentationToFirebase(presentation: Presentation): Promise<boolean> {
  const dataToSave = {
    ...presentation,
    updatedAt: Date.now(),
  };

  let savedSuccessfully = false;

  // 1. Try Firestore
  try {
    const docRef = doc(db, COLLECTION_NAME, presentation.id);
    await setDoc(docRef, dataToSave, { merge: true });
    savedSuccessfully = true;
  } catch (fsErr) {
    // try RTDB
  }

  // 2. Try Realtime Database
  try {
    const dbRef = rtdbRef(rtdb, `${COLLECTION_NAME}/${presentation.id}`);
    await rtdbSet(dbRef, dataToSave);
    savedSuccessfully = true;
  } catch (rtdbErr) {
    // ignore
  }

  // 3. Local mirror backup
  try {
    const cloudMirror = JSON.parse(localStorage.getItem('hmd_cloud_mirror') || '{}');
    cloudMirror[presentation.id] = dataToSave;
    localStorage.setItem('hmd_cloud_mirror', JSON.stringify(cloudMirror));
    savedSuccessfully = true;
  } catch {}

  return savedSuccessfully;
}

/**
 * Loads all presentations stored in Firebase Cloud
 */
export async function loadPresentationsFromFirebase(): Promise<Presentation[]> {
  // 1. Try Firestore
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
    if (list.length > 0) return list;
  } catch (fsErr) {
    // fallback to RTDB
  }

  // 2. Try Realtime Database
  try {
    const dbRef = rtdbRef(rtdb, COLLECTION_NAME);
    const snapshot = await rtdbGet(dbRef);
    if (snapshot.exists()) {
      const val = snapshot.val();
      const list = Object.values(val) as Presentation[];
      if (list && list.length > 0) {
        return list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      }
    }
  } catch (rtdbErr) {
    // fallback
  }

  // 3. Try Local Mirror Backup
  try {
    const cloudMirror = JSON.parse(localStorage.getItem('hmd_cloud_mirror') || '{}');
    const values = Object.values(cloudMirror) as Presentation[];
    return values.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  } catch {
    return [];
  }
}

/**
 * Deletes a presentation from Firebase Cloud
 */
export async function deletePresentationFromFirebase(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch {}

  try {
    const dbRef = rtdbRef(rtdb, `${COLLECTION_NAME}/${id}`);
    await rtdbRemove(dbRef);
  } catch {}

  try {
    const cloudMirror = JSON.parse(localStorage.getItem('hmd_cloud_mirror') || '{}');
    delete cloudMirror[id];
    localStorage.setItem('hmd_cloud_mirror', JSON.stringify(cloudMirror));
  } catch {}

  return true;
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
  } catch {}

  try {
    const dbRef = rtdbRef(rtdb, `${COLLECTION_NAME}/${id}`);
    const snapshot = await rtdbGet(dbRef);
    if (snapshot.exists()) {
      return snapshot.val() as Presentation;
    }
  } catch {}

  return null;
}
