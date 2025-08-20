"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Artist {
  id: number;
  name: string;
  desc: string | null;
  image_path: string | null;
  created_at: string;
  updated_at: string;
}

export default function ArtistsListPage() {
  const router = useRouter();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const response = await fetch("/api/artists");
      if (response.ok) {
        const data = await response.json();
        setArtists(data);
      } else {
        alert("Erreur lors du chargement des artistes");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du chargement des artistes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'artiste "${name}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/artists/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setArtists(prev => prev.filter(artist => artist.id !== id));
        alert("Artiste supprimé avec succès !");
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Une erreur est survenue lors de la suppression");
    }
  };

  const filteredAndSortedArtists = artists
    .filter(artist =>
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (artist.desc && artist.desc.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      if (sortBy === "name") {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else {
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const toggleSort = (field: "name" | "created_at") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des artistes...</p>
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
              Gestion des Artistes
            </h1>
            <p className="text-gray-600">
              {artists.length} artiste{artists.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <Link
            href="/admin/artists/new"
            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            + Nouvel Artiste
          </Link>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Rechercher un artiste
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
                placeholder="Rechercher par nom ou description..."
              />
            </div>
          </div>

          {/* Tri */}
          <div className="flex gap-2">
            <button
              onClick={() => toggleSort("name")}
              className={`px-4 py-2 text-sm font-medium rounded-md border ${
                sortBy === "name"
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Nom
              {sortBy === "name" && (
                <span className="ml-1">
                  {sortOrder === "asc" ? "↑" : "↓"}
                </span>
              )}
            </button>
            <button
              onClick={() => toggleSort("created_at")}
              className={`px-4 py-2 text-sm font-medium rounded-md border ${
                sortBy === "created_at"
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Date
              {sortBy === "created_at" && (
                <span className="ml-1">
                  {sortOrder === "asc" ? "↑" : "↓"}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des artistes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredAndSortedArtists.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? "Aucun artiste trouvé" : "Aucun artiste"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? "Essayez de modifier vos critères de recherche."
                : "Commencez par créer votre premier artiste."
              }
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link
                  href="/admin/artists/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  + Nouvel Artiste
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
                    Artiste
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de création
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière modification
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedArtists.map((artist) => (
                  <tr key={artist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {artist.image_path ? (
                            <img
                              className="h-12 w-12 rounded-full object-cover"
                              src={artist.image_path}
                              alt={artist.name}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {artist.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {artist.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {artist.desc ? (
                          <span className="line-clamp-2">{artist.desc}</span>
                        ) : (
                          <span className="text-gray-400 italic">Aucune description</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(artist.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(artist.updated_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/artists/${artist.id}`}
                          className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-md hover:bg-blue-50"
                        >
                          Voir
                        </Link>
                        <Link
                          href={`/admin/artists/${artist.id}`}
                          className="text-indigo-600 hover:text-indigo-900 px-3 py-1 rounded-md hover:bg-indigo-50"
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() => handleDelete(artist.id, artist.name)}
                          className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistiques */}
      {artists.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Artistes</p>
                <p className="text-2xl font-semibold text-gray-900">{artists.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avec Image</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {artists.filter(a => a.image_path).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ce mois</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {artists.filter(a => {
                    const created = new Date(a.created_at);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
