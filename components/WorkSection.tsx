'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { ProjectCarousel } from './ProjectCarousel'

interface Project {
  id: string
  title: string
  description: string
  type: 'desktop' | 'mobile'
  image: string
  images?: string[]
  technologies: string[]
}

const mockProjects: Project[] = [
  {
    id: 'project1',
    title: 'E-commerce Dashboard',
    description: 'A comprehensive dashboard for managing online stores, featuring real-time analytics, inventory management, and customer insights. Built with a focus on usability and performance.',
    type: 'desktop',
    image: '/images/projects/dashboard-preview.png',
    images: [
      '/images/projects/dashboard-preview.png',
      '/images/projects/dashboard-2.png',
      '/images/projects/dashboard-3.png'
    ],
    technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS']
  },
  {
    id: 'simplefitness',
    title: 'Simple Fitness (Tracking App!)',
    description: 'A simple fitness tracking app for logging strength training and cardio workouts. Built natively on iOS, which makes this my actual go to app for tracking my workouts.',
    type: 'mobile',
    image: '/images/projects/simplefitness-1.png',
    images: [
      '/images/projects/simplefitness-1.png',
      '/images/projects/simplefitness-2.png',
      '/images/projects/simplefitness-3.png',
      '/images/projects/simplefitness-4.png'
    ],
    technologies: ['Xcode', 'Swift', 'CoreData']
  }
]

export function WorkSection() {
  const observerRefs = useRef<(HTMLDivElement | null)[]>([])
  const [isCarouselOpen, setIsCarouselOpen] = useState(false)
  const [selectedProjectImages, setSelectedProjectImages] = useState<string[]>([])

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

  const handleImageClick = (project: Project) => {
    setSelectedProjectImages(project.images || [project.image])
    setIsCarouselOpen(true)
  }

  return (
    <section id="work" className="min-h-screen bg-[#F5F1EA] py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-[#2C2C2C] mb-12">Selected Work</h2>
        
        <div className="space-y-32">
          {mockProjects.map((project, index) => (
            <div
              key={project.id}
              ref={el => {
                observerRefs.current[index] = el
              }}
              className="opacity-0 translate-y-10 transition-all duration-1000 ease-out"
            >
              <div className={`grid ${
                project.type === 'desktop' 
                  ? 'grid-cols-1' 
                  : 'md:grid-cols-2 gap-8 items-center'
              }`}>
                <div
                  className={`relative ${
                    project.type === 'desktop'
                      ? 'aspect-[16/9] mb-8'
                      : 'h-[600px] w-[300px] mx-auto md:mx-0'
                  }`}
                >
                  <div 
                    onClick={() => handleImageClick(project)}
                    className="relative h-full cursor-pointer transition-transform hover:scale-[1.02]"
                  >
                    {project.type === 'mobile' && (
                      <>
                        <div className="absolute inset-0 bg-[#1A1A1A] rounded-[3rem] shadow-xl" />
                        <div className="absolute inset-[0px] bg-black rounded-[2.5rem]" />
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 h-6 w-40 bg-black rounded-b-3xl" />
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 h-[25px] w-[90px] bg-black rounded-full" />
                      </>
                    )}
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className={`${
                        project.type === 'mobile' 
                          ? 'object-contain p-[8px] rounded-[2.5rem]'
                          : 'object-cover rounded-lg'
                      }`}
                    />
                  </div>
                </div>
                
                <div className={`${project.type === 'mobile' ? 'md:order-first' : ''}`}>
                  <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4">
                    {project.title}
                  </h3>
                  <p className="text-[#4A4A4A] mb-6">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-[#E8E2D7] text-[#2C2C2C] rounded-full text-sm"
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

      {isCarouselOpen && (
        <ProjectCarousel
          images={selectedProjectImages}
          onClose={() => setIsCarouselOpen(false)}
        />
      )}
    </section>
  )
}

