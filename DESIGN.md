# DESIGN.md : Cyber-Physical Precision & Fluid Dynamics (Obsidian / Cyan)

Ce document formalise le système de design du portfolio d'Enrique Alex NDJAKOU KEMAYOU en s'appuyant sur trois référentiels complémentaires :
1. **`emilkowalski/skills` (`emil-design-eng`)** : cinématique, courbes d'accélération sur mesure, réactivité tactile et fluidité d'animation.
2. **`pbakaus/impeccable` (`impeccable` & `craft-floor`)** : hiérarchie typographique, contraste WCAG AA, surfaces navigateur thématisées et sobriété éditoriale.
3. **`Leonxlnx/taste-skill` (`design-taste-frontend`)** : rigueur structurelle, micro-interactions physiques sans tilt 3D artificiel et maîtrise stricte de la palette.

---

## 1. Visual World & Palette Signature
- **Univers :** Instrumentation cyber-physique, bancs d'essais temps réel, optique de précision et mécanique des fluides interactive (`CursorFluid` Navier-Stokes).
- **Palette Obsidian & Télémétrie (Dark Mode par défaut, Light Mode haute lisibilité) :**
  - `--color-brand-dark`: `#050505` (Obsidian profond)
  - `--color-brand-surface`: `#0A0C10` (Châssis instrumenté)
  - `--color-brand-elevated`: `#11141C` (Surface élevée avec bordure `rgba(255,255,255,0.10)` et reflet interne `inset 0 1px 0 rgba(255,255,255,0.06)`)
  - `--color-brand-cyan`: `#00D2FF` (Signal de télémétrie principal en mode sombre)
  - `--color-brand-blue`: `#3B82F6` / `--color-brand-blue-light`: `#2563EB` (Signaux cobalt accessibles en mode clair et sombre)
  - `--color-brand-green`: `#10B981` (Validation opérationnelle / En ligne)
  - `--color-brand-amber`: `#F59E0B` (Alerte / Seuil physique)
- **Règle chromatique (`taste-skill`) :** Aucun violet, lavande ou indigo générique (`#8B5CF6`, `#7C3AED`, `indigo-*`) dans l'interface ou les halos.

---

## 2. Moteur WebGL : `<CursorFluid />` (Navier-Stokes)
- **Choix Directeur :** Le fond interactif repose exclusivement sur `<CursorFluid />` (`src/components/animations/CursorFluid.tsx` + `webgl-fluid.js`), offrant une dissipation fluide calibrée sur la gamme cyan/cobalt (`SHADING: true`, `COLORFUL: true`, `SPLAT_RADIUS: 0.25`, `COLOR_UPDATE_SPEED: 8`, `BACK_COLOR: { r: 0, g: 0, b: 0 }`).
- **Résonance Chromatique :** Au survol d'une carte projet (`MagneticProjectCard`), l'événement `webgl-resonance` transmet la couleur thématique du système à `window.__webglResonanceColor` pour teinter le fluide sans rompre sa dynamique.
- **Performance & Accessibilité :** Initialisation différée via `requestIdleCallback` hors du chemin critique LCP, désactivation sur périphériques tactiles (`pointer: coarse`) ou sous `prefers-reduced-motion: reduce`, et libération explicite du contexte GPU (`destroy()` + `WEBGL_lose_context`) au démontage.

---

## 3. Cinématique & Micro-Interactions (`emilkowalski/skills` & `taste-skill`)
- **Courbes d'accélération personnalisées (`src/app/globals.css`) :**
  - `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` : pour les entrées, survols et retours d'état.
  - `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` : pour les transitions d'éléments persistants.
  - `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` : pour les modales, tiroirs et panneaux latéraux.
- **Feedback Tactile :** Les boutons et filtres interactifs réagissent au clic avec une compression nette (`active:scale-[0.97]`).
- **Cartes Projets (`MagneticProjectCard`) :**
  - **Sans Tilt 3D artificiel** (`taste-skill` Rule #5) : pas de `rotateX` / `rotateY` déformant la typographie.
  - **Élévation franche de 2 px** au survol (`hover:-translate-y-0.5`), zoom optique mesuré de l'image de couverture (`group-hover:scale-[1.03]`), et éclairage radial doux (`--mx`, `--my`).
  - **Filtrage sans reflow** : affichage filtré par GPU (`opacity` + `transform`) sans recalcul FLIP sur le thread principal.

---

## 4. Typographie & Surfaces Navigateur (`pbakaus/impeccable`)
- **Mesure de lecture :** Les blocs de texte narratif sont bornés à `max-w-[65ch]` pour préserver le confort de lecture.
- **Données & Télémétrie :** Alignement tabulaire systématique (`tabular-nums`) sur les compteurs, coordonnées géographiques (`51.03°N 02.37°E`), années et index (`SYS.01` à `SYS.15`).
- **Surfaces Navigateur :** Sélection de texte (`::selection`), curseur de saisie (`caret-color`), anneaux de focus clavier (`:focus-visible`) et barres de défilement internes calibrés en `#00D2FF` (sombre) et `#2563EB` / `#1D4ED8` (clair).

---

## 5. Identité de Marque & Prévisualisation Sociale (`kaankiziltug/logo-design-skill` · `op7418` · `neonwatty`)
- **Emblème Officiel : Le Prisme Architectural `EN` (`The Isometric EN Monolith`)**
  - Monogramme architectural 3D isométrique sans cercle ni cliché scolaire/industriel, validé pour le test `16x16` px.
  - La face gauche forme un **`E`** (`#00D2FF`) et la face droite forme un **`N`** (`#FFFFFF`) partageant une arête centrale de `10` unités sur une grille `24x24`.
- **Intégration Navigateurs :** Badge squircle Obsidienne (`#050505`) avec lueur radiale (`#0A1926`) et liseré spéculaire (`#00D2FF` / `#FFFFFF`) assurant la lisibilité sur onglets clairs et sombres.
- **Carte de Partage OpenGraph (`public/og-image.png`, `1200x630` px) :** Format standard `1.91:1` (`< 250 Ko`) intégrant le monolithe `EN`, les 4 piliers multidisciplinaires et le positionnement R&D international.
