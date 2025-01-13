import { useCarousel } from '@/hooks/useCarousel'
import { X } from 'lucide-react'
import Image from 'next/image'

interface ImageCarouselProps {
  images: string[]
  onClose: () => void
  type?: 'desktop' | 'mobile'
}

export function ImageCarousel({ images, onClose, type = 'desktop' }: ImageCarouselProps) {
  const { active, desired, offset, handlers, setActive } = useCarousel(images.length)
  
  const position = desired + (offset / window.innerWidth)
  const style = {
    transform: `translateX(${-position * 33.333}%)`,
    transition: offset === 0 ? 'transform 0.2s' : ''
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white z-10 p-2 hover:bg-white/10 rounded-full"
      >
        <X size={24} />
      </button>

      <div 
        className="w-full h-full relative overflow-hidden px-8"
        {...handlers}
      >
        <div 
          className="absolute inset-0 flex transition-transform items-center"
          style={style}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-1/3 h-full flex items-center justify-center"
            >
              {type === 'mobile' ? (
                <div className="relative w-[375px] h-[812px]">
                  {/* iPhone-style frame */}
                  <div className="absolute inset-0 bg-[#1A1A1A] rounded-[3.5rem] shadow-xl" />
                  {/* Screen bezel */}
                  <div className="absolute inset-[-2px] bg-black rounded-[3.2rem]" />
                  {/* Notch */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 h-7 w-44 bg-black rounded-b-3xl" />
                  {/* Dynamic Island */}
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 h-[30px] w-[100px] bg-black rounded-full" />
                  {/* Image container with padding for status bar */}
                  <div className="absolute inset-[3px] rounded-[3.2rem] overflow-hidden">
                    <div className="relative w-full h-full pt-12">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                          src={src}
                          alt={`Slide ${i + 1}`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 375px) 100vw, 375px"
                          priority
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full bg-neutral-800/50 rounded-3xl overflow-hidden">
                  <img
                    src={src}
                    alt={`Slide ${i + 1}`}
                    className="w-full h-full object-contain p-4"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === active ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 