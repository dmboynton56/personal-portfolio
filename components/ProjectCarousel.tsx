'use client';

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import { X } from 'lucide-react';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

interface ProjectCarouselProps {
  images: string[];
  onClose: () => void;
}

export function ProjectCarousel({ images, onClose }: ProjectCarouselProps) {
  const swiperRef = useRef<any>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative w-full max-w-5xl h-[80vh] flex flex-col bg-[#F5F1EA] rounded-2xl p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-neutral-800 hover:text-neutral-600 transition-colors"
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
          centeredSlides={true}
          slidesPerView={2.5}
          loop={true}
          className="w-full h-full"
        >
          {images.map((img, idx) => (
            <SwiperSlide key={idx}>
              <div className="w-full h-full relative p-4">
                <Image
                  src={img}
                  alt={`Project image ${idx + 1}`}
                  fill
                  className="object-contain"
                  priority={idx === 0}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
} 