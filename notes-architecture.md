# Notes d'architecture — TéléSport

Mes notes d'analyse du starter Angular de TéléSport (projet 2, OpenClassrooms).

L'étape 1 consiste à comprendre le code existant et à lister ce qui ne va pas, sans rien modifier. C'est l'objet de ce document. J'ajouterai l'architecture cible à la fin, en étape 2.

## Comment j'ai analysé le projet

J'ai d'abord installé les dépendances avec `npm ci`, puis lancé `ng serve` pour voir à quoi ressemble l'application. J'ai cliqué partout, je me suis mis en mobile, et j'ai tapé des URL à la main pour voir ce qui casse : `/country/Atlantide`, `/country/1`, `/nimporte-quoi`. Ensuite seulement j'ai lu les fichiers, un par un, en les comparant aux spécifications de Jeannette.

Versions en place : Angular 18.2.13, CLI 18.2.20, TypeScript 5.4, RxJS 7.8, Chart.js 4. Sur ma machine, Node 24 et npm 11.

Ce que donnent les commandes du CLI :

| Commande | Résultat |
|---|---|
| `ng serve` | Démarre. Avertissement : « Node 24.12.0 (Unsupported) » |
| `ng build` | Passe. Avertissement sur la `target` du `tsconfig.json` |
| `ng test` | Ne compile pas. `app.component.spec.ts:26` : `Property 'title' does not exist on type 'AppComponent'` |
| `ng lint` | Impossible, aucun linter installé : `Cannot find "lint" target` |
| `npm audit` | 81 vulnérabilités (3 critiques, 45 élevées), dont 9 en production |

## Ce que contient le projet

```
src/app/
├── app.component.*           # juste un <router-outlet>
├── app.module.ts             # déclare les 3 pages + provideHttpClient()
├── app-routing.module.ts     # '', 'country/:countryName', 'not-found', '**'
└── pages/
    ├── home/                 # requête HTTP + calculs + camembert + HTML
    ├── country/              # requête HTTP + calculs + courbe + HTML
    └── not-found/
src/assets/mock/olympic.json  # 5 pays, 3 participations chacun (2012, 2016, 2020)
src/styles.scss               # les styles des en-têtes et des KPIs, en global
```

Pas de `components/`, pas de `services/`, pas de `models/`. Le README du starter décrit pourtant un dossier `core/`, un `olympic.service.ts` et deux fichiers de modèles : rien de tout ça n'existe dans le dépôt. J'ai cherché deux fois avant de comprendre que le README mentait.

Un point qui m'a surpris : les fichiers sont courts, 70 lignes au maximum. Je m'attendais à trouver un composant de 400 lignes. Le problème est ailleurs. Chaque page fait tout, de la requête HTTP jusqu'à l'affichage, et les deux pages font la même chose chacune de leur côté.

Et l'application marche. `ng build` passe, l'accueil affiche 5 pays et 3 JO avec son camembert, un clic ouvre la page du pays, « Go back » revient à l'accueil, une URL inconnue tombe sur la 404. Tant qu'on suit le chemin prévu, rien ne se plaint.

## Ce que j'ai vu en testant

| Ce que j'ai fait | Ce que j'ai obtenu |
|---|---|
| Clic sur « United States » | `/country/United%20States`, alors que la spec demande `/country/:id` |
| `/country/Atlantide`, puis `/country/1` | `TypeError` dans la console, badge de titre vide, KPIs à 0, aucun message pour l'utilisateur |
| Passage accueil → page pays | Le titre « Olympic games app » et le `<hr>` disparaissent : l'en-tête n'est pas le même |
| Affichage en 375 px | Camembert haut de 143 px seulement, libellés des KPIs sur trois lignes |
| Lecture du graphique pays | La courbe est gris clair, de la même couleur que la grille. Je ne l'avais pas vue au premier coup d'œil |
| `/nimporte-quoi` | La page 404 s'affiche, avec deux barres de défilement inutiles |
| Ouverture de la console sur l'accueil | Tout le JSON est recraché par un `console.log` |
| Navigation au clavier depuis l'accueil | Aucun élément ne prend le focus, donc aucun moyen d'ouvrir une page pays |

