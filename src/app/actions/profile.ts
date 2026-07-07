'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ActionState = {
  error?: string
  success?: string
} | null

export async function updateProfileAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string

  if (!fullName || fullName.trim() === '') {
    return { error: 'Nama Lengkap tidak boleh kosong.' }
  }

  if (phone) {
    const phoneRegex = /^(08|\+628)[0-9]{8,12}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return { error: 'Format nomor telepon tidak valid. Gunakan format 08... atau +628...' }
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      full_name: fullName.trim(), 
      phone: phone.replace(/\s/g, '') || null 
    })
    .eq('id', user.id)

  if (error) {
    console.error('updateProfileAction error details:')
    console.error('message:', error.message)
    console.error('details:', error.details)
    console.error('hint:', error.hint)
    console.error('code:', error.code)
    return { error: error.message }
  }

  revalidatePath('/customer/profile')
  revalidatePath('/owner/profile')

  return { success: 'Profil berhasil diperbarui.' }
}

export async function changePasswordAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const oldPassword = formData.get('oldPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!oldPassword || !newPassword || !confirmPassword) {
    return { error: 'Semua kolom kata sandi wajib diisi.' }
  }

  if (newPassword.length < 6) {
    return { error: 'Kata sandi baru minimal 6 karakter.' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Konfirmasi kata sandi tidak cocok.' }
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: oldPassword,
  })

  if (signInError) {
    return { error: 'Kata sandi lama tidak valid.' }
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (updateError) {
    console.error('changePasswordAction error details:')
    console.error('message:', updateError.message)
    return { error: updateError.message }
  }

  return { success: 'Kata sandi berhasil diperbarui.' }
}

export async function uploadAvatarAction(formData: FormData): Promise<{ error?: string, url?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }

  if (file.size > 2 * 1024 * 1024) {
    return { error: 'Ukuran file maksimal 2MB.' }
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!validTypes.includes(file.type)) {
    return { error: 'Format file tidak didukung. Gunakan JPG, PNG, atau GIF.' }
  }

  console.log(`[Avatar Upload Step 1] Starting upload for user ${user.id}`)
  const ext = file.name.split('.').pop()
  const fileName = `${user.id}/avatar-${Date.now()}.${ext}`
  
  console.log(`[Avatar Upload Step 2] Uploading to Supabase Storage: bucket=avatars, path=${fileName}`)
  const { error: uploadError, data: uploadData } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    const err = uploadError as any
    console.error('[Avatar Upload Error Step 2] storage upload failed:')
    console.error('message:', err.message)
    console.error('details:', err.details)
    console.error('hint:', err.hint)
    console.error('code:', err.code)
    return { error: err.message }
  }
  console.log(`[Avatar Upload Step 2] Upload successful. Path: ${uploadData?.path}`)

  console.log(`[Avatar Upload Step 3] Generating public URL`)
  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)
  
  console.log(`[Avatar Upload Step 3] URL generated: ${publicUrlData.publicUrl}`)

  console.log(`[Avatar Upload Step 4] Updating profiles.avatar_url for user ${user.id}`)
  const { error: profileUpdateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrlData.publicUrl })
    .eq('id', user.id)

  if (profileUpdateError) {
    console.error('[Avatar Upload Error Step 4] profile update failed:')
    console.error('message:', profileUpdateError.message)
    console.error('details:', profileUpdateError.details)
    console.error('hint:', profileUpdateError.hint)
    console.error('code:', profileUpdateError.code)
    return { error: profileUpdateError.message }
  }
  console.log(`[Avatar Upload Step 4] profiles.avatar_url updated successfully.`)

  console.log(`[Avatar Upload Step 5] Revalidating paths and returning success`)
  revalidatePath('/customer/profile')
  revalidatePath('/owner/profile')

  return { url: publicUrlData.publicUrl }
}

export async function uploadQrisAction(formData: FormData): Promise<{ error?: string, url?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }

  if (file.size > 5 * 1024 * 1024) {
    return { error: 'Ukuran file maksimal 5MB.' }
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']
  if (!validTypes.includes(file.type)) {
    return { error: 'Format file tidak didukung. Gunakan JPG, PNG, atau GIF.' }
  }

  const ext = file.name.split('.').pop()
  const fileName = `${user.id}/qris-${Date.now()}.${ext}`
  
  const { error: uploadError, data: uploadData } = await supabase.storage
    .from('qris-images')
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    const err = uploadError as any
    return { error: err.message }
  }

  const { data: publicUrlData } = supabase.storage
    .from('qris-images')
    .getPublicUrl(fileName)
  
  const { error: profileUpdateError } = await supabase
    .from('profiles')
    .update({ qris_image_url: publicUrlData.publicUrl })
    .eq('id', user.id)

  if (profileUpdateError) {
    return { error: profileUpdateError.message }
  }

  revalidatePath('/owner/profile')

  return { url: publicUrlData.publicUrl }
}
