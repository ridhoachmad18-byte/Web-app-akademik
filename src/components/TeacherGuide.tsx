import React from 'react';
import {
  UserPlus,
  Copy,
  Printer,
  Upload,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

export const TeacherGuide: React.FC<{ onSwitchTab: (tab: any) => void }> = ({ onSwitchTab }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-teal-200 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-teal-950">
              Panduan Penggunaan Portal Akun Akademik · SD ASY - SYIFA 2
            </h2>
            <p className="text-xs text-slate-500">
              Petunjuk bagi guru, wali kelas, dan orang tua/siswa dalam mencari dan mengelola akun
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mt-4">
          Aplikasi ini dirancang untuk memudahkan pembagian informasi <strong>Username</strong> dan{' '}
          <strong>Password</strong> aplikasi akademik SD ASY - SYIFA 2 secara aman dan tertutup.
          Siswa hanya dapat melihat akun mereka sendiri tanpa melihat data siswa lainnya.
        </p>
      </div>

      {/* Grid of features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1 */}
        <div className="bg-white p-5 rounded-xl border border-teal-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-teal-700 font-semibold text-sm">
            <UserPlus className="w-4 h-4 text-teal-600" />
            <span>1. Cara Siswa Melihat Akun</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pada halaman utama <strong>"Pengumuman Siswa"</strong>, masukkan 16 digit <strong>NIK Siswa</strong> sesuai Kartu Keluarga (KK) atau Akta Kelahiran.
            Sistem secara otomatis akan mencocokkan data dan menampilkan kartu pengumuman resmi siswa yang bersangkutan beserta username dan kata sandi akademiknya.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-white p-5 rounded-xl border border-teal-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-teal-700 font-semibold text-sm">
            <Copy className="w-4 h-4 text-teal-600" />
            <span>2. Salin Username & Kata Sandi</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Klik tombol <strong>Salin</strong> di samping kolom username atau password untuk menyalin teks secara langsung,
            atau gunakan tombol <em>"Salin Lengkap Informasi Akun"</em> untuk menyimpan seluruh biodata login.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-white p-5 rounded-xl border border-teal-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-teal-700 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>3. Akses Khusus Admin / Guru</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Menu <strong>"Kelola & Input Data Siswa"</strong> dilindungi kata sandi admin (bawaan: <code className="bg-teal-50 px-1 py-0.5 rounded text-teal-800 font-mono">admin123</code>)
            sehingga data akun seluruh siswa tidak dapat diakses atau diubah oleh pihak luar.
          </p>
        </div>

        {/* Step 4 */}
        <div className="bg-white p-5 rounded-xl border border-teal-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-teal-700 font-semibold text-sm">
            <Printer className="w-4 h-4 text-teal-600" />
            <span>4. Cetak Slip / Kartu Akun Siswa</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Guru dapat mencetak slip kartu bergaris putus-putus dengan logo SD ASY - SYIFA 2 untuk digunting
            dan dibagikan langsung kepada wali murid atau siswa saat awal semester atau saat pembagian raport.
          </p>
        </div>
      </div>

      {/* Google Sheets Sync Box */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 text-xs text-emerald-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Sinkronisasi Google Spreadsheet (Penyimpanan Antar Akun & Perangkat)</span>
        </div>
        <p className="leading-relaxed text-emerald-800">
          Untuk mencegah data hilang saat dibuka di akun Google lain atau di perangkat berbeda, hubungkan panel admin dengan <strong>Google Spreadsheet</strong>. Setiap kali Anda menambah, mengedit, atau mengimpor data siswa di panel admin, perubahannya akan otomatis tersimpan langsung ke Google Spreadsheet sekolah secara permanen.
        </p>
      </div>
    </div>
  );
};
