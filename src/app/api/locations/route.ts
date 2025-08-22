import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  // Vérifier l'authentification admin
  const { error, session } = await requireAdminAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { name, address, latitude, longitude } = body;

    // Validation côté serveur
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { message: "Le nom du lieu est requis et doit contenir au moins 2 caractères" },
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

    // Créer le lieu
    const location = await prisma.locations.create({
      data: {
        name: name.trim(),
        address: address?.trim() || null,
        latitude: latitude !== null ? Number(latitude) : null,
        longitude: longitude !== null ? Number(longitude) : null,
      },
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du lieu:", error);
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
    const limit = parseInt(searchParams.get("limit") || "100");
    const search = searchParams.get("search") || "";
    const hasCoordinates = searchParams.get("hasCoordinates");

    // Construire les filtres
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    if (hasCoordinates === "true") {
      where.AND = [
        { latitude: { not: null } },
        { longitude: { not: null } },
      ];
    } else if (hasCoordinates === "false") {
      where.OR = [
        { latitude: null },
        { longitude: null },
      ];
    }

    // Calculer le skip pour la pagination
    const skip = (page - 1) * limit;

    // Récupérer les lieux avec pagination
    const [locations, total] = await Promise.all([
      prisma.locations.findMany({
        where,
        orderBy: {
          name: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.locations.count({ where }),
    ]);

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      locations,
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
    console.error("Erreur lors de la récupération des lieux:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
