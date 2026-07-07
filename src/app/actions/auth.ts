'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function registerCustomerAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  return registerAction('customer', prevState, formData)
}
export type AuthState = {
  error?: string
  success?: string
} | null

export async function loginAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email dan kata sandi wajib diisi' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Find user role to redirect correctly
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role || 'customer'
    // Await redirect is not necessary, it throws an error to the nearest boundary.
    redirect(`/${role}/dashboard`)
  }

  return { success: 'Berhasil masuk' }
}

export async function registerAction(
  role: 'customer' | 'owner',
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    console.log('REGISTER:', { email, fullName, role })

    const supabase = await createClient()

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    console.log('SIGNUP RESULT:', { error, data })

    if (error) {
      return { error: error.message }
    }

    if (data.user && role === 'owner') {
      const updateResult = await supabase
        .from('profiles')
        .update({ role: 'owner' })
        .eq('id', data.user.id)

      console.log('PROFILE UPDATE:', updateResult)
    }

    return {
      success: 'Akun berhasil dibuat'
    }
  } catch (err) {
    console.error('REGISTER ERROR:', err)
    return {
      error: err instanceof Error ? err.message : 'Kesalahan tidak dikenal'
    }
  }
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function forgotPasswordAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  if (!email) {
    return { error: 'Email wajib diisi' }
  }

  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Tautan reset kata sandi telah dikirim ke email Anda' }
}

export async function resetPasswordAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!newPassword || !confirmPassword) {
    return { error: 'Semua kolom wajib diisi' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Konfirmasi kata sandi tidak cocok' }
  }

  if (newPassword.length < 6) {
    return { error: 'Kata sandi minimal 6 karakter' }
  }

  const supabase = await createClient()
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Kata sandi berhasil diperbarui' }
}