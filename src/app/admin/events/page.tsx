"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Artist {
  id: number;
  name: string;
  image_path: string | null;
}

interface Event {
  id: number;
  title: string;
  desc: string;
  start_date: string;
  genre: "RAP" | "RNB" | "REGGAE" | "ROCK";
  type: "CONCERT" | "FESTIVAL" | "SHOWCASE" | "OTHER";
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  image_path: string | null;
  artist_id: number | null;
  artist: Artist | null;
}

const genreLabels = {
  RAP: "Rap",
  RNB: "R&B",
  REGGAE: "Reggae",
  ROCK: "Rock",
};

const typeLabels = {
  CONCERT: "Concert",
  FESTIVAL: "Festival",
  SHOWCASE: "Showcase",
  OTHER: "Autre",
};

const genreColors = {
  RAP: "bg-blue-100 text-blue-800",
  RNB: "bg-purple-100 text-purple-800",
  REGGAE: "bg-green-100 text-green-800",
  ROCK: "bg-red-100 text-red-800",
};

const typeColors = {
  CONCERT: "bg-indigo-100 text-indigo-800",
  FESTIVAL: "bg-yellow-100 text-yellow-800",
  SHOWCASE: "bg-pink-100 text-pink-800",
  OTHER: "bg-gray-100 text-gray-800",
};

export default function EventsListPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"start_date" | "title" | "genre">("start_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchEvents();
  }, [selectedGenre, selectedType, upcomingOnly]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedGenre) params.append("genre", selectedGenre);
      if (selectedType) params.append("type", selectedType);
      if (upcomingOnly) params.append("upcoming", "true");

      const response = await fetch(`/api/events?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || data);
      } else {
        alert("Erreur lors du chargement des événements");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du chargement des événements");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${title}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEvents(prev => prev.filter(event => event.id !== id));
        alert("Événement supprimé avec succès !");
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Une erreur est survenue lors de la suppression");
    }
  };

  const filteredAndSortedEvents = events
    .filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.desc && event.desc.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      if (sortBy === "title") {
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
      } else if (sortBy === "genre") {
        aValue = a.genre;
        bValue = b.genre;
      } else {
        aValue = new Date(a.start_date);
        bValue = new Date(b.start_date);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const toggleSort = (field: "start_date" | "title" | "genre") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getUpcomingEventsCount = () => {
    return events.filter(event => new Date(event.start_date) > new Date()).length;
  };

  const getPastEventsCount = () => {
    return events.filter(event => new Date(event.start_date) <= new Date()).length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestion des Événements
            </h1>
            <p className="text-gray-600">
              {events.length} événement{events.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <Link
            href="/admin/events/new"
            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            + Nouvel Événement
          </Link>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="lg:col-span-2">
            <label htmlFor="search" className="sr-only">
              Rechercher un événement
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Rechercher par titre, description ou lieu..."
              />
            </div>
          </div>

          {/* Filtre par genre */}
          <div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les genres</option>
              <option value="RAP">Rap</option>
              <option value="RNB">R&B</option>
              <option value="REGGAE">Reggae</option>
              <option value="ROCK">Rock</option>
            </select>
          </div>

          {/* Filtre par type */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="CONCERT">Concert</option>
              <option value="FESTIVAL">Festival</option>
              <option value="SHOWCASE">Showcase</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>
        </div>

        {/* Filtres supplémentaires */}
        <div className="mt-4 flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={upcomingOnly}
              onChange={(e) => setUpcomingOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Événements à venir uniquement</span>
          </label>
        </div>
      </div>

      {/* Tableau des événements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredAndSortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || selectedGenre || selectedType || upcomingOnly ? "Aucun événement trouvé" : "Aucun événement"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedGenre || selectedType || upcomingOnly 
                ? "Essayez de modifier vos critères de recherche."
                : "Commencez par créer votre premier événement."
              }
            </p>
            {!searchTerm && !selectedGenre && !selectedType && !upcomingOnly && (
              <div className="mt-6">
                <Link
                  href="/admin/events/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  + Nouvel Événement
                </Link>
              </div>
            )}
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
                    <button
                      onClick={() => toggleSort("start_date")}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Date</span>
                      {sortBy === "start_date" && (
                        <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => toggleSort("genre")}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Genre</span>
                      {sortBy === "genre" && (
                        <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => toggleSort("title")}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Type</span>
                      {sortBy === "title" && (
                        <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lieu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artiste
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedEvents.map((event) => {
                  const isUpcoming = new Date(event.start_date) > new Date();
                  const isPast = new Date(event.start_date) <= new Date();
                  
                  return (
                    <tr key={event.id} className={`hover:bg-gray-50 ${isPast ? 'opacity-75' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {event.image_path ? (
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={event.image_path}
                                alt={event.title}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-300 flex items-center justify-center">
                                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {event.title}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                              {event.desc}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(event.start_date).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(event.start_date).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {isUpcoming && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            À venir
                          </span>
                        )}
                        {isPast && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            Passé
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${genreColors[event.genre]}`}>
                          {genreLabels[event.genre]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[event.type]}`}>
                          {typeLabels[event.type]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.location || "Non spécifié"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {event.artist ? (
                          <div className="flex items-center">
                            {event.artist.image_path && (
                              <img
                                className="h-8 w-8 rounded-full object-cover mr-2"
                                src={event.artist.image_path}
                                alt={event.artist.name}
                              />
                            )}
                            <Link
                              href={`/admin/artists/${event.artist.id}`}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              {event.artist.name}
                            </Link>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Aucun artiste</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/events/${event.id}`}
                            className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-md hover:bg-blue-50"
                          >
                            Voir
                          </Link>
                          <Link
                            href={`/admin/events/${event.id}`}
                            className="text-indigo-600 hover:text-indigo-900 px-3 py-1 rounded-md hover:bg-indigo-50"
                          >
                            Modifier
                          </Link>
                          <button
                            onClick={() => handleDelete(event.id, event.title)}
                            className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md hover:bg-red-50"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistiques */}
      {events.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Événements</p>
                <p className="text-2xl font-semibold text-gray-900">{events.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">À venir</p>
                <p className="text-2xl font-semibold text-gray-900">{getUpcomingEventsCount()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Passés</p>
                <p className="text-2xl font-semibold text-gray-900">{getPastEventsCount()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avec Artiste</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {events.filter(e => e.artist).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
