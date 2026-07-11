'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { loginAction } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className="container mx-auto px-4 flex justify-center items-start md:items-center min-h-[calc(100vh-10rem)] md:min-h-[calc(100vh-16rem)] pt-8 pb-12 md:py-12">
      <Card className="w-full max-w-md mt-4 md:mt-0">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">Selamat Datang Kembali</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Masukkan email dan kata sandi untuk mengakses akun Anda
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            {state?.error && (
              <div className="p-3 text-sm text-white bg-destructive rounded-md">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Alamat Email</Label>
              <Input id="email" name="email" type="email" placeholder="Masukkan alamat email" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Kata Sandi</Label>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Lupa Kata Sandi?
                </Link>
              </div>
              <Input id="password" name="password" type="password" placeholder="Masukkan kata sandi" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? 'Sedang Masuk...' : 'Masuk'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Belum punya akun?{' '}
              <Link href="/auth/register" className="text-primary hover:underline font-medium">
                Daftar
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
