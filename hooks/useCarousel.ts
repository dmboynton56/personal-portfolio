import { useState, useEffect } from 'react'

interface CarouselState {
  offset: number
  desired: number
  active: number
}

export function useCarousel(length: number, interval: number = 5000) {
  const [state, setState] = useState<CarouselState>({
    offset: 0,
    desired: 0,
    active: 0
  })

  const [touching, setTouching] = useState(false)
  const [startX, setStartX] = useState(0)

  useEffect(() => {
    const id = setTimeout(() => {
      if (!touching && length > 3) {
        setState(prev => ({
          ...prev,
          desired: (prev.active + 1) % (length - 2),
          offset: 0
        }))
      }
    }, interval)
    return () => clearTimeout(id)
  }, [state.active, touching, length, interval])

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      setTouching(true)
      setStartX(e.touches[0].clientX)
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (!touching) return
      const x = e.touches[0].clientX
      const diff = startX - x
      setState(prev => ({
        ...prev,
        offset: diff
      }))
    },
    onTouchEnd: () => {
      if (!touching) return
      const { offset, active } = state
      const threshold = window.innerWidth * 0.1
      const maxPosition = Math.max(0, length - 3)
      const next = Math.min(
        maxPosition,
        Math.max(
          0,
          offset > threshold ? active + 1 :
          offset < -threshold ? active - 1 :
          active
        )
      )
      setState({
        desired: next,
        active: next,
        offset: 0
      })
      setTouching(false)
    }
  }

  return {
    active: state.active,
    desired: state.desired,
    offset: state.offset,
    handlers,
    setActive: (n: number) => setState({ active: n, desired: n, offset: 0 })
  }
} 