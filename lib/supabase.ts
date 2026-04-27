import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null

export const isMissingTableError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false
  const maybeCode = (error as { code?: string }).code
  return maybeCode === '42P01' || maybeCode === 'PGRST205'
}
