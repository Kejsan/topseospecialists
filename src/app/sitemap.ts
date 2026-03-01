import type { MetadataRoute } from "next";
import { initFirebase } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const BASE_URL = "https://topseospecialists.netlify.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  
  // Static pages
  const routes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ];

  try {
    const { db } = await initFirebase();

    // Specialist profile pages
    const specialistsRef = collection(db, "specialists");
    const specialistsSnapshot = await getDocs(specialistsRef);
    
    specialistsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.slug) {
        routes.push({
          url: `${BASE_URL}/specialist/${data.slug}`,
          lastModified: data.updatedAt?.toDate() || now,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    });

    // Blog post pages
    const blogRef = collection(db, "blog-posts");
    const blogQuery = query(blogRef, where("status", "==", "published"));
    const blogSnapshot = await getDocs(blogQuery);
    
    blogSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.slug) {
        routes.push({
          url: `${BASE_URL}/blog/${data.slug}`,
          lastModified: data.updatedAt?.toDate() || now,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }

  return routes;
}
