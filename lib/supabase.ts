import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseFetchTimeoutMs = Number(
  process.env.SUPABASE_FETCH_TIMEOUT_MS ?? 8000
)

const fetchWithTimeout: typeof fetch = async (input, init = {}) => {
  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(),
    Number.isFinite(supabaseFetchTimeoutMs) && supabaseFetchTimeoutMs > 0
      ? supabaseFetchTimeoutMs
      : 8000
  )
  const upstreamSignal = init.signal
  const abortUpstream = () => controller.abort()
  upstreamSignal?.addEventListener('abort', abortUpstream, { once: true })

  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
    upstreamSignal?.removeEventListener('abort', abortUpstream)
  }
}

export const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        },
        global: { fetch: fetchWithTimeout }
      })
    : null

export const isMissingTableError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false
  const maybeCode = (error as { code?: string }).code
  return maybeCode === '42P01' || maybeCode === 'PGRST205'
}
