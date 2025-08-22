# Pulse 🎵

Une plateforme moderne de gestion d'événements musicaux et d'artistes construite avec Next.js 15, Prisma 6 et PostgreSQL.

## ✨ Fonctionnalités

- 🎭 **Gestion des artistes** - Profils, images et descriptions
- 🎪 **Gestion des événements** - Concerts, showcases et événements acoustiques
- 🏪 **Gestion des stands** - Food, activités, tatouages, souvenirs et merch
- 🔔 **Système de notifications** - Rappels automatiques avant les événements
- 👥 **Authentification** - Système de connexion avec rôles utilisateur/admin
- 📧 **Notifications par email** - Envoi automatique de rappels
- 📱 **Interface responsive** - Optimisée pour tous les appareils
- 🗄️ **Base de données robuste** - PostgreSQL avec Prisma ORM

## 🚀 Démarrage rapide

### Prérequis
- **Node.js** 18+ 
- **Docker** et **Docker Compose**
- **npm** ou **yarn**
- **Git**

### Installation complète

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd Pulse
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
```bash
# Créer le fichier .env avec la configuration de base
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pulse?schema=public"' > .env
echo 'NODE_ENV="development"' >> .env
echo 'NEXTAUTH_SECRET="votre-secret-ici"' >> .env
echo 'NEXTAUTH_URL="http://localhost:3000"' >> .env
```

4. **Vérifier que Docker est démarré**
```bash
docker ps
```

5. **Démarrer la base de données PostgreSQL**
```bash
npm run docker:up
```

6. **Vérifier que PostgreSQL répond sur le bon port**
```bash
nc -zv localhost 5432
```

7. **Générer le client Prisma**
```bash
npm run db:generate
```

8. **Synchroniser la base de données avec le schéma**
```bash
npm run db:push
```

9. **Tester Prisma Studio (optionnel)**
```bash
npm run db:studio
```

10. **Lancer le serveur de développement**
```bash
npm run dev
```

Votre application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🗄️ Base de données

### Modèles de données

#### Users
- Gestion des utilisateurs avec authentification
- Rôles : USER et ADMIN
- Chiffrement des mots de passe avec bcrypt

#### Artists
- Profils d'artistes avec images et descriptions
- Relation avec les événements

#### Events
- Événements musicaux avec dates, lieux et géolocalisation
- Types : CONCERT, ACCOUSTIQUE, SHOWCASE, OTHER
- Genres : RAP, RNB, REGGAE, ROCK

#### Stands
- Gestion des stands d'événements
- Types : FOOD, ACTIVITE, TATOOS, SOUVENIRS, MERCH
- Capacité et prix configurables

#### EventNotifications
- Système de rappels automatiques
- Types : ONE_HOUR_BEFORE, TEN_MINUTES_BEFORE
- Intégration avec le planificateur de tâches

### Scripts disponibles
- `npm run db:generate` - Générer le client Prisma
- `npm run db:push` - Pousser le schéma vers la base
- `npm run db:migrate` - Créer et appliquer une migration
- `npm run db:studio` - Ouvrir Prisma Studio
- `npm run db:reset` - Réinitialiser la base de données

### Docker
- `npm run docker:up` - Démarrer PostgreSQL
- `npm run docker:down` - Arrêter PostgreSQL
- `npm run docker:logs` - Voir les logs

## 🏗️ Architecture du projet

