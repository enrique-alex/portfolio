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
    <div
      data-native-cursor="true"
      className="relative min-h-[100dvh] overflow-x-clip bg-[#F8F9FA] dark:bg-[#050505]"
    >
      {/* Background Ambient Admin */}
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* L'animation WebGL Fluide réactive en arrière-plan */}
      <CursorFluid />

      {/* Le contenu spécifique admin (login ou dashboard) par-dessus l'arrière-plan */}
      <div className="relative z-10 min-h-[100dvh]">
        {children}
      </div>
    </div>
  );
}
