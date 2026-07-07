import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Profile } from '@/lib/types/database'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface ProfileHeaderProps {
  profile: Profile
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const roleText = profile.role === 'owner' ? 'Pemilik Venue' : profile.role === 'customer' ? 'Pelanggan' : 'Admin'
  const statusBadge = profile.is_active ? <Badge variant="default" className="bg-green-600 hover:bg-green-700">Aktif</Badge> : <Badge variant="destructive">Nonaktif</Badge>

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-card border rounded-lg shadow-sm">
      <Avatar className="w-24 h-24 border-2">
        <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} className="object-cover" />
        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
          {getInitials(profile.full_name)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold">{profile.full_name}</h2>
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 mt-1">
              <span>{roleText}</span>
              {statusBadge}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-sm text-muted-foreground mt-4">
          <div className="flex items-center gap-1">
            <span className="font-medium text-foreground">Email:</span> {profile.email}
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-foreground">Telepon:</span> {profile.phone || '-'}
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-foreground">Bergabung sejak</span>{' '}
            {format(new Date(profile.created_at), 'MMMM yyyy', { locale: id })}
          </div>
        </div>
      </div>
    </div>
  )
}
