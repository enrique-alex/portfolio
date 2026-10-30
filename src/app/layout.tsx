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
        <link rel="preload" as="image" href="/photo.webp" type="image/webp" fetchPriority="high" />
      </head>
      <body className="bg-white text-zinc-900 transition-colors duration-700 ease-in-out dark:bg-[#050505] dark:text-[#EDEDED] antialiased overflow-x-hidden w-full max-w-full">
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
