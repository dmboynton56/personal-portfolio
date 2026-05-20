'use client'

import { ChatPanel } from '@/components/chat/ChatPanel'
import { getScopeUICopy } from '@/components/chat/scope-copy'
import type { ChatScope } from '@/lib/chatbot/types'

export type ProjectChatScope = Exclude<ChatScope, 'default'>

type ProjectChatProps = {
  scope: ProjectChatScope
}

export function ProjectChat({ scope }: ProjectChatProps) {
  const copy = getScopeUICopy(scope)

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-6">
      <ChatPanel
        scope={scope}
        variant="inline"
        title={copy.title}
        subtitle={copy.subtitle}
        welcomeMessage={copy.welcomeMessage}
        placeholder={copy.placeholder}
        showHeader
      />
    </section>
  )
}
