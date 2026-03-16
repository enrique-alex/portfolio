import "./globals.css";
import CursorFluid from "@/components/animations/CursorFluid";
import Navbar from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata = {
  title: "Portfolio Engineering",
  description: "Portfolio d'étudiant ingénieur",
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
          {/* L'animation WebGL Fluide en arrière-plan */}
          <CursorFluid />
          
          {/* La barre de navigation par-dessus l'animation */}
          <Navbar />
          
          {/* Le contenu des pages (qui pourra scroller en dessous de la navbar) */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}