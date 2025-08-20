import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

    // Vérifier si c'est une route admin
    if (isAdminRoute) {
      // Vérifier si l'utilisateur est connecté
      if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }

      // Vérifier si l'utilisateur a le rôle ADMIN
      if (token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/auth/login?error=unauthorized", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Pour les routes admin, on vérifie dans la fonction middleware
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token;
        }
        // Pour les autres routes, pas de vérification
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*"
  ]
};
