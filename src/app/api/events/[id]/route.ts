import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { requireAdminAuth } from "../../../../../lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

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

    if (!event) {
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
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
  const { error } = await requireAdminAuth(request);
  if (error) return error;

  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
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

    // Validation de la date
    const eventDate = new Date(start_date);
    if (eventDate <= new Date()) {
      return NextResponse.json(
        { message: "La date de début doit être dans le futur" },
        { status: 400 }
      );
    }

    // Validation des coordonnées GPS
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

    const updatedEvent = await prisma.events.update({
      where: { id },
      data: {
        title: title.trim(),
        desc: desc.trim(),
        start_date: eventDate,
        genre: genre as "RAP" | "RNB" | "REGGAE" | "ROCK",
        type: type as "CONCERT" | "FESTIVAL" | "SHOWCASE" | "OTHER",
        location: location.trim(),
        latitude: latitude !== null ? Number(latitude) : null,
        longitude: longitude !== null ? Number(longitude) : null,
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

    return NextResponse.json(updatedEvent);
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
  const { error } = await requireAdminAuth(request);
  if (error) return error;

  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

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
