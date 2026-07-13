import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { FaInstagram, FaFacebook, FaXTwitter } from 'react-icons/fa6'

export function PublicFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8 text-sm">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
          {/* Brand Info (takes 2 columns on lg) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter text-emerald-600">SportBook.</span>
            </Link>
            <p className="text-slate-500 leading-relaxed max-w-sm text-base">
              Platform booking lapangan olahraga terpercaya di Kendari. Temukan, pesan, dan mainkan olahraga favoritmu dengan pengalaman terbaik.
            </p>
            <div className="flex gap-3">
              <Link href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all text-slate-500">
                <FaInstagram className="w-5 h-5" />
              </Link>
              <Link href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all text-slate-500">
                <FaFacebook className="w-5 h-5" />
              </Link>
              <Link href="#" aria-label="X (Twitter)" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all text-slate-500">
                <FaXTwitter className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Cabang Olahraga */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-900 text-base">Cabang Olahraga</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/search?sport=futsal" className="text-slate-500 hover:text-emerald-600 transition-colors">Futsal</Link></li>
              <li><Link href="/search?sport=badminton" className="text-slate-500 hover:text-emerald-600 transition-colors">Badminton</Link></li>
              <li><Link href="/search?sport=basketball" className="text-slate-500 hover:text-emerald-600 transition-colors">Basket</Link></li>
              <li><Link href="/search?sport=tennis" className="text-slate-500 hover:text-emerald-600 transition-colors">Tenis</Link></li>
            </ul>
          </div>

          {/* Untuk Mitra */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-900 text-base">Untuk Mitra</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/auth/register" className="text-slate-500 hover:text-emerald-600 transition-colors">Daftarkan Venue</Link></li>
              <li><Link href="/auth/login" className="text-slate-500 hover:text-emerald-600 transition-colors">Masuk Dashboard</Link></li>
              <li><Link href="/panduan-mitra" className="text-slate-500 hover:text-emerald-600 transition-colors">Panduan Mitra</Link></li>
              <li><Link href="/kisah-sukses" className="text-slate-500 hover:text-emerald-600 transition-colors">Kisah Sukses</Link></li>
            </ul>
          </div>

          {/* Tentang & Bantuan */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-900 text-base">Dukungan</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/about" className="text-slate-500 hover:text-emerald-600 transition-colors">Tentang Kami</Link></li>
              <li><Link href="/bantuan" className="text-slate-500 hover:text-emerald-600 transition-colors">Pusat Bantuan</Link></li>
              <li><Link href="/kontak" className="text-slate-500 hover:text-emerald-600 transition-colors">Hubungi Kami</Link></li>
              <li><Link href="/faq" className="text-slate-500 hover:text-emerald-600 transition-colors">Tanya Jawab (FAQ)</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} SportBook Kendari. Hak Cipta Dilindungi.</p>
          <div className="flex gap-6">
            <Link href="/kebijakan-privasi" className="hover:text-emerald-600 transition-colors">Kebijakan Privasi</Link>
            <Link href="/syarat-ketentuan" className="hover:text-emerald-600 transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
        
      </div>
    </footer>
  )
}
