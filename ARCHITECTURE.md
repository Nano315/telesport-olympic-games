# Architecture

L'application tient en deux pages et un service. Le service fournit les données, les composants les affichent.

Le chemin d'une donnée : `olympic.json` → `DataService` → la fonction de vue de la page → la page → ses composants.

## Arborescence

```
src/app/
├── models/        les formes de données : Olympic, Participation, Indicator, LoadState
├── services/      DataService (les données) et olympic.stats.ts (les calculs)
├── components/    les briques d'affichage réutilisables
├── pages/         les trois pages routées
└── app.*          module, routage, layout commun, constantes partagées
```

Les données viennent de `src/assets/mock/olympic.json`. Son URL est déclarée dans `src/environments/`, et nulle part ailleurs.

## Les pages

| Route | Page | Ce qu'elle affiche |
| --- | --- | --- |
| `/` | `DashboardPageComponent` | Nombre de pays, nombre d'éditions, camembert des médailles. Un clic ouvre le détail du pays. |
| `/country/:id` | `CountryDetailPageComponent` | Participations, médailles, athlètes, courbe par édition, bouton retour. Un identifiant inconnu renvoie vers la 404. |
| tout le reste | `NotFoundComponent` | La seule page d'erreur du projet. |

Une page ne calcule rien. Elle s'abonne au service, et une petite fonction pure à côté d'elle (`dashboard.view.ts`, `country-detail.view.ts`) traduit l'état reçu en données prêtes à afficher : un titre, des indicateurs, les points du graphique.

## Les composants

| Composant | Rôle | Entrées et sorties |
| --- | --- | --- |
| `HeaderComponent` | L'en-tête commun aux deux pages | `@Input` title, indicators |
| `StatusMessageComponent` | Chargement, absence de données, erreur | `@Input` status, message · `@Output` retry |
| `MedalsByCountryChartComponent` | Le camembert du dashboard | `@Input` data · `@Output` countrySelected |
| `MedalsByEditionChartComponent` | La courbe de la page pays | `@Input` data, countryName |

Aucun ne connaît `HttpClient` ni le routeur. Le camembert émet l'identifiant du pays cliqué, et c'est la page qui navigue. Du coup ces composants se réutilisent ailleurs sans rien traîner avec eux.

## Le service

`DataService` est le seul fichier de l'application qui sait d'où viennent les données. Il est déclaré `providedIn: 'root'`, donc Angular n'en crée qu'une instance : les deux pages lisent le même chargement, au lieu d'en déclencher un chacune.

```ts
readonly olympics$: Observable<LoadState<Olympic[]>>;
getOlympicById(id: number): Observable<LoadState<Olympic | undefined>>;
load(): void;
```

`load()` est appelé une fois au démarrage par `AppComponent`. Le service publie le résultat dans un `BehaviorSubject`, et les pages s'y abonnent avec le pipe `async` : c'est le pattern Observer, et il évite tout `subscribe` manuel dans les composants.

`LoadState<T>` décrit les quatre situations possibles d'un chargement : `loading`, `loaded`, `empty`, `error`. Comme les données ne sont accessibles que dans le cas `loaded`, le compilateur oblige à traiter les autres.

Les calculs de totaux et d'agrégats vivent à part, dans `olympic.stats.ts`, en fonctions pures sans dépendance à Angular.

## Quand l'API remplacera le fichier JSON

- `src/environments/` : l'URL change, c'est tout. Le remplacement de fichier entre dev et prod est déjà configuré.
- `data.service.ts` : la requête pointe vers l'endpoint, et `getOlympicById` peut devenir un vrai `GET /olympics/:id`. Son type de retour ne bouge pas : un 404 revient comme `undefined`, cas déjà traité.
- `components/` et `pages/` : rien à changer. S'il fallait toucher une page le jour du branchement, c'est que la frontière aurait été mal placée.

L'analyse du code de départ et le détail des choix sont dans [notes-architecture.md](notes-architecture.md).
