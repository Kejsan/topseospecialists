import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

async function exportData() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const collections = ["specialists", "seo-profiles", "pending-specialists", "blog-posts"];
  const exportResult = {};

  for (const colName of collections) {
    console.log(`Fetching ${colName}...`);
    const snapshot = await getDocs(collection(db, colName));
    exportResult[colName] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  fs.writeFileSync("firestore_export.json", JSON.stringify(exportResult, null, 2));
  console.log("Export complete: firestore_export.json");
  process.exit(0);
}

exportData().catch(console.error);
