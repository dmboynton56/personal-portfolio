'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'

interface Project {
  id: string
  title: string
  description: string
  type: 'desktop' | 'mobile'
  image: string
  technologies: string[]
}

const mockProjects: Project[] = [
  {
    id: 'project1',
    title: 'E-commerce Dashboard',
    description: 'A comprehensive dashboard for managing online stores, featuring real-time analytics, inventory management, and customer insights. Built with a focus on usability and performance.',
    type: 'desktop',
    image: '/placeholder.svg',
    technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS']
  },
  {
    id: 'project2',
    title: 'Fitness Tracking App',
    description: 'A mobile-first application for tracking workouts and nutrition, with customizable workout plans and progress visualization. Emphasizes clean design and intuitive user experience.',
    type: 'mobile',
    image: '/placeholder.svg',
    technologies: ['React Native', 'Firebase', 'Redux']
  }
]

export function WorkSection() {
  const observerRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers = mockProjects.map((_, index) => {
      return new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('opacity-100', 'translate-y-0')
              entry.target.classList.remove('opacity-0', 'translate-y-10')
            }
          })
        },
        {
          threshold: 0.1,
          rootMargin: '-50px'
        }
      )
    })

    observerRefs.current.forEach((ref, index) => {
      if (ref) observers[index].observe(ref)
    })

    return () => {
      observerRefs.current.forEach((ref, index) => {
        if (ref) observers[index].unobserve(ref)
      })
    }
  }, [])

  return (
    <section id="work" className="min-h-screen bg-white py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-12">Selected Work</h2>
        
        <div className="space-y-32">
          {mockProjects.map((project, index) => (
            <div
              key={project.id}
              ref={el => observerRefs.current[index] = el}
              className="opacity-0 translate-y-10 transition-all duration-1000 ease-out"
            >
              <div className={`grid ${
                project.type === 'desktop' 
                  ? 'grid-cols-1' 
                  : 'md:grid-cols-2 gap-8 items-center'
              }`}>
                <div className={`relative ${
                  project.type === 'desktop'
                    ? 'aspect-[16/9] mb-8'
                    : 'aspect-[9/16] max-w-[300px] mx-auto md:mx-0'
                }`}>
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover rounded-lg shadow-xl"
                  />
                </div>
                
                <div className={`${project.type === 'mobile' ? 'md:order-first' : ''}`}>
                  <h3 className="text-2xl font-bold text-neutral-800 mb-4">
                    {project.title}
                  </h3>
                  <p className="text-neutral-600 mb-6">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
