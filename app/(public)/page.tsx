import AboutSection from "@/components/portfolio/about-me";
import ContactPage from "@/components/portfolio/contact-me";
import ExperiencesPage from "@/components/portfolio/experiences";
import SkillSection from "@/components/portfolio/skills";

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-10 lg:py-32">
      <AboutSection />
      <SkillSection />
      <ExperiencesPage />
      <ContactPage />
    </main>
  );
}