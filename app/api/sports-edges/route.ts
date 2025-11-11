import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const cronSecret = process.env.SPORTS_EDGE_CRON_SECRET

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('games_today_enriched')
      .select('*')
      .order('game_time_utc', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!cronSecret) {
      console.error('SPORTS_EDGE_CRON_SECRET is not configured')
      return NextResponse.json(
        { error: 'Cron secret is not configured' },
        { status: 500 }
      )
    }

    const providedSecret = req.headers.get('x-cron-secret')
    if (providedSecret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now the cron POST simply warms the Supabase view and returns counts.
    const { data, error } = await supabase
      .from('games_today_enriched')
      .select('*')
      .order('game_time_utc', { ascending: true })

    if (error) {
      console.error('Supabase cron error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      rowCount: data?.length ?? 0,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cron API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
