import CursorFluid from "@/components/animations/CursorFluid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminGlobalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 dark:bg-[#020202]">
      {/* Background Ambient Admin */}
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* Halos lumineux (Glows) */}
      <div className="fixed top-0 -z-10 h-[500px] w-[500px] rounded-full bg-brand-blue/10 blur-[120px]"></div>
      <div className="fixed bottom-[10%] right-[5%] -z-10 h-[300px] w-[300px] translate-x-1/2 rounded-full bg-brand-red/10 blur-[100px]"></div>

      {/* L'animation WebGL Fluide en arrière-plan */}
      <CursorFluid />

      {/* Le contenu spécifique admin (login ou dashboard) par-dessus l'arrière-plan */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}
