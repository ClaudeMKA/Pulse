import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/api-auth";
import { NotificationScheduler } from "@/lib/notificationScheduler";

export async function POST(request: NextRequest) {
  // Vérifier l'authentification admin
  const { error, session } = await requireAdminAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const {
      title,
      desc,
      start_date,
      genre,
      type,
      location,
      latitude,
      longitude,
      image_path,
      artist_id,
    } = body;

    // Validation côté serveur
    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json(
        { message: "Le titre de l'événement est requis et doit contenir au moins 3 caractères" },
        { status: 400 }
      );
    }

    if (!desc || typeof desc !== "string" || desc.trim().length < 10) {
      return NextResponse.json(
        { message: "La description est requise et doit contenir au moins 10 caractères" },
        { status: 400 }
      );
    }

    if (!start_date) {
      return NextResponse.json(
        { message: "La date de début est requise" },
        { status: 400 }
      );
    }

    if (!genre || !["RAP", "RNB", "REGGAE", "ROCK"].includes(genre)) {
      return NextResponse.json(
        { message: "Le genre musical est requis et doit être valide" },
        { status: 400 }
      );
    }

    if (!type || !["CONCERT", "FESTIVAL", "SHOWCASE", "OTHER"].includes(type)) {
      return NextResponse.json(
        { message: "Le type d'événement est requis et doit être valide" },
        { status: 400 }
      );
    }

    if (!location || typeof location !== "string" || location.trim().length === 0) {
      return NextResponse.json(
        { message: "Le lieu est requis" },
        { status: 400 }
      );
    }

    // Validation de la date (doit être dans le futur)
    const eventDate = new Date(start_date);
    const now = new Date();
    if (eventDate <= now) {
      return NextResponse.json(
        { message: "La date de début doit être dans le futur" },
        { status: 400 }
      );
    }

    // Validation des coordonnées GPS si fournies
    if (latitude !== null && (isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90)) {
      return NextResponse.json(
        { message: "La latitude doit être entre -90 et 90" },
        { status: 400 }
      );
    }

    if (longitude !== null && (isNaN(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180)) {
      return NextResponse.json(
        { message: "La longitude doit être entre -180 et 180" },
        { status: 400 }
      );
    }

    // Validation de l'artiste si fourni
    if (artist_id !== null) {
      const artist = await prisma.artists.findUnique({
        where: { id: Number(artist_id) },
      });
      if (!artist) {
        return NextResponse.json(
          { message: "L'artiste sélectionné n'existe pas" },
          { status: 400 }
        );
      }
    }

    // Créer l'événement
    const event = await prisma.events.create({
      data: {
        title: title.trim(),
        desc: desc.trim(),
        start_date: eventDate,
        genre: genre as "RAP" | "RNB" | "REGGAE" | "ROCK",
        type: type as "CONCERT" | "ACCOUSTIQUE" | "SHOWCASE" | "OTHER",
        location: location.trim(),
        latitude: latitude !== null ? Number(latitude) : null,
        longitude: longitude !== null ? Number(longitude) : null,
        image_path: image_path?.trim() || null,
        artist_id: artist_id !== null ? Number(artist_id) : null,
      },
      // Supprimer l'include pour l'instant
    });

    // Planifier les notifications automatiquement
    await NotificationScheduler.scheduleEventNotifications(event.id);

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'événement:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const genre = searchParams.get("genre") || "";
    const type = searchParams.get("type") || "";
    const artistId = searchParams.get("artist_id") || "";
    const upcoming = searchParams.get("upcoming") === "true";

    // Construire les filtres
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { desc: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    if (genre) {
      where.genre = genre;
    }

    if (type) {
      where.type = type;
    }

    if (artistId) {
      where.artist_id = parseInt(artistId);
    }

    if (upcoming) {
      where.start_date = {
        gte: new Date(),
      };
    }

    // Calculer le skip pour la pagination
    const skip = (page - 1) * limit;

    // Récupérer les événements avec pagination ET la relation artist
    const [events, total] = await Promise.all([
      prisma.events.findMany({
        where,
        include: {
          artist: {
            select: {
              id: true,
              name: true,
              image_path: true,
            },
          },
        },
        orderBy: {
          start_date: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.events.count({ where }),
    ]);

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      events,
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
    console.error("Erreur lors de la récupération des événements:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
