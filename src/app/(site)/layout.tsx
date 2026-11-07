import KineticCanvas from "@/components/animations/KineticCanvas";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/ui/Preloader";
import SideSlider from "@/components/ui/SideSlider";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Séquence d'initialisation matérielle */}
      <Preloader />

      {/* Moteur WebGL particulaire déterministe (5 topologies mathématiques synchronisées au scroll) */}
      <KineticCanvas />
      
      {/* La barre de navigation par-dessus l'animation */}
      <Navbar />

      {/* Le Slider de navigation latérale DA Obsidian / Cyan */}
      <SideSlider />
      
      {/* Le contenu des pages (qui pourra scroller en dessous de la navbar) */}
      {children}

      {/* Le Pied de page Système */}
      <Footer />
    </>
  );
}
