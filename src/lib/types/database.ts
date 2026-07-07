export type UserRole = 'customer' | 'owner' | 'admin'
export type SportType = 'futsal' | 'badminton' | 'basketball' | 'tennis'
export type VenueStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended' | 'maintenance'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  qris_image_url?: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Venue {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  sport_type: SportType
  address: string
  city: string
  district: string | null
  latitude: number | null
  longitude: number | null
  price_per_hour: number
  status: VenueStatus
  maintenance_reason: string | null
  maintenance_until: string | null
  rating_avg: number
  review_count: number
  created_at: string
  updated_at: string
}

export interface VenueImage {
  id: string
  venue_id: string
  url: string
  alt_text: string | null
  is_primary: boolean
  sort_order: number
  created_at: string
}

export interface VenueFacility {
  id: string
  venue_id: string
  name: string
  icon: string | null
  created_at: string
}

export interface Schedule {
  id: string
  venue_id: string
  day_of_week: number // 0-6
  open_time: string
  close_time: string
  is_closed: boolean
  created_at: string
}
