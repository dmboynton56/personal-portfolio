'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { ImageCarousel } from './ImageCarousel'

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
    image: '/images/projects/dashboard-preview.png',
    technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS']
  },
  {
    id: 'simplefitness',
    title: 'Simple Fitness (Tracking App!)',
    description: 'A simple fitness tracking app for logging strength training and cardio workouts. Built natively on iOS, which makes this my actual go to app for tracking my workouts.',
    type: 'mobile',
    image: '/images/projects/simplefitness-1.png',
    technologies: ['Xcode', 'Swift', 'CoreData']
  }
]

export function WorkSection() {
  const observerRefs = useRef<(HTMLDivElement | null)[]>([])
  const [carouselOpen, setCarouselOpen] = useState(false)
  const [currentImages, setCurrentImages] = useState<string[]>([])
  const [currentType, setCurrentType] = useState<'desktop' | 'mobile'>('desktop')

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

  const handleImageClick = (projectId: string, type: 'desktop' | 'mobile') => {
    if (projectId === 'simplefitness') {
      const images = [
        `/images/projects/${projectId}-1.png`,
        `/images/projects/${projectId}-2.png`,
        `/images/projects/${projectId}-3.png`,
        `/images/projects/${projectId}-4.png`,
      ]
      setCurrentImages(images)
      setCurrentType(type)
      setCarouselOpen(true)
    }
  }

  return (
    <section id="work" className="min-h-screen bg-white py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-12">Selected Work</h2>
        
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
                  onClick={() => handleImageClick(project.id, project.type)}
                >
                  {project.type === 'mobile' && (
                    <>
                      {/* iPhone-style frame */}
                      <div className="absolute inset-0 bg-[#1A1A1A] rounded-[3rem] shadow-xl" />
                      {/* Screen bezel */}
                      <div className="absolute inset-[0px] bg-black rounded-[2.5rem]" />
                      {/* Notch */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 h-6 w-40 bg-black rounded-b-3xl" />
                      {/* Dynamic Island */}
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

      {carouselOpen && (
        <ImageCarousel 
          images={currentImages} 
          onClose={() => setCarouselOpen(false)} 
          type={currentType}
        />
      )}
    </section>
  )
}

