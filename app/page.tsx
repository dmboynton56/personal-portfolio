import { Header } from '@/components/Header'
import { ProfileSection } from '@/components/ProfileSection'
import { AboutSection } from '@/components/AboutSection'
import { WorkSection } from '@/components/WorkSection'
import { ContactSection } from '@/components/ContactSection'

export default function Page() {
  return (
    <div className="min-h-screen">
      <Header />
      <ProfileSection />
      <AboutSection />
      <WorkSection />
      <ContactSection />
    </div>
  )
}

