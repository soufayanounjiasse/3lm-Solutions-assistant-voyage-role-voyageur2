Voya — Frontend (frontend/)

Application mobile Voyageur — modules Compte utilisateur et Gestion des voyages.

Ce dossier fait partie du monorepo voya-app, aux côtés de backend/. Voir le README à la racine du projet pour la vue d'ensemble et le workflow Git de l'équipe.

## Stack technique

| Élément | Technologie |
|---|---|
| Framework | React Native + Expo |
| Langage | TypeScript |
| Navigation | React Navigation (Native Stack + Bottom Tabs) |
| Icônes | @expo/vector-icons |
| Rendu web (dev) | react-native-web |
Prérequis
Node.js (LTS, v20+)
Le backend (../backend) doit tourner sur http://localhost:3000 — voir le README du backend pour le démarrer (PostgreSQL + npm run start:dev).
Installation
powershell
cd frontend
npm install
Lancer le projet
powershell
npx expo start

Puis choisir un mode d'affichage :

w → ouvre l'app dans le navigateur (http://localhost:8081) — pratique pour développer vite sans téléphone.
Scanner le QR code avec l'app Expo Go (Android/iOS) → lance l'app sur un vrai téléphone. ⚠️ Nécessite qu'Expo Go soit à jour avec une version compatible du SDK Expo (SDK 57 ici). Si incompatible, mettre à jour Expo Go depuis le store, ou utiliser l'émulateur Android Studio à la place.
a → lance sur un émulateur Android déjà ouvert (Android Studio).
Structure du projet
frontend/
├── App.tsx                 → point d'entrée, configure la navigation (Stack Navigator)
├── src/
│   ├── types.ts             → types partagés (voyages, utilisateur et navigation)
│   ├── i18n.tsx             → contexte de langue et traductions français/anglais/arabe
│   ├── api/
│   │   └── voya.ts          → tous les appels fetch vers l'API backend, centralisés ici
│   └── screens/
│       ├── OnboardingScreen.tsx         → choix de langue et préférences initiales
│       ├── LoginScreen.tsx              → connexion email ou téléphone
│       ├── RegisterScreen.tsx           → création de compte
│       ├── ProfileScreen.tsx            → profil, préférences et déconnexion
│       ├── DashboardScreen.tsx          → tableau de bord du voyage actif (carte hero + stats + "À venir")
│       ├── ReservationsScreen.tsx       → liste des réservations d'un voyage
│       ├── ReservationDetailScreen.tsx  → détail d'une réservation
│       ├── DocumentsScreen.tsx          → liste des documents d'un voyage
│       └── DocumentDetailScreen.tsx     → détail d'un document (+ lien d'ouverture)
Navigation actuelle
Dashboard (tableau de bord)
├── → Reservations (liste)
│     └── → ReservationDetail
└── → Documents (liste)
      └── → DocumentDetail

Chaque écran de liste attend voyageId et destination en paramètres de navigation ; chaque écran de détail attend l'id de l'élément concerné (reservationId ou documentId).

Connexion au backend

L'URL de base de l'API est définie dans src/api/voya.ts :

typescript
export const API_BASE_URL = 'http://localhost:3000';

⚠️ Le backend doit avoir CORS activé (app.enableCors() dans backend/src/main.ts) pour que les requêtes depuis le frontend web (localhost:8081) ne soient pas bloquées.

## Compte utilisateur et langues

Le parcours non authentifié commence par l'onboarding, puis mène à l'inscription ou à la connexion. Le token JWT et l'identifiant utilisateur sont conservés dans `AsyncStorage`.

Le choix de langue est disponible dès l'onboarding : `fr` (Français), `en` (English) et `ar` (العربية). Les textes du parcours utilisateur, du menu, du profil, de la création de voyage et des composants de formulaire utilisent le contexte partagé `src/i18n.tsx`. Le choix est persisté et le mode RTL est activé pour l'arabe.

Le frontend utilise le véritable identifiant de l'utilisateur connecté pour créer un voyage. Aucun identifiant utilisateur fictif n'est utilisé.

### Frontend SDK54 actuellement utilisé

La version frontend utilisée pour les derniers développements se trouve dans `../voya-frontend-sdk54`, avec sa propre installation npm :

```powershell
cd ..\voya-frontend-sdk54
npm install
npm start
```

Vérification TypeScript :

```powershell
npx tsc --noEmit
```

## État d'avancement (frontend)

| Fonctionnalité | Statut |
|---|---|
| Onboarding et sélection de langue (FR/EN/AR) | ✅ Fait |
| Inscription, connexion et session JWT | ✅ Fait |
| Profil et préférences utilisateur | ✅ Fait |
| Tableau de bord (voyage actif, stats, à venir) | ✅ Fait |
| Liste + détail des réservations | ✅ Fait |
| Liste + détail des documents (lecture seule) | ✅ Fait |
| Page liste de tous les voyages de l'utilisateur (passés/en cours/futurs) | ✅ Fait |
| Upload de documents (passeport, visa, billets...) | ✅ Fait |
Points d'attention
Si npm install ou npx expo install <package> échoue avec des modules manquants au démarrage (Cannot find module ...), c'est généralement une installation corrompue par une coupure réseau. Solution fiable : supprimer node_modules + package-lock.json, vider le cache (npm cache clean --force), puis npm install à nouveau.
Si un dossier est verrouillé lors d'une manipulation (Remove-Item, Move-Item), fermer tout serveur Expo/Node actif (Ctrl+C) et fermer VS Code avant de réessayer.
Ne jamais utiliser localStorage/sessionStorage dans ce projet (non supporté nativement par React Native) — utiliser l'état React ou AsyncStorage si un stockage local est nécessaire plus tard.
Contact

Pour toute question sur le frontend du Module 2 (Trip Management), contacter Soufiane.