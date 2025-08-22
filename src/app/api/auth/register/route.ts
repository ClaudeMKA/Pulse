import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();
    
    if (!username || !email || !password) {
      return NextResponse.json({ message: "Tous les champs sont requis" }, { status: 400 });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.users.create({
      data: { username: username.toLowerCase(), email: email.toLowerCase(), password: hashedPassword, role: "ADMIN" } // pour avoir full access
    });
    
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ message: "Compte créé", user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
