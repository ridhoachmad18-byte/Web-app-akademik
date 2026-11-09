import React, { useState, useEffect } from 'react';
import { X, Sparkles, Key, Eye, EyeOff, User, Hash, AlertCircle, Calendar, CreditCard } from 'lucide-react';
import { Student } from '../types/student';
import { generateUsernameFromName, generateRandomPassword } from '../utils/helpers';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  editingStudent?: Student | null;
  existingGrades: string[];
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStudent,
  existingGrades,
}) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [nik, setNik] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('');
  const [nis, setNis] = useState('');
  const [notes, setNotes] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingStudent) {
      setName(editingStudent.name);
      setBirthDate(editingStudent.birthDate || '');
      setNik(editingStudent.nik || '');
      setUsername(editingStudent.username);
      setPassword(editingStudent.password);
      setGrade(editingStudent.grade || '');
      setNis(editingStudent.nis || '');
      setNotes(editingStudent.notes || '');
    } else {
      setName('');
      setBirthDate('2017-05-12');
      setNik('');
      setUsername('');
      setPassword('');
      setGrade(existingGrades.length > 0 ? existingGrades[0] : 'Kelas 1A');
      setNis('');
      setNotes('');
    }
    setError(null);
    setShowPassword(false);
  }, [editingStudent, isOpen, existingGrades]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingStudent && (!username || username === generateUsernameFromName(name))) {
      setUsername(generateUsernameFromName(val));
    }
  };

  const handleAutoGenerateUsername = () => {
    if (!name.trim()) {
      setError('Masukkan nama siswa terlebih dahulu untuk generate username.');
      return;
    }
    setUsername(generateUsernameFromName(name));
    setError(null);
  };

  const handleAutoGeneratePassword = () => {
    setPassword(generateRandomPassword('AsySyifa'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama lengkap siswa wajib diisi.');
      return;
    }

    const cleanNik = nik.trim().replace(/\D/g, '');
    if (!cleanNik) {
      setError('NIK siswa (16 digit) wajib diisi untuk pencarian akun siswa.');
      return;
    }

    if (cleanNik.length !== 16) {
      setError(`NIK siswa harus 16 digit angka (saat ini ${cleanNik.length} digit).`);
      return;
    }

    if (!username.trim()) {
      setError('Username akun wajib diisi.');
      return;
    }
    if (!password.trim()) {
      setError('Password akun wajib diisi.');
      return;
    }

    onSave(
      {
        name: name.trim(),
        birthDate: birthDate,
        nik: nik.trim() || undefined,
        username: username.trim(),
        password: password.trim(),
        grade: grade.trim() || 'Kelas 1A',
        nis: nis.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      editingStudent?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-teal-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-teal-100 bg-teal-50/40">
          <div>
            <h3 className="text-base font-bold text-teal-950">
              {editingStudent ? 'Edit Akun Siswa' : 'Input Akun Siswa Baru'}
            </h3>
            <p className="text-xs text-teal-700 mt-0.5">
              SD ASY - SYIFA 2 · Aplikasi Akademik Sekolah
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 1. Nama Siswa */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Lengkap Siswa <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-teal-600">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Contoh: Muhammad Al-Fatih Pratama"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-teal-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* 2. NIK Siswa (16 Digit) - KUNCI PENCARIAN UTAMA */}
          <div className="bg-teal-50/50 p-3.5 rounded-lg border border-teal-300">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-teal-950">
                NIK Siswa (16 Digit) <span className="text-rose-500">*</span>
              </label>
              <span className={`text-[11px] font-mono font-semibold ${
                nik.replace(/\D/g, '').length === 16 ? 'text-emerald-700' : 'text-teal-800'
              }`}>
                {nik.replace(/\D/g, '').length} / 16 digit
              </span>
            </div>
            <p className="text-[11px] text-teal-700 mb-2">
              Kunci utama siswa mencari username & password di halaman pengumuman
            </p>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-teal-600">
                <CreditCard className="w-4 h-4" />
              </div>
              <input
                type="text"
                inputMode="numeric"
                required
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                placeholder="Contoh: 3273012401010001"
                className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-white border border-teal-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900 tracking-wider placeholder:text-slate-400 font-semibold"
              />
            </div>
          </div>

          {/* Tanggal Lahir Siswa */}
          <div className="bg-white p-3 rounded-lg border border-teal-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Lahir Siswa (Opsional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-teal-600">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-white border border-teal-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900 cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Grid Kelas & NIS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kelas / Rombel <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="grades-list"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Contoh: Kelas 1A"
                  className="w-full px-3 py-2 text-sm bg-white border border-teal-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 placeholder:text-slate-400"
                />
                <datalist id="grades-list">
                  {existingGrades.map((g) => (
                    <option key={g} value={g} />
                  ))}
                  <option value="Kelas 1A" />
                  <option value="Kelas 1B" />
                  <option value="Kelas 2A" />
                  <option value="Kelas 2B" />
                  <option value="Kelas 3A" />
                  <option value="Kelas 3B" />
                  <option value="Kelas 4A" />
                  <option value="Kelas 4B" />
                  <option value="Kelas 5A" />
                  <option value="Kelas 5B" />
                  <option value="Kelas 6A" />
                  <option value="Kelas 6B" />
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                NIS (Nomor Induk Siswa)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-teal-600">
                  <Hash className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  placeholder="240101"
                  className="w-full pl-8 pr-3 py-2 text-sm font-mono bg-white border border-teal-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* 4. Username */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Username Akademik <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateUsername}
                className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-teal-600" />
                <span>Buat Otomatis dari Nama</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="fatih.pratama"
                className="w-full px-3 py-2 text-sm font-mono bg-teal-50/30 border border-teal-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Username yang dipakai siswa untuk login ke sistem akademik sekolah
            </p>
          </div>

          {/* 5. Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Password / Kata Sandi <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAutoGeneratePassword}
                className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Key className="w-3 h-3 text-teal-600" />
                <span>Acak Password Aman</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full pl-3 pr-10 py-2 text-sm font-mono bg-teal-50/30 border border-teal-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 6. Catatan Tambahan (Opsional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Catatan Khusus (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Siswa Pindahan / Belum verifikasi"
              className="w-full px-3 py-2 text-sm bg-white border border-teal-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {editingStudent ? 'Simpan Perubahan' : 'Simpan Akun Siswa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
