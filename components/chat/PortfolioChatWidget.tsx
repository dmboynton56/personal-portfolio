'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Maximize2, MessageSquareText, Minimize2, X } from 'lucide-react'

import { ChatPanel } from '@/components/chat/ChatPanel'
import { getScopeUICopy } from '@/components/chat/scope-copy'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Matches `components/ui/use-mobile.tsx` (viewport width under 768px). */
const MOBILE_MQ = '(max-width: 767px)'

type Surface = 'closed' | 'compact' | 'expanded'

export function PortfolioChatWidget() {
  // SSR + first paint: closed avoids hydration mismatch; desktop opens to compact before paint.
  const [surface, setSurface] = useState<Surface>('closed')
  const panelRef = useRef<HTMLDivElement>(null)
  const prevSurfaceRef = useRef<Surface>('closed')

  useLayoutEffect(() => {
    if (!window.matchMedia(MOBILE_MQ).matches) {
      setSurface('compact')
    }
  }, [])
  const copy = getScopeUICopy('default')

  useEffect(() => {
    const prev = prevSurfaceRef.current
    prevSurfaceRef.current = surface
    if (!(prev === 'closed' && surface !== 'closed')) return
    const id = window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLInputElement>('input')?.focus()
    })
    return () => window.cancelAnimationFrame(id)
  }, [surface])

  useEffect(() => {
    if (surface === 'closed') return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setSurface((s) => (s === 'expanded' ? 'compact' : 'closed'))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [surface])

  const expand = () => setSurface('expanded')

  return (
    <>
      {surface === 'expanded' && (
        <button
          type="button"
          className="fixed inset-0 z-[55] cursor-default bg-black/20"
          aria-label="Collapse chat panel"
          onClick={() => setSurface('compact')}
        />
      )}

      <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal={surface === 'expanded'}
          aria-label="Portfolio chat"
          className={cn(
            'pointer-events-auto flex max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-[width,height] duration-200 ease-out',
            surface === 'closed' && 'hidden',
            surface === 'compact' &&
              'h-[min(520px,calc(100vh-5rem))] w-[min(380px,calc(100vw-2rem))]',
            surface === 'expanded' &&
              'h-[min(90vh,calc(100vh-3rem))] w-[min(640px,calc(100vw-2rem))]',
          )}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2">
            <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
              <MessageSquareText className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">Ask about my work</span>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              {surface === 'compact' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Expand chat"
                  onClick={expand}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}
              {surface === 'expanded' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Shrink chat"
                  onClick={() => setSurface('compact')}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Close chat"
                onClick={() => setSurface('closed')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col p-3 pt-2">
            <ChatPanel
              scope="default"
              variant="floating"
              showHeader={false}
              title={copy.title}
              subtitle={copy.subtitle}
              welcomeMessage={copy.welcomeMessage}
              placeholder={copy.placeholder}
              onExpand={expand}
            />
          </div>
        </div>

        {surface === 'closed' && (
          <Button
            type="button"
            size="icon"
            className="pointer-events-auto h-14 w-14 rounded-full shadow-lg"
            onClick={() => setSurface('compact')}
            aria-label="Open portfolio chat"
          >
            <MessageSquareText className="h-6 w-6" />
          </Button>
        )}
      </div>
    </>
  )
}
