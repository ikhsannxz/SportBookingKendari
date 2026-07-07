import { NextResponse } from 'next/server';
import { getFeaturedVenues } from '@/lib/supabase/queries/venues';

export async function GET() {
  const data = await getFeaturedVenues();
  return NextResponse.json(data);
}
