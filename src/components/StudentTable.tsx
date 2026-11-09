import React, { useState } from 'react';
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  CreditCard,
  User,
  Shield,
  KeyRound,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  UploadCloud,
  FileSpreadsheet,
} from 'lucide-react';
import { Student } from '../types/student';
import { formatDateIndo } from '../utils/helpers';

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: string, name: string) => void;
  onViewCard: (student: Student) => void;
  onCopy: (text: string, label: string) => void;
  onOpenBatchImport: () => void;
  onExportCsv: () => void;
  onAddNew: () => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onEdit,
  onDelete,
  onViewCard,
  onCopy,
  onOpenBatchImport,
  onExportCsv,
  onAddNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [globalReveal, setGlobalReveal] = useState(false);
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'grade' | 'newest'>('name-asc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique grades
  const grades = Array.from(new Set(students.map((s) => s.grade))).sort();

  // Filter students (searches by Name, Tanggal Lahir, NIK, Username, or NIS)
  const filteredStudents = students.filter((student) => {
    const q = searchQuery.toLowerCase().trim();
    const formattedDate = student.birthDate ? formatDateIndo(student.birthDate).toLowerCase() : '';
    const matchesSearch =
      student.name.toLowerCase().includes(q) ||
      (student.birthDate && student.birthDate.includes(q)) ||
      formattedDate.includes(q) ||
      (student.nik && student.nik.includes(q)) ||
      student.username.toLowerCase().includes(q) ||
      (student.nis && student.nis.toLowerCase().includes(q));

    const matchesGrade = selectedGrade === 'all' || student.grade === selectedGrade;

    return matchesSearch && matchesGrade;
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name, 'id');
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name, 'id');
    if (sortBy === 'grade') return a.grade.localeCompare(b.grade, 'id');
    if (sortBy === 'newest') return b.createdAt - a.createdAt;
    return 0;
  });

  const togglePasswordVisibility = (id: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleGlobalReveal = () => {
    const nextState = !globalReveal;
    setGlobalReveal(nextState);
    const updated: Record<string, boolean> = {};
    students.forEach((s) => {
      updated[s.id] = nextState;
    });
    setRevealedPasswords(updated);
  };

  const handleCopyText = (text: string, label: string, feedbackKey: string) => {
    onCopy(text, label);
    setCopiedId(feedbackKey);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter, and Action Controls */}
      <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-xs flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search bar */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-teal-600">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa, NIK (16 digit), username, atau NIS..."
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-teal-50/20 border border-teal-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-teal-700 cursor-pointer"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Kelas filter */}
          <div className="flex items-center gap-1.5 bg-teal-50/40 border border-teal-200 px-2.5 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-transparent text-teal-900 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="all">Semua Kelas ({students.length})</option>
              {grades.map((g) => {
                const count = students.filter((s) => s.grade === g).length;
                return (
                  <option key={g} value={g}>
                    {g} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 bg-teal-50/40 border border-teal-200 px-2.5 py-1.5 rounded-lg text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-teal-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-teal-900 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="name-asc">Nama (A - Z)</option>
              <option value="name-desc">Nama (Z - A)</option>
              <option value="grade">Urutkan Kelas</option>
              <option value="newest">Baru Ditambahkan</option>
            </select>
          </div>

          {/* Toggle Reveal Passwords */}
          <button
            type="button"
            onClick={handleToggleGlobalReveal}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
              globalReveal
                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                : 'bg-white text-slate-700 border-teal-200 hover:bg-teal-50'
            }`}
            title={globalReveal ? 'Sembunyikan semua password' : 'Perlihatkan semua password'}
          >
            {globalReveal ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Samarkan Sandi</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-teal-600" />
                <span>Lihat Semua Sandi</span>
              </>
            )}
          </button>

          {/* Batch Import Button */}
          <button
            type="button"
            onClick={onOpenBatchImport}
            className="px-3 py-1.5 text-xs font-medium bg-white text-teal-900 border border-teal-200 hover:bg-teal-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Import banyak siswa sekaligus"
          >
            <UploadCloud className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Import Massal</span>
          </button>

          {/* Export to CSV */}
          <button
            type="button"
            onClick={onExportCsv}
            disabled={sortedStudents.length === 0}
            className="px-3 py-1.5 text-xs font-medium bg-white text-teal-900 border border-teal-200 hover:bg-teal-50 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            title="Download data tabel ke format CSV/Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-xl border border-teal-200 shadow-xs overflow-hidden">
        {sortedStudents.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              {students.length === 0 ? 'Belum Ada Akun Siswa' : 'Tidak Ditemukan Siswa'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {students.length === 0
                ? 'Tambahkan data akun siswa pertama Anda untuk aplikasi akademik sekolah.'
                : 'Coba ubah kata kunci pencarian (Nama atau NIK) atau ganti filter kelas di atas.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {students.length === 0 ? (
                <button
                  onClick={onAddNew}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Input Akun Siswa Baru
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGrade('all');
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-teal-50/60 border-b border-teal-200 text-teal-900 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5 w-12 text-center">No</th>
                  <th className="py-3 px-4 min-w-[200px]">Nama Lengkap Siswa</th>
                  <th className="py-3 px-3.5 min-w-[170px]">NIK Siswa (16 Digit)</th>
                  <th className="py-3 px-3 w-28">Kelas</th>
                  <th className="py-3 px-3 w-24">NIS</th>
                  <th className="py-3 px-4 min-w-[160px]">Username Akademik</th>
                  <th className="py-3 px-4 min-w-[190px]">Password / Sandi</th>
                  <th className="py-3 px-4 w-32 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-50">
                {sortedStudents.map((student, idx) => {
                  const isPwRevealed = globalReveal || Boolean(revealedPasswords[student.id]);
                  const userCopied = copiedId === `u-${student.id}`;
                  const passCopied = copiedId === `p-${student.id}`;
                  const nikCopied = copiedId === `nik-${student.id}`;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-teal-50/40 transition-colors group"
                    >
                      {/* No */}
                      <td className="py-3 px-3.5 text-center font-mono tabular-nums text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Nama Siswa */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-teal-100 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                              {student.name}
                            </p>
                            {student.notes && (
                              <p className="text-[11px] text-slate-400 truncate max-w-xs">
                                {student.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* NIK Siswa (16 Digit) */}
                      <td className="py-3 px-3.5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <code className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-900 border border-teal-200/80 font-mono text-xs font-semibold">
                              {student.nik || '-'}
                            </code>
                            {student.nik && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyText(
                                    student.nik!,
                                    `NIK "${student.name}"`,
                                    `nik-${student.id}`
                                  )
                                }
                                className={`p-1 rounded-md transition-colors cursor-pointer ${
                                  nikCopied
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'text-slate-400 hover:text-teal-700 hover:bg-teal-50'
                                }`}
                                title="Salin NIK"
                              >
                                {nikCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                          {student.birthDate && (
                            <span className="text-[11px] text-slate-500">
                              Lahir: {formatDateIndo(student.birthDate)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kelas */}
                      <td className="py-3 px-3">
                        <span className="font-medium text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                          {student.grade}
                        </span>
                      </td>

                      {/* NIS */}
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-600">
                        {student.nis || '-'}
                      </td>

                      {/* Username dengan Tombol Salin */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <code className="px-2 py-0.5 rounded-md bg-teal-50/80 text-teal-800 border border-teal-200/80 font-mono text-xs font-semibold">
                            {student.username}
                          </code>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyText(
                                student.username,
                                `Username "${student.username}"`,
                                `u-${student.id}`
                              )
                            }
                            className={`p-1 rounded-md transition-colors cursor-pointer ${
                              userCopied
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'text-slate-400 hover:text-teal-700 hover:bg-teal-50'
                            }`}
                            title="Salin username"
                          >
                            {userCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Password dengan Tombol Lihat & Salin */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <code className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono text-xs font-medium min-w-[95px]">
                            {isPwRevealed ? student.password : '••••••••••••'}
                          </code>
                          
                          {/* Toggle View Password */}
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(student.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title={isPwRevealed ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                          >
                            {isPwRevealed ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Copy Password */}
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyText(
                                student.password,
                                `Password untuk "${student.name}"`,
                                `p-${student.id}`
                              )
                            }
                            className={`p-1 rounded-md transition-colors cursor-pointer ${
                              passCopied
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'text-slate-400 hover:text-teal-700 hover:bg-teal-50'
                            }`}
                            title="Salin kata sandi"
                          >
                            {passCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onViewCard(student)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                            title="Pratinjau Kartu Siswa"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEdit(student)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Edit Akun Siswa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(student.id, student.name)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Akun Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary */}
        <div className="py-3 px-4 bg-teal-50/30 border-t border-teal-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <span>
              Menampilkan <strong className="text-teal-900 font-mono tabular-nums">{sortedStudents.length}</strong> dari{' '}
              <strong className="text-teal-900 font-mono tabular-nums">{students.length}</strong> total akun siswa
            </span>
            {selectedGrade !== 'all' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-teal-700">Filter: {selectedGrade}</span>
              </>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            Pencarian di atas dapat mencari berdasarkan NIK, Nama, atau Username
          </div>
        </div>
      </div>
    </div>
  );
};