## Les problèmes

J'ai classé chaque problème selon trois niveaux. Critique : c'est un bug visible ou un critère d'acceptation qui saute. Majeur : ça marche, mais ça va coûter cher à maintenir ou bloquer le branchement de l'API. Mineur : propreté et cohérence.

Les numéros (A1, B2...) me servent à m'y retrouver quand j'en parle avec mon mentor.

| # | Problème | Gravité |
|---|---|---|
| A1 | Les pages appellent `HttpClient` elles-mêmes, aucun service | Critique |
| A2 | Aucun modèle de données | Critique |
| A3 | Calculs métier dans les composants | Majeur |
| A4 | En-tête, récupération et graphiques dupliqués | Majeur |
| A5 | URL du mock en dur, environnements inutilisés | Majeur |
| A6 | Aucun composant réutilisable ni layout commun | Mineur |
| A7 | Noms des pages éloignés de la spec | Mineur |
| A8 | README trompeur, pas d'`ARCHITECTURE.md` | Mineur |
| B1 | Route par nom de pays au lieu de l'id | Critique |
| B2 | Pays inexistant : plantage sans message | Critique |
| B3 | Paramètre de route lu par effet de bord | Majeur |
| B4 | Lien retour au lieu du bouton demandé | Mineur |
| C1 | 19 `any` | Critique |
| C2 | Conversions nombre vers texte vers nombre | Majeur |
| C3 | Déclarations de propriétés incohérentes | Mineur |
| D1 | Erreurs jamais affichées | Critique |
| D2 | Aucun état de chargement ni état vide | Critique |
| D3 | Abonnements manuels, sans nettoyage ni composition | Majeur |
| D4 | Syntaxe RxJS dépréciée, `.pipe()` vides | Mineur |
| E1 | Canvas ciblé par id global, graphiques jamais détruits | Majeur |
| E2 | Graphiques non responsives | Majeur |
| E3 | Courbe du graphique pays quasi invisible | Majeur |
| E4 | Camembert inutilisable au toucher | Mineur |
| E5 | Configuration Chart.js en dur, contenu `[object Object]` | Mineur |
| F1 | Styles des composants dans le SCSS global | Majeur |
| F2 | Accessibilité insuffisante | Majeur |
| F3 | HTML non sémantique | Majeur |
| F4 | Charte graphique nulle part | Mineur |
| G1 | `console.log` oubliés | Mineur |
| G2 | Code mort | Mineur |
| G3 | Constantes non factorisées | Majeur |
| G4 | Nommage et formatage incohérents | Mineur |
| H1 | Tests cassés | Majeur |
| H2 | Aucun linter | Majeur |
| H3 | `ng generate` crée des composants standalone | Majeur |
| H4 | Configuration Angular héritée d'anciennes versions | Mineur |
| H5 | Vulnérabilités et versions non supportées | Majeur |
| H6 | Dépendances inutilisées | Mineur |

### A. Architecture et responsabilités

#### A1. Les pages appellent `HttpClient` elles-mêmes (critique)

