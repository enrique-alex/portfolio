---
name: logo-design
description: Synthesizes the top-starred GitHub logo design agent skills (kaankiziltug/logo-design-skill, op7418/logo-generator-skill, neonwatty/logo-designer-skill) adapted to Enrique Alex Ndjakou Kemayou's personal brand identity ("The EN Monolith / Le Prisme Architectural EN") and social link preview (OpenGraph 1200x630).
---

# Logo Design & Brand Identity Skill (`EN` Isometric Monolith)

This skill unifies the methodologies and technical guardrails of the three highest-starred open-source logo design skills on GitHub, tailored to **Enrique Alex NDJAKOU KEMAYOU** (`Enrique.Ndjakou`):

1. **`kaankiziltug/logo-design-skill` (`skills/logo-design/SKILL.md`)** — Discovery brief, mark taxonomy, anti-pattern & pareidolia elimination, optical corrections (counterform breathing room, stroke weight compensation across scales), 16px pixel test, and monochrome/reversed proof.
2. **`op7418/logo-generator-skill` (`SKILL.md` & `references/design_patterns.md`)** — Geometric primitive construction, negative-space structural channels, isometric prism topology, and high-contrast obsidian container presentation.
3. **`neonwatty/logo-designer-skill` (`SKILL.md`)** — Multi-scale dark/light browser tab exploration, iterative optical refinement, full multi-resolution asset ladder generation (`ICO`, `SVG`, `Apple Touch`, `Android Maskable`), and OpenGraph (`1200×630`) social preview alignment.

---

## 1. Anti-Patterns & Pareidolia Guardrails (`kaankiziltug/logo-design-skill`)
- **Zero Eye Pareidolia ("Pas d'effet œil"):** Never place a central circle/dot inside concentric arcs or horizontal lines. At `16×16` and `32×32` pixels in browser tabs, concentric circles + horizontal axes trigger human eye pareidolia.
- **No Literal School / Work Schematics:** Avoid textbook diagrams (PID control loops, gears, microchips, oscilloscope waves, PCB traces). A personal brand mark must transcend literal school/work exercises and stand as a timeless architectural emblem.
- **Open Counterforms at 16px:** Never close the right side of an `E` into a vertical stem (which collapses into `B` or `8` at `16px`). Maintain generous negative-space channels ($\ge 4.5$ units on a `24×24` grid) between parallel bars.

---

## 2. Official Brand Mark: The Isometric `EN` Monolith (`Le Prisme Architectural EN`)
- **Concept & Taxonomy:** An interlocking **3D Isometric Hexagonal Prism / Architectural Monogram** uniting **E** (Enrique) and **N** (Ndjakou) along a central vertical axis:
  - **Left Isometric Face (`E` — Electric Cyan `#00D2FF`):** Constructed from the upper-left crown ridge, left vertical pillar, bottom-left base, upper isometric crossbar, and middle cantilevered bar.
  - **Right Isometric Face (`N` — Pure White `#FFFFFF`):** Constructed from the central vertical spine, diagonal bridge, right vertical pillar, and upper-right crown ridge.
  - **Top Isometric Diamond:** Open negative-space crown creating 3D architectural depth without enclosed clutter.
- **Mathematical Grid (`24×24` viewBox in `src/components/ui/Logo.tsx`):**
  - Left `E` contour: `M12 2.5L3.5 7v10L12 21.5`
  - Upper `E` isometric bar: `M3.5 7L12 11.5`
  - Middle `E` cantilever: `M3.5 12L9 15`
  - Upper-right crown ridge: `M12 2.5L20.5 7`
  - Right `N` isometric face: `M12 21.5v-10L20.5 17V7`
  - Every vertical pillar (`x=3.5`, `x=12`, `x=20.5`) measures exactly `10.0` units; every isometric receding plane follows the exact `4.5 / 8.5` ratio.

---

## 3. Browser Tab & Multi-Resolution Asset Ladder (`neonwatty` & `op7418`)
- **Browser Tab Presence (`src/app/icon.svg`, `public/icon.svg`, `favicon-16x16.png`, `favicon-32x32.png`, `favicon.ico`):**
  - Encapsulated in an **Obsidian squircle badge (`#050505` with `#0A1926` radial depth)** and a **precision specular inner rim (`linearGradient` cyan/white border)** so the icon remains crisp and distinct on both dark browser tab bars (Chrome/Edge/Arc Dark) and light browser tab bars.
  - Optical stroke compensation: `stroke-width="2.4"` at `16×16`, `2.3` at `32×32`, and `2.2` at `180×180`–`512×512`.
- **Social Link Preview (`public/og-image.png` & `src/app/layout.tsx`):**
  - Strict **`1200×630` (`1.91:1`)** OpenGraph & Twitter `summary_large_image` standard.
  - File size optimized `< 250 KB` for instant WhatsApp, LinkedIn, X/Twitter, Discord, and iMessage link previews.
  - Showcases the Isometric `EN` Monolith alongside the 4 multidisciplinary engineering pillars (`Systèmes Embarqués`, `Robotique & Temps Réel`, `Architecture Logicielle & SCADA`, `Électronique & HIL`) and international R&D mobility positioning.
