import { Header } from '@/components/Header'
import { ProfileSection } from '@/components/ProfileSection'
import { FlagshipQuickLinks } from '@/components/FlagshipQuickLinks'
import { WorkSection } from '@/components/WorkSection'
import { ContactSection } from '@/components/ContactSection'
import { PortfolioChatWidget } from '@/components/chat/PortfolioChatWidget'
import { AuroraBackground } from '@/components/ui/aurora-background'

export default function Page() {
  return (
    <main className="relative">
      <AuroraBackground className="min-h-screen">
        <div className="relative z-20">
          <Header />
        </div>
        <div className="relative z-10 flex flex-1 flex-col">
          <ProfileSection />
        </div>
      </AuroraBackground>
      <FlagshipQuickLinks />
      <WorkSection />
      <ContactSection />
      <PortfolioChatWidget />
    </main>
  )
}
