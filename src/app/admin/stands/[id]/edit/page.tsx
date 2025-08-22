"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Stand {
  id: number;
  name: string;
  description: string;
  location: string;
  event_id: number | null;
  event?: {
    id: number;
    title: string;
  } | null;
  created_at: string;
  updated_at: string;
}

interface Event {
  id: number;
  title: string;
}

export default function EditStandPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    event_id: "",
  });

  useEffect(() => {
    if (params.id) {
      Promise.all([
        fetchStand(Number(params.id)),
        fetchEvents()
      ]);
    }
  }, [params.id]);

  const fetchStand = async (id: number) => {
    try {
      const response = await fetch(`/api/stands/${id}`);
      if (response.ok) {
        const stand: Stand = await response.json();
        setFormData({
          name: stand.name,
          description: stand.description,
          location: stand.location,
          event_id: stand.event_id ? stand.event_id.toString() : "",
        });
      } else if (response.status === 404) {
        alert("Stand introuvable");
        router.push("/admin/stands");
      } else {
        alert("Erreur lors du chargement du stand");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du chargement du stand");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(Array.isArray(data.events) ? data.events : []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error);
      setEvents([]);
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
      const response = await fetch(`/api/stands/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          event_id: formData.event_id ? parseInt(formData.event_id) : null,
        }),
      });

      if (response.ok) {
        alert("Stand modifié avec succès !");
        router.push(`/admin/stands/${params.id}`);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      alert("Une erreur est survenue lors de la modification");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du stand...</p>
        </div>
      </div>
    );
  }

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
          <Link href={`/admin/stands/${params.id}`} className="hover:text-gray-700">
            {formData.name || `Stand #${params.id}`}
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>Modifier</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Modifier le stand</h1>
        <p className="text-gray-600 mt-2">
          Modifiez les informations du stand.
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

          {/* Localisation */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Localisation *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Emplacement du stand"
            />
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
              href={`/admin/stands/${params.id}`}
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
                  Modification...
                </div>
              ) : (
                "Enregistrer les modifications"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}