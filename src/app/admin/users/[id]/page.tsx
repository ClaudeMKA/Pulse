"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Role = "ADMIN" | "USER";

interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export default function UserDetailPage() {
  const { id } = useParams() as { id: string };
  const userId = Number(id);
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("USER");

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleString("fr-FR") : "";

  async function fetchUser() {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/users/${userId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      setUser(data);
      setUsername(data.username);
      setEmail(data.email);
      setRole(data.role);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(userId)) {
      setError("ID invalide");
      setIsLoading(false);
      return;
    }
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          role,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || "Échec de la sauvegarde");
      }
      const updated = await res.json();
      setUser(updated);
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    try {
      setChangingPassword(true);
      setError("");
      if (newPassword.length < 6) throw new Error("Mot de passe trop court (min 6)");
      if (newPassword !== confirmPassword) throw new Error("Les mots de passe ne correspondent pas");

      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || "Échec du changement de mot de passe");
      }
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setError(e.message || "Erreur lors du changement de mot de passe");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    try {
      setDeleting(true);
      setError("");
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || "Échec de la suppression");
      }
      router.push("/admin/users");
    } catch (e: any) {
      setError(e.message || "Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse h-6 w-40 bg-gray-200 rounded mb-6" />
        <div className="animate-pulse h-96 bg-gray-100 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-4 text-red-600">{error}</div>
        <Link href="/admin/users" className="text-blue-600 hover:underline">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="mb-4">Utilisateur introuvable.</div>
        <Link href="/admin/users" className="text-blue-600 hover:underline">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Utilisateur #{user.id}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Créé le {formatDate(user.created_at)} • Modifié le {formatDate(user.updated_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/users"
            className="px-4 py-2 rounded-md border bg-white text-gray-700 hover:bg-gray-50"
          >
            Retour
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>

      {/* Form infos */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Informations</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom d’utilisateur</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rôle</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="USER">Utilisateur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Mot de passe</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Minimum 6 caractères"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmer</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="inline-flex items-center px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50"
              >
                {changingPassword ? "Modification..." : "Changer le mot de passe"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
