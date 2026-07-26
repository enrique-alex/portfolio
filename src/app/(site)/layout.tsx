import CursorFluid from "@/components/animations/CursorFluid";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/ui/Preloader";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
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
    </>
  );
}
