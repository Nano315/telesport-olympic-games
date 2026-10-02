# Notes d'architecture — TéléSport

Mes notes d'analyse du code de départ, et l'architecture que j'en ai tirée. L'architecture telle qu'elle est aujourd'hui dans le code est décrite dans [ARCHITECTURE.md](ARCHITECTURE.md).

## Comment j'ai analysé

J'ai d'abord lancé l'application et cliqué partout, en 375 px comme en grand écran, et j'ai tapé des URL à la main pour voir ce qui casse. J'ai lu le code ensuite, en le comparant au cahier des charges.

Ce que les commandes du projet répondaient au départ :

| Commande | Résultat |
| --- | --- |
| `ng serve` et `ng build` | Passent, avec un avertissement : Node 24 n'est pas supporté par Angular 18 |
| `ng test` | Ne compile pas : la spec teste un `title` qui n'existe plus |
| `ng lint` | Impossible, aucun linter installé |
| `npm audit` | 81 vulnérabilités, dont 9 en production |

## Ce qui casse pour l'utilisateur

- Un pays inconnu fait planter la page : `data.find(...)` renvoie `undefined` et la ligne suivante lit `selectedCountry.country` sans protection. Les lignes d'après utilisent pourtant `?.`, la protection avait été écrite à moitié.
- Les erreurs ne s'affichent jamais. `this.error` est rempli, mais aucun template ne le lit, donc une panne ressemble à une page vide.
- Il n'y a ni chargement ni état vide. Les indicateurs affichent `0` en attendant les données, et un tableau vide ne produit rien du tout, silencieusement.
- L'URL porte le nom du pays, `/country/United%20States`, là où le cahier des charges demande son identifiant.
- Le détail d'un pays est inatteignable au clavier : la navigation n'existe que dans le gestionnaire de clic de Chart.js.
- Sur mobile, le camembert fait 143 px de haut, à cause d'un ratio figé.

Ces six points ont un air de famille : personne ne s'est demandé ce qui se passe quand ça ne se passe pas bien.

## Ce qui coûte cher à maintenir

- Les deux pages appellent `HttpClient` elles-mêmes, avec le même code copié, et rechargent le JSON entier à chaque navigation. Le jour de l'API, il faudra modifier chaque page.
- Rien n'est typé : 19 `any` dans un projet pourtant en mode strict. Le typage est désactivé précisément là où il sert, à la frontière avec les données.
- Les calculs vivent dans les composants : nombre d'éditions, totaux de médailles et d'athlètes, tous dans les callbacks de `subscribe`.
- L'en-tête et les graphiques sont dupliqués d'une page à l'autre. On en voit déjà le prix : le titre de l'application n'a été ajouté que sur l'accueil.
- L'URL du mock est écrite en dur, deux fois, alors que les fichiers d'environnement ne contiennent que `production`.
- Les styles des composants sont dans `styles.scss`, avec des sélecteurs comme `.center div` qui s'appliquent partout.

C'est le premier point qui explique les autres. Quand la requête vit dans la page, le typage se perd et le code se recopie.

## Le reste

Du code mort (`Router` injecté sans être utilisé, `.pipe()` vides, une classe SCSS jamais appelée), deux `console.log` dont un qui affiche `[object Object]`, des constantes recopiées, un `i` qui désigne tour à tour un pays, un tableau et un nombre.

Côté outillage : les tests ne compilent pas, il n'y a pas de linter, et avec le CLI 18 un `ng generate component` produit un composant standalone, qu'on ne peut pas déclarer dans `AppModule`. Ce dernier point m'aurait bloqué dès le premier composant généré.

## L'architecture que j'ai choisie

Une règle : chaque fichier a une responsabilité qu'on peut formuler en une phrase. Si la phrase contient un « et », le fichier fait deux choses.

```
src/app/
├── models/        les formes de données
├── services/      DataService (les données) et olympic.stats.ts (les calculs)
├── components/    header, messages d'état, les deux graphiques
├── pages/         dashboard, détail d'un pays, 404
└── app.*          module, routage, layout, constantes
```

Les quatre dossiers suggérés par l'énoncé, et rien au-dessus. J'ai hésité à ajouter `core/`, courant dans les projets Angular, mais le cahier des charges impose le chemin `src/app/services/data.service.ts` : l'y mettre serait déjà s'écarter des consignes. Pour deux pages et huit composants, un niveau suffit.

Les trois patterns retenus et ce qu'ils règlent ici :

- **Singleton** (`providedIn: 'root'`) : une seule instance de `DataService`, donc un seul chargement partagé par les deux pages, au lieu d'une requête par navigation.
- **Observer** (RxJS) : le service publie son état, les pages l'écoutent avec le pipe `async`, et plus personne n'appelle `subscribe` à la main.
- **Séparation composant/service** : le service sait où sont les données, les composants savent les afficher.

Je n'écris pas d'**Adapter** : le JSON correspond déjà aux interfaces imposées, le traduire reviendrait à traduire une langue vers elle-même. L'endroit où il se branchera est noté dans `ARCHITECTURE.md`. Le **Decorator**, lui, est déjà là sans que je l'écrive : `@Component`, `@Injectable`, `@Input`.

Et le jour où l'API remplacera le fichier : seuls l'environnement et `DataService` changent, les pages et les composants ne bougent pas.

## Ce que la refactorisation a changé au plan

Le plan prévoyait de livrer les deux pages séparément. Impossible : le dashboard navigue par identifiant alors que l'ancienne page de détail attendait un nom, donc les séparer aurait laissé l'application cassée entre deux commits.

Et une surprise : une fois l'erreur de compilation des tests corrigée, le `require.context` de `src/test.ts` s'est révélé incompatible avec le builder d'Angular 18. Je l'avais classé en dette mineure ; il bloquait en fait toute la suite.

## Questions restées ouvertes

- Le cahier des charges définit le total comme « or + argent + bronze », mais le JSON ne fournit qu'un `medalsCount`. J'utilise `medalsCount`.
- Les maquettes et les libellés sont en anglais, alors que le message vide demandé est en français. J'ai tout gardé en anglais.
- Angular 18 n'est plus supporté depuis novembre 2025, et Node 24 non plus par Angular 18. La montée de version sort du cadre de l'exercice, je note le risque.