```
Pulse/
├── prisma/
│   ├── schema.prisma          # Schéma de base de données
│   └── init/                  # Données d'initialisation
├── src/
│   ├── app/                   # Pages Next.js (App Router)
│   │   ├── admin/             # Interface d'administration
│   │   │   ├── artists/       # Gestion des artistes
│   │   │   ├── events/        # Gestion des événements
│   │   │   ├── users/         # Gestion des utilisateurs
│   │   │   └── notifications/ # Gestion des notifications
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Authentification
│   │   │   ├── artists/       # API des artistes
│   │   │   ├── events/        # API des événements
│   │   │   ├── users/         # API des utilisateurs
│   │   │   ├── notifications/ # API des notifications
│   │   │   ├── upload/        # Upload de fichiers
│   │   │   └── cron/          # Tâches planifiées
│   │   ├── auth/              # Pages d'authentification
│   │   └── globals.css        # Styles globaux
│   ├── components/            # Composants React réutilisables
│   │   ├── auth/              # Composants d'authentification
│   │   ├── providers/         # Providers React
│   │   └── ui/                # Composants UI
│   │       └── buttons/       # Boutons personnalisés
│   ├── generated/             # Client Prisma généré
│   └── lib/                   # Utilitaires et configurations
│       ├── api-auth.ts        # Configuration API
│       ├── auth.ts            # Configuration NextAuth
│       ├── email.ts           # Configuration email
│       ├── notificationScheduler.ts # Planificateur de notifications
│       └── prisma.ts          # Instance Prisma
├── public/                    # Assets statiques
│   └── assets/               # Images et fichiers
│       ├── artists/          # Images des artistes
│       └── events/           # Images des événements
├── types/                     # Définitions TypeScript
├── docker-compose.yml         # Configuration PostgreSQL
└── next.config.ts            # Configuration Next.js
```

## 🔧 Configuration et technologies

### Stack technique
- **Frontend** : Next.js 15 avec App Router
- **Backend** : API Routes Next.js
- **Base de données** : PostgreSQL 16
- **ORM** : Prisma 6
- **Authentification** : NextAuth.js 4
- **Styling** : Tailwind CSS 4
- **Langage** : TypeScript 5
- **Email** : Nodemailer
- **Planification** : node-cron
- **Upload** : Multer

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Base de données
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pulse?schema=public"

# Environnement
NODE_ENV="development"

# NextAuth
NEXTAUTH_SECRET=br+Y98g0wLbgVe4SF1BUkMPt13mCdxiche/fx6YNSw8
NEXTAUTH_URL="http://localhost:3000"

# Email (optionnel pour le développement)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=arthurjfr.dev@gmail.com
SMTP_PASS=tajliozkqifmpzwj
SMTP_FROM=arthurjfr.dev@gmail.com
```

## 🎯 Fonctionnalités principales

### Interface d'administration
- **Gestion des artistes** : CRUD complet avec upload d'images
- **Gestion des événements** : Création, modification et suppression
- **Gestion des utilisateurs** : Administration des comptes
- **Système de notifications** : Configuration des rappels automatiques

### API REST
- **Endpoints sécurisés** avec authentification
- **Upload de fichiers** pour les images
- **Validation des données** avec Prisma
- **Gestion des erreurs** standardisée

### Système de notifications
- **Rappels automatiques** avant les événements
- **Planification intelligente** avec node-cron
- **Envoi par email** avec Nodemailer
- **Interface de gestion** dans l'admin

## 🔐 Sécurité et Authentification

### Système d'authentification
- **NextAuth.js 4** avec stratégie JWT
- **Chiffrement des mots de passe** avec bcrypt (12 rounds)
- **Gestion des sessions** sécurisées
- **Rôles utilisateur** : USER et ADMIN
- **Protection des routes** avec middleware d'authentification

### Protection des routes API
- **`requireAdminAuth`** : Accès réservé aux administrateurs
- **`requireUserAuth`** : Accès pour utilisateurs connectés
- **Validation des tokens** sur chaque requête protégée
- **Gestion des erreurs 401/403** standardisées

### Variables d'environnement de sécurité
```env
NEXTAUTH_SECRET="secret-super-securise-minimum-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"
```

## 🌐 API Routes - Documentation complète

### Authentification
- **`POST /api/auth/register`** - Création de compte (publique)
- **`POST /api/auth/login`** - Connexion via NextAuth (publique)
- **`GET/POST /api/auth/[...nextauth]`** - Gestion des sessions NextAuth

### Gestion des artistes
- **`GET /api/artists`** - Liste des artistes (publique)
- **`POST /api/artists`** - Créer un artiste (admin uniquement)
- **`GET /api/artists/[id]`** - Détails d'un artiste (publique)
- **`PUT /api/artists/[id]`** - Modifier un artiste (admin uniquement)
- **`DELETE /api/artists/[id]`** - Supprimer un artiste (admin uniquement)

### Gestion des événements
- **`GET /api/events`** - Liste des événements avec filtres et pagination (publique)
  - Paramètres : `page`, `limit`, `search`, `genre`, `type`, `artist_id`, `upcoming`
- **`POST /api/events`** - Créer un événement (admin uniquement)
  - Validation : titre (min 3 chars), description (min 10 chars), date future, coordonnées GPS
- **`GET /api/events/[id]`** - Détails d'un événement (publique)
- **`PUT /api/events/[id]`** - Modifier un événement (admin uniquement)
- **`DELETE /api/events/[id]`** - Supprimer un événement (admin uniquement)

### Gestion des utilisateurs
- **`GET /api/users`** - Liste des utilisateurs avec pagination et filtres (admin uniquement)
  - Paramètres : `page`, `limit`, `search`, `role`, `sortBy`, `sortOrder`
- **`POST /api/users`** - Créer un utilisateur (admin uniquement)
  - Validation : username (min 3 chars), email valide, password (min 6 chars)
- **`GET /api/users/[id]`** - Détails d'un utilisateur (admin uniquement)
- **`PATCH /api/users/[id]`** - Modifier un utilisateur (admin uniquement)
- **`DELETE /api/users/[id]`** - Supprimer un utilisateur (admin uniquement)

### Upload de fichiers
- **`POST /api/upload`** - Upload d'images pour artistes/événements (publique)
  - Types acceptés : images uniquement
  - Taille max : 5MB
  - Dossiers : `/public/assets/artists/` et `/public/assets/events/`

### Système de notifications
- **`GET /api/notifications`** - Liste des notifications (admin uniquement)
- **`POST /api/notifications`** - Créer une notification (admin uniquement)
- **`PUT /api/notifications/[id]`** - Modifier une notification (admin uniquement)
- **`DELETE /api/notifications/[id]`** - Supprimer une notification (admin uniquement)

### Tâches planifiées (Cron)
- **`POST /api/cron/start-scheduler`** - Démarrer le planificateur de notifications
- **`POST /api/cron/stop-scheduler`** - Arrêter le planificateur de notifications
- **`GET /api/cron/status`** - Statut du planificateur

## 📡 Corps des Requêtes API - Détails complets

### 🔐 Authentification

#### POST /api/auth/register
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "motdepasse123"
}
```

