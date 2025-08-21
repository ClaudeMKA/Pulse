import cron from "node-cron";
import { prisma } from "./prisma";
import { sendEventReminder } from "./email";

// Utiliser any pour éviter les problèmes de types
let cronJob: any = null;

export class NotificationScheduler {
  static async scheduleEventNotifications(eventId: number) {
    try {
      // Récupérer l'événement avec l'artiste
      const event = await prisma.events.findUnique({
        where: { id: eventId },
        include: { artist: true },
      });

      if (!event) return;

      const eventDate = new Date(event.start_date);
      const oneHourBefore = new Date(eventDate.getTime() - 60 * 60 * 1000);
      const tenMinutesBefore = new Date(eventDate.getTime() - 10 * 60 * 1000);

      // Créer les notifications planifiées
      await Promise.all([
        prisma.eventNotifications.create({
          data: {
            event_id: eventId,
            type: "ONE_HOUR_BEFORE",
            title: "Rappel événement",
            message: `${event.artist?.name || "Artiste"} joue dans 1h, ${event.location || "Lieu non spécifié"}`,
            scheduled_for: oneHourBefore,
          },
        }),
        prisma.eventNotifications.create({
          data: {
            event_id: eventId,
            type: "TEN_MINUTES_BEFORE",
            title: "Rappel événement",
            message: `${event.artist?.name || "Artiste"} joue dans 10min, ${event.location || "Lieu non spécifié"}`,
            scheduled_for: tenMinutesBefore,
          },
        }),
      ]);

      console.log(`Notifications planifiées pour l'événement ${eventId}`);
    } catch (error) {
      console.error("Erreur lors de la planification des notifications:", error);
    }
  }

  static async sendScheduledNotifications() {
    try {
      const now = new Date();
      const notifications = await prisma.eventNotifications.findMany({
        where: {
          is_sent: false,
          scheduled_for: {
            lte: now,
          },
        },
        include: {
          event: {
            include: {
              artist: true,
            },
          },
        },
      });

      for (const notification of notifications) {
        try {
          // Récupérer tous les utilisateurs
          const users = await prisma.users.findMany({
            select: { email: true },
          });

          // Envoyer les emails avec plus de détails
          const emailPromises = users.map(user =>
            sendEventReminder(
              user.email,
              notification.event.title,
              notification.event.artist?.name || "Artiste", // ← String par défaut
              notification.event.location || "Lieu non spécifié", // ← String par défaut
              notification.type === "ONE_HOUR_BEFORE" ? "1h" : "10min"
            )
          );

          await Promise.all(emailPromises);

          // Marquer comme envoyée
          await prisma.eventNotifications.update({
            where: { id: notification.id },
            data: {
              is_sent: true,
              sent_at: now,
            },
          });

          console.log(`Notification ${notification.id} envoyée avec succès`);
        } catch (error) {
          console.error(`Erreur lors de l'envoi de la notification ${notification.id}:`, error);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi des notifications planifiées:", error);
    }
  }

  static startScheduler() {
    if (cronJob) {
      cronJob.stop();
    }

    // Vérifier toutes les minutes
    cronJob = cron.schedule("* * * * *", () => {
      this.sendScheduledNotifications();
    });

    console.log("Planificateur de notifications démarré");
  }

  static stopScheduler() {
    if (cronJob) {
      cronJob.stop();
      cronJob = null;
    }

    // Mettre à jour le statut
    const { setSchedulerStatus } = require("../src/app/api/cron/status/route");
    setSchedulerStatus("Arrêté");

    console.log("Planificateur de notifications arrêté");
  }

  static getStatus() {
    return cronJob ? "En cours" : "Arrêté";
  }
}