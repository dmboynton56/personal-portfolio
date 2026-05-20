'use client'

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { Loader2, MessageSquareText, Send } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

import { enrichMarkdownLinks } from '@/lib/chat/markdown-links'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CHAT_SCOPES } from '@/lib/chatbot/scopes'
import type { ChatApiResponse, ChatScope, Citation } from '@/lib/chatbot/types'

type ChatRole = 'user' | 'assistant'

type Message = {
  id: string
  role: ChatRole
  content: string
  citations?: Citation[]
}

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const citationLabels: Record<Citation['type'], string> = {
  doc: 'Doc',
  bigquery: 'BigQuery',
  supabase: 'Supabase',
  web: 'Web',
  model: 'Model',
}

const citationClasses: Record<Citation['type'], string> = {
  doc: 'border-blue-500/20 bg-blue-500/10 text-blue-500',
  bigquery: 'border-violet-500/20 bg-violet-500/10 text-violet-500',
  supabase: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
  web: 'border-amber-500/20 bg-amber-500/10 text-amber-500',
  model: 'border-pink-500/20 bg-pink-500/10 text-pink-500',
}

export type ChatPanelProps = {
  scope: ChatScope
  welcomeMessage: string
  title: string
  subtitle: string
  placeholder?: string
  variant: 'inline' | 'floating'
  /** When false, omit the title block (e.g. floating widget supplies its own header). */
  showHeader?: boolean
  /** Called when the user sends a message or clicks a starter prompt (expand compact → expanded). */
  onExpand?: () => void
  /** Override scroll region classes (e.g. fixed max-height for inline). */
  messagesMaxHeightClass?: string
}

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-2 list-disc pl-4">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-2 list-decimal pl-4">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="mb-1">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-bold text-foreground">{children}</strong>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
    >
      {children}
    </a>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-muted-foreground/20 px-1 py-0.5 font-mono text-xs">
      {children}
    </code>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="my-2 overflow-x-auto rounded bg-muted-foreground/10 p-2 font-mono text-xs">
      {children}
    </pre>
  ),
}

export function ChatPanel({
  scope,
  welcomeMessage,
  title,
  subtitle,
  placeholder,
  variant,
  showHeader = true,
  onExpand,
  messagesMaxHeightClass,
}: ChatPanelProps) {
  const starterPrompts = CHAT_SCOPES[scope].starterPrompts
  const [messages, setMessages] = useState<Message[]>([
    {
      id: createId(),
      role: 'assistant',
      content: welcomeMessage,
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scrollAnchorRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const hasConversation = useMemo(() => messages.length > 1, [messages.length])

  const scrollAreaClasses =
    messagesMaxHeightClass ??
    (variant === 'floating'
      ? 'min-h-0 flex-1 overflow-y-auto'
      : 'max-h-[440px] overflow-y-auto')

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isLoading])

  const submitMessage = async (rawMessage: string) => {
    const message = rawMessage.trim()
    if (!message || isLoading) return

    onExpand?.()

    const userMessage: Message = {
      id: createId(),
      role: 'user',
      content: message,
    }

    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setError(null)
    setIsLoading(true)

    try {
      const history = nextMessages.slice(-8).map((entry) => ({
        role: entry.role,
        content: entry.content,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history,
          scope,
        }),
      })

      const payload = (await response.json()) as ChatApiResponse

      if (!response.ok || payload.error) {
        throw new Error(payload.error || 'Failed to get chat response.')
      }

      const assistantMessage: Message = {
        id: createId(),
        role: 'assistant',
        content: payload.answer,
        citations: payload.citations,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (requestError) {
      const requestMessage =
        requestError instanceof Error ? requestError.message : 'Unexpected error.'
      setError(requestMessage)
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          content:
            'I could not complete that request. Please try again or ask a narrower question.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await submitMessage(input)
  }

  const handlePanelKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !rootRef.current) return

    const focusables = rootRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    if (focusables.length === 0) return

    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement as HTMLElement | null

    if (event.shiftKey) {
      if (active === first || !rootRef.current.contains(active)) {
        event.preventDefault()
        last.focus()
      }
    } else if (active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const inner = (
    <>
      {showHeader && (
        <header className="shrink-0 space-y-2">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <MessageSquareText className="h-5 w-5 text-primary" />
            {title}
          </div>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </header>
      )}

      {!hasConversation && (
        <div className="flex shrink-0 flex-wrap gap-2">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                onExpand?.()
                submitMessage(prompt)
              }}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              disabled={isLoading}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div
        className={`space-y-3 rounded-lg border border-border/70 bg-background/40 p-3 ${scrollAreaClasses}`}
      >
        {messages.map((message) => (
          <article
            key={message.id}
            className={`rounded-lg p-3 text-sm ${
              message.role === 'user'
                ? 'ml-8 bg-primary text-primary-foreground'
                : 'mr-8 bg-muted text-foreground'
            }`}
          >
            <div
              className={
                message.role === 'assistant'
                  ? 'prose prose-sm dark:prose-invert max-w-none break-words'
                  : 'whitespace-pre-wrap break-words leading-relaxed'
              }
            >
              {message.role === 'assistant' ? (
                <ReactMarkdown components={markdownComponents}>
                  {enrichMarkdownLinks(message.content)}
                </ReactMarkdown>
              ) : (
                message.content
              )}
            </div>
            {message.role === 'assistant' &&
              message.citations &&
              message.citations.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-border/70 pt-2 text-xs">
                  {message.citations.slice(0, 3).map((citation) => (
                    <div key={`${message.id}-${citation.source}-${citation.title}`}>
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-normal ${citationClasses[citation.type]}`}
                        >
                          {citationLabels[citation.type]}
                        </span>
                        <p className="font-medium">{citation.title}</p>
                      </div>
                      <p className="text-muted-foreground">
                        {citation.source.replace(/^docs\/project-knowledge\//, '').replace(/^docs\//, '')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
          </article>
        ))}

        {isLoading && (
          <div className="mr-8 flex items-center gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking...
          </div>
        )}
        <div ref={scrollAnchorRef} className="h-px shrink-0" aria-hidden />
      </div>

      {error && <p className="shrink-0 text-xs text-red-500">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 items-center gap-2"
      >
        <Input
          className="min-w-0 flex-1"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </>
  )

  if (variant === 'floating') {
    return (
      <div ref={rootRef} className="flex min-h-0 flex-1 flex-col gap-3" onKeyDown={handlePanelKeyDown}>
        {inner}
      </div>
    )
  }

  return (
    <div ref={rootRef} className="space-y-4" onKeyDown={handlePanelKeyDown}>
      {inner}
    </div>
  )
}
