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
    <main className="relative flex flex-col items-center justify-center overflow-hidden">

      {/* 
        Le Background Ambient
        Un maillage très subtil (Grid) couplé à des halos lumineux qui se fondent avec l'animation de fond
      */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* Halos lumineux (Glows) */}
      <div className="absolute top-0 -z-10 h-[500px] w-[500px] rounded-full bg-brand-blue/20 blur-[120px]"></div>
      <div className="absolute top-[20%] right-[10%] -z-10 h-[300px] w-[300px] translate-x-1/2 rounded-full bg-brand-red/10 blur-[100px]"></div>

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