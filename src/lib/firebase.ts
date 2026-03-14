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

const functionsRegion = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION || "us-central1";

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app, functionsRegion);

export { db, auth, functions, functionsRegion };

export async function initFirebase() {
  if (!firebaseConfig.apiKey) {
    throw new Error("Firebase configuration not found. Check your .env.local file.");
  }
  return { app, db, auth, functions, functionsRegion, config: firebaseConfig };
}

export function formatFirebaseFunctionsError(error: unknown, actionLabel: string) {
  const details = error as { code?: string; message?: string } | null;
  const code = details?.code || "";
  const message = details?.message || "";

  if (code === "functions/unauthenticated") {
    return `${actionLabel} requires an authenticated admin session. Sign in again and retry.`;
  }

  if (code === "functions/failed-precondition") {
    return message || `${actionLabel} is not configured correctly on Firebase yet.`;
  }

  if (code === "functions/internal") {
    return `${actionLabel} could not reach the Firebase callable function. This usually means the function is not deployed correctly for project "${firebaseConfig.projectId}" in region "${functionsRegion}", or the browser request was blocked before the callable handler responded.`;
  }

  if (message) {
    return `${actionLabel} failed: ${message}`;
  }

  return `${actionLabel} failed. Check the browser console and Firebase Functions deployment.`;
}

export async function getApprovedSpecialists(): Promise<Specialist[]> {
  const q = query(collection(db, "specialists"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Specialist));
}

export async function getSpecialistBySlug(slug: string): Promise<Specialist | null> {
  if (!slug) return null; // Guard against undefined/empty slug
  const q = query(collection(db, "specialists"), where("slug", "==", slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Specialist;
}
