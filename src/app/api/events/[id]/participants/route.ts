import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Obtenir la liste des participants d'un événement (admin seulement)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const { id: paramId } = await params;
    const eventId = parseInt(paramId);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { message: "ID d'événement invalide" },
        { status: 400 }
      );
    }

    // Vérifier que l'événement existe
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        start_date: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { message: "Événement introuvable" },
        { status: 404 }
      );
    }

    // Récupérer les participants avec pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {
      event_id: eventId,
    };

    if (search) {
      where.user = {
        OR: [
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    // Récupérer les participants
    const [participants, total] = await Promise.all([
      prisma.eventParticipants.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.eventParticipants.count({ where }),
    ]);

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        start_date: event.start_date,
        totalParticipants: event._count.participants,
      },
      participants,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des participants:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des participants" },
      { status: 500 }
    );
  }
}