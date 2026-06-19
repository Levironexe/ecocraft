import { NextResponse } from 'next/server';
import { createServiceClient } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServiceClient();
    // Lightweight ping — just fetch 1 row from any table
    const { error } = await supabase.from('user_crafts').select('id').limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
