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
      { url: '/favicon.ico?v=6', sizes: 'any' },
      { url: '/icon.svg?v=6', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png?v=6', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png?v=6', sizes: '16x16', type: 'image/png' },
      { url: '/icon-192.png?v=6', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png?v=6', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=6',
    apple: [
      { url: '/apple-touch-icon.png?v=6', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon-precomposed.png?v=6',
      },
    ],
  },
  title: "Enrique Alex Ndjakou, Ingénieur en Génie Électrique et Mécatronique",
  description:
    "Portfolio d'Enrique Alex Ndjakou Kemayou, Élève Ingénieur en Génie Électrique et Mécatronique à Polytech Lille, Apprenti chez Minakem. Systèmes embarqués, robotique, commande temps réel, C/C++, Python et architecture industrielle & logicielle.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://portfolio.enriquekemayou.workers.dev"),
  openGraph: {
    title: "Enrique Alex Ndjakou, Ingénieur en Génie Électrique et Mécatronique",
    description:
      "Élève Ingénieur en Génie Électrique et Mécatronique (Polytech Lille) · Systèmes Embarqués, Robotique, Commande Temps Réel & Architecture Logicielle / Industrielle (Minakem).",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://portfolio.enriquekemayou.workers.dev",
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
      "Élève Ingénieur en Génie Électrique et Mécatronique (Polytech Lille) · Systèmes Embarqués, Robotique, Commande Temps Réel & R&D.",
    images: ["/og-image.png"],
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
        <link rel="shortcut icon" href="/favicon.ico?v=6" />
        <link rel="icon" href="/favicon.ico?v=6" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg?v=6" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=6" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=6" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png?v=6" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png?v=6" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=6" />
        <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png?v=6" />
        <link rel="manifest" href="/manifest.webmanifest?v=6" />
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
