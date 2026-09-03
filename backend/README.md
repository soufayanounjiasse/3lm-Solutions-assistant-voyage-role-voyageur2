# aRécap complet du projet à ce stade :

✅ Environnement complet installé (Node, Git, NestJS CLI, PostgreSQL natif)
✅ Backend NestJS connecté à PostgreSQL via TypeORM
✅ Module 1 : inscription, connexion JWT, profil et préférences utilisateur
✅ Module 2 (Trip) : Voyage et Reservation en CRUD complet, testés via Swagger
✅ Projet versionné sur GitHub, workflow en branches en place
⏸️ Document (Module 2) : reste à faire
⏸️ Redis : reportéssistant-voyage
Récap complet du projet à ce stade :

✅ Environnement complet installé (Node, Git, NestJS CLI, PostgreSQL natif)
✅ Backend NestJS connecté à PostgreSQL via TypeORM
✅ Module 2 (Trip) : Voyage et Reservation en CRUD complet, testés via Swagger
✅ Projet versionné sur GitHub, workflow en branches en place
⏸️ Document (Module 2) : reste à faire
⏸️ Redis : reporté


# Voya — Backend (voya-backend)

## Stack technique

| Couche | Techno |
|---|---|
| Backend | Node.js + NestJS (API REST) |
| Base de données | PostgreSQL |
| ORM | TypeORM |
| Validation | class-validator / class-transformer |
| Documentation API | Swagger (`/api`) |
| Mobile (V1/V2) | React Native + TypeScript |
| Cache/sessions | Redis *(prévu, pas encore intégré)* |
| Stockage fichiers | Amazon S3 *(prévu)* |

## Prérequis

- [Node.js](https://nodejs.org/) (LTS, v20+)
- [Git](https://git-scm.com/)
- PostgreSQL 16 — voir la section installation ci-dessous
- [Postman](https://www.postman.com/) ou navigateur (Swagger intégré)

### Installation de PostgreSQL

⚠️ Ce projet utilise l'**archive binaire portable** de PostgreSQL plutôt que l'installeur graphique classique (pratique si Docker n'est pas disponible sur ta machine).

1. Télécharge l'archive ZIP depuis [postgresql.org/download/windows](https://www.postgresql.org/download/windows/) (choisir la version binaires, pas l'installeur `.exe`)
2. Extrais-la vers `C:\pgsql`
3. Ajoute `C:\pgsql\bin` à ta variable d'environnement `PATH` (Utilisateur)
4. Initialise le cluster (si pas déjà fait) :
   ```powershell
   initdb -D C:\pgsql\data -U postgres -W
   ```
5. Démarre le serveur (**à refaire à chaque redémarrage de ta machine**, ce n'est pas un service Windows automatique) :
   ```powershell
   pg_ctl -D C:\pgsql\data -l C:\pgsql\data\logfile.log start
   ```
6. Crée la base du projet :
   ```powershell
   psql -U postgres
   CREATE DATABASE voya_db;
   \q
   ```

## Installation du projet

```powershell
git clone https://github.com/oumayma728/assistant-voyage.git
cd assistant-voyage
npm install
```

Crée un fichier `.env` à la racine (jamais commité, voir `.gitignore`) :

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=ton_mot_de_passe_postgres
DB_NAME=voya_db
JWT_SECRET=une_valeur_secrete_forte
```

## Lancer le projet

```powershell
npm run start:dev
```

Le serveur écoute sur `http://localhost:3000`.

- **Documentation API interactive (Swagger)** : http://localhost:3000/api
- Les changements de schéma sont gérés par les migrations TypeORM. `synchronize` est désactivé dans l'application.

## Module utilisateur

Le module utilisateur est enregistré dans `AppModule` et documenté automatiquement dans Swagger.

### Authentification

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/auth/register` | Créer un compte avec email ou téléphone |
| `POST` | `/auth/login` | Se connecter avec email ou téléphone |
| `POST` | `/auth/social-login` | Connexion Google, Apple ou Facebook |
| `POST` | `/auth/forgot-password` | Demander une réinitialisation |
| `POST` | `/auth/reset-password` | Réinitialiser le mot de passe |

### Profil et préférences

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/users/me` | Récupérer le profil lié au token JWT |
| `GET` | `/users/:id` | Récupérer un profil |
| `PATCH` | `/users/:id` | Modifier un profil |
| `GET` | `/users/:id/preferences` | Récupérer les préférences |
| `PATCH` | `/users/:id/preferences` | Modifier les préférences |

Les routes protégées utilisent `Authorization: Bearer <accessToken>`. Dans Swagger, cliquer sur **Authorize** et saisir le token avec le préfixe `Bearer`.

La migration `1788293510408-UserModule` crée les tables utilisateur et préférences. Appliquer les migrations avec :

```powershell
npm run migration:run
```

## Structure du projet

```
src/
├── auth/          → Module 1 : inscription/connexion, JWT
├── profile/       → Module 1 : profil, préférences
├── trip/          → Module 2 : voyages, réservations, documents
├── ...            → autres modules (3 à 11)
├── common/        → guards, interceptors, decorators partagés
├── app.module.ts
└── main.ts
```

Chaque module métier est un module NestJS autonome (`controller` + `service` + `entities` + `dto`), le tout dans **un seul backend monolithique modulaire** (pas de microservices pour cette phase du projet).

## État d'avancement des modules

| Module | Statut | Branche |
|---|---|---|
| 1 — Compte utilisateur & Profil | ⏸️ À faire | — |
| 2 — Gestion des voyages (Trip Management) | 🚧 En cours (Voyage ✅, Reservation ✅, Document 🚧) | `module2-trip-soufiane` |
| 3 à 11 | ⏸️ À faire | — |

*(Mets à jour ce tableau au fur et à mesure de l'avancement de chacun.)*

## Workflow Git

1. **Ne travaille jamais directement sur `main`.**
2. Crée ta branche depuis `main` :
   ```powershell
   git checkout main
   git pull origin main
   git checkout -b moduleX-nomdumodule-tonprenom
   ```
3. Commit régulièrement avec des messages clairs :
   ```powershell
   git add .
   git commit -m "feat(moduleX): description courte"
   ```
4. Pousse ta branche :
   ```powershell
   git push -u origin moduleX-nomdumodule-tonprenom
   ```
5. Ouvre une **Pull Request** sur GitHub vers `main` quand ton module (ou une partie stable) est prêt. Demande une relecture avant fusion.
6. Avant de recommencer à travailler, resynchronise toujours ta branche avec `main` :
   ```powershell
   git checkout main
   git pull origin main
   git checkout moduleX-nomdumodule-tonprenom
   git merge main
   ```

## Tester l'API

Deux options :

- **Swagger** (recommandé, rien à installer) : http://localhost:3000/api — bouton "Try it out" sur chaque endpoint.
- **Postman** : collections disponibles dans `/docs/postman/` *(à ajouter au fur et à mesure par chaque module)*.

## Points d'attention

- Le fichier `.env` ne doit **jamais** être commité (il est dans `.gitignore`).
- PostgreSQL doit être démarré manuellement à chaque session de travail (`pg_ctl ... start`), ce n'est pas un service automatique avec cette installation.
- `synchronize: true` dans la config TypeORM est pratique en développement mais recrée/modifie les tables automatiquement — à surveiller quand plusieurs modules partagent la même base.

## Contact

Pour toute question sur le Module 2 (Trip Management), contacter Soufiane.

demarrer le server postgres : pg_ctl -D C:\pgsql\data -l C:\pgsql\data\logfile.log start