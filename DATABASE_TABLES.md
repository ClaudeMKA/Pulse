# 🗄️ Tables de la Base de Données - Pulse

## 📊 Vue d'ensemble des tables

Votre base de données contient **8 tables principales** avec leurs relations et contraintes.

---

## 👥 **Table : `users`**

| Colonne | Type | Contrainte | Description | Exemple |
|---------|------|------------|-------------|---------|
| `id` | `Int` | `@id @default(autoincrement())` | Identifiant unique | `1, 2, 3...` |
| `username` | `String` | `@unique` | Nom d'utilisateur unique | `"admin", "john_doe"` |
| `email` | `String` | `@unique` | Email unique | `"admin@pulse.com"` |
| `password` | `String` | - | Mot de passe hashé | `"$2a$10$..."` |
| `role` | `Role` | `@default(ADMIN)` | Rôle utilisateur | `ADMIN, USER` |
| `created_at` | `DateTime` | `@default(now())` | Date de création | `2024-01-15T10:30:00Z` |
| `updated_at` | `DateTime` | `@updatedAt` | Date de modification | `2024-01-15T15:45:00Z` |

**Relations :**
- `notifications` → `Notifications[]` (1:N)

**Index :**
- `id` (Primary Key)
- `username` (Unique)
- `email` (Unique)

---

## 🎨 **Table : `artists`**

| Colonne | Type | Contrainte | Description | Exemple |
|---------|------|------------|-------------|---------|
| `id` | `Int` | `@id @default(autoincrement())` | Identifiant unique | `1, 2, 3...` |
| `name` | `String` | - | Nom de l'artiste | `"Drake", "Beyoncé"` |
| `desc` | `String?` | - | Description (optionnel) | `"Artiste canadien de rap"` |
| `image_path` | `String?` | - | Chemin de l'image (optionnel) | `"/assets/artists/drake.jpg"` |
| `created_at` | `DateTime` | `@default(now())` | Date de création | `2024-01-15T10:30:00Z` |
| `updated_at` | `DateTime` | `@updatedAt` | Date de modification | `2024-01-15T15:45:00Z` |

**Relations :**
- `events` → `Events[]` (1:N)

**Index :**
- `id` (Primary Key)

---

## 🎭 **Table : `events`**

| Colonne | Type | Contrainte | Description | Exemple |
|---------|------|------------|-------------|---------|
| `id` | `Int` | `@id @default(autoincrement())` | Identifiant unique | `1, 2, 3...` |
| `title` | `String` | - | Titre de l'événement | `"Concert Drake"` |
| `desc` | `String` | - | Description de l'événement | `"Grand concert de rap"` |
| `start_date` | `DateTime` | - | Date et heure de début | `2024-08-15T20:00:00Z` |
| `end_date` | `DateTime?` | - | Date et heure de fin (optionnel) | `2024-08-15T23:00:00Z` |
| `genre` | `Genre` | - | Genre musical | `RAP, RNB, REGGAE, ROCK` |
| `type` | `EventType` | - | Type d'événement | `CONCERT, ACCOUSTIQUE, SHOWCASE, OTHER` |
| `image_path` | `String?` | - | Chemin de l'image (optionnel) | `"/assets/events/concert.jpg"` |
| `artist_id` | `Int?` | - | ID de l'artiste (optionnel) | `1, 2, 3...` |
| `location_id` | `Int?` | - | ID du lieu (optionnel) | `1, 2, 3...` |
| `created_at` | `DateTime` | `@default(now())` | Date de création | `2024-01-15T10:30:00Z` |
| `updated_at` | `DateTime` | `@updatedAt` | Date de modification | `2024-01-15T15:45:00Z` |

**Relations :**
- `artist` → `Artists?` (N:1)
- `location` → `Locations?` (N:1)
- `stands` → `Stands[]` (1:N)
- `notifications` → `EventNotifications[]` (1:N)

**Index :**
- `id` (Primary Key)
- `artist_id` (Foreign Key)
- `location_id` (Foreign Key)

---

## 📍 **Table : `locations`**

