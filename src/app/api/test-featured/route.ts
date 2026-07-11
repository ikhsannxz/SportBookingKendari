import { NextResponse } from 'next/server'
import { getFeaturedVenues } from '@/lib/supabase/queries/venues'

export async function GET() {
  try {
    const venues = await getFeaturedVenues()
    return NextResponse.json({ success: true, venues })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message, stack: error?.stack })
  }
}
