export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { Search, MapPin, Star, ShieldCheck, Clock, CreditCard, ChevronRight, CheckCircle2, QrCode, Zap, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { getFeaturedVenues } from '@/lib/supabase/queries/venues'
import Image from 'next/image'
import { getVenueImage } from '@/lib/utils'

export default async function LandingPage() {
  const featuredVenues = await getFeaturedVenues(6)

  const sports = [
    { name: 'Futsal', image: '/images/home/futsal.png', slug: 'futsal' },
    { name: 'Badminton', image: '/images/home/badminton.png', slug: 'badminton' },
    { name: 'Basket', image: '/images/home/basketball.png', slug: 'basketball' },
    { name: 'Tenis', image: '/images/home/tennis.png', slug: 'tennis' },
  ]

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white">
      
      {/* 1. Hero Section (Modern Collage/Thematic) */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden bg-slate-50">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            <div className="flex-1 w-full flex flex-col items-start text-left z-10">
              <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                Platform Olahraga #1 di Kendari
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] mb-6">
                Pesan Lapangan Olahraga <br className="hidden md:block"/>
                <span className="text-emerald-600">
                  Lebih Mudah & Cepat
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 font-medium leading-relaxed">
                Temukan dan booking lapangan futsal, badminton, basket, hingga tenis. Bebas antre, bayar online, langsung main!
              </p>
              
              {/* Main Search Widget */}
              <form action="/search" method="GET" className="w-full max-w-2xl bg-white border border-slate-200 p-2 rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col sm:flex-row gap-2 relative z-20">
                <div className="flex-1 flex items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 focus-within:border-emerald-300 focus-within:bg-white transition-colors">
                  <Search className="w-5 h-5 text-emerald-600 mr-3 shrink-0" />
                  <Input 
                    name="q"
                    placeholder="Cari nama lapangan atau lokasi..." 
                    className="border-0 bg-transparent focus-visible:ring-0 px-0 shadow-none text-base text-slate-900 placeholder:text-slate-400 h-full w-full outline-none"
                  />
                </div>
                <Button type="submit" size="lg" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-auto py-4 sm:py-0 px-8 text-base font-bold shadow-md transition-all">
                  Cari Sekarang
                </Button>
              </form>
              
              <div className="mt-8 flex items-center gap-6 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Lebih dari 50+ Venue</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Harga Terbaik</span>
                </div>
              </div>
            </div>
            
            {/* Hero Imagery Collage */}
            <div className="flex-1 w-full relative h-[400px] sm:h-[500px] lg:h-[600px] z-0">
              <div className="absolute top-0 right-0 w-4/5 h-4/5 rounded-3xl overflow-hidden shadow-2xl border-8 border-white z-10 transform rotate-2 hover:rotate-0 transition-transform duration-500 bg-slate-200">
                <Image 
                  src="/images/home/hero.png" 
                  alt="Pemain Futsal" 
                  fill 
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute bottom-0 left-0 w-3/5 h-3/5 rounded-3xl overflow-hidden shadow-2xl border-8 border-white z-20 transform -rotate-3 hover:rotate-0 transition-transform duration-500 bg-slate-200">
                <Image 
                  src="/images/home/badminton.png" 
                  alt="Pemain Badminton" 
                  fill 
                  className="object-cover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl -z-10"></div>
              <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Benefits */}
      <section className="py-16 border-y border-slate-100 bg-white">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Booking Real-time</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Cek ketersediaan dan pesan jadwal secara instan tanpa perlu menelepon.</p>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Pembayaran QRIS</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Bayar mudah dan aman dari semua dompet digital dan mobile banking.</p>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Venue Terverifikasi</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Semua lapangan telah dicek kualitas fasilitas dan kenyamanannya.</p>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Jadwal Selalu Terupdate</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Sistem kami terhubung langsung dengan jadwal pengelola venue.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Cabang Olahraga */}
      <section className="py-24 bg-slate-50">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-4">Pilih Olahraga Anda</h2>
              <p className="text-lg text-slate-500 font-medium">Berbagai pilihan venue olahraga dengan fasilitas terbaik siap untuk Anda mainkan.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {sports.map((sport) => (
              <Link key={sport.name} href={`/search?sport=${sport.slug}`}>
                <div className="group relative rounded-3xl overflow-hidden aspect-[3/4] shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer bg-slate-200">
                  <Image 
                    src={sport.image} 
                    alt={`Lapangan ${sport.name}`} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  {/* Premium Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent transition-opacity duration-300" />
                  
                  <div className="absolute bottom-0 left-0 w-full p-6 text-white transform transition-transform duration-300">
                    <h3 className="text-2xl font-bold mb-2 tracking-tight group-hover:-translate-y-1 transition-transform duration-300">{sport.name}</h3>
                    <div className="flex items-center text-sm font-semibold text-white/80 group-hover:text-white opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      Lihat Venue <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Lapangan Populer (Airbnb Style) */}
      <section className="py-24 bg-white">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-4">Rekomendasi Venue</h2>
              <p className="text-lg text-slate-500 font-medium">Venue pilihan dengan rating tertinggi dan fasilitas terlengkap minggu ini.</p>
            </div>
            <Button variant="outline" className="rounded-full border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 shrink-0 font-bold px-6" asChild>
              <Link href="/search">Lihat Semua Venue</Link>
            </Button>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {featuredVenues.map((venue) => {
              const primaryImage = getVenueImage(venue.venue_images)

              return (
                <Link key={venue.id} href={`/venues/${venue.slug}`} className="group flex flex-col gap-3 cursor-pointer">
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-1">
                    {primaryImage ? (
                      <Image 
                        unoptimized 
                        src={primaryImage} 
                        alt={venue.name} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <span className="text-slate-400 font-medium">Belum ada foto</span>
                      </div>
                    )}
                    
                    {/* Floating Heart / Like */}
                    <div className="absolute top-4 right-4 text-white hover:scale-110 transition-transform drop-shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(0,0,0,0.4)" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </div>
                  </div>
                  
                  {/* Content Container */}
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-lg text-slate-900 truncate">
                        {venue.name}
                      </h3>
                      {venue.status === 'maintenance' && (
                        <StatusBadge status="maintenance" className="w-fit text-[10px] uppercase shrink-0" />
                      )}
                      <div className="flex items-center gap-1 text-sm font-semibold text-slate-900 shrink-0">
                        <Star className="w-4 h-4 fill-slate-900 text-slate-900" />
                        <span>{venue.rating_avg > 0 ? venue.rating_avg.toFixed(1) : 'Baru'}</span>
                      </div>
                    </div>
                    
                    <p className="text-slate-500 text-sm truncate capitalize mb-1">{venue.district}, {venue.city}</p>
                    <p className="text-slate-500 text-sm mb-2 capitalize">{venue.sport_type}</p>
                    
                    <div className="flex items-center gap-1 mt-1">
                      <span className="font-bold text-slate-900">
                        Rp {venue.price_per_hour.toLocaleString('id-ID')}
                      </span>
                      <span className="text-slate-500 text-sm">per jam</span>
                    </div>
                  </div>
                </Link>
              )
            })}
            
            {featuredVenues.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-500 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-lg font-medium">Belum ada venue yang direkomendasikan saat ini.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Cara Kerja (Startup Style Timeline) */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-4">Mulai Booking dalam 3 Langkah</h2>
            <p className="text-lg text-slate-500 font-medium">Proses booking lapangan dibuat sangat simpel dan efisien untuk Anda.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center max-w-5xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                <Search className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">1. Temukan Venue</h3>
              <p className="text-slate-500 text-sm">Cari lapangan berdasarkan olahraga dan lokasi yang paling dekat dengan Anda.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                <Clock className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">2. Pilih Jadwal</h3>
              <p className="text-slate-500 text-sm">Lihat jadwal kosong secara langsung dan tentukan waktu bermain Anda.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                <QrCode className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">3. Bayar Otomatis</h3>
              <p className="text-slate-500 text-sm">Selesaikan pembayaran melalui QRIS atau transfer, dan lapangan resmi milik Anda.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call To Action untuk Mitra (Sleek Startup Design) */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="bg-slate-950 rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
            {/* Minimalist Decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
            
            <div className="max-w-2xl text-white relative z-10">
              <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Kembangkan Bisnis Venue Anda Bersama Kami</h2>
              <p className="text-lg text-slate-400 mb-10 font-medium leading-relaxed">
                Tingkatkan okupansi lapangan dan kelola operasional dengan lebih efisien menggunakan dashboard manajemen dari SportBook.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 h-14 text-base transition-colors" asChild>
                  <Link href="/auth/register">Daftar Menjadi Mitra</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-bold px-8 h-14 text-base transition-colors" asChild>
                  <Link href="/panduan-mitra">Pelajari Fitur Mitra</Link>
                </Button>
              </div>
            </div>
            
            <div className="hidden lg:block relative z-10 w-full max-w-sm">
              <div className="aspect-square bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Booking Baru</div>
                    <div className="text-xs text-slate-400">Baru saja</div>
                  </div>
                </div>
                <div className="h-2 bg-slate-800 rounded-full w-full"></div>
                <div className="h-2 bg-slate-800 rounded-full w-3/4"></div>
                <div className="h-2 bg-slate-800 rounded-full w-5/6"></div>
                <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">+Rp 450.000</div>
                  <div className="text-xs font-medium text-emerald-500/80">Pendapatan hari ini</div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>
      
    </div>
  )
}
