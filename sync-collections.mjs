import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function sync() {
  console.log("Syncing specialists to the final unified collection...");
  
  const sourceRef = collection(db, "seo-profiles");
  const destRef = collection(db, "specialists");
  
  const snapshot = await getDocs(sourceRef);
  console.log(`Found ${snapshot.size} documents in seo-profiles.`);
  
  const batch = writeBatch(db);
  
  snapshot.forEach((sourceDoc) => {
    const data = sourceDoc.data();
    const destDocRef = doc(destRef, sourceDoc.id);
    batch.set(destDocRef, data);
  });
  
  await batch.commit();
  console.log("Successfully synced to 'specialists' collection!");
  
  // Optional: Clean up old collection if desired, but safer to keep for now
  process.exit(0);
}

sync().catch(err => {
  console.error("Sync failed:", err);
  process.exit(1);
});
