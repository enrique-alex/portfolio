import "./globals.css";
import dynamic from "next/dynamic";
const CursorFluid = dynamic(() => import("@/components/animations/CursorFluid"), { ssr: false });
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LanguageProvider } from "@/components/theme/LanguageProvider";
import Preloader from "@/components/ui/Preloader";

export const metadata = {
  title: "Enrique Alex Ndjakou — Ingénieur Systèmes Embarqués",
  description:
    "Portfolio d'Enrique Alex Ndjakou Kemayou, Élève Ingénieur en Systèmes Embarqués à Polytech Lille, Apprenti chez Minakem. C/C++, Python, Automatisme, Électronique.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://enrique-alex.pages.dev"),
  openGraph: {
    title: "Enrique Alex Ndjakou — Ingénieur Systèmes Embarqués",
    description:
      "Élève Ingénieur en Systèmes Embarqués (Polytech Lille) · Apprenti Automatisme & Informatique Industrielle chez Minakem Dunkerque.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://enrique-alex.pages.dev",
    siteName: "Portfolio · Enrique Alex Ndjakou",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1024,
        height: 1024,
        alt: "Enrique Alex Ndjakou — Ingénieur Systèmes Embarqués",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enrique Alex Ndjakou — Ingénieur Systèmes Embarqués",
    description:
      "Élève Ingénieur en Systèmes Embarqués (Polytech Lille) · Automatisme & Informatique Industrielle.",
    images: ["/og-image.png"],
  },
  keywords: [
    "Enrique Alex Ndjakou",
    "Ingénieur",
    "Systèmes Embarqués",
    "Polytech Lille",
    "Automatisme",
    "C++",
    "Python",
    "Mécatronique",
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
      <body className="bg-white text-zinc-900 transition-colors duration-700 ease-in-out dark:bg-[#050505] dark:text-[#EDEDED] antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <LanguageProvider>
          {/* L'animation d'ouverture 2026 */}
          <Preloader />

          {/* L'animation WebGL Fluide en arrière-plan */}
          <CursorFluid />
          
          {/* La barre de navigation par-dessus l'animation */}
          <Navbar />
          
          {/* Le contenu des pages (qui pourra scroller en dessous de la navbar) */}
          {children}

          {/* Le Pied de page Système */}
          <Footer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}