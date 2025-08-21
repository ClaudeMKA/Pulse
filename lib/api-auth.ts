import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function requireAdminAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      error: NextResponse.json(
        { message: "Non autorisé - Connexion requise" },
        { status: 401 }
      ),
      session: null
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { message: "Non autorisé - Rôle admin requis" },
        { status: 403 }
      ),
      session: null
    };
  }

  return { error: null, session };
}

export async function requireUserAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      error: NextResponse.json(
        { message: "Non autorisé - Connexion requise" },
        { status: 401 }
      ),
      session: null
    };
  }

  return { error: null, session };
}