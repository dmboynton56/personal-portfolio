import { Button } from "@/components/ui/button"

export function ContactSection() {
  return (
    <section id="contact" className="min-h-screen bg-neutral-900 flex flex-col justify-center px-4 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-6 mb-16">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-800">
            <img
              src="/placeholder.svg"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl text-white font-light">
            Let's work<br />together
          </h2>
        </div>

        <div className="grid gap-8 mb-16">
          <a
            href="mailto:your.email@example.com"
            className="inline-flex px-6 py-3 rounded-full border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors w-fit"
          >
            your.email@example.com
          </a>
          <a
            href="tel:+1234567890"
            className="inline-flex px-6 py-3 rounded-full border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors w-fit"
          >
            +1 (234) 567-890
          </a>
        </div>

        <Button
          size="lg"
          className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-8 h-32 w-32"
        >
          Get in touch
        </Button>

        <footer className="mt-32 flex flex-wrap gap-8 justify-between text-sm text-neutral-500">
          <div className="space-y-2">
            <p>VERSION</p>
            <p>2024 © Edition</p>
          </div>
          <div className="space-y-2">
            <p>LOCAL TIME</p>
            <p>{new Date().toLocaleTimeString('en-US', { timeZone: 'UTC', timeZoneName: 'short' })}</p>
          </div>
          <div className="space-y-2">
            <p>SOCIALS</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </footer>
      </div>
    </section>
  )
}

