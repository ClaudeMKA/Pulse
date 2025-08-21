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

### Codes de réponse HTTP
- **200** : Succès
- **201** : Ressource créée
- **400** : Erreur de validation
- **401** : Non authentifié
- **403** : Non autorisé (rôle insuffisant)
- **404** : Ressource non trouvée
- **409** : Conflit (doublon)
- **500** : Erreur interne du serveur

### Exemple d'utilisation avec authentification
```typescript
// Requête protégée admin
const response = await fetch('/api/artists', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Le token JWT est automatiquement inclus par NextAuth
  },
  body: JSON.stringify({
    name: "Nouvel Artiste",
    desc: "Description de l'artiste"
  })
});

if (response.status === 401) {
  // Rediriger vers la page de connexion
} else if (response.status === 403) {
  // Utilisateur non autorisé
}
```

### Sécurité des données
- **Validation côté serveur** : Toutes les entrées sont validées avant traitement
- **Protection contre l'injection SQL** : Utilisation de Prisma ORM
- **Chiffrement des mots de passe** : Hachage bcrypt avec salt de 12 rounds
- **Gestion des sessions** : Tokens JWT sécurisés avec expiration
- **Upload sécurisé** : Validation des types et tailles de fichiers
- **CORS** : Configuration sécurisée des origines autorisées

### Bonnes pratiques implémentées
- **Séparation des responsabilités** : Middleware d'authentification réutilisable
- **Gestion d'erreurs centralisée** : Codes HTTP standardisés et messages d'erreur clairs
- **Validation des données** : Règles métier appliquées côté serveur
- **Logs de sécurité** : Traçabilité des actions d'administration
- **Protection des routes sensibles** : Vérification systématique des rôles

## 🚀 Déploiement

### Préparation de la production

1. **Configurer la base de données**
   - Utiliser une base PostgreSQL externe (AWS RDS, Supabase, etc.)
   - Mettre à jour `DATABASE_URL` dans vos variables d'environnement

2. **Variables d'environnement de production**
   ```env
   NODE_ENV="production"
   NEXTAUTH_URL="https://votre-domaine.com"
   NEXTAUTH_SECRET="secret-production-securise"
   ```

3. **Migration de la base de données**
   ```bash
   npm run db:migrate
   ```

4. **Build de l'application**
   ```bash
   npm run build
   npm start
   ```
1. Connecter votre repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement à chaque push

### Déploiement sur Docker

```bash
# Build de l'image
docker build -t pulse-app .

# Lancement
docker run -p 3000:3000 --env-file .env pulse-app
```

## 🧪 Tests et développement

### Commandes utiles
```bash
# Linting
npm run lint

# Build de production
npm run build

# Démarrage en production
npm start

# Vérification des types TypeScript
npx tsc --noEmit
```

---

**Pulse** - Gestion moderne d'événements musicaux 🎵
