import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID d'artiste invalide" },
        { status: 400 }
      );
    }

    const artist = await prisma.artists.findUnique({
      where: { id },
    });

    if (!artist) {
      return NextResponse.json(
        { message: "Artiste non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(artist);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'artiste:", error);
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
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { name, desc, image_path } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID d'artiste invalide" },
        { status: 400 }
      );
    }

    // Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { message: "Le nom de l'artiste est requis et doit contenir au moins 2 caractères" },
        { status: 400 }
      );
    }

    const updatedArtist = await prisma.artists.update({
      where: { id },
      data: {
        name: name.trim(),
        desc: desc?.trim() || null,
        image_path: image_path?.trim() || null,
      },
    });

    return NextResponse.json(updatedArtist);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'artiste:", error);
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
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID d'artiste invalide" },
        { status: 400 }
      );
    }

    await prisma.artists.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Artiste supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'artiste:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
