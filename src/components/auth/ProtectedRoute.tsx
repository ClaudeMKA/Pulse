"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "USER";
}

export default function ProtectedRoute({ children, requiredRole = "ADMIN" }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (requiredRole === "ADMIN" && session.user.role !== "ADMIN") {
      router.push("/auth/login?error=unauthorized");
      return;
    }
  }, [session, status, router, requiredRole]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  if (!session || (requiredRole === "ADMIN" && session.user.role !== "ADMIN")) {
    return null;
  }

  return <>{children}</>;
}