| Colonne | Type | Contrainte | Description | Exemple |
|---------|------|------------|-------------|---------|
| `id` | `Int` | `@id @default(autoincrement())` | Identifiant unique | `1, 2, 3...` |
| `name` | `String` | - | Nom du lieu | `"Stade de France"` |
| `latitude` | `Float?` | - | Latitude GPS (optionnel) | `48.9244` |
| `longitude` | `Float?` | - | Longitude GPS (optionnel) | `2.3603` |
| `address` | `String?` | - | Adresse (optionnel) | `"93200 Saint-Denis"` |
| `created_at` | `DateTime` | `@default(now())` | Date de création | `2024-01-15T10:30:00Z` |
| `updated_at` | `DateTime` | `@updatedAt` | Date de modification | `2024-01-15T15:45:00Z` |

**Relations :**
- `events` → `Events[]` (1:N)
- `stands` → `Stands[]` (1:N)

**Index :**
- `id` (Primary Key)

---

## 🏪 **Table : `stands`**

| Colonne | Type | Contrainte | Description | Exemple |
|---------|------|------------|-------------|---------|
| `id` | `Int` | `@id @default(autoincrement())` | Identifiant unique | `1, 2, 3...` |
| `name` | `String` | - | Nom du stand | `"Stand Burger"` |
| `description` | `String?` | - | Description (optionnel) | `"Burgers et frites"` |
| `capacity` | `Int?` | - | Capacité d'accueil (optionnel) | `50, 100` |
| `price` | `Float?` | - | Prix (optionnel) | `15.50, 25.00` |
| `type` | `StandType` | - | Type de stand | `FOOD, ACTIVITE, TATOOS, SOUVENIRS, MERCH` |
| `opened_at` | `DateTime` | - | Heure d'ouverture | `2024-08-15T18:00:00Z` |
| `closed_at` | `DateTime` | - | Heure de fermeture | `2024-08-15T23:00:00Z` |
| `image_path` | `String?` | - | Chemin de l'image (optionnel) | `"/assets/stands/burger.jpg"` |
| `location_id` | `Int?` | - | ID du lieu (optionnel) | `1, 2, 3...` |
| `event_id` | `Int?` | - | ID de l'événement (optionnel) | `1, 2, 3...` |
| `created_at` | `DateTime` | `@default(now())` | Date de création | `2024-01-15T10:30:00Z` |
| `updated_at` | `DateTime` | `@updatedAt` | Date de modification | `2024-01-15T15:45:00Z` |

**Relations :**
- `location` → `Locations?` (N:1)
- `event` → `Events?` (N:1)

**Index :**
- `id` (Primary Key)
- `location_id` (Foreign Key)
- `event_id` (Foreign Key)

---

## 📧 **Table : `contact_messages`**

| Colonne | Type | Contrainte | Description | Exemple |
|---------|------|------------|-------------|---------|
| `id` | `Int` | `@id @default(autoincrement())` | Identifiant unique | `1, 2, 3...` |
| `name` | `String` | - | Nom de l'expéditeur | `"Jean Dupont"` |
| `email` | `String` | - | Email de l'expéditeur | `"jean@email.com"` |
| `subject` | `String` | - | Sujet du message | `"Question sur l'événement"` |
| `message` | `String` | - | Contenu du message | `"Bonjour, j'ai une question..."` |
| `read` | `Boolean` | `@default(false)` | Message lu ou non | `false, true` |
| `created_at` | `DateTime` | `@default(now())` | Date de création | `2024-01-15T10:30:00Z` |
| `updated_at` | `DateTime` | `@updatedAt` | Date de modification | `2024-01-15T15:45:00Z` |

**Relations :**
- Aucune relation

**Index :**
- `id` (Primary Key)

---

## 🔔 **Table : `notifications`**

| Colonne | Type | Contrainte | Description | Exemple |
|---------|------|------------|-------------|---------|
| `id` | `Int` | `@id @default(autoincrement())` | Identifiant unique | `1, 2, 3...` |
| `title` | `String` | - | Titre de la notification | `"Nouvel événement"` |
| `message` | `String` | - | Contenu de la notification | `"Un nouvel événement a été créé"` |
| `type` | `NotificationType` | - | Type de notification | `INFO, WARNING, SUCCESS, ERROR` |
| `read` | `Boolean` | `@default(false)` | Notification lue ou non | `false, true` |
| `user_id` | `Int` | - | ID de l'utilisateur destinataire | `1, 2, 3...` |
| `created_at` | `DateTime` | `@default(now())` | Date de création | `2024-01-15T10:30:00Z` |

