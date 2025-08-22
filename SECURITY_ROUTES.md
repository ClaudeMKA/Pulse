# 🔒 Sécurité des Routes API - Pulse

## 📋 Vue d'ensemble de la sécurité

Toutes les routes API sont protégées selon le principe de sécurité suivant :
- **GET** : Publiques (lecture seule)
- **POST/PUT/DELETE** : Protégées (authentification admin requise)

## 🛡️ Routes protégées (Admin uniquement)

### Artistes
- `POST /api/artists` ✅ **PROTÉGÉE** - Création d'artiste
- `PUT /api/artists/[id]` ✅ **PROTÉGÉE** - Modification d'artiste  
- `DELETE /api/artists/[id]` ✅ **PROTÉGÉE** - Suppression d'artiste

### Événements
- `POST /api/events` ✅ **PROTÉGÉE** - Création d'événement
- `PUT /api/events/[id]` ✅ **PROTÉGÉE** - Modification d'événement
- `DELETE /api/events/[id]` ✅ **PROTÉGÉE** - Suppression d'événement

### Lieux
- `POST /api/locations` ✅ **PROTÉGÉE** - Création de lieu
- `PUT /api/locations/[id]` ✅ **PROTÉGÉE** - Modification de lieu
- `DELETE /api/locations/[id]` ✅ **PROTÉGÉE** - Suppression de lieu

### Stands
- `POST /api/stands` ✅ **PROTÉGÉE** - Création de stand
- `PUT /api/stands/[id]` ✅ **PROTÉGÉE** - Modification de stand
- `DELETE /api/stands/[id]` ✅ **PROTÉGÉE** - Suppression de stand

### Utilisateurs
- `GET /api/users` ✅ **PROTÉGÉE** - Liste des utilisateurs (admin)
- `POST /api/users` ✅ **PROTÉGÉE** - Création d'utilisateur
- `PUT /api/users/[id]` ✅ **PROTÉGÉE** - Modification d'utilisateur
- `DELETE /api/users/[id]` ✅ **PROTÉGÉE** - Suppression d'utilisateur

### Upload
- `POST /api/upload` ✅ **PROTÉGÉE** - Upload d'images

### Notifications
- `GET /api/notifications` ✅ **PROTÉGÉE** - Lecture des notifications
- `POST /api/notifications` ✅ **PROTÉGÉE** - Création de notifications

### Planificateur (Cron)
- `POST /api/cron/start-scheduler` ✅ **PROTÉGÉE** - Démarrage du scheduler
- `POST /api/cron/stop-scheduler` ✅ **PROTÉGÉE** - Arrêt du scheduler
- `GET /api/cron/status` ✅ **PUBLIQUE** - Statut du scheduler (lecture seule)

## 🌐 Routes publiques (Lecture seule)

### Artistes
- `GET /api/artists` ✅ **PUBLIQUE** - Liste des artistes
- `GET /api/artists/[id]` ✅ **PUBLIQUE** - Détail d'un artiste

### Événements  
- `GET /api/events` ✅ **PUBLIQUE** - Liste des événements
- `GET /api/events/[id]` ✅ **PUBLIQUE** - Détail d'un événement

### Lieux
- `GET /api/locations` ✅ **PUBLIQUE** - Liste des lieux
- `GET /api/locations/[id]` ✅ **PUBLIQUE** - Détail d'un lieu

### Stands
- `GET /api/stands` ✅ **PUBLIQUE** - Liste des stands
- `GET /api/stands/[id]` ✅ **PUBLIQUE** - Détail d'un stand

### Contact
- `POST /api/contact` ✅ **PUBLIQUE** - Envoi de message de contact
- `GET /api/contact` ✅ **PROTÉGÉE** - Lecture des messages (admin)

### Authentification
- `GET /api/auth/session` ✅ **PUBLIQUE** - Session utilisateur
- `POST /api/auth/signin` ✅ **PUBLIQUE** - Connexion
- `POST /api/auth/signout` ✅ **PUBLIQUE** - Déconnexion

## 🔐 Méthodes de protection

### 1. `requireAdminAuth(request)`
- Vérifie l'authentification
- Vérifie le rôle ADMIN
- Retourne une erreur 401/403 si non autorisé

### 2. `requireAuth(request)`  
- Vérifie l'authentification uniquement
- Permet l'accès aux utilisateurs connectés
- Retourne une erreur 401 si non connecté

## 🚨 Routes critiques

### ⚠️ **TRÈS SENSIBLES** (Protection maximale)
- `/api/upload` - Upload de fichiers
- `/api/cron/*` - Contrôle du planificateur
- `/api/users/*` - Gestion des utilisateurs
- `/api/notifications` - Envoi de notifications

### ⚠️ **SENSIBLES** (Protection admin)
- `/api/artists/*` - Gestion des artistes
- `/api/events/*` - Gestion des événements
- `/api/locations/*` - Gestion des lieux
- `/api/stands/*` - Gestion des stands

## ✅ Vérifications de sécurité

- [x] Toutes les routes POST/PUT/DELETE sont protégées
- [x] Toutes les routes GET sont publiques (sauf utilisateurs)
- [x] Upload de fichiers protégé
- [x] Planificateur protégé
- [x] Gestion des utilisateurs protégée
- [x] Messages de contact protégés (lecture admin)
- [x] Authentification centralisée via `@/lib/api-auth`

## 🔍 Tests de sécurité recommandés

1. **Test d'accès non authentifié** : Essayer d'accéder aux routes protégées sans session
2. **Test d'accès utilisateur normal** : Essayer d'accéder aux routes admin avec un compte USER
3. **Test des routes publiques** : Vérifier que les routes GET sont accessibles sans authentification
4. **Test des permissions** : Vérifier que seuls les admins peuvent créer/modifier/supprimer

## 📝 Notes importantes

- Les routes GET restent publiques pour permettre l'affichage des données
- Seules les opérations de modification sont protégées
- L'authentification est gérée via NextAuth.js
- Les rôles sont vérifiés côté serveur (jamais côté client)
- Toutes les erreurs d'authentification retournent des codes HTTP appropriés
