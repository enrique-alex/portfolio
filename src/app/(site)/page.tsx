import HeroSection from "@/components/sections/HeroSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import SectionDivider from "@/components/ui/SectionDivider";
import AcademicJourney from "@/components/ui/AcademicJourney";
import SkillsSection from "@/components/ui/SkillsSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import ProfileSection from "@/components/sections/ProfileSection";
import ContactSection from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <main className="relative flex flex-col items-center justify-center overflow-x-clip w-full">

      {/* 
        Le Background Ambient
        Un maillage très subtil (Grid) couplé à l'animation WebGL d'arrière-plan
      */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <HeroSection />
      <SectionDivider />
      <ProfileSection />
      <SectionDivider />
      <AcademicJourney />
      <SectionDivider />
      <ExperienceSection />
      <SectionDivider />
      <ProjectsSection />
      <SectionDivider />
      <SkillsSection />
      <SectionDivider />
      <ContactSection />
    </main>
  );
}
