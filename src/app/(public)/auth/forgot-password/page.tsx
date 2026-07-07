'use client'

import Link from 'next/link'
import { useActionState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { forgotPasswordAction } from '@/app/actions/auth'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, null)

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
    if (state?.success) {
      toast.success(state.success)
    }
  }, [state])

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-16rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Lupa Kata Sandi</CardTitle>
          <CardDescription>
            Masukkan alamat email yang terdaftar untuk menerima tautan reset kata sandi.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Alamat Email</Label>
              <Input id="email" name="email" type="email" placeholder="email@contoh.com" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? 'Mengirim...' : 'Kirim Tautan Reset'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Ingat kata sandi Anda?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Masuk
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
