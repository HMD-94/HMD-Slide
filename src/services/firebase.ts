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
import {
  idbSavePresentation,
  idbGetPresentations,
  idbGetPresentationById,
  idbDeletePresentation,
} from '../utils/indexedDb';

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

// Initialize Firebase safely
export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(firebaseApp);
export const rtdb = getDatabase(firebaseApp);

const COLLECTION_NAME = 'presentations';

/**
 * Deep sanitization to remove undefined values which cause Firestore setDoc() to fail
 */
function sanitizeForCloud<T>(obj: T): T {
  try {
    return JSON.parse(
      JSON.stringify(obj, (_key, value) => (value === undefined ? null : value))
    );
  } catch {
    return obj;
  }
}

/**
 * Saves a presentation to Cloud:
 * 1. Persistent Server Cloud Storage API (/api/cloud/presentations)
 * 2. Browser IndexedDB (robust offline storage up to gigabytes)
 * 3. Firestore & Realtime Database (with sanitized payload)
 * 4. LocalStorage fallback mirror
 */
export async function savePresentationToFirebase(presentation: Presentation): Promise<boolean> {
  const sanitized = sanitizeForCloud({
    ...presentation,
    updatedAt: Date.now(),
  });

  let savedOnServer = false;
  let savedInIdb = false;
  let savedInFirebase = false;

  // 1. Save to Persistent Server Cloud API
  try {
    const res = await fetch('/api/cloud/presentations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitized),
    });
    if (res.ok) {
      savedOnServer = true;
    }
  } catch (serverErr) {
    console.warn('Server Cloud API unavailable, falling back to local/remote sync:', serverErr);
  }

  // 2. Save to Browser IndexedDB (no 5MB localStorage limit, persists across reloads)
  try {
    const ok = await idbSavePresentation(sanitized);
    if (ok) {
      savedInIdb = true;
    }
  } catch (idbErr) {
    console.warn('IndexedDB save failed:', idbErr);
  }

  // 3. Try Firebase Firestore
  try {
    const docRef = doc(db, COLLECTION_NAME, presentation.id);
    await setDoc(docRef, sanitized, { merge: true });
    savedInFirebase = true;
  } catch (fsErr) {
    // Firestore might be disabled on this project, continue quietly
  }

  // 4. Try Firebase Realtime Database
  try {
    const dbRef = rtdbRef(rtdb, `${COLLECTION_NAME}/${presentation.id}`);
    await rtdbSet(dbRef, sanitized);
    savedInFirebase = true;
  } catch (rtdbErr) {
    // RTDB might have permission restrictions, continue quietly
  }

  // 5. Local mirror backup (safely catch quota exceptions)
  try {
    const cloudMirror = JSON.parse(localStorage.getItem('hmd_cloud_mirror') || '{}');
    cloudMirror[presentation.id] = sanitized;
    localStorage.setItem('hmd_cloud_mirror', JSON.stringify(cloudMirror));
  } catch {
    // Quota exceeded in localStorage, ignored since we have Server & IndexedDB
  }

  // Considered successful if saved to Server, IndexedDB, or Firebase
  return savedOnServer || savedInIdb || savedInFirebase;
}

/**
 * Loads all presentations stored in Cloud (Server API + IndexedDB + Firebase + Local mirror)
 */
