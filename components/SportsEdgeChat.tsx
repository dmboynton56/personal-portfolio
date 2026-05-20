'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Loader2, MessageSquareText, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import ReactMarkdown from 'react-markdown'

type ChatRole = 'user' | 'assistant'

type Citation = {
  type: 'doc' | 'bigquery' | 'supabase' | 'web' | 'model'
  source: string
  title: string
  snippet?: string
  query?: string
  generatedAt?: string
}

type Message = {
  id: string
  role: ChatRole
  content: string
  citations?: Citation[]
}

type ChatApiResponse = {
  answer: string
  model: string
  scope: 'default' | 'sports-edge' | 'llm-advisor' | 'nba-hof'
  citations: Citation[]
  error?: string
}

const quickPrompts = [
  'NFL week 12 top edges',
  'Why does the model care about rest days?',
  'How should I interpret edge_pts and spread hit rate?',
  'What are the current model limitations?'
]

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const citationLabels: Record<Citation['type'], string> = {
  doc: 'Doc',
  bigquery: 'BigQuery',
  supabase: 'Supabase',
  web: 'Web',
  model: 'Model'
}

const citationClasses: Record<Citation['type'], string> = {
  doc: 'border-blue-500/20 bg-blue-500/10 text-blue-500',
  bigquery: 'border-violet-500/20 bg-violet-500/10 text-violet-500',
  supabase: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
  web: 'border-amber-500/20 bg-amber-500/10 text-amber-500',
  model: 'border-pink-500/20 bg-pink-500/10 text-pink-500'
}

export function SportsEdgeChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: createId(),
      role: 'assistant',
      content:
        'Ask about Sports Edge results, methodology, or risk. I can combine live SQL stats with portfolio documentation.'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasMessages = useMemo(() => messages.length > 1, [messages.length])

  const submitMessage = async (rawMessage: string) => {
    const message = rawMessage.trim()
    if (!message || isLoading) return

    const userMessage: Message = {
      id: createId(),
      role: 'user',
      content: message
    }

    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setError(null)
    setIsLoading(true)

    try {
      const history = nextMessages.slice(-8).map((entry) => ({
        role: entry.role,
        content: entry.content
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          history,
          scope: 'sports-edge'
        })
      })

      const payload = (await response.json()) as ChatApiResponse

      if (!response.ok || payload.error) {
        throw new Error(payload.error || 'Failed to get chat response.')
      }

      const assistantMessage: Message = {
        id: createId(),
        role: 'assistant',
        content: payload.answer,
        citations: payload.citations
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
            'I could not complete that request. Please try again or ask a narrower question (for example, "NFL week 12 top edges").'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await submitMessage(input)
  }

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <MessageSquareText className="h-5 w-5 text-primary" />
          Sports Edge Chat
        </div>
        <p className="text-sm text-muted-foreground">
          Hybrid assistant: SQL summaries for results + documentation retrieval for methodology.
        </p>
      </header>

      {!hasMessages && (
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => submitMessage(prompt)}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              disabled={isLoading}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="max-h-[440px] space-y-3 overflow-y-auto rounded-lg border border-border/70 bg-background/40 p-3">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`rounded-lg p-3 text-sm ${
              message.role === 'user'
                ? 'ml-8 bg-primary text-primary-foreground'
                : 'mr-8 bg-muted text-foreground'
            }`}
          >
            <div className={message.role === 'assistant' ? "prose prose-sm dark:prose-invert max-w-none break-words" : "whitespace-pre-wrap break-words leading-relaxed"}>
              {message.role === 'assistant' ? (
                <ReactMarkdown 
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="mb-2 list-disc pl-4">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-2 list-decimal pl-4">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                    code: ({ children }) => <code className="rounded bg-muted-foreground/20 px-1 py-0.5 font-mono text-xs">{children}</code>,
                    pre: ({ children }) => <pre className="my-2 overflow-x-auto rounded bg-muted-foreground/10 p-2 font-mono text-xs">{children}</pre>
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                message.content
              )}
            </div>
            {message.role === 'assistant' && message.citations && message.citations.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-border/70 pt-2 text-xs">
                {message.citations.slice(0, 3).map((citation) => (
                  <div key={`${message.id}-${citation.source}-${citation.title}`}>
                    <div className="mb-1 flex items-center gap-2">
                      <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-normal ${citationClasses[citation.type]}`}>
                        {citationLabels[citation.type]}
                      </span>
                      <p className="font-medium">{citation.title}</p>
                    </div>
                    <p className="text-muted-foreground">{citation.source}</p>
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
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about top edges, feature logic, metrics, or risk assumptions"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </section>
  )
}
