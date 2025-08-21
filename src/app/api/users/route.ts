import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  // Vérifier l'authentification admin
  const { error, session } = await requireAdminAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { username, email, password, role = "USER" } = body;

    // Validation côté serveur
    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return NextResponse.json(
        { message: "Le nom d'utilisateur est requis et doit contenir au moins 3 caractères" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { message: "L'email est requis et doit être valide" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { message: "Le mot de passe est requis et doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    if (role && !["ADMIN", "USER"].includes(role)) {
      return NextResponse.json(
        { message: "Le rôle doit être ADMIN ou USER" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { username: username.toLowerCase().trim() },
          { email: email.toLowerCase().trim() }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Un utilisateur avec ce nom d'utilisateur ou cet email existe déjà" },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = await prisma.users.create({
      data: {
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role as "ADMIN" | "USER",
      },
    });

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
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
    const role = searchParams.get("role") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Validation des paramètres
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { message: "Paramètres de pagination invalides" },
        { status: 400 }
      );
    }

    // Construire les filtres
    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role && role !== "all") {
      where.role = role;
    }

    // Validation du tri
    const validSortFields = ["username", "email", "role", "created_at", "updated_at"];
    const validSortOrders = ["asc", "desc"];
    
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json(
        { message: "Champ de tri invalide" },
        { status: 400 }
      );
    }

    if (!validSortOrders.includes(sortOrder)) {
      return NextResponse.json(
        { message: "Ordre de tri invalide" },
        { status: 400 }
      );
    }

    // Construire l'objet de tri
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Calculer le skip pour la pagination
    const skip = (page - 1) * limit;

    // Récupérer les utilisateurs avec pagination
    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          created_at: true,
          updated_at: true,
          // Exclure le mot de passe
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.users.count({ where }),
    ]);

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      users,
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
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
        { message: "ID d'utilisateur invalide" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { username, email, role, password } = body;

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.users.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (username !== undefined) {
      if (typeof username !== "string" || username.trim().length < 3) {
        return NextResponse.json(
          { message: "Le nom d'utilisateur doit contenir au moins 3 caractères" },
          { status: 400 }
        );
      }
      updateData.username = username.toLowerCase().trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !email.includes("@")) {
        return NextResponse.json(
          { message: "L'email doit être valide" },
          { status: 400 }
        );
      }
      updateData.email = email.toLowerCase().trim();
    }

    if (role !== undefined) {
      if (!["ADMIN", "USER"].includes(role)) {
        return NextResponse.json(
          { message: "Le rôle doit être ADMIN ou USER" },
          { status: 400 }
        );
      }
      updateData.role = role;
    }

    if (password !== undefined) {
      if (typeof password !== "string" || password.length < 6) {
        return NextResponse.json(
          { message: "Le mot de passe doit contenir au moins 6 caractères" },
          { status: 400 }
        );
      }
      const bcrypt = await import("bcryptjs");
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Vérifier les doublons si username ou email changent
    if (updateData.username || updateData.email) {
      const duplicateCheck = await prisma.users.findFirst({
        where: {
          OR: [
            ...(updateData.username ? [{ username: updateData.username }] : []),
            ...(updateData.email ? [{ email: updateData.email }] : []),
          ],
          NOT: { id },
        },
      });

      if (duplicateCheck) {
        return NextResponse.json(
          { message: "Un utilisateur avec ce nom d'utilisateur ou cet email existe déjà" },
          { status: 409 }
        );
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.users.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
        // Exclure le mot de passe
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
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
        { message: "ID d'utilisateur invalide" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.users.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Empêcher la suppression de son propre compte
    if (session?.user?.id && parseInt(session.user.id) === id) {
      return NextResponse.json(
        { message: "Vous ne pouvez pas supprimer votre propre compte" },
        { status: 400 }
      );
    }

    // Supprimer l'utilisateur
    await prisma.users.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Utilisateur supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
