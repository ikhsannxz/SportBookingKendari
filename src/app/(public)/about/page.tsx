import { Metadata } from 'next'
import { Target, Lightbulb, Heart, MapPin, Mail, Phone, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Tentang Kami - SportBooking Kendari',
  description: 'Mengenal lebih dekat SportBooking Kendari, platform reservasi lapangan olahraga terkemuka di Kota Kendari.',
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden bg-slate-950 text-white">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] opacity-50 pointer-events-none" />
        
        <div className="container px-4 md:px-8 mx-auto relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm font-medium text-slate-300 mb-6">
            Mengenal SportBook Kendari
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-6">
            Menyatukan Komunitas <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Melalui Olahraga
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Kami percaya bahwa akses berolahraga harus mudah, cepat, dan transparan untuk seluruh masyarakat Kota Kendari.
          </p>
        </div>
      </section>

      {/* 2. About SportBooking Kendari */}
      <section className="py-24 bg-white">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-6">Tentang Kami</h2>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              SportBook Kendari adalah platform reservasi dan manajemen lapangan olahraga pertama dan terbesar di Sulawesi Tenggara. Kami hadir sebagai jembatan antara pengelola fasilitas olahraga dengan para penggemar olahraga, memastikan proses booking menjadi mulus, terpercaya, dan sepenuhnya digital.
            </p>
          </div>
        </div>
      </section>

      {/* 3 & 4. Vision and Mission */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            
            {/* Vision */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Lightbulb className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Visi Kami</h3>
              <p className="text-slate-600 leading-relaxed">
                Menjadi ekosistem teknologi olahraga terdepan di Indonesia Timur yang mempromosikan gaya hidup aktif dan sehat melalui kemudahan akses fasilitas berstandar tinggi.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Misi Kami</h3>
              <ul className="space-y-4 text-slate-600">
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  <p>Menghadirkan pengalaman booking instan, aman, dan tanpa hambatan.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  <p>Mendukung pemilik venue (UMKM) dengan sistem manajemen operasional yang modern dan efisien.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  <p>Menyediakan transparansi jadwal dan harga yang selalu terupdate real-time.</p>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Why We Built This Platform */}
      <section className="py-24 bg-white">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mb-6 transform -rotate-6">
                <Heart className="w-8 h-8 fill-current" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-6">Kenapa Platform Ini Hadir?</h2>
              <div className="space-y-4 text-slate-600 text-lg leading-relaxed">
                <p>
                  Semuanya bermula dari rasa frustrasi komunitas olahraga di Kendari. Proses mencari lapangan seringkali mengharuskan kita menelepon satu per satu venue, membandingkan harga secara manual, hingga mendatangi lokasi hanya untuk mengetahui bahwa jadwal sudah penuh.
                </p>
                <p>
                  Di sisi lain, pemilik venue kesulitan mengatur jadwal ganda (double-booking) dan menerima pembayaran tunai yang tidak tercatat dengan baik.
                </p>
                <p className="font-semibold text-slate-900">
                  SportBook hadir untuk memecahkan masalah ini.
                </p>
                <p>
                  Kami membangun teknologi ini dari nol untuk memastikan Anda bisa berolahraga dengan tenang, tanpa pusing memikirkan masalah booking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Contact Information */}
      <section className="py-24 bg-slate-950 text-white rounded-t-[3rem] mt-12">
        <div className="container px-4 md:px-8 mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6">Hubungi Kami</h2>
          <p className="text-slate-400 mb-12 text-lg">
            Ada pertanyaan, masukan, atau tertarik untuk bekerja sama? Kami selalu siap mendengar dari Anda.
          </p>
          
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            <div className="flex flex-col items-center p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
              <Mail className="w-8 h-8 text-emerald-400 mb-4" />
              <h4 className="font-bold mb-1">Email</h4>
              <p className="text-sm text-slate-400">halo@sportbook.id</p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
              <Phone className="w-8 h-8 text-blue-400 mb-4" />
              <h4 className="font-bold mb-1">Telepon / WhatsApp</h4>
              <p className="text-sm text-slate-400">+62 812 3456 7890</p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
              <MapPin className="w-8 h-8 text-rose-400 mb-4" />
              <h4 className="font-bold mb-1">Kantor Pusat</h4>
              <p className="text-sm text-slate-400">Jl. Jend. A. Yani No. 12<br/>Kendari, Sulawesi Tenggara</p>
            </div>
          </div>

          <Button size="lg" className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 h-14 text-base transition-colors" asChild>
            <Link href="/search">Mulai Cari Lapangan <ChevronRight className="w-5 h-5 ml-2" /></Link>
          </Button>
        </div>
      </section>

    </div>
  )
}
