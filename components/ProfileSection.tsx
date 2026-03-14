import Image from 'next/image'
import { Logo } from './Logo'

export function ProfileSection() {
  return (
    <section id="home" className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 relative w-48 h-48 mx-auto">
          <Image
            src="/images/general/profile-picture.jpg"
            alt="Drew Boynton"
            fill
            className="rounded-full object-cover shadow-xl"
            priority
          />
        </div>
        <div className="flex items-baseline justify-center gap-4 mb-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Drew Boynton</h1>
          <Logo size={48} clickable className="translate-y-[8px]" />
        </div>
        <p className="text-xl md:text-2xl text-foreground/80 mb-6">Software/ML Engineer</p>
        <p className="max-w-2xl mx-auto text-foreground/70">
          I build production-focused ML and data products end to end, from feature pipelines and model inference
          to APIs, frontend delivery, and automated monitoring.
        </p>
      </div>
    </section>
  )
}