Les deux pages injectent `HttpClient` et vont chercher le JSON directement : [`home.component.ts:19-22`](src/app/pages/home/home.component.ts#L19-L22) et [`country.component.ts:21-27`](src/app/pages/country/country.component.ts#L21-L27). Même code, copié d'une page à l'autre, et le fichier entier est rechargé à chaque navigation.

C'est le problème central, celui dont découlent la moitié des autres. Tant que la requête vit dans le composant, brancher l'API REST du projet suivant voudra dire modifier chaque page, et tester une page voudra dire simuler `HttpClient`. La spec demande explicitement un `DataService` qui centralise l'accès aux données.

#### A2. Aucun modèle de données (critique)

Pas de dossier `models/`, pas d'interface `Olympic` ni `Participation`. La réponse HTTP est typée `any[]` dans [`home.component.ts:22`](src/app/pages/home/home.component.ts#L22) comme dans [`country.component.ts:27`](src/app/pages/country/country.component.ts#L27). Le [README:25](README.md#L25) prétend le contraire.

Sans interface, la forme des données n'est écrite nulle part. Si l'API renomme `medalsCount`, personne ne le saura avant l'exécution.

#### A3. Les calculs métier sont dans les composants (majeur)

Le nombre de JO se calcule avec un `Set` et un `flat` en [`home.component.ts:26-30`](src/app/pages/home/home.component.ts#L26-L30). Les totaux de médailles et d'athlètes se calculent à coups de `reduce` en [`country.component.ts:30-38`](src/app/pages/country/country.component.ts#L30-L38). Le tout dans les callbacks de `subscribe`.

Un composant affiche, il ne calcule pas. Ces agrégats sont de la logique métier, et pour l'instant ils ne sont testables qu'en montant un composant complet.

#### A4. Le même code dans les deux pages (majeur)

Le bloc « titre + indicateurs » est écrit à la main deux fois, indicateur par indicateur, sans `*ngFor` : [`home.component.html:5-17`](src/app/pages/home/home.component.html#L5-L17) et [`country.component.html:3-19`](src/app/pages/country/country.component.html#L3-L19). Les graphiques suivent la même recette dans [`home.component.ts:41-68`](src/app/pages/home/home.component.ts#L41-L68) et [`country.component.ts:48-66`](src/app/pages/country/country.component.ts#L48-L66).

On voit déjà les dégâts : le titre de l'application n'a été ajouté que sur l'accueil, et personne ne l'a reporté sur la page pays. D'où le `HeaderComponent` réutilisable du cahier des charges : un titre, une liste d'indicateurs, un seul fichier à corriger.

#### A5. L'URL du mock est en dur, les environnements ne servent à rien (majeur)

`'./assets/mock/olympic.json'` apparaît en [`home.component.ts:12`](src/app/pages/home/home.component.ts#L12) et en [`country.component.ts:13`](src/app/pages/country/country.component.ts#L13). Pendant ce temps, [`environment.ts`](src/environments/environment.ts#L5-L7) ne contient que `production: false`.

Ces fichiers existent précisément pour ça. Avec l'URL dans `environment`, lue par le service, passer du mock à l'API devient une ligne à changer.

#### A6. Rien n'est partagé entre les pages (mineur)

`AppComponent` se limite à un [`<router-outlet>`](src/app/app.component.html#L1). Le titre de l'application et le `<hr>` sont plantés dans la page d'accueil, en [`home.component.html:1-2`](src/app/pages/home/home.component.html#L1-L2). Ce qui est commun à toutes les pages devrait vivre dans un layout, pas dans l'une des pages.

#### A7. Les noms ne sont pas ceux de la spec (mineur)

`HomeComponent` et `CountryComponent` en [`home.component.ts:11`](src/app/pages/home/home.component.ts#L11) et [`country.component.ts:12`](src/app/pages/country/country.component.ts#L12), là où la spec parle de `DashboardPage` et `CountryDetailPage`. Détail, mais autant parler le même langage que l'équipe.

#### A8. Documentation trompeuse (mineur)

Le [README](README.md#L17-L25) décrit une architecture qui n'existe pas, le projet s'appelle toujours `olympic-games-starter` dans [`package.json`](package.json#L2), et il n'y a pas d'`ARCHITECTURE.md`. Les deux documents font partie des critères d'acceptation, donc à écrire avant la fin.

### B. Routing et navigation

#### B1. La route utilise le nom du pays, pas son id (critique)

La route déclarée est `country/:countryName` ([`app-routing.module.ts:13`](src/app/app-routing.module.ts#L13)), et la navigation utilise le libellé affiché dans le graphique ([`home.component.ts:60-61`](src/app/pages/home/home.component.ts#L60-L61)). D'où l'URL `/country/United%20States`.

La spec demande `/country/:id`. Un nom se traduit, contient des espaces et des accents, et change. Un id, non. C'est d'ailleurs ce qu'exposera l'API.

#### B2. Un pays inexistant fait planter la page (critique)

En [`country.component.ts:30-31`](src/app/pages/country/country.component.ts#L30-L31), `data.find(...)` renvoie `undefined` et la ligne suivante lit `selectedCountry.country` sans `?.`. D'où le `TypeError`. Le plus agaçant : les lignes juste en dessous utilisent `?.`, donc la protection a été écrite à moitié. Comme l'exception part du callback de succès, le gestionnaire d'erreur ne la voit jamais. Et la route `not-found` déclarée en [`app-routing.module.ts:17-20`](src/app/app-routing.module.ts#L17-L20) n'est jamais utilisée par personne.

Résultat pour l'utilisateur : une page à moitié vide, sans explication. Le critère « Gestion d'ID invalide » n'est pas rempli.

#### B3. Le paramètre de route est lu par effet de bord (majeur)

En [`country.component.ts:25-27`](src/app/pages/country/country.component.ts#L25-L27), le paramètre est copié dans une variable locale par un premier `subscribe`, puis relu dans le callback d'un second `subscribe`. Les deux flux ne sont pas composés : ça ne tient que parce que `paramMap` émet immédiatement.

J'ai vérifié le cas qui casse. Quand on passe d'un pays à un autre sans quitter la page, le routeur réutilise le composant : l'URL devient `/country/Italy` mais la page continue d'afficher France. Aujourd'hui aucun lien de l'interface ne permet de déclencher ça, donc le bug dort. Il se réveillera au premier lien « pays voisin ».

#### B4. Le retour est un lien, pas un bouton (mineur)

`<a routerLink="">Go back</a>` en [`country.component.html:28`](src/app/pages/country/country.component.html#L28) et [`not-found.component.html:3`](src/app/pages/not-found/not-found.component.html#L3). Ça fonctionne, le routeur traite la chaîne vide comme la racine, mais la spec demande un bouton « Retour » avec `routerLink="/"`. Et à la lecture, `""` se comprend plutôt comme « la route courante ».

### C. Typage

#### C1. 19 `any` (critique)

Répartis sur 14 lignes : [`country.component.ts`](src/app/pages/country/country.component.ts#L16) lignes 16, 27, 30, 32, 34, 35, 36 (deux fois), 37 et 38 (deux fois), et [`home.component.ts`](src/app/pages/home/home.component.ts#L22) lignes 22, 26 (deux fois), 27, 29 (deux fois) et 30 (deux fois).

Le `tsconfig.json` est pourtant en `strict: true`. Chaque `any` annule cette vérification à l'endroit où elle servirait le plus, c'est-à-dire à la frontière avec les données. Le cahier des charges les interdit, et de toute façon ils disparaîtront d'eux-mêmes une fois les interfaces écrites.

#### C2. Des nombres transformés en texte pour être re-transformés en nombres (majeur)

En [`country.component.ts:35-38`](src/app/pages/country/country.component.ts#L35-L38) : `medalsCount.toString()`, puis `parseInt(item)` dans le `reduce`. Le graphique, lui, est déclaré `Chart<"line", string[], number>` ([ligne 14](src/app/pages/country/country.component.ts#L14)) et reçoit effectivement des chaînes.

Ça fonctionne parce que Chart.js reconvertit derrière. C'est le genre de code qu'on écrit quand on ne sait pas ce qu'on manipule, ce qui renvoie à C1.

#### C3. Déclarations incohérentes (mineur)

`totalEntries: any = 0` alors que c'est un compteur, trois assertions `!` pour contourner l'initialisation stricte (`error!`, `pieChart!`, `lineChart!`), un `titlePage` sans modificateur au milieu de propriétés `public`, et aucun type de retour sur `ngOnInit` ni sur les méthodes de construction des graphiques. Voir [`country.component.ts:14-19`](src/app/pages/country/country.component.ts#L14-L19) et [`home.component.ts:13-17`](src/app/pages/home/home.component.ts#L13-L17).

### D. Observables et états de l'interface

#### D1. Les erreurs ne s'affichent jamais (critique)

`this.error` est bien renseigné en [`home.component.ts:34-37`](src/app/pages/home/home.component.ts#L34-L37) et [`country.component.ts:42-44`](src/app/pages/country/country.component.ts#L42-L44). Sauf qu'aucun template ne lit cette propriété. J'ai cherché « error » dans les trois fichiers HTML : rien.

Donc si le JSON ne répond pas, l'utilisateur voit une page vide et rien d'autre. Au passage, le log d'erreur de l'accueil affiche `[object Object]`, et le message stocké est le message technique brut de `HttpErrorResponse`, pas une phrase destinée à un visiteur.

#### D2. Ni chargement ni état vide (critique)

Les KPIs affichent `0` tant que les données ne sont pas là. Et si le tableau revient vide, le `if (data && data.length > 0)` de [`home.component.ts:25`](src/app/pages/home/home.component.ts#L25) ne fait simplement rien, sans le dire. La spec demande un squelette ou un spinner pendant le chargement, et « Aucune donnée » quand il n'y a rien.

#### D3. Des `subscribe` impératifs, sans nettoyage (majeur)

Toute la logique est dans les callbacks : [`home.component.ts:22-38`](src/app/pages/home/home.component.ts#L22-L38), [`country.component.ts:26-45`](src/app/pages/country/country.component.ts#L26-L45). Ni pipe `async`, ni `takeUntilDestroyed`, ni `ngOnDestroy`.

Honnêtement, il n'y a pas de fuite aujourd'hui : un appel `HttpClient` se termine tout seul après sa réponse, et l'`ActivatedRoute` meurt avec le composant. C'est l'habitude qui est dangereuse. Le jour où le service exposera un flux qui dure, par exemple des données mises en cache dans un `BehaviorSubject`, ce même code fuira pour de bon.

#### D4. Syntaxe dépréciée (mineur)

`subscribe(next, error)` avec deux fonctions séparées est déprécié depuis RxJS 7 au profit d'un objet `{ next, error }` : [`home.component.ts:22`](src/app/pages/home/home.component.ts#L22) et [`country.component.ts:27`](src/app/pages/country/country.component.ts#L27). Les `.pipe()` juste avant sont vides, donc ils ne servent à rien.

### E. Les graphiques (Chart.js)

#### E1. Canvas ciblé par son id, graphiques jamais détruits (majeur)

`new Chart("DashboardPieChart", ...)` en [`home.component.ts:42`](src/app/pages/home/home.component.ts#L42) cherche le canvas par id dans tout le document, depuis le callback HTTP. Pareil en [`country.component.ts:49`](src/app/pages/country/country.component.ts#L49). Aucun `@ViewChild`, aucun `ngAfterViewInit`, et aucun `destroy()` au départ de la page.

Ce qui me dérange ici, c'est que ça ne marche que par chance de calendrier : la réponse HTTP arrive après l'affichage du template, donc le canvas existe. Avec des données déjà en cache, donc disponibles tout de suite, le canvas n'existerait pas encore et le graphique ne s'afficherait pas. Et chaque visite laisse derrière elle une instance de Chart que personne ne libère.

#### E2. Les graphiques ne s'adaptent pas à l'écran (majeur)

`aspectRatio: 2.5` est figé en [`home.component.ts:54`](src/app/pages/home/home.component.ts#L54) et [`country.component.ts:62`](src/app/pages/country/country.component.ts#L62). Sur un écran de 375 px, ça donne un camembert de 143 px de haut, illisible. Côté CSS, la seule media query du projet est à 1000 px ([`country.component.scss:15-19`](src/app/pages/country/country.component.scss#L15-L19)), alors que la spec parle de 768 px et 1200 px. La user story US-05 n'est pas tenue.

#### E3. La courbe est quasi invisible (majeur)

En [`country.component.ts:54-58`](src/app/pages/country/country.component.ts#L54-L58), seul `backgroundColor` est défini. Chart.js applique donc sa couleur de ligne par défaut, un gris très clair, exactement comme la grille. L'axe Y ne part pas de zéro non plus, ce qui exagère les écarts entre deux éditions. Et « Date » est un `<h2>` posé sous le graphique ([`country.component.html:24`](src/app/pages/country/country.component.html#L24)) plutôt qu'un titre d'axe.

#### E4. Le camembert est inutilisable au doigt (mineur)

Le gestionnaire de clic en [`home.component.ts:55-61`](src/app/pages/home/home.component.ts#L55-L61) recalcule l'élément cliqué alors que Chart.js le passe déjà en paramètre, et prévoit un repli `''` qui enverrait vers `/country/`. Surtout, sur mobile, l'appui déclenche la navigation immédiatement : impossible de lire le nombre de médailles d'un pays, puisque cette valeur n'apparaît que dans l'infobulle.

#### E5. Configuration en dur et `[object Object]` (mineur)

Les couleurs sont écrites dans le composant en [`home.component.ts:49`](src/app/pages/home/home.component.ts#L49), avec un `'orange'` au milieu des codes hexadécimaux, et la palette de six couleurs recommencera au début au septième pays. Le `<canvas>` contient `{{ pieChart }}` ([`home.component.html:19`](src/app/pages/home/home.component.html#L19)), ce qui affiche `[object Object]` comme contenu de repli. Enfin, `import Chart from 'chart.js/auto'` embarque tous les types de graphiques de la bibliothèque, pour un bundle principal de 431 ko.

### F. Templates, styles et accessibilité

#### F1. Les styles des composants sont dans le SCSS global (majeur)

[`styles.scss:6-43`](src/styles.scss#L6-L43) définit `.center div` et `.split div`, qui s'appliquent donc à n'importe quelle `div` placée dans ces classes, n'importe où dans l'application. `.heading` ne sert à rien. `home.component.scss` et `app.component.scss` sont vides. Et [`not-found.component.scss`](src/app/pages/not-found/not-found.component.scss#L1-L8) redéfinit `.center` en `100vw` / `100vh`, ce qui, avec la marge globale, explique les deux barres de défilement de la page 404.

Angular isole déjà les styles par composant. Autant s'en servir, et garder le global pour les variables, la typographie et le reset.

#### F2. Accessibilité (majeur)

Les canvas n'ont ni texte alternatif ni `aria-label` ([`home.component.html:19`](src/app/pages/home/home.component.html#L19), [`country.component.html:23`](src/app/pages/country/country.component.html#L23)). Comme la navigation vers le détail n'existe que dans le `onClick` de Chart.js ([`home.component.ts:55-64`](src/app/pages/home/home.component.ts#L55-L64)), l'accueil n'a aucun élément focusable : au clavier, on ne peut tout simplement pas atteindre une page pays. Aucun `:focus` n'est défini dans le projet.

Côté contrastes, j'ai mesuré : blanc sur `#0b868f` donne 4,36:1 et le gris sur blanc 3,95:1, pour un minimum AA de 4,5:1 sur du texte normal. On est juste en dessous, ce qui est presque plus embêtant qu'un écart franc, parce que ça se voit mal à l'œil.

#### F3. HTML peu sémantique (majeur)

Aucun `<h1>` dans l'application, les titres de page sont des `<div>`, les KPIs des `<p>`, la légende d'axe un `<h2>`, et il n'y a ni `<main>` ni `<header>`. Voir [`home.component.html`](src/app/pages/home/home.component.html#L1) et [`country.component.html`](src/app/pages/country/country.component.html#L1). C'est cette structure que les lecteurs d'écran utilisent pour naviguer.

#### F4. Pas de charte graphique (mineur)

`#0b868f` est recopié dans le SCSS et dans les deux composants TypeScript, sans variable. Aucune police n'est définie, donc l'application s'affiche dans le serif par défaut du navigateur. Le logo `assets/images/teleSport.png` est livré dans le dépôt mais n'est jamais utilisé. `index.html` annonce `lang="en"` et le titre « Olympic Games App ». Les nombres sont affichés bruts, `1888` au lieu de `1 888`.

### G. Propreté du code

#### G1. `console.log` oubliés (mineur)

[`home.component.ts:24`](src/app/pages/home/home.component.ts#L24) recrache tout le JSON dans la console, et [ligne 35](src/app/pages/home/home.component.ts#L35) affiche `[object Object]` en guise de message d'erreur.

#### G2. Code mort (mineur)

`Router` est injecté dans `CountryComponent` sans être utilisé ([lignes 3 et 21](src/app/pages/country/country.component.ts#L21)). `.map((i: any) => i)` en [ligne 32](src/app/pages/country/country.component.ts#L32) ne fait qu'une copie dont on ne lit que la taille. Les `.pipe()` sont vides. Les propriétés `pieChart` et `lineChart` ne servent qu'à l'interpolation qui affiche `[object Object]`. Le constructeur de `NotFoundComponent` est vide. La classe `.heading` n'est utilisée nulle part.

#### G3. Constantes recopiées partout (majeur)

L'URL du mock, les couleurs, `aspectRatio`, le segment de route `'country'` et les libellés des KPIs sont écrits en dur, souvent à deux endroits : [`home.component.ts:12`](src/app/pages/home/home.component.ts#L12), [49](src/app/pages/home/home.component.ts#L49), [54](src/app/pages/home/home.component.ts#L54), [61](src/app/pages/home/home.component.ts#L61), [`country.component.ts:13`](src/app/pages/country/country.component.ts#L13), [57](src/app/pages/country/country.component.ts#L57) et [62](src/app/pages/country/country.component.ts#L62). Factoriser les constantes fait partie des contraintes du cahier des charges.

#### G4. Nommage et formatage (mineur)

`i` désigne tour à tour un pays, une participation, un tableau et un nombre. En [`home.component.ts:29-30`](src/app/pages/home/home.component.ts#L29-L30), un `i` en masque même un autre dans la fonction imbriquée. Côté forme : guillemets simples et doubles mélangés, points-virgules parfois absents, espacement des imports variable, alors qu'un `.editorconfig` est présent dans le dépôt.

### H. Outillage, tests, configuration

#### H1. Les tests sont cassés (majeur)

`ng test` ne compile pas : [`app.component.spec.ts:23-34`](src/app/app.component.spec.ts#L23-L34) teste un `title` et un `.content span` qui viennent du template généré par le CLI et n'existent plus. Les specs de [`home`](src/app/pages/home/home.component.spec.ts#L10-L12) et [`country`](src/app/pages/country/country.component.spec.ts#L11-L13) ne fournissent ni `HttpClient` ni `ActivatedRoute` : elles échoueraient aussi, si on allait jusque-là. Les seuls tests écrits sont des « should create », et `RouterTestingModule` est déprécié.

Concrètement, je vais refactoriser sans filet.

#### H2. Aucun linter (majeur)

`ng lint` est impossible, aucun ESLint n'est installé ([`package.json:4-10`](package.json#L4-L10)), et il n'y a pas de formateur non plus. L'exercice demande justement de passer `ng lint`. Un linter aurait relevé seul une bonne partie des points C et G.

#### H3. `ng generate` va créer des composants standalone (majeur)

Avec le CLI 18, `ng generate component` crée un composant standalone par défaut, et [`angular.json:8-12`](angular.json#L8-L12) ne change rien à ce comportement.

Un composant standalone ne peut pas être déclaré dans `AppModule`, donc la compilation cassera dès le premier composant généré à l'étape 3. À régler avant de générer quoi que ce soit, soit en forçant `standalone: false` dans les schematics, soit en assumant le passage complet au standalone.

#### H4. Configuration héritée d'anciennes versions (mineur)

`browserTarget` ([`angular.json:72-83`](angular.json#L72-L83)) est déprécié au profit de `buildTarget`. Le builder utilisé est `:browser` (webpack) et non `:application` (esbuild). `polyfills.ts` et `test.ts` traînent depuis des versions plus anciennes du CLI. Et la `target: es2020` du [`tsconfig.json`](tsconfig.json#L19) déclenche l'avertissement que je vois à chaque build.

#### H5. Vulnérabilités et versions (majeur)

`npm audit` remonte 81 vulnérabilités, dont 9 dans les dépendances de production, qui touchent Angular lui-même. Angular 18 n'est plus supporté depuis novembre 2025, donc ces failles ne seront pas corrigées sur cette branche. Côté Node, Angular 18 attend du 18.19, 20.11 ou 22, et je suis en 24 : ça tourne, avec un avertissement. Rien dans le projet n'impose de version, ni `engines` dans le `package.json`, ni `.nvmrc`.

Monter Angular de version sort du cadre de l'exercice. Je note le risque, et je vais au moins repasser sur un Node supporté.

#### H6. Dépendances inutilisées (mineur)

`@angular/animations`, `@angular/forms`, `@angular/platform-server` et `@types/express` sont déclarés dans [`package.json`](package.json#L12-L41) mais jamais importés. Le projet n'a ni formulaire, ni animation, ni rendu serveur.

## Ce que j'en retiens

Le code du starter, pris ligne à ligne, se lit sans difficulté. Ce qui manque, c'est une couche. Deux composants font à eux seuls le travail de trois ou quatre fichiers, et aucun n'a de responsabilité qu'on puisse résumer en une phrase.

Tout part de là. Comme la requête HTTP est dans la page, les données ne sont pas typées, les calculs se font dans le callback, et le code est recopié dans l'autre page. Sortir l'accès aux données vers un service règle, au moins partiellement, une bonne moitié de ma liste.

Ensuite viennent les cas limites, que personne n'a traités : pays inconnu, erreur réseau, chargement, données vides. D'où les deux bugs les plus visibles, le plantage sur `/country/Atlantide` et la page muette quand le fichier ne répond pas.

Ce qui m'inquiète le plus pour la suite, ce n'est pourtant aucun des deux : c'est H1 et H2. Je m'apprête à déplacer tout le code d'un projet dont les tests ne compilent pas et qui n'a pas de linter. Je vais donc commencer par remettre ces deux outils en état, avant de toucher à l'architecture.

## Questions à trancher

Le total des médailles, d'abord. La spec le définit comme « or + argent + bronze », mais le JSON ne fournit qu'un `medalsCount` par participation. Je partirai sur `medalsCount`, mais c'est un écart entre le cahier des charges et les données, donc une question à poser.

La langue, ensuite. Les maquettes et les libellés actuels sont en anglais, alors que la spec demande un message « Aucune donnée » en français. Il faut choisir, et s'y tenir.

Les NgModules enfin. Les consignes parlent de `app.module.ts` et de mettre à jour ses imports, donc je reste sur des NgModules et je configurerai le CLI en conséquence (voir H3). Passer tout en standalone serait plus moderne, mais ce n'est pas ce que l'exercice demande.

## Architecture cible

À compléter à l'étape 2.
