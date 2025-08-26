import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  // Fetch the stats (assuming a single row)
  const { data, error } = await supabase
    .from('mancala_stats')
    .select('*')
    .limit(1)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // body: { winner: 1 | 2 | 0 }
  // Fetch the current stats row
  const { data, error } = await supabase
    .from('mancala_stats')
    .select('*')
    .limit(1)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update the stats
  const update: any = {};
  if (body.winner === 1) update.p1_wins = data.p1_wins + 1;
  else if (body.winner === 2) update.p2_wins = data.p2_wins + 1;
  else update.ties = data.ties + 1;

  const { error: updateError } = await supabase
    .from('mancala_stats')
    .update(update)
    .eq('id', data.id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
