import { NextRequest, NextResponse } from "next/server";
import { NotificationScheduler } from "@/lib/notificationScheduler";
import { setSchedulerStatus } from "../status/route";
import { requireAdminAuth } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  // Vérifier l'authentification admin
  const { error, session } = await requireAdminAuth(request);
  if (error) return error;
  try {
    NotificationScheduler.startScheduler();
    setSchedulerStatus("En cours");
    return NextResponse.json({ message: "Planificateur démarré" });
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur lors du démarrage du planificateur" },
      { status: 500 }
    );
  }
}
