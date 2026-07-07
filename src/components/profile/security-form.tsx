'use client'

import { useState, useTransition } from 'react'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { changePasswordAction } from '@/app/actions/profile'

export function SecurityForm() {
  const [isPending, startTransition] = useTransition()
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await changePasswordAction(null, formData)
      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success(result.success)
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Keamanan</CardTitle>
          <CardDescription>Kelola kata sandi dan pengaturan keamanan Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Kata Sandi Saat Ini</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="oldPassword" 
                name="oldPassword"
                type={showOldPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="pl-9 pr-10" 
                required
              />
              <button 
                type="button" 
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">Kata Sandi Baru</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="newPassword" 
                name="newPassword"
                type={showNewPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="pl-9 pr-10" 
                required
                minLength={6}
              />
              <button 
                type="button" 
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="confirmPassword" 
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="pl-9 pr-10" 
                required
                minLength={6}
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t p-6">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Ubah Kata Sandi
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
