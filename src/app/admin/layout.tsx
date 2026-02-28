import { ProtectedRoute } from "@/components/custom/ProtectedRoute";

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
