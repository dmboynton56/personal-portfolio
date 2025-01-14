'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { ProjectCarousel } from './ProjectCarousel'
import { DeviceFrameset } from 'react-device-frameset'
import '@/styles/device-frames.css'

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
    image: '/images/projects/project1-1.png',
    images: [
      '/images/projects/project1-1.png',
      '/images/projects/project1-2.png',
      '/images/projects/project1-1.png'
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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

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
    setSelectedProject(project)
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
                      ? 'w-full h-[600px] mb-8'
                      : 'h-[600px] mx-auto md:mx-0 flex items-center justify-center'
                  }`}
                >
                  <div 
                    onClick={() => handleImageClick(project)}
                    className="relative cursor-pointer transition-transform hover:scale-[1.02] flex items-center justify-center w-full h-full"
                  >
                    {project.type === 'mobile' ? (
                      <div className="transform scale-[0.85] origin-center">
                        <DeviceFrameset device="iPhone X" color="black" landscape={false}>
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-cover"
                          />
                        </DeviceFrameset>
                      </div>
                    ) : (
                      <div className="transform scale-[0.7] origin-center">
                        <DeviceFrameset device="MacBook Pro" color="silver">
                          <div className="relative w-[1280px] h-[800px] bg-black">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                className="object-contain"
                                style={{ padding: '2px' }}
                              />
                            </div>
                          </div>
                          <div className="bottom-bar" />
                        </DeviceFrameset>
                      </div>
                    )}
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

      {isCarouselOpen && selectedProject && (
        <ProjectCarousel
          images={selectedProject.images || [selectedProject.image]}
          projectType={selectedProject.type}
          onClose={() => {
            setIsCarouselOpen(false)
            setSelectedProject(null)
          }}
        />
      )}
    </section>
  )
}

