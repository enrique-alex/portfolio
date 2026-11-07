# DESIGN.md — Cyber-Physical Precision & Fluid Dynamics (Obsidian / Cyan)

Ce document formalise le système de design du portfolio d'Enrique Alex NDJAKOU KEMAYOU en fusionnant et en adaptant trois référentiels d'excellence :
1. **`emilkowalski/skills` (`emil-design-eng`)** — Cinématique, courbes d'accélération sur mesure, réactivité tactile et performance 60 fps.
2. **`pbakaus/impeccable` (`impeccable` & `craft-floor`)** — Hiérarchie typographique, contraste WCAG AA/AAA, surfaces navigateur thématisées et élimination radicale des clichés IA.
3. **`Leonxlnx/taste-skill` (`design-taste-frontend`)** — Sobriété structurelle, micro-interactions physiques sans tilt 3D artificiel, et bannissement absolu du violet/lavande.

---

## 1. Visual World & Palette Signature
- **Univers :** Instrumentation cyber-physique, bancs d'essais temps réel, optique de précision et mécanique des fluides interactive (`CursorFluid` Navier-Stokes).
- **Palette Obsidian & Télémétrie (Dark Mode par défaut, Light Mode haute lisibilité) :**
  - `--color-brand-dark`: `#050505` (Obsidian profond)
  - `--color-brand-surface`: `#0A0C10` (Châssis instrumenté)
  - `--color-brand-elevated`: `#11141C` (Surface élevée avec bordure `rgba(255,255,255,0.10)` et reflet interne `inset 0 1px 0 rgba(255,255,255,0.06)`)
  - `--color-brand-cyan`: `#00D2FF` (Signal de télémétrie principal en mode sombre)
  - `--color-brand-blue`: `#3B82F6` (Signal cobalt en mode clair & accent secondaire)
  - `--color-brand-green`: `#10B981` (Validation opérationnelle / En ligne)
  - `--color-brand-amber`: `#F59E0B` (Alerte / Seuil physique)
- **Interdiction chromatique stricte (`taste-skill`) :** Zéro violet, lavande ou indigo générique (`#8B5CF6`, `#7C3AED`, etc.) dans l'interface ou les halos.

---

## 2. Moteur WebGL : `<CursorFluid />` (Navier-Stokes)
- **Choix Directeur :** Le fond interactif repose exclusivement sur `<CursorFluid />` (`src/components/animations/CursorFluid.tsx` + `webgl-fluid.js`), offrant une dissipation fluide, organique et naturelle au mouvement du curseur (`SHADING: true`, `COLORFUL: true`, `SPLAT_RADIUS: 0.25`, `COLOR_UPDATE_SPEED: 8`, `BACK_COLOR: { r: 0, g: 0, b: 0 }`).
- **Résonance Chromatique :** Au survol d'une carte projet (`MagneticProjectCard`), l'événement `webgl-resonance` transmet la couleur thématique du système à `window.__webglResonanceColor`, teintant organiquement le fluide sans briser sa dynamique naturelle.
- **Performance & Accessibilité :** Initialisation différée via `requestIdleCallback` hors du chemin critique LCP, arrêt total si `prefers-reduced-motion: reduce`, et libération explicite du contexte GPU (`WEBGL_lose_context`) au démontage.

---

## 3. Cinématique & Micro-Interactions (`emilkowalski/skills` & `taste-skill`)
- **Courbes d'accélération personnalisées (`src/app/globals.css`) :**
  - `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` — Pour toutes les entrées, survols et retours d'état.
  - `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` — Pour les déplacements d'éléments persistants.
  - `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` — Pour les modales, tiroirs et panneaux latéraux.
- **Feedback Tactile :** Tout bouton ou filtre interactif compresse légèrement au clic (`active:scale-[0.97]`).
- **Cartes Projets (`MagneticProjectCard`) :**
  - **Zéro Tilt 3D artificiel** (`taste-skill` Rule #5) : pas de `rotateX` / `rotateY` qui déforme la typographie.
  - **Élévation franche de 2px** au survol (`hover:-translate-y-0.5`), zoom optique subtil de l'image de couverture (`group-hover:scale-[1.03]`), et éclairage radial doux (`--mx`, `--my`).
  - **Zéro `layout` thrashing** : filtrage fluide par GPU (`opacity` + `transform`) sans recalcul FLIP sur le thread principal.

---

## 4. Typographie & Surfaces Navigateur (`pbakaus/impeccable`)
- **Mesure de lecture :** Tous les blocs de texte narratif sont bornés à `max-w-[65ch]` pour un confort de lecture optimal.
- **Données & Télémétrie :** Alignement tabulaire systématique (`tabular-nums`) sur tous les compteurs, coordonnées GPS (`51.03°N 02.37°E`), années et séquences (`SYS.01` à `SYS.15`).
- **Surfaces Navigateur :** Sélection de texte (`::selection`), curseur de saisie (`caret-color`), anneaux de focus clavier (`:focus-visible`) et barres de défilement internes teintés en `#00D2FF`.
