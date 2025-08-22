import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID de lieu invalide" },
        { status: 400 }
      );
    }

    const location = await prisma.locations.findUnique({
      where: { id },
      include: {
        events: {
          select: {
            id: true,
            title: true,
            start_date: true,
          },
        },
        stands: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    if (!location) {
      return NextResponse.json(
        { message: "Lieu non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error("Erreur lors de la récupération du lieu:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Vérifier l'authentification admin
  const { error, session } = await requireAdminAuth(request);
  if (error) return error;

  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID de lieu invalide" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, address, latitude, longitude } = body;

    // Vérifier que le lieu existe
    const existingLocation = await prisma.locations.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      return NextResponse.json(
        { message: "Lieu non trouvé" },
        { status: 404 }
      );
    }

    // Validation côté serveur
    if (name !== undefined && (!name || typeof name !== "string" || name.trim().length < 2)) {
      return NextResponse.json(
        { message: "Le nom du lieu doit contenir au moins 2 caractères" },
        { status: 400 }
      );
    }

    // Validation des coordonnées GPS si fournies
    if (latitude !== undefined && latitude !== null && (isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90)) {
      return NextResponse.json(
        { message: "La latitude doit être entre -90 et 90" },
        { status: 400 }
      );
    }

    if (longitude !== undefined && longitude !== null && (isNaN(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180)) {
      return NextResponse.json(
        { message: "La longitude doit être entre -180 et 180" },
        { status: 400 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (address !== undefined) {
      updateData.address = address?.trim() || null;
    }

    if (latitude !== undefined) {
      updateData.latitude = latitude !== null ? Number(latitude) : null;
    }

    if (longitude !== undefined) {
      updateData.longitude = longitude !== null ? Number(longitude) : null;
    }

    // Mettre à jour le lieu
    const updatedLocation = await prisma.locations.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedLocation);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du lieu:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Vérifier l'authentification admin
  const { error, session } = await requireAdminAuth(request);
  if (error) return error;

  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID de lieu invalide" },
        { status: 400 }
      );
    }

    // Vérifier que le lieu existe
    const existingLocation = await prisma.locations.findUnique({
      where: { id },
      include: {
        events: {
          select: { id: true },
        },
        stands: {
          select: { id: true },
        },
      },
    });

    if (!existingLocation) {
      return NextResponse.json(
        { message: "Lieu non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier s'il y a des événements ou stands liés
    if (existingLocation.events.length > 0 || existingLocation.stands.length > 0) {
      return NextResponse.json(
        { 
          message: "Impossible de supprimer ce lieu car il est utilisé par des événements ou des stands",
          eventsCount: existingLocation.events.length,
          standsCount: existingLocation.stands.length,
        },
        { status: 409 }
      );
    }

    // Supprimer le lieu
    await prisma.locations.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Lieu supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression du lieu:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
