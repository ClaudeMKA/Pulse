"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PrimaryButton, SecondaryButton, DangerButton, LinkButton } from "@/components/ui/buttons";

interface Location {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  events: Array<{
    id: number;
    title: string;
    start_date: string;
  }>;
  stands: Array<{
    id: number;
    name: string;
    type: string;
  }>;
}

export default function LocationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.id as string;

  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (locationId) {
      fetchLocation();
    }
  }, [locationId]);

  const fetchLocation = async () => {
    try {
      const response = await fetch(`/api/locations/${locationId}`);
      if (response.ok) {
        const data = await response.json();
        setLocation(data);
        setFormData({
          name: data.name,
          address: data.address || "",
          latitude: data.latitude?.toString() || "",
          longitude: data.longitude?.toString() || "",
        });
      } else {
        alert("Lieu non trouvé");
        router.push("/admin/locations");
      }
    } catch (error) {
      console.error("Erreur lors du chargement du lieu:", error);
      alert("Erreur lors du chargement du lieu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom du lieu est requis";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères";
    }

    if (formData.latitude && (isNaN(Number(formData.latitude)) || Number(formData.latitude) < -90 || Number(formData.latitude) > 90)) {
      newErrors.latitude = "La latitude doit être entre -90 et 90";
    }

    if (formData.longitude && (isNaN(Number(formData.longitude)) || Number(formData.longitude) < -180 || Number(formData.longitude) > 180)) {
      newErrors.longitude = "La longitude doit être entre -180 et 180";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/locations/${locationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          address: formData.address.trim() || null,
          latitude: formData.latitude ? Number(formData.latitude) : null,
          longitude: formData.longitude ? Number(formData.longitude) : null,
        }),
      });

      if (response.ok) {
        const updatedLocation = await response.json();
        setLocation(updatedLocation);
        setIsEditing(false);
        alert("Lieu mis à jour avec succès");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce lieu ?")) return;

    try {
      const response = await fetch(`/api/locations/${locationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/locations");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du lieu...</p>
        </div>
      </div>
    );
  }

  if (!location) {
    return <div>Lieu non trouvé</div>;
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto p-6">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isEditing ? "Modifier le lieu" : location.name}
              </h1>
              <p className="text-gray-600">
                {isEditing 
                  ? "Modifiez les informations du lieu"
                  : "Détails et informations du lieu"
                }
              </p>
            </div>
            <div className="flex space-x-3">
              {!isEditing && (
                <>
                  <SecondaryButton
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="lg"
                  >
                    Modifier
                  </SecondaryButton>
                  <DangerButton
                    onClick={handleDelete}
                    size="lg"
                  >
                    Supprimer
                  </DangerButton>
                </>
              )}
              <LinkButton
                href="/admin/locations"
                variant="secondary"
                size="lg"
              >
                Retour
              </LinkButton>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informations du lieu
              </h2>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du lieu *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                        Latitude
                      </label>
                      <input
                        type="number"
                        id="latitude"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        step="any"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.latitude ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.latitude && (
                        <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                        Longitude
                      </label>
                      <input
                        type="number"
                        id="longitude"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        step="any"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.longitude ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.longitude && (
                        <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <SecondaryButton
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      disabled={isSaving}
                    >
                      Annuler
                    </SecondaryButton>
                    <PrimaryButton
                      onClick={handleSave}
                      disabled={isSaving}
                      icon={
                        isSaving ? (
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )
                      }
                    >
                      {isSaving ? "Sauvegarde..." : "Sauvegarder"}
                    </PrimaryButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nom</label>
                    <p className="mt-1 text-sm text-gray-900">{location.name}</p>
                  </div>

                  {location.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Adresse</label>
                      <p className="mt-1 text-sm text-gray-900">{location.address}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Latitude</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {location.latitude || "Non définie"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Longitude</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {location.longitude || "Non définie"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Créé le</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(location.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Modifié le</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(location.updated_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar avec statistiques */}
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Événements</span>
                  <span className="text-sm font-medium text-gray-900">{location.events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Stands</span>
                  <span className="text-sm font-medium text-gray-900">{location.stands.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Coordonnées GPS</span>
                  <span className="text-sm font-medium text-gray-900">
                    {location.latitude && location.longitude ? "Oui" : "Non"}
                  </span>
                </div>
              </div>
            </div>

            {/* Événements récents */}
            {location.events.length > 0 && (
              <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Événements récents</h3>
                <div className="space-y-3">
                  {location.events.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(event.start_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <LinkButton
                        href={`/admin/events/${event.id}`}
                        variant="secondary"
                        size="sm"
                      >
                        Voir
                      </LinkButton>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stands */}
            {location.stands.length > 0 && (
              <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Stands</h3>
                <div className="space-y-3">
                  {location.stands.slice(0, 5).map((stand) => (
                    <div key={stand.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {stand.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {stand.type}
                        </p>
                      </div>
                      <LinkButton
                        href={`/admin/stands/${stand.id}`}
                        variant="secondary"
                        size="sm"
                      >
                        Voir
                      </LinkButton>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
