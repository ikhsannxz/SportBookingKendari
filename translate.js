const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const dictionary = [
  // Forms & Placeholders
  { search: /placeholder="Enter venue name"/g, replace: 'placeholder="Masukkan nama venue"' },
  { search: /placeholder="Describe your venue"/g, replace: 'placeholder="Deskripsikan venue Anda"' },
  { search: /placeholder="Full address"/g, replace: 'placeholder="Alamat lengkap"' },
  { search: /placeholder="Search..."/g, replace: 'placeholder="Cari..."' },
  { search: />Search</g, replace: '>Cari<' },
  { search: />Upload</g, replace: '>Unggah<' },
  
  // Dashboard terms
  { search: />Total Bookings</g, replace: '>Total Booking<' },
  { search: />Active Bookings</g, replace: '>Booking Aktif<' },
  { search: />Completed Bookings</g, replace: '>Booking Selesai<' },
  
  // General
  { search: />Update</g, replace: '>Perbarui<' },
  { search: />Create</g, replace: '>Buat<' },
  { search: />Details</g, replace: '>Detail<' },
  { search: />View Details</g, replace: '>Lihat Detail<' },
  { search: />Close</g, replace: '>Tutup<' },
  { search: />Confirm</g, replace: '>Konfirmasi<' },
  { search: />Yes</g, replace: '>Ya<' },
  { search: />No</g, replace: '>Tidak<' },
  { search: />Submit</g, replace: '>Kirim<' },
  
  // Profile
  { search: />Edit Profile</g, replace: '>Edit Profil<' },
  { search: />Change Password</g, replace: '>Ubah Kata Sandi<' },
  { search: />Personal Information</g, replace: '>Informasi Pribadi<' },
  
  // States
  { search: />No data available</g, replace: '>Tidak ada data yang tersedia<' },
  { search: />Loading...</g, replace: '>Memuat...<' },
  
  // Header / Menus
  { search: />Sign out</g, replace: '>Keluar<' },
  { search: />My Profile</g, replace: '>Profil Saya<' }
];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
      callback(dirPath);
    }
  });
}

let modifiedFiles = 0;

walkDir(directoryPath, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let changed = false;

  dictionary.forEach(({ search, replace }) => {
    if (search.test(content)) {
      content = content.replace(search, replace);
      changed = true;
    }
  });

  if (changed && content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedFiles++;
    console.log(`Modified: ${filePath}`);
  }
});

console.log(`Total files modified: ${modifiedFiles}`);
