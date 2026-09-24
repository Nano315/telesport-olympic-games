# TéléSport — Jeux olympiques

Application Angular qui présente l'historique des Jeux olympiques pour la chaîne TéléSport : un tableau de bord des médailles par pays, et une page de détail par pays.

Projet 2 du parcours Lead Développeur Full-Stack Java/Angular (OpenClassrooms). Le code de départ fourni a été analysé puis restructuré ; l'analyse et les choix d'architecture sont consignés dans [notes-architecture.md](notes-architecture.md), et l'architecture retenue est décrite dans [ARCHITECTURE.md](ARCHITECTURE.md).

## Démarrer

Il faut Node en version 18.19, 20.11 ou 22 (versions supportées par Angular 18) et npm.

```bash
npm ci
npm start
```

L'application est servie sur http://localhost:4200.

Les autres commandes utiles :

```bash
npm run build   # build de production dans dist/
npm test        # tests unitaires (Karma + Jasmine)
npm run lint    # ESLint sur le TypeScript et les templates
```

Pour lancer les tests sans fenêtre de navigateur, par exemple en intégration continue :

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

## Les deux pages

`/` affiche le titre de la page, le nombre de pays, le nombre d'éditions et un camembert des médailles par pays. Choisir un pays ouvre sa page de détail.

`/country/:id` affiche le nom du pays, son nombre de participations, son total de médailles, son total d'athlètes, et la courbe de ses médailles édition par édition. Un bouton ramène à l'accueil. Un identifiant inconnu affiche un message d'erreur et le même bouton de retour.

Toute autre URL tombe sur une page 404.

## Structure

```
src/app/
├── models/        interfaces des données (Olympic, Participation, Indicator, LoadState)
├── services/      DataService (accès aux données) et olympic.stats.ts (calculs purs)
├── components/    composants d'affichage réutilisables (header, états, graphiques)
├── pages/         les trois pages routées, chacune avec sa fonction de vue
└── app.*          module, routage, layout et constantes partagées
```

Les données viennent de `src/assets/mock/olympic.json`, dont l'URL est déclarée dans `src/environments/`.

## Décisions

Les données ne sont chargées qu'une fois par session. `DataService` les publie dans un `BehaviorSubject` que les deux pages lisent, au lieu de refaire une requête à chaque navigation.

Chaque page est accompagnée d'une fonction pure (`dashboard.view.ts`, `country-detail.view.ts`) qui traduit l'état du service en données d'affichage. Les templates n'ont donc aucune décision à prendre, et ces fonctions se testent sans monter Angular.

L'URL de détail porte l'identifiant du pays et non son nom, parce que c'est ce qu'exposera l'API du projet suivant. Un pays introuvable suit le même chemin qu'un futur 404 : `getOlympicById` renvoie `undefined`, et la fonction de vue en fait un message d'erreur.

Les libellés de l'interface sont en anglais, comme les maquettes. Le message « Aucune donnée » demandé par le cahier des charges est donc rendu par « No data available ».

Le projet reste en NgModule, conformément aux consignes de l'exercice. Les schematics du CLI sont configurés en `standalone: false` pour que `ng generate` produise des composants déclarables dans `AppModule`.

Les graphiques utilisent Chart.js, dans des composants dédiés qui gèrent la création et la destruction de leur instance. Chaque graphique est doublé d'un tableau de données, ce qui le rend lisible au clavier et au lecteur d'écran.

## Qualité

`npm run lint` passe sans erreur. La règle `no-explicit-any` et la limite de 300 lignes par fichier, toutes deux exigées par le cahier des charges, sont vérifiées automatiquement.

`npm test` exécute 51 tests : les calculs, le service (succès, données vides, erreur réseau, identifiant inconnu), les fonctions de vue, les composants et les deux pages.
