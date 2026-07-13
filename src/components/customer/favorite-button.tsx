'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { toggleFavoriteAction } from '@/app/actions/favorites'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  venueId: string
  initialIsFavorite: boolean
  variant?: 'icon' | 'text'
  className?: string
}

export function FavoriteButton({ venueId, initialIsFavorite, variant = 'icon', className }: FavoriteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const router = useRouter()

  const handleToggle = () => {
    // Optimistic UI update
    const previousState = isFavorite
    setIsFavorite(!previousState)

    startTransition(async () => {
      const result = await toggleFavoriteAction(venueId)

      if ('needsLogin' in result && result.needsLogin) {
        // Revert optimistic update
        setIsFavorite(previousState)
        toast.error(result.error)
        router.push('/auth/login')
        return
      }

      if ('error' in result && result.error) {
        // Revert optimistic update
        setIsFavorite(previousState)
        toast.error(result.error)
        return
      }

      if ('success' in result && result.success) {
        // Use the actual state from the server to be sure, though optimistic is likely correct
        if ('isFavorite' in result && result.isFavorite !== undefined) {
          setIsFavorite(result.isFavorite)
        }
        toast.success(result.success)
      }
    })
  }

  if (variant === 'text') {
    return (
      <Button 
        variant="outline" 
        onClick={handleToggle} 
        disabled={isPending}
        className={cn("gap-2", className)}
      >
        <Heart 
          className={cn("w-5 h-5 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} 
        />
        {isFavorite ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
      </Button>
    )
  }

  return (
    <Button 
      type="button" 
      variant="secondary" 
      size="icon" 
      onClick={(e) => {
        e.preventDefault() // prevent navigating if inside a link
        handleToggle()
      }}
      disabled={isPending}
      className={cn(
        "absolute top-2 right-2 z-10 rounded-full bg-background/80 backdrop-blur hover:bg-background/90 transition-all",
        className
      )}
      aria-label={isFavorite ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
    >
      <Heart className={cn("w-5 h-5 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "")} />
    </Button>
  )
}
