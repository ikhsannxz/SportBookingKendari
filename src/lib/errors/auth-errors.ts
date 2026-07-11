export function translateAuthError(error: Error | any): string {
  if (!error) return "Terjadi kesalahan. Silakan coba kembali."
  
  const msg = error.message || error.toString()
  const lowerMsg = msg.toLowerCase()

  if (lowerMsg.includes('rate limit') || lowerMsg.includes('too many requests')) {
    return "Terlalu banyak permintaan. Silakan tunggu beberapa menit lalu coba kembali."
  }
  
  if (lowerMsg.includes('user already registered') || lowerMsg.includes('already exists')) {
    return "Email ini sudah terdaftar. Silakan masuk menggunakan akun Anda."
  }
  
  if (lowerMsg.includes('invalid login credentials') || lowerMsg.includes('invalid credentials')) {
    return "Email atau kata sandi tidak sesuai."
  }
  
  if (lowerMsg.includes('email not confirmed')) {
    return "Email Anda belum diverifikasi. Silakan cek kotak masuk email Anda."
  }
  
  if (lowerMsg.includes('password should be at least')) {
    return "Kata sandi minimal 6 karakter."
  }
  
  if (lowerMsg.includes('network request failed') || lowerMsg.includes('fetch failed')) {
    return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
  }

  // Fallback
  return "Terjadi kesalahan. Silakan coba kembali."
}
