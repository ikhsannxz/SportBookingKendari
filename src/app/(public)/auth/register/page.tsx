'use client'

import Link from 'next/link'
import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { registerAction } from '@/app/actions/auth'

export default function RegisterPage() {
  const [customerState, customerAction, isCustomerPending] = useActionState(registerAction.bind(null, 'customer'), null)
  const [ownerState, ownerAction, isOwnerPending] = useActionState(registerAction.bind(null, 'owner'), null)
  const router = useRouter()

  useEffect(() => {
    if (customerState?.redirectUrl) {
      router.push(customerState.redirectUrl)
    }
  }, [customerState, router])

  useEffect(() => {
    if (ownerState?.redirectUrl) {
      router.push(ownerState.redirectUrl)
    }
  }, [ownerState, router])

  return (
    <div className="container mx-auto px-4 flex justify-center items-start md:items-center min-h-[calc(100vh-10rem)] md:min-h-[calc(100vh-16rem)] pt-8 pb-12 md:py-12">
      <Card className="w-full max-w-md mt-4 md:mt-0">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">Buat Akun</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Bergabunglah dengan SportBook untuk memesan venue atau mendaftarkan venue Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="customer">Pelanggan</TabsTrigger>
              <TabsTrigger value="owner">Pemilik Venue</TabsTrigger>
            </TabsList>

            <TabsContent value="customer">
              <form action={customerAction} className="space-y-4">
                {customerState?.error && (
                  <div className="p-3 text-sm text-white bg-destructive rounded-md">
                    {customerState.error}
                  </div>
                )}
                {customerState?.success && (
                  <div className="p-3 text-sm text-white bg-green-500 rounded-md">
                    {customerState.success}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name-customer">Nama Lengkap</Label>
                  <Input id="name-customer" name="fullName" placeholder="Masukkan nama lengkap" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-customer">Alamat Email</Label>
                  <Input id="email-customer" name="email" type="email" placeholder="Masukkan alamat email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-customer">Kata Sandi</Label>
                  <PasswordInput id="password-customer" name="password" placeholder="Masukkan kata sandi" required minLength={6} />
                </div>
                <Button className="w-full" type="submit" disabled={isCustomerPending}>
                  {isCustomerPending ? 'Mendaftarkan Akun...' : 'Buat Akun'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="owner">
              <form action={ownerAction} className="space-y-4">
                {ownerState?.error && (
                  <div className="p-3 text-sm text-white bg-destructive rounded-md">
                    {ownerState.error}
                  </div>
                )}
                {ownerState?.success && (
                  <div className="p-3 text-sm text-white bg-green-500 rounded-md">
                    {ownerState.success}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name-owner">Nama Lengkap / Nama Bisnis</Label>
                  <Input id="name-owner" name="fullName" placeholder="Masukkan nama lengkap" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-owner">Email Bisnis</Label>
                  <Input id="email-owner" name="email" type="email" placeholder="Masukkan alamat email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-owner">Kata Sandi</Label>
                  <PasswordInput id="password-owner" name="password" placeholder="Masukkan kata sandi" required minLength={6} />
                </div>
                <Button className="w-full" type="submit" disabled={isOwnerPending}>
                  {isOwnerPending ? 'Mendaftarkan Akun Pemilik...' : 'Buat Akun Pemilik'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Masuk
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
