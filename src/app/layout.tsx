import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LanguageProvider } from "@/components/theme/LanguageProvider";
import { ProjectsProvider } from "@/components/theme/ProjectsProvider";
import DualBodyCursor from "@/components/animations/DualBodyCursor";
import type { Viewport } from 'next';

export const viewport: Viewport = {
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  icons: {
    icon: [
      { url: '/favicon.ico?v=5', sizes: 'any' },
      { url: '/icon.svg?v=5', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png?v=5', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png?v=5', sizes: '16x16', type: 'image/png' },
      { url: '/icon-192.png?v=5', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png?v=5', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=5',
    apple: [
      { url: '/apple-touch-icon.png?v=5', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon-precomposed.png?v=5',
      },
    ],
  },
  title: "Enrique Alex Ndjakou, Ingénieur en Génie Électrique et Mécatronique",
  description:
    "Portfolio d'Enrique Alex Ndjakou Kemayou, Élève Ingénieur en Génie Électrique et Mécatronique à Polytech Lille, Apprenti chez Minakem. Automatisme, SCADA, C/C++, Python, Électronique.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://enrique-alex.pages.dev"),
  openGraph: {
    title: "Enrique Alex Ndjakou, Ingénieur en Génie Électrique et Mécatronique",
    description:
      "Élève Ingénieur en Génie Électrique et Mécatronique (Polytech Lille) · Apprenti Automatisme & Informatique Industrielle chez Minakem Dunkerque.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://enrique-alex.pages.dev",
    siteName: "Portfolio · Enrique Alex Ndjakou",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1376,
        height: 768,
        alt: "Enrique Alex Ndjakou, Ingénieur en Génie Électrique et Mécatronique",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enrique Alex Ndjakou, Ingénieur en Génie Électrique et Mécatronique",
    description:
      "Élève Ingénieur en Génie Électrique et Mécatronique (Polytech Lille) · Automatisme & Informatique Industrielle.",
    images: ["/og-image.png"],
  },
  keywords: [
    "Enrique Alex Ndjakou",
    "Ingénieur",
    "Génie Électrique",
    "Mécatronique",
    "Polytech Lille",
    "Automatisme",
    "Automatisme Industriel",
    "SCADA",
    "Ignition",
    "C++",
    "Python",
    "Portfolio",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning est indispensable avec next-themes pour éviter le flash au chargement
    <html lang="fr" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(typeof window!=='undefined'&&typeof window.__name==='undefined'){window.__name=function(t,v){return Object.defineProperty(t,'name',{value:v,configurable:true});}}",
          }}
        />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; connect-src 'self' https://api.web3forms.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://pub-f2abb97fd5a44520b79d8e56bf020956.r2.dev; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';"
        />
      </head>
      <body className="bg-white text-zinc-900 transition-colors duration-700 ease-in-out dark:bg-[#050505] dark:text-[#EDEDED] antialiased overflow-x-hidden w-full max-w-full" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <LanguageProvider>
            <ProjectsProvider>
              <DualBodyCursor />
              {children}
            </ProjectsProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
