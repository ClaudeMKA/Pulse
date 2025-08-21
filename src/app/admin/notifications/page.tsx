"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface EventNotification {
  id: number;
  event_id: number;
  type: "ONE_HOUR_BEFORE" | "TEN_MINUTES_BEFORE";
  title: string;
  message: string;
  is_sent: boolean;
  scheduled_for: string;
  sent_at: string | null;
  created_at: string;
  event: {
    title: string;
    start_date: string;
    location: string | null;
    artist: { name: string } | null;
  };
}

export default function NotificationsPage() {
  const [schedulerStatus, setSchedulerStatus] = useState<string>("Arrêté");
  const [notifications, setNotifications] = useState<EventNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "sent">("all");

  useEffect(() => {
    fetchSchedulerStatus();
    fetchNotifications();
  }, []);

  const fetchSchedulerStatus = async () => {
    try {
      const response = await fetch('/api/cron/status');
      if (response.ok) {
        const data = await response.json();
        setSchedulerStatus(data.status);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du statut:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startScheduler = async () => {
    try {
      const response = await fetch('/api/cron/start-scheduler', {
        method: 'POST',
      });
      
      if (response.ok) {
        setSchedulerStatus("En cours");
        alert('Planificateur démarré !');
      }
    } catch (error) {
      alert('Erreur lors du démarrage');
    }
  };

  const stopScheduler = async () => {
    try {
      const response = await fetch('/api/cron/stop-scheduler', {
        method: 'POST',
      });
      
      if (response.ok) {
        setSchedulerStatus("Arrêté");
        alert('Planificateur arrêté !');
      }
    } catch (error) {
      alert('Erreur lors de l\'arrêt');
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ONE_HOUR_BEFORE": return "1h avant";
      case "TEN_MINUTES_BEFORE": return "10min avant";
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ONE_HOUR_BEFORE": return "bg-blue-100 text-blue-800";
      case "TEN_MINUTES_BEFORE": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (isSent: boolean) => {
    if (isSent) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Envoyée
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        En attente
      </span>
    );
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "pending") return !notification.is_sent;
    if (filter === "sent") return notification.is_sent;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Gestion des Notifications
      </h1>

      {/* Statut du Planificateur */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Statut du Planificateur
        </h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              schedulerStatus === "En cours" ? "bg-green-500" : "bg-red-500"
            }`}></div>
            <span className="text-gray-700">
              Planificateur: {schedulerStatus}
            </span>
          </div>
          
          <button
            onClick={startScheduler}
            disabled={schedulerStatus === "En cours"}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            🚀 Démarrer
          </button>
          
          <button
            onClick={stopScheduler}
            disabled={schedulerStatus === "Arrêté"}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            ⏹️ Arrêter
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filtrer par :</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Toutes les notifications</option>
            <option value="pending">En attente d'envoi</option>
            <option value="sent">Envoyées</option>
          </select>
        </div>
      </div>

      {/* Tableau des Notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filter === "all" ? "Aucune notification" : `Aucune notification ${filter === "pending" ? "en attente" : "envoyée"}`}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === "all" 
                ? "Les notifications apparaîtront ici après création d'événements."
                : "Aucune notification correspondant à ce filtre."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Événement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type de Rappel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Programmé pour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {notification.event.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {notification.event.artist?.name || "Aucun artiste"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {notification.event.location || "Lieu non spécifié"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                        {getTypeLabel(notification.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(notification.scheduled_for).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(notification.is_sent)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {notification.message}
                      </div>
                      {notification.is_sent && notification.sent_at && (
                        <div className="text-xs text-gray-500 mt-1">
                          Envoyée le {new Date(notification.sent_at).toLocaleString('fr-FR')}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistiques */}
      {notifications.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Notifications</p>
                <p className="text-2xl font-semibold text-gray-900">{notifications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">En Attente</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {notifications.filter(n => !n.is_sent).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Envoyées</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {notifications.filter(n => n.is_sent).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Événements</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Set(notifications.map(n => n.event_id)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
