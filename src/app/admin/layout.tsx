import { ProtectedRoute } from "@/components/custom/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
        {children}
      </div>
    </ProtectedRoute>
  );
}
