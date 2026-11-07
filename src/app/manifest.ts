import type { MetadataRoute } from 'next';

/**
 * Web App Manifest Configuration for Next.js App Router
 * Enables official branding when installed or pinned as PWA / Web App
 * across OS platforms (Windows, macOS, Android, iOS).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Enrique Ndjakou | Ingénieur',
    short_name: 'EN',
    description: "Portfolio d'Enrique Ndjakou, Ingénieur en Génie Électrique et Mécatronique",
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#050505',
    icons: [
      {
        src: '/icon-maskable-192.png?v=7',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-192.png?v=7',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable-512.png?v=7',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png?v=7',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon.svg?v=7',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