**Réponse de succès (201) :**
```json
{
  "message": "Compte créé",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "ADMIN",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### POST /api/auth/login
```json
{
  "email": "john@example.com",
  "password": "motdepasse123"
}
```

**Réponse de succès :**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "ADMIN"
  }
}
```

### 🎭 Gestion des Artistes

#### POST /api/artists
```json
{
  "name": "Artiste Example",
  "desc": "Description détaillée de l'artiste et de son style musical",
  "image_path": "/assets/artists/artiste-example.jpg"
}
```

**Réponse de succès (201) :**
```json
{
  "id": 1,
  "name": "Artiste Example",
  "desc": "Description détaillée de l'artiste et de son style musical",
  "image_path": "/assets/artists/artiste-example.jpg",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

#### PUT /api/artists/[id]
```json
{
  "name": "Artiste Example Modifié",
  "desc": "Nouvelle description de l'artiste",
  "image_path": "/assets/artists/nouvelle-image.jpg"
}
```

#### GET /api/artists
**Paramètres de requête :**
```
?page=1&limit=20&search=artiste&sortBy=name&sortOrder=asc
```

**Réponse :**
```json
[
  {
    "id": 1,
    "name": "Artiste Example",
    "desc": "Description de l'artiste",
    "image_path": "/assets/artists/artiste-example.jpg",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

### 🎪 Gestion des Événements

#### POST /api/events
```json
{
  "title": "Concert de Jazz",
  "desc": "Une soirée exceptionnelle de jazz avec des artistes talentueux",
  "start_date": "2024-02-15T20:00:00.000Z",
  "end_date": "2024-02-15T23:00:00.000Z",
  "genre": "JAZZ",
  "type": "CONCERT",
  "location": "Salle de Concert Central",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "image_path": "/assets/events/concert-jazz.jpg",
  "artist_id": 1
}
```

**Réponse de succès (201) :**
```json
{
  "id": 1,
  "title": "Concert de Jazz",
  "desc": "Une soirée exceptionnelle de jazz avec des artistes talentueux",
  "start_date": "2024-02-15T20:00:00.000Z",
  "end_date": "2024-02-15T23:00:00.000Z",
  "genre": "JAZZ",
  "type": "CONCERT",
  "location": "Salle de Concert Central",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "image_path": "/assets/events/concert-jazz.jpg",
  "artist_id": 1,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

#### GET /api/events
**Paramètres de requête :**
```
?page=1&limit=20&search=jazz&genre=JAZZ&type=CONCERT&artist_id=1&upcoming=true
```

**Réponse avec pagination :**
```json
{
  "events": [
    {
      "id": 1,
      "title": "Concert de Jazz",
      "desc": "Une soirée exceptionnelle de jazz",
      "start_date": "2024-02-15T20:00:00.000Z",
      "genre": "JAZZ",
      "type": "CONCERT",
      "location": "Salle de Concert Central",
      "artist": {
        "id": 1,
        "name": "Artiste Example",
        "image_path": "/assets/artists/artiste-example.jpg"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

#### PUT /api/events/[id]
```json
{
  "title": "Concert de Jazz Modifié",
  "desc": "Description mise à jour de l'événement",
  "start_date": "2024-02-20T20:00:00.000Z",
  "end_date": "2024-02-20T23:00:00.000Z",
  "genre": "JAZZ",
  "type": "CONCERT",
  "location": "Nouvelle Salle de Concert",
  "latitude": 48.8600,
  "longitude": 2.3500,
  "image_path": "/assets/events/nouvelle-image.jpg",
  "artist_id": 2
}
```

### 👥 Gestion des Utilisateurs

#### POST /api/users
```json
{
  "username": "nouveau_user",
  "email": "nouveau@example.com",
  "password": "motdepasse123",
  "role": "USER"
}
```

**Réponse de succès (201) :**
```json
{
  "id": 2,
  "username": "nouveau_user",
  "email": "nouveau@example.com",
  "role": "USER",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

#### PATCH /api/users/[id]
```json
{
  "username": "username_modifie",
  "email": "email_modifie@example.com",
  "role": "ADMIN",
  "password": "nouveau_mot_de_passe"
}
```

#### GET /api/users
**Paramètres de requête :**
```
?page=1&limit=20&search=admin&role=ADMIN&sortBy=created_at&sortOrder=desc
```

**Réponse avec pagination :**
```json
{
  "users": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "ADMIN",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### 📁 Upload de Fichiers

#### POST /api/upload
**FormData :**
```
type: "artists" | "events"
file: [fichier image]
```

**Réponse de succès (201) :**
```json
{
  "filename": "artiste-1234567890.jpg",
  "path": "/assets/artists/artiste-1234567890.jpg",
  "size": 1024000,
  "type": "image/jpeg"
}
```

### 🔔 Système de Notifications

#### POST /api/notifications
```json
{
  "event_id": 1,
  "type": "ONE_HOUR_BEFORE",
  "title": "Rappel événement",
  "message": "L'événement commence dans 1 heure",
  "scheduled_for": "2024-02-15T19:00:00.000Z"
}
```

**Réponse de succès (201) :**
```json
{
  "id": 1,
  "event_id": 1,
  "type": "ONE_HOUR_BEFORE",
  "title": "Rappel événement",
  "message": "L'événement commence dans 1 heure",
  "scheduled_for": "2024-02-15T19:00:00.000Z",
  "is_sent": false,
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

#### GET /api/notifications
**Paramètres de requête :**
```
?page=1&limit=20&type=ONE_HOUR_BEFORE&is_sent=false&event_id=1
```

**Réponse avec relations :**
```json
{
  "notifications": [
    {
      "id": 1,
      "event_id": 1,
      "type": "ONE_HOUR_BEFORE",
      "title": "Rappel événement",
      "message": "L'événement commence dans 1 heure",
      "scheduled_for": "2024-02-15T19:00:00.000Z",
      "is_sent": false,
      "created_at": "2024-01-15T10:30:00.000Z",
      "event": {
        "id": 1,
        "title": "Concert de Jazz",
        "start_date": "2024-02-15T20:00:00.000Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### ⏰ Tâches Planifiées (Cron)

#### POST /api/cron/start-scheduler
**Corps vide** - Démarre le planificateur de notifications

**Réponse de succès (200) :**
```json
{
  "message": "Planificateur démarré avec succès",
  "status": "En cours"
}
```

#### POST /api/cron/stop-scheduler
**Corps vide** - Arrête le planificateur de notifications

**Réponse de succès (200) :**
```json
{
  "message": "Planificateur arrêté avec succès",
  "status": "Arrêté"
}
```

#### GET /api/cron/status
**Réponse :**
```json
{
  "status": "En cours",
  "lastCheck": "2024-01-15T10:30:00.000Z",
  "notificationsScheduled": 5,
  "notificationsSent": 12
}
```

## 📋 Codes de Réponse HTTP

### Succès
- **200 OK** : Requête traitée avec succès
- **201 Created** : Ressource créée avec succès

### Erreurs Client
- **400 Bad Request** : Données invalides ou manquantes
- **401 Unauthorized** : Authentification requise
- **403 Forbidden** : Accès refusé (rôle insuffisant)
- **404 Not Found** : Ressource non trouvée
- **409 Conflict** : Conflit (doublon, contrainte violée)

### Erreurs Serveur
- **500 Internal Server Error** : Erreur interne du serveur

## 🔒 Exemples d'Utilisation avec Authentification

### Requête protégée admin
```typescript
// Créer un artiste (admin uniquement)
const response = await fetch('/api/artists', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Le token JWT est automatiquement inclus par NextAuth
  },
  body: JSON.stringify({
    name: "Nouvel Artiste",
    desc: "Description de l'artiste",
    image_path: "/assets/artists/image.jpg"
  })
});

if (response.status === 401) {
  // Rediriger vers la page de connexion
  router.push('/auth/login');
} else if (response.status === 403) {
  // Utilisateur non autorisé
  alert('Accès refusé');
} else if (response.ok) {
  const artist = await response.json();
  console.log('Artiste créé:', artist);
}
```

### Requête avec gestion d'erreur
```typescript
// Créer un événement avec validation
try {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: "Mon Événement",
      desc: "Description de l'événement",
      start_date: "2024-12-25T20:00:00.000Z",
      genre: "ROCK",
      type: "CONCERT",
      location: "Salle de Concert"
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la création');
  }

  const event = await response.json();
  console.log('Événement créé:', event);
} catch (error) {
  console.error('Erreur:', error.message);
}
```

## 🛡️ Sécurité des Données

### Validation côté serveur
- **Toutes les entrées** sont validées avant traitement
- **Règles métier** appliquées (longueur min/max, formats, etc.)
- **Types de données** vérifiés et convertis si nécessaire

### Protection contre les attaques
- **Injection SQL** : Utilisation de Prisma ORM avec paramètres préparés
- **XSS** : Échappement automatique des données
- **CSRF** : Protection intégrée NextAuth.js
- **Upload malveillant** : Validation des types et tailles de fichiers

### Chiffrement et Hachage
- **Mots de passe** : Hachage bcrypt avec salt de 12 rounds
- **Sessions** : Tokens JWT sécurisés avec expiration
- **HTTPS** : Recommandé en production

## 📊 Bonnes Pratiques Implémentées

### Architecture
- **Séparation des responsabilités** : Middleware d'authentification réutilisable
- **Gestion d'erreurs centralisée** : Codes HTTP standardisés et messages clairs
- **Validation des données** : Règles métier appliquées côté serveur

### Performance
- **Pagination** : Limitation du nombre de résultats retournés
- **Relations optimisées** : Chargement conditionnel des données liées
- **Cache** : Sessions utilisateur mises en cache

### Maintenabilité
- **Types TypeScript** : Interfaces et types pour toutes les entrées/sorties
- **Logs structurés** : Traçabilité des actions d'administration
- **Tests** : Structure prête pour l'ajout de tests unitaires et d'intégration
