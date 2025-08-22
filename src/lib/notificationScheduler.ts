import { prisma } from "./prisma";

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
              participants: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      username: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      for (const notification of notifications) {
        try {
          // Récupérer uniquement les participants inscrits à l'événement
          const participants = notification.event.participants;

          if (participants.length === 0) {
            console.log(`Aucun participant inscrit pour l'événement ${notification.event.title}`);
          } else {
            // Créer des notifications dans l'app pour chaque participant
            await Promise.all(
              participants.map(participant =>
                prisma.notifications.create({
                  data: {
                    user_id: participant.user.id,
                    title: notification.title,
                    message: notification.message,
                    type: "INFO",
                  },
                })
              )
            );

            // TODO: Envoyer les emails (fonctionnalité désactivée temporairement)
            console.log(`Notification envoyée à ${participants.length} participants de l'événement ${notification.event.title}`);
          }

          // Marquer comme envoyée
          await prisma.eventNotifications.update({
            where: { id: notification.id },
            data: {
              is_sent: true,
              sent_at: now,
            },
          });

          console.log(`Notification ${notification.id} traitée avec succès`);
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
      clearInterval(cronJob);
    }

    // Vérifier toutes les minutes (60000ms)
    cronJob = setInterval(() => {
      this.sendScheduledNotifications();
    }, 60000);

    console.log("Planificateur de notifications démarré");
  }

  static stopScheduler() {
    if (cronJob) {
      clearInterval(cronJob);
      cronJob = null;
    }

    console.log("Planificateur de notifications arrêté");
  }

  static getStatus() {
    return cronJob ? "En cours" : "Arrêté";
  }
}