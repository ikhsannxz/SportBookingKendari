import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const isAuthRoute = pathname.startsWith('/auth')
  const isCustomerRoute = pathname.startsWith('/customer') || pathname.endsWith('/book')
  const isOwnerRoute = pathname.startsWith('/owner')
  const isAdminRoute = pathname.startsWith('/admin')
  
  const isProtectedRoute = isCustomerRoute || isOwnerRoute || isAdminRoute

  // 1. Redirect authenticated users away from auth pages
  if (user && isAuthRoute) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role || 'customer'
    
    const url = request.nextUrl.clone()
    url.pathname = `/${role}/dashboard`
    return NextResponse.redirect(url)
  }

  // 2. Protect routes requiring authentication
  if (isProtectedRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    // 3. Perform Role-Based Access Control
    const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role

    if (error || !role) {
      // In case of missing profile, force re-authentication
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    if (isAdminRoute && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = `/${role}/dashboard`
      return NextResponse.redirect(url)
    }

    if (isOwnerRoute && role !== 'owner') {
      const url = request.nextUrl.clone()
      url.pathname = `/${role}/dashboard`
      return NextResponse.redirect(url)
    }

    if (isCustomerRoute && role !== 'customer') {
      const url = request.nextUrl.clone()
      url.pathname = `/${role}/dashboard`
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
