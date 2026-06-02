'use client';

import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { X } from 'lucide-react';
import Image from 'next/image';
import { DeviceFrameset } from 'react-device-frameset';
import '@/styles/device-frames.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ProjectCarouselProps {
  images: string[];
  onClose: () => void;
  projectType?: 'desktop' | 'mobile';
  initialImage?: string; // Add prop to specify which image to start on
}

const DESKTOP_DEVICE_PREVIEW_CLASS =
  'device-scale device-scale--macbook device-scale--desktop-carousel';
const MOBILE_DEVICE_PREVIEW_CLASS =
  'device-scale device-scale--iphone device-scale--mobile-carousel';

function DevicePreview({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="device-scale-content">{children}</div>
    </div>
  );
}

export function ProjectCarousel({ images, onClose, projectType, initialImage }: ProjectCarouselProps) {
  const swiperRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Calculate which slide to start on based on initialImage
  const getInitialSlide = () => {
    if (!initialImage) return 0;
    const index = images.findIndex(img => img === initialImage);
    return index >= 0 ? index : 0;
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-6xl h-[85vh] flex flex-col bg-background-emphasis rounded-2xl p-8 shadow-2xl pointer-events-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-foreground hover:text-foreground/80 transition-colors"
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </button>

        <Swiper
          ref={swiperRef}
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          centeredSlides={true}
          slidesPerView={1}
          initialSlide={getInitialSlide()}
          loop={images.length > 1} // Only enable loop if we have multiple images
          spaceBetween={30}
          className="w-full h-full"
        >
          {images.map((src, idx) => (
            <SwiperSlide key={idx} className="flex items-center justify-center py-8">
              <div className="w-full h-full flex items-center justify-center">
                {projectType === 'mobile' ? (
                  <DevicePreview className={MOBILE_DEVICE_PREVIEW_CLASS}>
                    <DeviceFrameset device="iPhone X" color="black" landscape={false}>
                      <Image
                        src={src}
                        alt={`Project image ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) min(100vw, 896px), min(896px, 85vw)"
                        className="object-contain"
                        priority={idx === getInitialSlide()}
                      />
                    </DeviceFrameset>
                  </DevicePreview>
                ) : (
                  <DevicePreview className={DESKTOP_DEVICE_PREVIEW_CLASS}>
                    <DeviceFrameset device="MacBook Pro" color="silver">
                      <div className="relative w-[1280px] h-[800px] bg-background">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Image
                            src={src}
                            alt={`Project image ${idx + 1}`}
                            fill
                            sizes="(max-width: 768px) min(100vw, 896px), min(896px, 85vw)"
                            className="object-contain"
                            style={{ padding: '2px' }}
                            priority={idx === getInitialSlide()}
                          />
                        </div>
                      </div>
                      <div className="bottom-bar" />
                    </DeviceFrameset>
                  </DevicePreview>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>,
    document.body
  );
}