export async function loadPresentationsFromFirebase(): Promise<Presentation[]> {
  const mapById = new Map<string, Presentation>();

  // 1. Fetch from Server Cloud API
  try {
    const res = await fetch('/api/cloud/presentations');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.presentations)) {
        for (const p of data.presentations) {
          if (p && p.id && p.slides) {
            mapById.set(p.id, p);
          }
        }
      }
    }
  } catch (serverErr) {
    // Server might be starting or offline
  }

  // 2. Fetch from IndexedDB
  try {
    const idbList = await idbGetPresentations();
    for (const p of idbList) {
      if (p && p.id && p.slides) {
        const existing = mapById.get(p.id);
        if (!existing || (p.updatedAt || 0) > (existing.updatedAt || 0)) {
          mapById.set(p.id, p);
        }
      }
    }
  } catch (idbErr) {
    console.warn('IndexedDB load error:', idbErr);
  }

  // 3. Fetch from Firebase Firestore
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Presentation;
      if (data && data.id && data.slides) {
        const existing = mapById.get(data.id);
        if (!existing || (data.updatedAt || 0) > (existing.updatedAt || 0)) {
          mapById.set(data.id, data);
        }
      }
    });
  } catch (fsErr) {
    // Fallback if Firestore disabled
  }

  // 4. Fetch from Realtime Database
  try {
    const dbRef = rtdbRef(rtdb, COLLECTION_NAME);
    const snapshot = await rtdbGet(dbRef);
    if (snapshot.exists()) {
      const val = snapshot.val();
      const list = Object.values(val) as Presentation[];
      for (const p of list) {
        if (p && p.id && p.slides) {
          const existing = mapById.get(p.id);
          if (!existing || (p.updatedAt || 0) > (existing.updatedAt || 0)) {
            mapById.set(p.id, p);
          }
        }
      }
    }
  } catch (rtdbErr) {
    // Fallback
  }

  // 5. Fetch from Local mirror
  try {
    const cloudMirror = JSON.parse(localStorage.getItem('hmd_cloud_mirror') || '{}');
    const values = Object.values(cloudMirror) as Presentation[];
    for (const p of values) {
      if (p && p.id && p.slides) {
        const existing = mapById.get(p.id);
        if (!existing || (p.updatedAt || 0) > (existing.updatedAt || 0)) {
          mapById.set(p.id, p);
        }
      }
    }
  } catch {
    // ignore
  }

  const result = Array.from(mapById.values());
  return result.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

/**
 * Deletes a presentation from Cloud across all layers
 */
export async function deletePresentationFromFirebase(id: string): Promise<boolean> {
  // 1. Delete from Server
  try {
    await fetch(`/api/cloud/presentations/${id}`, { method: 'DELETE' });
  } catch {}

  // 2. Delete from IndexedDB
  try {
    await idbDeletePresentation(id);
  } catch {}

  // 3. Delete from Firestore
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch {}

  // 4. Delete from RTDB
  try {
    const dbRef = rtdbRef(rtdb, `${COLLECTION_NAME}/${id}`);
    await rtdbRemove(dbRef);
  } catch {}

  // 5. Delete from Local mirror
  try {
    const cloudMirror = JSON.parse(localStorage.getItem('hmd_cloud_mirror') || '{}');
    delete cloudMirror[id];
    localStorage.setItem('hmd_cloud_mirror', JSON.stringify(cloudMirror));
  } catch {}

  return true;
}

/**
 * Fetches a single presentation by ID from Cloud
 */
export async function getPresentationByIdFromFirebase(id: string): Promise<Presentation | null> {
  // 1. Try Server
  try {
    const res = await fetch(`/api/cloud/presentations/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.presentation) {
        return data.presentation;
      }
    }
  } catch {}

  // 2. Try IndexedDB
  try {
    const idbItem = await idbGetPresentationById(id);
    if (idbItem) return idbItem;
  } catch {}

  // 3. Try Firestore
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Presentation;
    }
  } catch {}

  // 4. Try RTDB
  try {
    const dbRef = rtdbRef(rtdb, `${COLLECTION_NAME}/${id}`);
    const snapshot = await rtdbGet(dbRef);
    if (snapshot.exists()) {
      return snapshot.val() as Presentation;
    }
  } catch {}

  // 5. Try Local mirror
  try {
    const cloudMirror = JSON.parse(localStorage.getItem('hmd_cloud_mirror') || '{}');
    if (cloudMirror[id]) return cloudMirror[id];
  } catch {}

  return null;
}
