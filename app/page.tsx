import { Header } from '@/components/Header'
import { ProfileSection } from '@/components/ProfileSection'
import { WorkSection } from '@/components/WorkSection'
import { ContactSection } from '@/components/ContactSection'
import { AuroraBackground } from '@/components/ui/aurora-background'

export default function Page() {
  return (
    <main className="relative">
      <div className="relative">
        <AuroraBackground className="min-h-screen">
          <div className="relative z-20">
            <Header />
          </div>
          <div className="relative z-10 h-full">
            <ProfileSection />
          </div>
        </AuroraBackground>
      </div>
      <WorkSection />
      <ContactSection />
    </main>
  )
}

