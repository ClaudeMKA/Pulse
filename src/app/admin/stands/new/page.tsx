"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Location {
  id: number;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface Event {
  id: number;
  title: string;
}

export default function NewStandPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location_id: "",
    event_id: "",
    type: "FOOD",
    opened_at: "",
    closed_at: "",
  });

  useEffect(() => {
    Promise.all([fetchEvents(), fetchLocations()]);
  }, []);

  const fetchEvents = async () => {
    try {
      console.log("Fetching events...");
      const response = await fetch("/api/events");
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Events data:", data);
        // L'API retourne {events, pagination}
        setEvents(Array.isArray(data.events) ? data.events : []);
      } else {
        console.error("Response not ok:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error);
      setEvents([]);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations");
      if (response.ok) {
        const data = await response.json();
        // L'API retourne { locations: [...], pagination: {...} }
        setLocations(data.locations || data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des lieux:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/stands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          location_id: formData.location_id ? parseInt(formData.location_id) : null,
          event_id: formData.event_id ? parseInt(formData.event_id) : null,
          opened_at: formData.opened_at ? new Date(formData.opened_at).toISOString() : null,
          closed_at: formData.closed_at ? new Date(formData.closed_at).toISOString() : null,
        }),
      });

      if (response.ok) {
        alert("Stand créé avec succès !");
        router.push("/admin/stands");
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      alert("Une erreur est survenue lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/admin" className="hover:text-gray-700">Dashboard</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/admin/stands" className="hover:text-gray-700">Stands</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>Nouveau</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Créer un nouveau stand</h1>
        <p className="text-gray-600 mt-2">
          Ajoutez les informations du nouveau stand à votre plateforme.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom du stand *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nom du stand"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description détaillée du stand..."
            />
          </div>

          {/* Lieu */}
          <div>
            <label htmlFor="location_id" className="block text-sm font-medium text-gray-700 mb-2">
              Lieu *
            </label>
            <select
              id="location_id"
              name="location_id"
              value={formData.location_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner un lieu</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} {location.address ? `- ${location.address}` : ""}
                </option>
              ))}
            </select>
            <div className="mt-2">
              <Link
                href="/admin/locations/new"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Créer un nouveau lieu
              </Link>
            </div>
          </div>

          {/* Type de stand */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Type de stand *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="FOOD">Nourriture</option>
              <option value="ACTIVITE">Activité</option>
              <option value="TATOOS">Tatouages</option>
              <option value="SOUVENIRS">Souvenirs</option>
              <option value="MERCH">Merchandising</option>
            </select>
          </div>

          {/* Horaires d'ouverture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="opened_at" className="block text-sm font-medium text-gray-700 mb-2">
                Heure d'ouverture *
              </label>
              <input
                type="datetime-local"
                id="opened_at"
                name="opened_at"
                value={formData.opened_at}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="closed_at" className="block text-sm font-medium text-gray-700 mb-2">
                Heure de fermeture *
              </label>
              <input
                type="datetime-local"
                id="closed_at"
                name="closed_at"
                value={formData.closed_at}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Événement associé */}
          <div>
            <label htmlFor="event_id" className="block text-sm font-medium text-gray-700 mb-2">
              Événement associé
            </label>
            <select
              id="event_id"
              name="event_id"
              value={formData.event_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner un événement (optionnel)</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Vous pouvez laisser ce champ vide si le stand n'est pas lié à un événement spécifique.
            </p>
          </div>

          {/* Boutons */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <Link
              href="/admin/stands"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </div>
              ) : (
                "Créer le stand"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}