'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useVisibleProjects() {
  const [visibleProjectIds, setVisibleProjectIds] = useState(() => new Set<string>())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const elementsRef = useRef(new Map<string, HTMLElement | null>())

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleProjectIds((prev) => {
          const next = new Set(prev)
          for (const entry of entries) {
            const id = (entry.target as HTMLElement).dataset.projectId
            if (!id) continue
            if (entry.isIntersecting) next.add(id)
            else next.delete(id)
          }
          return next
        })
      },
      { threshold: 0.1, rootMargin: '200px' }
    )
    observerRef.current = observer
    elementsRef.current.forEach((el, id) => {
      if (el) {
        el.dataset.projectId = id
        observer.observe(el)
      }
    })
    return () => {
      observer.disconnect()
      observerRef.current = null
    }
  }, [])

  const observeProjectEl = useCallback((id: string, el: HTMLElement | null) => {
    const obs = observerRef.current
    const prev = elementsRef.current.get(id)
    if (prev && obs) obs.unobserve(prev)
    if (el) elementsRef.current.set(id, el)
    else elementsRef.current.delete(id)
    if (el && obs) {
      el.dataset.projectId = id
      obs.observe(el)
    }
  }, [])

  return { visibleProjectIds, observeProjectEl }
}
