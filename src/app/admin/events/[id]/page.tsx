"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Artist {
  id: number;
  name: string;
  image_path: string | null;
}

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
  desc: string;
  start_date: string;
  genre: "RAP" | "RNB" | "REGGAE" | "ROCK";
  type: "CONCERT" | "ACCOUSTIQUE" | "SHOWCASE" | "OTHER";
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  image_path: string | null;
  artist_id: number | null;
  location_id: number | null;
  artist: Artist | null;
}

interface EventFormData {
  title: string;
  desc: string;
  start_date: string;
  genre: "RAP" | "RNB" | "REGGAE" | "ROCK";
  type: "CONCERT" | "ACCOUSTIQUE" | "SHOWCASE" | "OTHER";
  location_id: string;
  image_path: string;
  artist_id: string;
}

const genreLabels = {
  RAP: "Rap",
  RNB: "R&B",
  REGGAE: "Reggae",
  ROCK: "Rock",
};

const typeLabels = {
  CONCERT: "Concert",
  ACCOUSTIQUE: "Accoustique",
  SHOWCASE: "Showcase",
  OTHER: "Autre",
};

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    desc: "",
    start_date: "",
    genre: "RAP",
    type: "CONCERT",
    location_id: "",
    image_path: "",
    artist_id: "",
  });
  const [errors, setErrors] = useState<Partial<EventFormData>>({});
  const [generalError, setGeneralError] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    if (params.id) {
      fetchEvent();
      fetchArtists();
      fetchLocations();
    }
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`);
      if (response.ok) {
        const eventData = await response.json();
        setEvent(eventData);
        setFormData({
          title: eventData.title,
          desc: eventData.desc,
          start_date: new Date(eventData.start_date).toISOString().slice(0, 16),
          genre: eventData.genre,
          type: eventData.type,
          location_id: eventData.location_id?.toString() || "",
          image_path: eventData.image_path || "",
          artist_id: eventData.artist_id?.toString() || "",
        });
        setPreviewImage(eventData.image_path || "");
      } else {
        alert("Erreur lors du chargement de l'événement");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du chargement de l'événement");
    } finally {
      setIsLoading(false);
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

  const getLocationDisplayName = (locationId: number | null) => {
    if (!locationId) return "Non spécifié";
    if (!Array.isArray(locations)) return "Chargement des lieux...";
    const location = locations.find(loc => loc.id === locationId);
    if (!location) return "Lieu inconnu";
    return location.address ? `${location.name} - ${location.address}` : location.name;
  };

  const fetchArtists = async () => {
    try {
      const response = await fetch("/api/artists");
      if (response.ok) {
        const data = await response.json();
        setArtists(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des artistes:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof EventFormData]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image valide");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 5MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "events");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({ ...prev, image_path: result.path }));
        setPreviewImage(result.path);
      } else {
        const error = await response.json();
        alert(`Erreur upload: ${error.message}`);
      }
    } catch (error) {
      console.error("Erreur upload:", error);
      alert("Erreur lors de l'upload de l'image");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EventFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Le titre de l'événement est requis";
    }

    if (formData.title.trim().length < 3) {
      newErrors.title = "Le titre doit contenir au moins 3 caractères";
    }

    if (!formData.desc.trim()) {
      newErrors.desc = "La description est requise";
    }

    if (formData.desc.trim().length < 10) {
      newErrors.desc = "La description doit contenir au moins 10 caractères";
    }

    if (!formData.start_date) {
      newErrors.start_date = "La date de début est requise";
    }

    if (new Date(formData.start_date) <= new Date()) {
      newErrors.start_date = "La date de début doit être dans le futur";
    }

    if (!formData.location_id) {
      newErrors.location_id = "Le lieu est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Effacer les erreurs précédentes
    setErrors({});
    setGeneralError("");
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const eventData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        location_id: formData.location_id ? parseInt(formData.location_id) : null,
        artist_id: formData.artist_id ? parseInt(formData.artist_id) : null,
      };

      const response = await fetch(`/api/events/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        setEvent(updatedEvent);
        setIsEditing(false);
        alert("Événement mis à jour avec succès !");
      } else {
        const error = await response.json();
        // Afficher l'erreur dans l'interface au lieu d'un alert
        setGeneralError(error.message);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Une erreur est survenue lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/events/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Événement supprimé avec succès !");
        router.push("/admin/events");
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Une erreur est survenue lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'événement...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Événement non trouvé
          </h1>
          <Link
            href="/admin/events"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Retour à la liste des événements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditing ? "Modifier l'événement" : event.title}
            </h1>
            <p className="text-gray-600">
              {isEditing 
                ? "Modifiez les informations de l'événement"
                : `${genreLabels[event.genre]} • ${typeLabels[event.type]}`
              }
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/admin/events"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Retour
            </Link>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Modifier
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {isEditing ? (
          /* Mode édition */
          <div className="space-y-6">
            {/* Affichage des erreurs générales */}
            {generalError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Impossible de modifier l'événement
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {generalError}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Titre */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'événement *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="desc" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="desc"
                name="desc"
                value={formData.desc}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.desc ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.desc && (
                <p className="mt-1 text-sm text-red-600">{errors.desc}</p>
              )}
            </div>

            {/* Date et heure de début */}
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                Date et heure de début *
              </label>
              <input
                type="datetime-local"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.start_date ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>

            {/* Genre et Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                  Genre musical *
                </label>
                <select
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="RAP">RAP</option>
                  <option value="RNB">RNB</option>
                  <option value="REGGAE">REGGAE</option>
                  <option value="ROCK">ROCK</option>
                </select>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'événement *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="CONCERT">Concert</option>
                  <option value="ACCOUSTIQUE">Accoustique</option>
                  <option value="SHOWCASE">Showcase</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
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
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.location_id ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Sélectionner un lieu</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} {location.address ? `- ${location.address}` : ""}
                  </option>
                ))}
              </select>
              {errors.location_id && (
                <p className="mt-1 text-sm text-red-600">{errors.location_id}</p>
              )}
              <div className="mt-2">
                <Link
                  href="/admin/locations/new"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Créer un nouveau lieu
                </Link>
              </div>
            </div>

            {/* Artiste associé */}
            <div>
              <label htmlFor="artist_id" className="block text-sm font-medium text-gray-700 mb-2">
                Artiste principal (optionnel)
              </label>
              <select
                id="artist_id"
                name="artist_id"
                value={formData.artist_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un artiste</option>
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload d'image */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Image de l'événement
              </label>
              <div className="flex items-center space-x-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Changer l'image
                </button>
              </div>
            </div>

            {/* Aperçu de l'image */}
            {previewImage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aperçu de l'image
                </label>
                <div className="w-48 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={previewImage}
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  fetchEvent(); // Recharger les données originales
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </div>
        ) : (
          /* Mode affichage */
          <div className="space-y-6">
            {/* Image de l'événement */}
            {event.image_path && (
              <div className="flex justify-center">
                <div className="w-64 h-40 border-2 border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={event.image_path}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">Titre</p>
                <p className="text-gray-700">{event.title}</p>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">Genre</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {genreLabels[event.genre]}
                </span>
              </div>

              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">Type</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {typeLabels[event.type]}
                </span>
              </div>

              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">Date de début</p>
                <p className="text-gray-700">
                  {new Date(event.start_date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">Description</p>
              <p className="text-gray-700 whitespace-pre-wrap">{event.desc}</p>
            </div>

            {/* Lieu et coordonnées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">Lieu</p>
                <p className="text-gray-700">{getLocationDisplayName(event.location_id)}</p>
              </div>

              {(event.latitude && event.longitude) && (
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">Coordonnées GPS</p>
                  <p className="text-gray-700">
                    {event.latitude}, {event.longitude}
                  </p>
                </div>
              )}
            </div>

            {/* Artiste associé */}
            {event.artist && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Artiste principal</h3>
                <div className="flex items-center space-x-3">
                  {event.artist.image_path && (
                    <img
                      src={event.artist.image_path}
                      alt={event.artist.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <Link
                    href={`/admin/artists/${event.artist.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {event.artist.name}
                  </Link>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Suppression..." : "Supprimer l'événement"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
