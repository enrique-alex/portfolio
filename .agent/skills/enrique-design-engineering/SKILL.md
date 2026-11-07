---
name: enrique-design-engineering
description: Unified Design Engineering, Craft Floor & Taste skill adapted to Enrique Alex Ndjakou Kemayou's multidisciplinary engineering universe. Synthesizes emilkowalski/skills (emil-design-eng), pbakaus/impeccable, and Leonxlnx/taste-skill.
---

# Enrique Design Engineering & Cyber-Physical Taste Skill

This skill adapts three industry-reference frontend design and engineering methodologies to the specific universe of **Enrique Alex NDJAKOU KEMAYOU** (Polytech Lille — Electrical Engineering, Mechatronics, Embedded Systems, Robotics, Real-Time Control, Software & Industrial Architecture):
1. **`emilkowalski/skills` (`emil-design-eng`)** — Invisible craft, custom `cubic-bezier` curves, tactile press feedback (`0.97`), GPU-only animations (`transform`, `opacity`), and strict `65ch` / `tabular-nums` typography.
2. **`pbakaus/impeccable` (`impeccable` & `craft-floor`)** — Anti-AI-slop discipline, durable context (`PRODUCT.md` & `DESIGN.md`), WCAG AA/AAA contrast floor, and themed browser surfaces (`::selection`, `caret-color`, `:focus-visible`).
3. **`Leonxlnx/taste-skill` (`design-taste-frontend`)** — Disciplined layout density, no artificial 3D card tilt (`hover:-translate-y-0.5` + `group-hover:scale-[1.03]`), zero violet/lavender palette rule, and factual engineering copywriting.

---

## 1. Editorial & Identity Guardrails (No Over-Centering on SCADA)
- **Multidisciplinary Balance:** Enrique is currently an Apprentice Engineer at **Minakem Dunkerque** working on SCADA / Ignition / T-SQL / ISA-18.2, **and** a multidisciplinary engineering student in **Electrical Engineering & Mechatronics (Polytech Lille)** projecting himself toward **R&D, embedded systems, robotics, real-time control, and an international engineering internship (stage à l'étranger)**.
- **Where SCADA belongs:** Keep `ISA-18.2`, `Ignition Perspective`, and `SQL Server` inside the Minakem experience (`experience.0.*`), the Automation skill category, and the dedicated SCADA project.
- **Where Multidisciplinary & International Horizon belong:** The Hero section (`HeroSection.tsx`, `hero.*`), Profile mission (`profile.*`), Projects header (`projects.header.subtitle`), and Contact callout (`contact.header.subtitle`) must always foreground all **4 engineering pillars** (`Embarqué · Robotique · Commande Temps Réel · Architecture Logicielle & Industrielle`) and openness to **international R&D mobility (`R&D · Intl`)**.

---

## 2. WebGL Background Invariant: `<CursorFluid />`
- **Always use `<CursorFluid />` in `src/app/(site)/layout.tsx`.** Never replace `<CursorFluid />` with rigid 3D geometric particle meshes in the site layout.
- **Fluid Parameters (`src/components/animations/CursorFluid.tsx`):**
  - `SHADING: true`, `COLORFUL: true`, `SPLAT_RADIUS: 0.25`, `COLOR_UPDATE_SPEED: 8`, `BACK_COLOR: { r: 0, g: 0, b: 0 }`, `TRANSPARENT: true`, `SUNRAYS: false`, `BLOOM: false`.
- **Card Color Resonance (`src/components/animations/webgl-fluid.js`):**
  - Hovering a project card dispatches `CustomEvent('webgl-resonance', { detail: { color } })`, which sets `window.__webglResonanceColor` and tints new fluid splats organically while keeping colorful fluid behavior everywhere else.

---

## 3. Interaction & Motion Rules (`emilkowalski/skills` + `Leonxlnx/taste-skill`)
- **Custom Easing Tokens (`src/app/globals.css`):**
  - `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`
  - `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`
  - `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`
- **Tactile Press Feedback:** Every interactive button, CTA, and filter pill must include `active:scale-[0.97]` (or `active:scale-[0.985]` for large cards).
- **Card Hover Discipline (`MagneticProjectCard.tsx`):**
  - **No 3D Tilt (`rotateX` / `rotateY`)**: 3D perspective tilt warps technical typography and feels unnatural.
  - **2px Lift + 1.03 Optical Zoom**: Cards lift cleanly on hover (`hover:-translate-y-0.5`), cover images zoom subtly (`group-hover:scale-[1.03]`), and a soft radial spotlight tracks `--mx` / `--my`.
- **60fps Compositor Discipline:**
  - Never use `transition-all`; always list explicit properties (`transition-[transform,border-color,background-color,box-shadow]`).
  - Keep UI feedback transitions between `150ms` and `220ms`.
  - Avoid Framer Motion `layout` / `layoutId` on multi-card grids to prevent main-thread FLIP layout thrashing during category filtering.

---

## 4. Typography, Palette & Craft Floor (`pbakaus/impeccable`)
- **Zero Violet Rule:** Never introduce purple, violet, or indigo accents (`#8B5CF6`, `#7C3AED`). Stick strictly to Obsidian (`#050505`, `#0A0C10`), Telemetry Cyan (`#00D2FF`), Cobalt (`#3B82F6`), Emerald (`#10B981`), and Amber (`#F59E0B`).
- **Measure & Numerals:** Constrain narrative paragraphs to `max-w-[65ch]`. Apply `tabular-nums` to all numeric KPIs, coordinates, years, and system indices (`SYS.01`–`SYS.15`).
- **Browser Surfaces:** Maintain custom `::selection`, `caret-color`, `:focus-visible`, and `text-underline-offset` rules in `src/app/globals.css`.

---

## 5. Brand Identity & Link Preview (`kaankiziltug/logo-design-skill` + `op7418` + `neonwatty`)
- **The Isometric `EN` Monolith (`src/components/ui/Logo.tsx`, `src/app/icon.svg`, `public/icon.svg`):**
  - Never use concentric circles or literal school/work diagrams (PID loops, circuits, gears) that look like an eye at `16×16`px.
  - Use the 5-path **Isometric `EN` Monolith** (3D hexagonal prism uniting an `E` left face in `#00D2FF` and an `N` right face in `#FFFFFF`).
- **Browser Tab & OpenGraph Social Card (`public/og-image.png`):**
  - Browser favicons (`16×16`, `32×32`, `favicon.ico`, `icon.svg`) sit inside an Obsidian squircle badge (`#050505` with radial cyan glow and specular rim border) for high contrast on both dark and light browser tab bars.
  - `public/og-image.png` follows the universal **`1200×630` (`1.91:1`)** OpenGraph standard (`< 250 KB`), featuring the Isometric `EN` Monolith and all 4 multidisciplinary pillars.