**Relations :**
- `user` → `Users` (N:1)

**Index :**
- `id` (Primary Key)
- `user_id` (Foreign Key)

---

## ⏰ **Table : `event_notifications`**

| Colonne | Type | Contrainte | Description | Exemple |
|---------|------|------------|-------------|---------|
| `id` | `Int` | `@id @default(autoincrement())` | Identifiant unique | `1, 2, 3...` |
| `event_id` | `Int` | - | ID de l'événement | `1, 2, 3...` |
| `type` | `ReminderType` | - | Type de rappel | `ONE_HOUR_BEFORE, TEN_MINUTES_BEFORE` |
| `title` | `String` | - | Titre de la notification | `"Rappel événement"` |
| `message` | `String` | - | Contenu de la notification | `"Votre événement commence dans 1h"` |
| `sent_at` | `DateTime?` | - | Date d'envoi (optionnel) | `2024-08-15T19:00:00Z` |
| `is_sent` | `Boolean` | `@default(false)` | Notification envoyée ou non | `false, true` |
| `scheduled_for` | `DateTime` | - | Date de programmation | `2024-08-15T19:00:00Z` |
| `created_at` | `DateTime` | `@default(now())` | Date de création | `2024-01-15T10:30:00Z` |

**Relations :**
- `event` → `Events` (N:1) avec `onDelete: Cascade`

**Index :**
- `id` (Primary Key)
- `event_id` (Foreign Key)

---

## 🔤 **Énumérations (Enums)**

### **Role**
- `USER` - Utilisateur standard
- `ADMIN` - Administrateur

### **Genre**
- `RAP` - Musique rap
- `RNB` - Rhythm and blues
- `REGGAE` - Musique reggae
- `ROCK` - Musique rock

### **EventType**
- `CONCERT` - Concert
- `ACCOUSTIQUE` - Concert acoustique
- `SHOWCASE` - Présentation d'artiste
- `OTHER` - Autre type d'événement

### **StandType**
- `FOOD` - Stand de nourriture
- `ACTIVITE` - Stand d'activité
- `TATOOS` - Stand de tatouage
- `SOUVENIRS` - Stand de souvenirs
- `MERCH` - Stand de merchandising

### **NotificationType**
- `INFO` - Information
- `WARNING` - Avertissement
- `SUCCESS` - Succès
- `ERROR` - Erreur

### **ReminderType**
- `ONE_HOUR_BEFORE` - 1 heure avant
- `TEN_MINUTES_BEFORE` - 10 minutes avant

---

## 🔗 **Relations entre les tables**

```
Users (1) ←→ (N) Notifications
Users (1) ←→ (N) EventNotifications (via Events)

Artists (1) ←→ (N) Events
Locations (1) ←→ (N) Events
Locations (1) ←→ (N) Stands

Events (1) ←→ (N) Stands
Events (1) ←→ (N) EventNotifications

ContactMessages (isolée - pas de relations)
```

---

## 📊 **Statistiques des tables**

| Table | Colonnes | Relations | Index | Description |
|-------|----------|-----------|-------|-------------|
| `users` | 7 | 1 sortante | 3 | Gestion des utilisateurs et authentification |
| `artists` | 6 | 1 sortante | 1 | Catalogue des artistes |
| `events` | 12 | 4 relations | 3 | Événements et programmation |
| `locations` | 7 | 2 sortantes | 1 | Lieux et géolocalisation |
| `stands` | 12 | 2 entrantes | 3 | Stands et services |
| `contact_messages` | 8 | 0 | 1 | Messages de contact public |
| `notifications` | 7 | 1 entrante | 2 | Notifications utilisateur |
| `event_notifications` | 9 | 1 entrante | 2 | Rappels d'événements |

**Total : 8 tables, 68 colonnes, 12 relations, 16 index**

---

## 🎯 **Utilisation typique**

- **`users`** : Authentification et gestion des comptes
- **`artists`** : Catalogue des artistes disponibles
- **`events`** : Programmation des événements
- **`locations`** : Gestion des lieux et géolocalisation
- **`stands`** : Services et stands sur les événements
- **`contact_messages`** : Formulaire de contact public
- **`notifications`** : Système de notifications utilisateur
- **`event_notifications`** : Rappels automatiques d'événements
