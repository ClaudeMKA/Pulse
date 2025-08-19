# Pulse

Un projet Next.js moderne avec Prisma et PostgreSQL pour la gestion d'événements et d'artistes.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- Docker et Docker Compose
- npm ou yarn

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
# Créer le fichier .env avec la bonne configuration
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pulse?schema=public"' > .env
echo 'NODE_ENV="development"' >> .env
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

## 🗄️ Base de données

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

## 🏗️ Structure du projet

```
Pulse/
├── prisma/
│   └── schema.prisma      # Schéma de base de données
├── src/
│   ├── app/               # Pages Next.js
│   └── generated/         # Client Prisma généré
├── lib/
│   └── prisma.ts         # Configuration Prisma
└── docker-compose.yml     # Configuration PostgreSQL
```

## 🔧 Configuration

Le projet utilise :
- **Next.js 15** avec App Router
- **Prisma 6** pour l'ORM
- **PostgreSQL 16** dans Docker
- **TypeScript** pour le typage



## 🚀 Déploiement

Pour la production, assurez-vous de :
1. Configurer une base de données PostgreSQL externe
2. Mettre à jour `DATABASE_URL` dans vos variables d'environnement
3. Exécuter `npm run db:migrate` pour appliquer les migrations
4. Construire l'application avec `npm run build`
