import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, getDoc, doc, orderBy } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { Specialist } from "@/types/models";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

export { db, auth, functions };

export async function initFirebase() {
  if (!firebaseConfig.apiKey) {
    throw new Error("Firebase configuration not found. Check your .env.local file.");
  }
  return { app, db, auth, functions, config: firebaseConfig };
}

export async function getApprovedSpecialists(): Promise<Specialist[]> {
  const q = query(collection(db, "specialists"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Specialist));
}

export async function getSpecialistBySlug(slug: string): Promise<Specialist | null> {
  const q = query(collection(db, "specialists"), where("slug", "==", slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Specialist;
}
