# Production Software Engineering Directives & Rules
# Scope: Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, Cloudflare D1 / Workers

These rules enforce staff-level software engineering standards across all code generation, refactoring, and component creation in this repository.

---

## 1. Next.js 16 App Router & Server/Client Boundaries
- **Server Components First**: Default all components to React Server Components (RSC).
- **Leaf-Level `'use client'`**: Push the `'use client'` directive to the lowest interactive tree leaves. Do not declare `'use client'` on root layouts or static page wrappers.
- **Data Hydration**: Fetch data on the server or in route handlers. Client components only receive serialized, strongly-typed props.
- **Streaming & Suspense**: Wrap client-heavy elements or asynchronous data fetching blocks in `<Suspense fallback={<Skeleton />}>`.
- **Image Optimization**: Enforce `next/image` with responsive `sizes` attributes. `priority` and `fetchPriority="high"` are reserved exclusively for the Hero LCP element.

---

## 2. Strict TypeScript (Zero `any` Policy)
- **Zero `any`**: The use of `any` is strictly prohibited. Use `unknown` coupled with type narrowing, type predicates, or Zod schemas.
- **Systematic Props & Returns Typing**:
  - Every component must define an explicit `interface ComponentProps { ... }`.
  - Every function, helper, custom hook, and API handler must have an explicit return type.
- **Interfaces over Types**: Use `interface` for component props and domain models. Reserve `type` for unions, intersections, and utility types.
- **Const Objects over Enums**: Use `as const` objects with keyof/typeof string literal unions instead of TypeScript `enum`.
- **Exhaustive Error Handling**: Catch blocks must type `error: unknown` and narrow down with `error instanceof Error ? error.message : ...`.

---

## 3. Tailwind CSS & Responsive Design (Mobile-First)
- **Mobile-First Breakpoints**: Base utility classes represent mobile (< 640px). Breakpoints `sm:`, `md:`, `lg:`, `xl:` represent progressive enhancements.
- **Zero Arbitrary Values**: Avoid arbitrary brackets (`w-[380px]`, `text-[17px]`) unless strictly required for physical WebGL canvas aspect ratios.
- **Fluid Viewport & Safe Insets**:
  - Use `min-h-[100dvh]` or `min-h-[100svh]` rather than `100vh` to eliminate mobile URL bar jump bugs.
  - Integrate safe area insets: `pt-[calc(1rem+env(safe-area-inset-top))]`, `pb-[calc(1rem+env(safe-area-inset-bottom))]`.
- **Touch Ergonomics & Sizing**:
  - All interactive tap targets must satisfy at least 44x44px.
  - Disable magnetic pulls, hover tilts, and 3D rotations on touch devices (`pointer: coarse`).
  - Eliminate horizontal overflow at root cause (no unchecked `whitespace-nowrap`).

---

## 4. Web Performance & Accessibility (WCAG 2.1 AA & WebGL)
- **WCAG 2.1 AA Contrast**: Ensure minimum 4.5:1 contrast for body copy and 3:1 for large typography and icons in both light and dark themes.
- **Accessible Names**: All buttons, links, and inputs must have accessible names (`aria-label`, visible text, or `<title>`).
- **SVG Semantics**: Decorative SVGs must have `aria-hidden="true"`; informative SVGs must provide `<title>` or `aria-label`.
- **Scroll & Focus Locking**: Modals and full-screen mobile menus must trap focus and lock document scrolling (`document.body.style.overflow = 'hidden'`).
- **Motion Sensitivity**: Honor `prefers-reduced-motion: reduce` by stopping continuous marquee tracks, 3D tilts, and infinite background animations.
- **Canvas / WebGL Performance**:
  - WebGL and 2D canvas loops must pause when off-screen via `IntersectionObserver`.
  - Clean up event listeners, WebGL contexts, and `requestAnimationFrame` IDs on unmount.
  - Animate only GPU-composited properties (`transform`, `opacity`). Avoid animating `color`, `height`, or layout properties during frame-by-frame loops.

---

## 5. Cloudflare D1 Resilience & Fallbacks
- Database operations must include local fallback data when running in `next dev` without an active Wrangler D1 binding.
- Sanitize all parameters and enforce strict input validation in API routes.
