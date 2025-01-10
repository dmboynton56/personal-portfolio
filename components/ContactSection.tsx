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
            href="mailto:dmboynton6@gmail.com"
            className="inline-flex px-6 py-3 rounded-full border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors w-fit"
          >
            dmboynton6@gmail.com
          </a>
          <a
            href="tel:9788866947"
            className="inline-flex px-6 py-3 rounded-full border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors w-fit"
          >
            +1 (978) 886-6947
          </a>
        </div>

        <footer className="mt-32 flex flex-wrap gap-8 justify-between text-sm text-neutral-500">
          <div className="space-y-2">
            <p>VERSION</p>
            <p>2025 © Edition</p>
          </div>
          <div className="space-y-2">
            <p>SOCIALS</p>
            <div className="flex gap-4">
              <a href="https://www.linkedin.com/in/drew-boynton-1bba16180/" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="https://github.com/dmboynton56" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </footer>
      </div>
    </section>
  )
}

