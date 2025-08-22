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
      location_id,
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

    if (!type || !["CONCERT", "ACCOUSTIQUE", "SHOWCASE", "OTHER"].includes(type)) {
      return NextResponse.json(
        { message: "Le type d'événement est requis et doit être valide" },
        { status: 400 }
      );
    }

    if (!location_id || typeof location_id !== "number") {
      return NextResponse.json(
        { message: "Le lieu est requis et doit être valide" },
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

    // Validation du lieu
    try {
      const location = await prisma.$queryRaw`SELECT id FROM locations WHERE id = ${location_id}`;
      if (!Array.isArray(location) || location.length === 0) {
        return NextResponse.json(
          { message: "Le lieu sélectionné n'existe pas" },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { message: "Le lieu sélectionné n'existe pas" },
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

      // Vérifier que l'artiste n'est pas déjà programmé sur la même journée
      const startOfDay = new Date(eventDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(eventDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingEvent = await prisma.events.findFirst({
        where: {
          artist_id: Number(artist_id),
          start_date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (existingEvent) {
        return NextResponse.json(
          { 
            message: `L'artiste ${artist.name} est déjà programmé le ${startOfDay.toLocaleDateString('fr-FR')} pour l'événement "${existingEvent.title}"` 
          },
          { status: 400 }
        );
      }
    }

    // Créer l'événement avec Prisma standard
    const event = await (prisma as any).events.create({
      data: {
        title: title.trim(),
        desc: desc.trim(),
        start_date: eventDate,
        genre: genre,
        type: type,
        location_id: location_id,
        image_path: image_path?.trim() || null,
        artist_id: artist_id !== null ? Number(artist_id) : null,
      },
    });

    // Désactiver temporairement le NotificationScheduler pour éviter les erreurs
    // await NotificationScheduler.scheduleEventNotifications(event.id);

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

    // Récupérer les lieux séparément pour éviter les erreurs de relations
    const locationIds = events.map((e: any) => e.location_id).filter(Boolean);
    let locations: any[] = [];
    
    if (locationIds.length > 0) {
      try {
        // Utiliser une requête SQL brute pour éviter les erreurs de type Prisma
        const result = await prisma.$queryRaw`SELECT id, name, address, latitude, longitude FROM locations WHERE id = ANY(${locationIds})`;
        locations = Array.isArray(result) ? result : [];
      } catch (error) {
        console.warn("Impossible de récupérer les lieux:", error);
        locations = [];
      }
    }

    // Transformer les événements pour inclure location, latitude et longitude au niveau racine
    const transformedEvents = events.map((event: any) => {
      const location = locations.find((l: any) => l.id === event.location_id);
      return {
        ...event,
        location: location?.name || null,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
      };
    });

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      events: transformedEvents,
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
