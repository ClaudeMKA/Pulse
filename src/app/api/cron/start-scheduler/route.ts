import { NextResponse } from "next/server";
import { NotificationScheduler } from "@/lib/notificationScheduler";
import { setSchedulerStatus } from "../status/route";

export async function POST() {
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
