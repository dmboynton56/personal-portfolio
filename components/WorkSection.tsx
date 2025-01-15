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
    id: 'houseclusters',
    title: 'Advanced Data Cluster Sorting',
    description: 'Project for my Advanced Data Science class. This project was a individual effort to sort data into clusters based on their similarity. We used a variety of data structures and algorithms to achieve this.',
    type: 'desktop',
    image: '/images/projects/project3-1.jpg',
    images: [
      '/images/projects/project3-1.jpg',
      '/images/projects/project3-2.jpg'
    ],
    technologies: ['Python', 'Pandas', 'Gaussian Mixture Models']
  },
  {
    id: 'project1',
    title: 'E-commerce Dashboard',
    description: 'A comprehensive dashboard for managing online stores, featuring real-time analytics, inventory management, and customer insights. Built with a focus on usability and performance.',
    type: 'desktop',
    image: '/images/projects/project1-1.jpg',
    images: [
      '/images/projects/project1-1.jpg',
      '/images/projects/project1-2.jpg'
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
    <section id="work" className="min-h-screen bg-background-alt py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">Selected Work</h2>
        
        <div className="space-y-40">
          {mockProjects.map((project, index) => (
            <div
              key={project.id}
              ref={el => {
                observerRefs.current[index] = el
              }}
              className="opacity-0 translate-y-10 transition-all duration-1000 ease-out"
            >
              <div className={`grid grid-cols-1 gap-8 ${
                project.type === 'desktop' 
                  ? '' 
                  : 'md:grid-cols-2 md:items-center'
              }`}>
                <div 
                  className={`bg-background-emphasis p-12 rounded-xl shine-border group/shine transition-all duration-300`}
                  style={{
                    '--shine-degree': project.type === 'mobile' ? '135deg' : '45deg'
                  } as React.CSSProperties}
                >
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-foreground mb-6">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground mb-8">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 rounded-full shine-border group/tag transition-all duration-300 hover:scale-[1.02]"
                          style={{ '--shine-degree': '45deg' } as React.CSSProperties}
                        >
                          <span className="relative z-10 text-muted-foreground group-hover/tag:text-foreground text-sm transition-colors">
                            {tech}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className={`relative mx-auto w-full ${
                    project.type === 'desktop'
                      ? 'h-[500px] mt-8'
                      : 'h-[600px] flex items-center justify-center'
                  }`}
                >
                  <div 
                    onClick={() => handleImageClick(project)}
                    className="relative cursor-pointer transition-transform hover:scale-[1.02] flex items-center justify-center w-full h-full group"
                  >
                    {project.type === 'mobile' ? (
                      <div className="transform scale-[0.65] md:scale-[0.85] origin-center">
                        <DeviceFrameset device="iPhone X" color="black" landscape={false}>
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-contain"
                          />
                        </DeviceFrameset>
                      </div>
                    ) : (
                      <div className="transform scale-[0.25] sm:scale-[0.4] md:scale-[0.55] lg:scale-[0.7] origin-center">
                        <DeviceFrameset device="MacBook Pro" color="silver">
                          <div className="relative w-[1280px] h-[800px] bg-background">
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
                    <div className="absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
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

