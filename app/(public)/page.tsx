import AboutSection from "@/components/portfolio/about-me"
import ContactSection from "@/components/portfolio/contact-me"
import EducationSection from "@/components/portfolio/education"
import ExperiencesSection from "@/components/portfolio/experiences"
import ProjectsSection from "@/components/portfolio/projects"
import SkillSection from "@/components/portfolio/skills"

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-10 lg:py-32">
      <AboutSection />
      <SkillSection />
      <ProjectsSection />
      <ExperiencesSection />
      <EducationSection />
      <ContactSection />
    </main>
  )
}
