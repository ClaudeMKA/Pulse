import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const users = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}