import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, writeBatch } from "firebase/firestore";
import { initialSpecialistData } from "./src/lib/data.js";

// Check if env vars are loaded (via --env-file)
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.error("Error: Firebase environment variables not found.");
  process.exit(1);
}

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

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function migrate() {
  console.log(`Starting migration of ${initialSpecialistData.length} specialists...`);
  const batch = writeBatch(db);
  const profilesRef = collection(db, "seo-profiles");

  for (const specialist of initialSpecialistData) {
    const slug = slugify(specialist.name);
    const docRef = doc(profilesRef, slug);
    batch.set(docRef, {
      ...specialist,
      slug,
      status: "approved",
      createdAt: new Date().toISOString(), // Use string for consistent storage
    });
  }

  console.log("Committing batch...");
  await batch.commit();
  console.log("Successfully migrated all profiles to 'seo-profiles' collection!");
  process.exit(0);
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
