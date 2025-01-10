import Image from 'next/image'

export function ProfileSection() {
  return (
    <section id="home" className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 relative w-48 h-48 mx-auto">
          <Image
            src="/placeholder.svg"
            alt="Drew Boynton"
            fill
            className="rounded-full object-cover shadow-xl"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-neutral-900">Drew Boynton</h1>
        <p className="text-xl md:text-2xl text-neutral-700 mb-6">Software Engineer</p>
        <p className="max-w-lg mx-auto text-neutral-600">
          I am a full stack developer with an interest in AI and machine learning.
        </p>
      </div>
    </section>
  )
}

