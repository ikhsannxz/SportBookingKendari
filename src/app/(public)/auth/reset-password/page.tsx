'use client'

import { useActionState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { resetPasswordAction } from '@/app/actions/auth'
import { toast } from 'sonner'

function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const errorParam = searchParams.get('error')
  const isError = !!errorParam

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
    if (state?.success) {
      toast.success(state.success)
      // Redirect to login after successful reset
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    }
  }, [state, router])

  if (isError) {
    return (
      <Card className="w-full max-w-md text-center mt-4 md:mt-0">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl md:text-3xl font-bold text-destructive">Tautan Kedaluwarsa</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Tautan reset kata sandi tidak valid atau telah kedaluwarsa. Silakan minta tautan baru.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/auth/forgot-password">
              Kembali ke Lupa Kata Sandi
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mt-4 md:mt-0">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl md:text-3xl font-bold">Reset Kata Sandi</CardTitle>
        <CardDescription className="text-sm md:text-base">
          Masukkan kata sandi baru Anda di bawah ini.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Kata Sandi Baru</Label>
            <Input id="newPassword" name="newPassword" type="password" placeholder="Masukkan kata sandi" required minLength={6} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Masukkan ulang kata sandi" required minLength={6} />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="container mx-auto px-4 flex justify-center items-start md:items-center min-h-[calc(100vh-10rem)] md:min-h-[calc(100vh-16rem)] pt-8 pb-12 md:py-12">
      <Suspense fallback={<div>Memuat...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
