import React, { useState } from 'react';
import {
  CreditCard,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Printer,
  ShieldCheck,
  Sparkles,
  School,
  AlertCircle,
  ArrowRight,
  Search,
  RotateCcw,
  User,
} from 'lucide-react';
import { Student, SchoolConfig } from '../types/student';
import { formatDateIndo } from '../utils/helpers';

interface StudentAnnouncementViewProps {
  students: Student[];
  schoolConfig: SchoolConfig;
  onCopy: (text: string, label: string) => void;
  onOpenTeacherPanel: () => void;
  spreadsheetUrl?: string;
}

export const StudentAnnouncementView: React.FC<StudentAnnouncementViewProps> = ({
  students,
  schoolConfig,
  onCopy,
  onOpenTeacherPanel,
  spreadsheetUrl,
}) => {
  const [nikInput, setNikInput] = useState<string>('');
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const logoSrc = schoolConfig.logoUrl || '/assets/aistudio/images__1__7d6e64c5.png';

  // Format and sanitize NIK input (only digits, max 16 digits)
  const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 16);
    setNikInput(rawVal);
    setErrorMessage(null);

    // Auto-search if 16 digits are entered
    if (rawVal.length === 16) {
      performSearch(rawVal);
    } else {
      if (activeStudent) {
        setActiveStudent(null);
        setHasSearched(false);
      }
    }
  };

  const performSearch = (targetNik: string) => {
    const cleaned = targetNik.trim().replace(/\D/g, '');
    setHasSearched(true);

    if (cleaned.length < 16) {
      setErrorMessage(`NIK harus terdiri dari 16 digit angka (saat ini ${cleaned.length} digit).`);
      setActiveStudent(null);
      return;
    }

    const match = students.find((s) => {
      const sNik = (s.nik || '').replace(/\D/g, '');
      return sNik === cleaned;
    });

    if (match) {
      setActiveStudent(match);
      setErrorMessage(null);
      setShowPassword(false);
    } else {
      setActiveStudent(null);
      setErrorMessage(
        `NIK "${cleaned}" tidak ditemukan dalam sistem SD ASY - SYIFA 2. Pastikan 16 digit NIK sesuai dengan Kartu Keluarga (KK) atau Akta Kelahiran.`
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(nikInput);
  };

  const handleReset = () => {
    setNikInput('');
    setActiveStudent(null);
    setHasSearched(false);
    setErrorMessage(null);
    setShowPassword(false);
  };

  const handleCopyUser = () => {
    if (!activeStudent) return;
    onCopy(activeStudent.username, `Username ${activeStudent.username}`);
    setCopiedUser(true);
    setTimeout(() => setCopiedUser(false), 1500);
  };

  const handleCopyPass = () => {
    if (!activeStudent) return;
    onCopy(activeStudent.password, `Password untuk ${activeStudent.name}`);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 1500);
  };

  const handleCopyAll = () => {
    if (!activeStudent) return;
    const allText = `PENGUMUMAN AKUN AKADEMIK ${schoolConfig.schoolName.toUpperCase()}\nNama: ${activeStudent.name}\nNIK: ${activeStudent.nik || '-'}\nKelas: ${activeStudent.grade}\nNIS: ${activeStudent.nis || '-'}\nUsername: ${activeStudent.username}\nPassword: ${activeStudent.password}\nPortal: ${schoolConfig.academicAppUrl}`;
    onCopy(allText, 'Data Login Lengkap');
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  const handlePrintSingle = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Header Pengumuman Sekolah Resmi (Hijau Toska Theme + School Logo) */}
      <div className="no-print bg-white rounded-2xl border border-teal-200 shadow-xs overflow-hidden">
        {/* Banner Atas Pengumuman */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-950 to-emerald-950 text-white p-6 sm:p-8 relative">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* School Logo */}
            <div className="shrink-0 bg-white p-2 rounded-2xl shadow-md border-2 border-teal-400/40">
              <img
                src={logoSrc}
                alt={`Logo ${schoolConfig.schoolName}`}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 backdrop-blur-md text-teal-200 text-xs font-semibold mb-2 border border-teal-400/30">
                <School className="w-3.5 h-3.5 text-teal-300" />
                <span>{schoolConfig.schoolName}</span>
                <span aria-hidden="true">·</span>
                <span>T.A. {schoolConfig.academicYear}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Pengumuman Akun Aplikasi Akademik Siswa
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-teal-100/90 leading-relaxed">
                Pencarian akun siswa menggunakan <strong>NIK Siswa (16 Digit)</strong>. Masukkan NIK
                anak sesuai Kartu Keluarga (KK) atau Akta Kelahiran untuk melihat <strong>Username</strong> dan <strong>Password</strong> resmi sekolah.
              </p>
            </div>
          </div>
        </div>

        {/* NIK Search & Lookup Section */}
        <div className="p-6 sm:p-8 bg-teal-50/30 border-t border-teal-100">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="nik-input" className="text-xs font-bold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-teal-600" />
                <span>Masukkan NIK Siswa (16 Digit)</span>
              </label>

              <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md ${
                nikInput.length === 16
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-teal-100 text-teal-800 border border-teal-200'
              }`}>
                {nikInput.length} / 16 digit
              </span>
            </div>

            {/* Input NIK Box */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-teal-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <input
                  id="nik-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={16}
                  required
                  value={nikInput}
                  onChange={handleNikChange}
                  placeholder="Contoh: 3273012401010001"
                  className="w-full pl-12 pr-12 py-3.5 text-base sm:text-lg bg-white border-2 border-teal-300 rounded-xl focus:outline-hidden focus:border-teal-600 focus:ring-4 focus:ring-teal-100 transition-all text-slate-900 font-mono tracking-wider shadow-xs"
                />

                {nikInput && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="p-1 text-slate-400 hover:text-teal-700 transition-colors cursor-pointer"
                      title="Hapus NIK"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={nikInput.length === 0}
                className="px-6 py-3.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Cari Akun Saya</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              * NIK tercantum pada Kartu Keluarga (KK) atau Kartu Identitas Anak (KIA) / Akta Kelahiran.
            </p>

            {/* Error / Not Found Alert */}
            {errorMessage && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-3 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Data Tidak Ditemukan</p>
                  <p className="mt-0.5 text-amber-800 leading-relaxed">
                    {errorMessage}
                  </p>
                  <p className="mt-1 text-[11px] text-amber-700">
                    Bila data belum terdaftar, mohon hubungi pihak tata usaha sekolah atau wali kelas SD ASY - SYIFA 2.
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* 2. KARTU PENGUMUMAN SISWA YANG BERSANGKUTAN (Tampil Eksklusif Saat NIK Cocok) */}
      {activeStudent ? (
        <div className="bg-white rounded-2xl border-2 border-teal-600 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header Kartu Pengumuman Pribadi dengan Logo Sekolah */}
          <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white p-6 sm:p-7 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white p-1.5 rounded-xl shadow-md border-2 border-teal-300 shrink-0">
                  <img
                    src={logoSrc}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-teal-200 text-xs font-semibold mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>PENGUMUMAN RESMI {schoolConfig.schoolName.toUpperCase()}</span>
                    <span aria-hidden="true">·</span>
                    <span>T.A. {schoolConfig.academicYear}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {activeStudent.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs sm:text-sm text-teal-100 font-medium">
                    <span className="bg-teal-900/60 px-2 py-0.5 rounded font-mono border border-teal-400/30">
                      NIK: {activeStudent.nik || '-'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{activeStudent.grade}</span>
                    {activeStudent.nis && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">NIS: {activeStudent.nis}</span>
                      </>
                    )}
                    {activeStudent.birthDate && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>Lahir: {formatDateIndo(activeStudent.birthDate)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0 bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-xl text-center self-start sm:self-center">
                <span className="text-[11px] text-teal-200 block">Status Akun Siswa</span>
                <span className="text-xs font-bold text-white tracking-wide">AKTIF & TERVERIFIKASI</span>
              </div>
            </div>
          </div>

          {/* Body Kredensial Pribadi */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-teal-50/60 border border-teal-200 rounded-xl p-4 text-xs text-teal-900 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Informasi Akses Aplikasi Akademik Siswa:</p>
                <p className="mt-0.5 text-teal-800 leading-relaxed">
                  Berdasarkan verifikasi NIK <strong>{activeStudent.nik}</strong>, berikut adalah data
                  username dan kata sandi resmi untuk ananda <strong>{activeStudent.name}</strong> di{' '}
                  <strong>{schoolConfig.schoolName}</strong>:
                </p>
              </div>
            </div>

            {/* Grid Username & Password (Toska Design) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box Username */}
              <div className="bg-teal-50/30 border border-teal-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span className="font-semibold uppercase tracking-wider text-[11px] text-teal-800">
                      Username Akademik
                    </span>
                    <span className="text-teal-700 font-semibold">ID Login</span>
                  </div>
                  <div className="bg-white border-2 border-teal-200 rounded-lg p-3 flex items-center justify-between shadow-2xs">
                    <code className="text-base sm:text-lg font-mono font-bold text-teal-800 tracking-wide select-all">
                      {activeStudent.username}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyUser}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        copiedUser
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-teal-50 hover:bg-teal-100 text-teal-700'
                      }`}
                      title="Salin Username"
                    >
                      {copiedUser ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Gunakan username ini saat masuk ke portal akademik
                </p>
              </div>

              {/* Box Password */}
              <div className="bg-teal-50/30 border border-teal-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span className="font-semibold uppercase tracking-wider text-[11px] text-teal-800">
                      Kata Sandi (Password)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPassword ? 'Sembunyikan' : 'Perlihatkan'}</span>
                    </button>
                  </div>
                  <div className="bg-white border-2 border-teal-200 rounded-lg p-3 flex items-center justify-between shadow-2xs">
                    <code className="text-base sm:text-lg font-mono font-bold text-slate-900 tracking-wide select-all">
                      {showPassword ? activeStudent.password : '••••••••••••'}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyPass}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        copiedPass
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-teal-50 hover:bg-teal-100 text-teal-700'
                      }`}
                      title="Salin Password"
                    >
                      {copiedPass ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Klik ikon mata untuk memeriksa ejaan kata sandi
                </p>
              </div>
            </div>

            {/* URL Portal & Petunjuk Login */}
            <div className="bg-white border border-teal-200 rounded-xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-teal-100">
                <div>
                  <span className="text-[11px] text-teal-800 uppercase tracking-wider font-semibold block">
                    Alamat Website Aplikasi Akademik
                  </span>
                  <a
                    href={schoolConfig.academicAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-bold font-mono text-teal-700 hover:underline inline-flex items-center gap-1.5 mt-0.5"
                  >
                    <span>{schoolConfig.academicAppUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <a
                  href={schoolConfig.academicAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Buka Aplikasi Akademik</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Langkah Akses */}
              <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                <p className="font-semibold text-teal-950">Petunjuk Akses bagi Siswa / Orang Tua:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed pl-1">
                  <li>Buka website aplikasi akademik di tautan di atas melalui HP, tablet, atau laptop.</li>
                  <li>Masukkan <strong>Username</strong> dan <strong>Password</strong> sesuai pengumuman ini.</li>
                  <li>Jika berhasil login, segera lengkapi biodata atau ganti password jika diinstruksikan oleh pihak sekolah.</li>
                </ol>
              </div>
            </div>

            {/* Action Bar Siswa */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopyAll}
                className="px-4 py-2 text-xs font-medium text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-teal-700" />}
                <span>{copiedAll ? 'Semua Info Tersalin!' : 'Salin Lengkap Informasi Akun'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintSingle}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Cetak atau simpan slip pengumuman ini sebagai PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-600" />
                  <span>Cetak / Simpan PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-2 text-xs font-medium text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                >
                  Cari NIK Lain
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 3. TAMPILAN AWAL SEBELUM SISWA MEMASUKKAN NIK */
        <div className="bg-white rounded-2xl border border-teal-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
              <img
                src={logoSrc}
                alt="Logo Sekolah"
                className="w-9 h-9 object-contain"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-teal-950">
                Pemberitahuan Akun Akademik {schoolConfig.schoolName}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Untuk menjaga privasi dan keamanan akun anak, pengumuman username serta password
                hanya dapat dibuka dengan memasukkan <strong>16 digit NIK Siswa</strong> yang terdaftar resmi di sekolah.
              </p>
            </div>
          </div>

          {/* Quick Steps Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-100">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                1
              </span>
              <p className="text-xs font-bold text-teal-950">Masukkan NIK Siswa</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Ketikkan 16 digit Nomor Induk Kependudukan anak sesuai Kartu Keluarga (KK).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-100">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                2
              </span>
              <p className="text-xs font-bold text-teal-950">Verifikasi NIK</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Sistem akan memverifikasi NIK dengan database siswa SD ASY - SYIFA 2.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-100">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                3
              </span>
              <p className="text-xs font-bold text-teal-950">Salin & Login</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Gunakan username dan password yang tampil untuk login ke aplikasi akademik.
              </p>
            </div>
          </div>

          {/* Footer teacher link */}
          <div className="pt-4 border-t border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 text-teal-800">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Sistem Pencarian Akun Terproteksi NIK Siswa</span>
            </div>

            <button
              type="button"
              onClick={onOpenTeacherPanel}
              className="text-teal-700 hover:text-teal-900 font-semibold hover:underline text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Akses Khusus Guru / Admin: Input & Kelola Data Siswa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
