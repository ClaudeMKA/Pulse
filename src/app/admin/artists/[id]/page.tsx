"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Artist {
  id: number;
  name: string;
  desc: string | null;
  image_path: string | null;
  created_at: string;
  updated_at: string;
}

interface ArtistFormData {
  name: string;
  desc: string;
  image_path: string;
}

export default function ArtistDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<ArtistFormData>({
    name: "",
    desc: "",
    image_path: "",
  });
  const [errors, setErrors] = useState<Partial<ArtistFormData>>({});
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    fetchArtist();
  }, [params.id]);

  const fetchArtist = async () => {
    try {
      const response = await fetch(`/api/artists/${params.id}`);
      if (response.ok) {
        const artistData = await response.json();
        setArtist(artistData);
        setFormData({
          name: artistData.name,
          desc: artistData.desc || "",
          image_path: artistData.image_path || "",
        });
        setPreviewImage(artistData.image_path || "");
      } else {
        alert("Erreur lors du chargement de l'artiste");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du chargement de l'artiste");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ArtistFormData]) {
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
      formData.append("type", "artists");

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
    const newErrors: Partial<ArtistFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom de l'artiste est requis";
    }

    if (formData.name.trim().length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères";
    }

    if (formData.desc && formData.desc.trim().length < 10) {
      newErrors.desc = "La description doit contenir au moins 10 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/artists/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedArtist = await response.json();
        setArtist(updatedArtist);
        setIsEditing(false);
        alert("Artiste mis à jour avec succès !");
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Une erreur est survenue lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet artiste ?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/artists/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Artiste supprimé avec succès !");
        router.push("/admin/artists");
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
          <p className="mt-4 text-gray-600">Chargement de l'artiste...</p>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Artiste non trouvé
          </h1>
          <Link
            href="/admin/artists"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Retour à la liste des artistes
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
              {isEditing ? "Modifier l'artiste" : artist.name}
            </h1>
            <p className="text-gray-600">
              {isEditing 
                ? "Modifiez les informations de l'artiste"
                : `Créé le ${new Date(artist.created_at).toLocaleDateString('fr-FR')}`
              }
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/admin/artists"
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
            {/* Nom */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'artiste *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="desc" className="block text-sm font-medium text-gray-700 mb-2">
                Description
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

            {/* Upload d'image */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Image de profil
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
                <div className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
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
                  setFormData({
                    name: artist.name,
                    desc: artist.desc || "",
                    image_path: artist.image_path || "",
                  });
                  setPreviewImage(artist.image_path || "");
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
            {/* Image de profil */}
            {artist.image_path && (
              <div className="flex justify-center">
                <div className="w-48 h-48 border-2 border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={artist.image_path}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Informations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nom</h3>
                <p className="text-gray-700">{artist.name}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Date de création</h3>
                <p className="text-gray-700">
                  {new Date(artist.created_at).toLocaleDateString('fr-FR', {
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
            {artist.desc && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{artist.desc}</p>
              </div>
            )}

            {/* Dernière modification */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Dernière modification</h3>
              <p className="text-gray-700">
                {new Date(artist.updated_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Suppression..." : "Supprimer l'artiste"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
