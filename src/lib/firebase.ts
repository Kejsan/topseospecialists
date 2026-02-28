import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

export async function getFirebaseConfig() {
  if (typeof window === "undefined") {
    return null; // Don't run this on the server
  }

  // Check if already loaded globally (like the original site did)
  if (window.__APP_CONFIG__) {
    return window.__APP_CONFIG__.firebase;
  }

  try {
    const res = await fetch("/config.json");
    if (res.ok) {
      const data = await res.json();
      return data.firebase;
    }
  } catch (error) {
    console.error("Failed to load Firebase config", error);
  }
  return null;
}

export async function initFirebase() {
  const config = await getFirebaseConfig();
  if (!config) {
    throw new Error("Firebase configuration not found");
  }

  const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
  const db = getFirestore(app);
  const auth = getAuth(app);
  const functions = getFunctions(app);

  return { app, db, auth, functions, config };
}
