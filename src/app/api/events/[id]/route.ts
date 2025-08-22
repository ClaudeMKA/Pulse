
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID d'événement invalide" },
        { status: 400 }
      );
    }

    const event = await prisma.events.findUnique({
      where: { id },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            image_path: true,
          },
        },
      },
    });

    // Récupérer les détails de la location séparément
    let locationDetails = null;
    if ((event as any)?.location_id) {
      locationDetails = await (prisma as any).locations.findUnique({
        where: { id: (event as any).location_id },
        select: {
          id: true,
          name: true,
          address: true,
          latitude: true,
          longitude: true,
        },
      });
    }

    if (!event) {
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Transformer l'événement pour inclure latitude et longitude au niveau racine
    const transformedEvent = {
      ...event,
      latitude: locationDetails?.latitude || null,
      longitude: locationDetails?.longitude || null,
      location: locationDetails?.name || null,
      location_address: locationDetails?.address || null,
    };

    return NextResponse.json(transformedEvent);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'événement:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Vérifier l'authentification admin
  const { error, session } = await requireAdminAuth(request);
  if (error) return error;

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
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

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID d'événement invalide" },
        { status: 400 }
      );
    }

    // Validation
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

    // Validation de la date
    const eventDate = new Date(start_date);
    if (eventDate <= new Date()) {
      return NextResponse.json(
        { message: "La date de début doit être dans le futur" },
        { status: 400 }
      );
    }

    // Validation du lieu
    const location = await (prisma as any).locations.findUnique({
      where: { id: location_id },
    });
    if (!location) {
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

      // Vérifier que l'artiste n'est pas déjà programmé sur la même journée (en excluant l'événement actuel)
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
          id: {
            not: id, // Exclure l'événement actuel
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

    const updatedEvent = await (prisma as any).events.update({
      where: { id },
      data: {
        title: title.trim(),
        desc: desc.trim(),
        start_date: eventDate,
        genre: genre as "RAP" | "RNB" | "REGGAE" | "ROCK",
        type: type as "CONCERT" | "ACCOUSTIQUE" | "SHOWCASE" | "OTHER",
        location_id: location_id,
        image_path: image_path?.trim() || null,
        artist_id: artist_id !== null ? Number(artist_id) : null,
      },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            image_path: true,
          },
        },
      },
    });

    // Récupérer les détails de la location séparément
    let locationDetails = null;
    if (location_id) {
      locationDetails = await (prisma as any).locations.findUnique({
        where: { id: location_id },
        select: {
          id: true,
          name: true,
          address: true,
          latitude: true,
          longitude: true,
        },
      });
    }

    // Transformer l'événement pour inclure latitude et longitude au niveau racine
    const transformedEvent = {
      ...updatedEvent,
      latitude: locationDetails?.latitude || null,
      longitude: locationDetails?.longitude || null,
      location: locationDetails?.name || null,
      location_address: locationDetails?.address || null,
    };

    return NextResponse.json(transformedEvent);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'événement:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Vérifier l'authentification admin
  const { error, session } = await requireAdminAuth(request);
  if (error) return error;

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID d'événement invalide" },
        { status: 400 }
      );
    }

    await prisma.events.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Événement supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'événement:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
