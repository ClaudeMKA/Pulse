import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { message: "ID utilisateur invalide" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur demande ses propres événements ou est admin
    if (!session || (parseInt(session.user.id) !== userId && session.user.role !== "ADMIN")) {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Récupérer les participations de l'utilisateur
    const participations = await prisma.eventParticipants.findMany({
      where: {
        user_id: userId,
      },
      include: {
        event: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        event: {
          start_date: "asc",
        },
      },
    });

    return NextResponse.json({
      participations,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des événements:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des événements" },
      { status: 500 }
    );
  }
}