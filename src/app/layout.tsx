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
  themeColor: '#050505',
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.CF_PAGES === '1'
    ? 'https://enrique-alex.pages.dev'
    : 'https://portfolio.enriquekemayou.workers.dev');

export const metadata = {
  icons: {
    icon: [
      { url: '/favicon.ico?v=7', sizes: 'any' },
      { url: '/icon.svg?v=7', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png?v=7', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png?v=7', sizes: '16x16', type: 'image/png' },
      { url: '/icon-192.png?v=7', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png?v=7', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=7',
    apple: [
      { url: '/apple-touch-icon.png?v=7', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon-precomposed.png?v=7',
      },
    ],
  },
  title: "Enrique Alex Ndjakou, Ingénieur en Génie Électrique et Mécatronique",
  description:
    "Portfolio d'Enrique Alex Ndjakou Kemayou, Élève Ingénieur en Génie Électrique et Mécatronique à Polytech Lille, Apprenti chez Minakem. Systèmes embarqués, robotique, commande temps réel, C/C++, Python et architecture industrielle & logicielle.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Enrique Alex Ndjakou · Ingénieur en Génie Électrique, Mécatronique & Systèmes Embarqués",
    description:
      "Élève Ingénieur à Polytech Lille & Apprenti chez Minakem · 15 Systèmes & Architectures : Systèmes Embarqués (C/C++, AVR8), Robotique, Commande Temps Réel, SCADA & R&D Internationale.",
    url: SITE_URL,
    siteName: "Enrique.Ndjakou · Engineering Portfolio",
    locale: "fr_FR",
    alternateLocale: ["en_US"],
    type: "website",
    images: [
      {
        url: "/og-image.png?v=7",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Enrique Alex Ndjakou Kemayou — Ingénieur en Génie Électrique, Mécatronique & Systèmes Embarqués (Polytech Lille · Minakem)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enrique Alex Ndjakou · Ingénieur en Génie Électrique, Mécatronique & Systèmes Embarqués",
    description:
      "Élève Ingénieur (Polytech Lille · Minakem) · Systèmes Embarqués, Robotique, Commande Temps Réel, Architecture Logicielle/SCADA & Mobilité R&D Internationale.",
    images: [
      {
        url: "/og-image.png?v=7",
        width: 1200,
        height: 630,
        alt: "Enrique Alex Ndjakou Kemayou — Engineering Portfolio",
      },
    ],
  },
  keywords: [
    "Enrique Alex Ndjakou",
    "Ingénieur",
    "Génie Électrique",
    "Mécatronique",
    "Polytech Lille",
    "Systèmes Embarqués",
    "Robotique",
    "Commande Temps Réel",
    "R&D",
    "Stage International",
    "Automatisme",
    "SCADA",
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
        <link rel="shortcut icon" href="/favicon.ico?v=7" />
        <link rel="icon" href="/favicon.ico?v=7" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg?v=7" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=7" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=7" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png?v=7" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png?v=7" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=7" />
        <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png?v=7" />
        <link rel="manifest" href="/manifest.webmanifest?v=7" />
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
      <body className="bg-[#F8F9FA] text-zinc-900 dark:bg-[#050505] dark:text-[#EDEDED] antialiased selection:bg-brand-blue/20 selection:text-brand-blue dark:selection:bg-[#00D2FF]/20 dark:selection:text-[#00D2FF] overflow-x-hidden w-full max-w-full" suppressHydrationWarning>
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
