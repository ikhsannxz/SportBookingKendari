'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'
import { Suspense } from 'react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 flex items-center justify-center min-h-[calc(100vh-16rem)]">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm text-center max-w-lg w-full flex flex-col items-center">
        
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <Mail className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
          Periksa Email Anda
        </h1>
        
        <p className="text-slate-600 mb-6 leading-relaxed">
          Kami telah mengirimkan email verifikasi ke alamat email{' '}
          {email ? (
            <span className="font-semibold text-slate-900">{email}</span>
          ) : (
            'Anda'
          )}
          .
        </p>
        
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-8 w-full text-left">
          <p className="text-sm text-slate-700 font-medium mb-3">
            Silakan buka kotak masuk email Anda dan klik tautan verifikasi untuk mengaktifkan akun SportBook.
          </p>
          <ul className="text-sm text-slate-500 space-y-2 list-disc list-inside">
            <li>Periksa folder Spam</li>
            <li>Periksa folder Promosi</li>
            <li>Tunggu beberapa menit jika email belum masuk</li>
          </ul>
        </div>
        
        <div className="flex flex-col w-full gap-3">
          <Button asChild size="lg" className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white">
            <a href="https://mail.google.com/" target="_blank" rel="noopener noreferrer">
              Buka Gmail
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full rounded-full text-emerald-600 border-emerald-200 hover:bg-emerald-50">
            <Link href="/auth/login">
              Kembali ke Masuk
            </Link>
          </Button>
        </div>
        
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-16rem)] flex items-center justify-center">Memuat...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
