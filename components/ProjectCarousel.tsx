'use client';

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import { X } from 'lucide-react';
import Image from 'next/image';
import { DeviceFrameset } from 'react-device-frameset';
import '@/styles/device-frames.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

interface ProjectCarouselProps {
  images: string[];
  onClose: () => void;
  projectType?: 'desktop' | 'mobile';
}

export function ProjectCarousel({ images, onClose, projectType }: ProjectCarouselProps) {
  const swiperRef = useRef(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" />
      <div className="relative w-full max-w-6xl h-[85vh] flex flex-col bg-background-emphasis rounded-2xl p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-foreground hover:text-foreground/80 transition-colors"
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </button>

        <Swiper
          ref={swiperRef}
          modules={[Navigation, Pagination, EffectCoverflow]}
          navigation
          pagination={{ clickable: true }}
          effect="coverflow"
          coverflowEffect={{
            rotate: 35,
            stretch: 0,
            depth: 50,
            modifier: 1.5,
            slideShadows: true,
          }}
          centeredSlides
          slidesPerView={1}
          loop
          breakpoints={{
            768: {
              slidesPerView: 1.5,
            },
            1024: {
              slidesPerView: 1.8,
            },
            1280: {
              slidesPerView: 2,
            },
          }}
          className="w-full h-full"
        >
          {images.map((src, idx) => (
            <SwiperSlide key={idx} className="flex items-center justify-center py-8">
              <div className={`relative ${
                projectType === 'mobile' 
                  ? 'w-full h-full flex items-center justify-center' 
                  : 'w-full h-full flex items-center justify-center'
              }`}>
                {projectType === 'mobile' ? (
                  <div className="transform scale-[0.85] origin-center">
                    <DeviceFrameset device="iPhone X" color="black" landscape={false}>
                      <Image
                        src={src}
                        alt={`Project image ${idx + 1}`}
                        fill
                        className="object-cover"
                        priority={idx === 0}
                      />
                    </DeviceFrameset>
                  </div>
                ) : (
                  <div className="transform scale-[0.6] origin-center">
                    <DeviceFrameset device="MacBook Pro" color="silver">
                      <div className="relative w-[1280px] h-[800px] bg-background">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Image
                            src={src}
                            alt={`Project image ${idx + 1}`}
                            fill
                            className="object-contain"
                            style={{ padding: '2px' }}
                            priority={idx === 0}
                          />
                        </div>
                      </div>
                      <div className="bottom-bar" />
                    </DeviceFrameset>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
} 