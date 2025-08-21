import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type") || "";
    const isSent = searchParams.get("is_sent");

    // Construire les filtres
    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (isSent !== null && isSent !== undefined) {
      where.is_sent = isSent === "true";
    }

    // Calculer le skip pour la pagination
    const skip = (page - 1) * limit;

    // Récupérer les notifications avec pagination et relations
    const [notifications, total] = await Promise.all([
      prisma.eventNotifications.findMany({
        where,
        include: {
          event: {
            include: {
              artist: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.eventNotifications.count({ where }),
    ]);

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      notifications,
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
    console.error("Erreur lors de la récupération des notifications:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id, type, title, message, scheduled_for } = body;

    // Validation
    if (!event_id || !type || !title || !message || !scheduled_for) {
      return NextResponse.json(
        { message: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Créer la notification
    const notification = await prisma.eventNotifications.create({
      data: {
        event_id: parseInt(event_id),
        type: type as "ONE_HOUR_BEFORE" | "TEN_MINUTES_BEFORE",
        title,
        message,
        scheduled_for: new Date(scheduled_for),
      },
      include: {
        event: {
          include: {
            artist: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
