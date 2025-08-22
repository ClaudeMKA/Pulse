export interface NotificationData {
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  user_id?: number;
  send_to_all?: boolean;
}

export class NotificationService {
  static async createNotification(data: NotificationData) {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur NotificationService.createNotification:', error);
      throw error;
    }
  }

  static async getUserNotifications(userId?: number) {
    try {
      const url = userId ? `/api/notifications?user_id=${userId}` : '/api/notifications';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des notifications');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur NotificationService.getUserNotifications:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId: number, read: boolean = true) {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur NotificationService.markAsRead:', error);
      throw error;
    }
  }

  static async deleteNotification(notificationId: number) {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur NotificationService.deleteNotification:', error);
      throw error;
    }
  }

  // Créer des notifications prédéfinies pour certains événements
  static async notifyNewEvent(eventTitle: string) {
    return this.createNotification({
      title: 'Nouvel événement disponible !',
      message: `Un nouvel événement "${eventTitle}" vient d'être ajouté à la programmation. Ne le ratez pas !`,
      type: 'INFO',
      send_to_all: true,
    });
  }

  static async notifyEventCancelled(eventTitle: string) {
    return this.createNotification({
      title: 'Événement annulé',
      message: `L'événement "${eventTitle}" a été annulé. Nous nous excusons pour la gêne occasionnée.`,
      type: 'ERROR',
      send_to_all: true,
    });
  }

  static async notifyEventUpdate(eventTitle: string) {
    return this.createNotification({
      title: 'Mise à jour d\'événement',
      message: `L'événement "${eventTitle}" a été mis à jour. Consultez les nouveaux détails.`,
      type: 'WARNING',
      send_to_all: true,
    });
  }

  static async notifySystemMaintenance() {
    return this.createNotification({
      title: 'Maintenance prévue',
      message: 'Une maintenance système est prévue ce weekend. Le site pourrait être temporairement indisponible.',
      type: 'WARNING',
      send_to_all: true,
    });
  }
}

// Utilitaires pour les types de notifications
export const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'INFO':
      return '🔵';
    case 'SUCCESS':
      return '✅';
    case 'WARNING':
      return '⚠️';
    case 'ERROR':
      return '❌';
    default:
      return '📢';
  }
};

export const getNotificationColor = (type: string) => {
  switch (type) {
    case 'INFO':
      return 'blue';
    case 'SUCCESS':
      return 'green';
    case 'WARNING':
      return 'yellow';
    case 'ERROR':
      return 'red';
    default:
      return 'gray';
  }
};