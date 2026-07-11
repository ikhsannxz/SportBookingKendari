import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getVenueImage(venueImages?: { url: string; is_primary: boolean }[] | any): string {
  if (!venueImages || !Array.isArray(venueImages) || venueImages.length === 0) {
    return 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80'
  }
  const primaryImg = venueImages.find(img => img.is_primary)
  const fallbackImg = venueImages[0]
  return primaryImg?.url || fallbackImg?.url || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80'
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(dateStr))
}

export function translateFacility(facilityName: string): string {
  const mapping: Record<string, string> = {
    'Premium Vinyl Court': 'Lapangan Vinyl Premium',
    'Shower & Toilet': 'Kamar Mandi & Toilet',
    'Waiting Area': 'Ruang Tunggu',
    'Cafe / Canteen': 'Kafe / Kantin',
    'Free WiFi': 'WiFi Gratis',
    'Spacious Parking': 'Area Parkir Luas',
    'Prayer Room': 'Mushola'
  }
  return mapping[facilityName] || facilityName
}

export function getGoogleMapsUrl(venue: { google_maps_url?: string | null, latitude?: number | null, longitude?: number | null, address?: string | null, city?: string | null }): string | null {
  if (venue.google_maps_url) {
    return venue.google_maps_url
  }
  if (venue.latitude != null && venue.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`
  }
  if (venue.address) {
    const query = encodeURIComponent(`${venue.address}${venue.city ? `, ${venue.city}` : ''}`)
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  }
  return null
}

