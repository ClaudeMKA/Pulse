import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, desc, image_path } = body;

    // Validation côté serveur
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { message: "Le nom de l'artiste est requis et doit contenir au moins 2 caractères" },
        { status: 400 }
      );
    }

    // Créer l'artiste
    const artist = await prisma.artists.create({
      data: {
        name: name.trim(),
        desc: desc?.trim() || null,
        image_path: image_path?.trim() || null,
      },
    });

    return NextResponse.json(artist, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'artiste:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const artists = await prisma.artists.findMany({
      include: {
        events: {
          orderBy: {
            start_date: "asc",
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(artists);
  } catch (error) {
    console.error("Erreur lors de la récupération des artistes:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
