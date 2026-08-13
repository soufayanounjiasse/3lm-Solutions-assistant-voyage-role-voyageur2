Voya — Frontend (frontend/)

Application mobile Voyageur — Module 2 : Gestion des voyages (Trip Management).

Ce dossier fait partie du monorepo voya-app, aux côtés de backend/. Voir le README à la racine du projet pour la vue d'ensemble et le workflow Git de l'équipe.

Stack technique
Élément	Techno
Framework	React Native + Expo (SDK 57)
Langage	TypeScript
Navigation	React Navigation (Native Stack)
Icônes	@expo/vector-icons
Rendu web (dev)	react-native-web
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
│   ├── types.ts             → types partagés (Voyage, Reservation, DocumentItem, RootStackParamList)
│   ├── api/
│   │   └── voya.ts          → tous les appels fetch vers l'API backend, centralisés ici
│   └── screens/
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

État d'avancement (Module 2 — côté frontend)
Fonctionnalité	Statut
Tableau de bord (voyage actif, stats, à venir)	✅ Fait
Liste + détail des réservations	✅ Fait
Liste + détail des documents (lecture seule)	✅ Fait
Page liste de tous les voyages de l'utilisateur (passés/en cours/futurs)	⏸️ À faire
Upload de documents (passeport, visa, billets...)	⏸️ À faire
Points d'attention
Si npm install ou npx expo install <package> échoue avec des modules manquants au démarrage (Cannot find module ...), c'est généralement une installation corrompue par une coupure réseau. Solution fiable : supprimer node_modules + package-lock.json, vider le cache (npm cache clean --force), puis npm install à nouveau.
Si un dossier est verrouillé lors d'une manipulation (Remove-Item, Move-Item), fermer tout serveur Expo/Node actif (Ctrl+C) et fermer VS Code avant de réessayer.
Ne jamais utiliser localStorage/sessionStorage dans ce projet (non supporté nativement par React Native) — utiliser l'état React ou AsyncStorage si un stockage local est nécessaire plus tard.
Contact

Pour toute question sur le frontend du Module 2 (Trip Management), contacter Soufiane.