"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Stand {
  id: number;
  name: string;
  description: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  location_address: string | null;
  event_id: number | null;
  event?: {
    id: number;
    title: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export default function StandDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [stand, setStand] = useState<Stand | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchStand(Number(params.id));
    }
  }, [params.id]);

  const fetchStand = async (id: number) => {
    try {
      const response = await fetch(`/api/stands/${id}`);
      if (response.ok) {
        const data = await response.json();
        setStand(data);
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

  const handleDelete = async () => {
    if (!stand) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le stand "${stand.name}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/stands/${stand.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Stand supprimé avec succès !");
        router.push("/admin/stands");
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Une erreur est survenue lors de la suppression");
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

  if (!stand) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Stand introuvable</h1>
          <p className="text-gray-600 mt-2">Le stand demandé n'existe pas.</p>
          <Link
            href="/admin/stands"
            className="inline-block mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Retour aux stands
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Breadcrumb */}
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
          <span>{stand.name}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{stand.name}</h1>
            <p className="text-gray-600 mt-1">ID: {stand.id}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href={`/admin/stands/${stand.id}/edit`}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Détails du stand */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Informations du stand</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{stand.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Localisation</h3>
                <p className="text-gray-900">{stand.location || "Non spécifié"}</p>
                {stand.location_address && (
                  <p className="text-gray-600 text-sm mt-1">{stand.location_address}</p>
                )}
                {(stand.latitude && stand.longitude) && (
                  <p className="text-gray-600 text-sm mt-1">
                    Coordonnées GPS: {stand.latitude}, {stand.longitude}
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Événement associé</h3>
                {stand.event ? (
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/events/${stand.event.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {stand.event.title}
                    </Link>
                    <span className="text-gray-500">(ID: {stand.event.id})</span>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Aucun événement associé</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar avec métadonnées */}
        <div className="space-y-6">
          {/* Métadonnées */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Métadonnées</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date de création</h3>
                <p className="text-gray-900 mt-1">
                  {new Date(stand.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Dernière modification</h3>
                <p className="text-gray-900 mt-1">
                  {new Date(stand.updated_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Actions</h2>
            </div>
            
            <div className="p-6 space-y-3">
              <Link
                href={`/admin/stands/${stand.id}/edit`}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier le stand
              </Link>
              
              <Link
                href="/admin/stands"
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à la liste
              </Link>
              
              <button
                onClick={handleDelete}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Supprimer le stand
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}