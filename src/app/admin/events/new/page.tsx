"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Artist {
  id: number;
  name: string;
}

interface Location {
  id: number;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
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
  price: string;
  currency: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    desc: "",
    start_date: "",
    genre: "RAP",
    type: "CONCERT",
    location_id: "",
    image_path: "",
    artist_id: "",
    price: "0",
    currency: "EUR",
  });
  const [artists, setArtists] = useState<Artist[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Partial<EventFormData>>({});
  const [generalError, setGeneralError] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    fetchArtists();
    fetchLocations();
  }, []);

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

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations");
      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations || data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des lieux:", error);
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

    setUploading(true);

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
    } finally {
      setUploading(false);
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

    if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = "Le prix doit être un nombre positif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Effacer les erreurs précédentes
    setErrors({});
    setGeneralError("");
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const eventData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        location_id: parseInt(formData.location_id),
        artist_id: formData.artist_id ? parseInt(formData.artist_id) : null,
        price: parseFloat(formData.price),
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Événement créé avec succès !");
        router.push(`/admin/events/${result.id}`);
      } else {
        const error = await response.json();
        // Afficher l'erreur dans l'interface au lieu d'un alert
        setGeneralError(error.message);
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      alert("Une erreur est survenue lors de la création de l'événement");
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Fonction pour obtenir le nom complet d'un lieu
  const getLocationDisplayName = (location: Location) => {
    if (location.address) {
      return `${location.name} - ${location.address}`;
    }
    return location.name;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Créer un nouvel événement
        </h1>
        <p className="text-gray-600">
          Ajoutez un nouvel événement à votre plateforme Pulse
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                  Impossible de créer l'événement
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {generalError}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre de l'événement */}
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
              placeholder="Ex: Concert de Drake, Festival Hip-Hop..."
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
              placeholder="Décrivez l'événement, la programmation, les informations pratiques..."
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
              min={getCurrentDateTime()}
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
                <option value="ACCOUSTIQUE">Acoustique</option>
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
                  {getLocationDisplayName(location)}
                </option>
              ))}
            </select>
            {errors.location_id && (
              <p className="mt-1 text-sm text-red-600">{errors.location_id}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Sélectionnez un lieu existant. Si le lieu n'existe pas, 
              <button
                type="button"
                onClick={() => router.push('/admin/locations/new')}
                className="text-blue-600 hover:text-blue-800 underline ml-1"
              >
                créez-le d'abord
              </button>
            </p>
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
            <p className="mt-1 text-sm text-gray-500">
              Laissez vide si l'événement n'est pas lié à un artiste spécifique
            </p>
          </div>

          {/* Prix et devise */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Prix de l'événement *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.price ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Mettez 0 pour un événement gratuit
              </p>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Devise *
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
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
                disabled={uploading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {uploading ? "Upload en cours..." : "Sélectionner une image"}
              </button>
              {formData.image_path && (
                <span className="text-sm text-green-600">
                  ✓ Image uploadée
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Formats acceptés: JPG, PNG, GIF. Taille max: 5MB
            </p>
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
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || uploading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création...
                </span>
              ) : (
                "Créer l'événement"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
