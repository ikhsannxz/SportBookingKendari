import { createClient } from './supabase/server'
import { redirect } from 'next/navigation'

export type UserRole = 'customer' | 'owner' | 'admin'

/**
 * Ensures a user is authenticated. 
 * Use this at the top of Server Actions or API routes that require any logged-in user.
 */
export async function requireUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }
  
  return { supabase, user }
}

/**
 * Ensures a user is authenticated and has one of the allowed roles.
 * Use this at the top of Server Actions or API routes that require specific roles.
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const { supabase, user } = await requireUser()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (error || !profile || !allowedRoles.includes(profile.role as UserRole)) {
    throw new Error('Unauthorized access')
  }
  
  return { supabase, user, role: profile.role as UserRole }
}
