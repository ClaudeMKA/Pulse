import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function requireAdminAuth(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return {
        error: NextResponse.json(
          { message: "Authentification requise" },
          { status: 401 }
        )
      };
    }

    if (session.user.role !== "ADMIN") {
      return {
        error: NextResponse.json(
          { message: "Accès non autorisé - Droits administrateur requis" },
          { status: 403 }
        )
      };
    }

    return { error: null, session };
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    return {
      error: NextResponse.json(
        { message: "Erreur d'authentification" },
        { status: 500 }
      )
    };
  }
}

export async function requireAuth(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return {
        error: NextResponse.json(
          { message: "Authentification requise" },
          { status: 401 }
        )
      };
    }

    return { error: null, session };
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    return {
      error: NextResponse.json(
        { message: "Erreur d'authentification" },
        { status: 500 }
      )
    };
  }
}