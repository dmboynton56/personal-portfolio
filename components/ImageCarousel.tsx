import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'

interface ImageCarouselProps {
  images: string[]
  onClose: () => void
}

export function ImageCarousel({ images, onClose }: ImageCarouselProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <button onClick={onClose} className="absolute top-4 right-4 text-white">Close</button>
      <Carousel showThumbs={false} infiniteLoop useKeyboardArrows>
        {images.map((src, index) => (
          <div key={index}>
            <img src={src} alt={`Project image ${index + 1}`} />
          </div>
        ))}
      </Carousel>
    </div>
  )
} 