import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  
  const error = searchParams.get('error')
  const error_code = searchParams.get('error_code')
  const error_description = searchParams.get('error_description')

  // If Supabase sends an error (like otp_expired), forward it to the destination
  if (error) {
    return NextResponse.redirect(`${origin}${next}?error=${error}&error_code=${error_code}&error_description=${error_description}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      return NextResponse.redirect(`${origin}${next}?error=access_denied&error_code=exchange_failed&error_description=${exchangeError.message}`)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
