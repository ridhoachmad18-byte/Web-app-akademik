import React, { useState } from 'react';
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  AtSign,
  Key,
  Search,
  Filter,
} from 'lucide-react';
import { Student } from '../types/student';
import { formatDateIndo } from '../utils/helpers';

interface StudentCardGridProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: string, name: string) => void;
  onCopy: (text: string, label: string) => void;
  onAddNew: () => void;
}

export const StudentCardGrid: React.FC<StudentCardGridProps> = ({
  students,
  onEdit,
  onDelete,
  onCopy,
  onAddNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const grades = Array.from(new Set(students.map((s) => s.grade))).sort();

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.nik && student.nik.includes(searchQuery));

    const matchesGrade = selectedGrade === 'all' || student.grade === selectedGrade;

    return matchesSearch && matchesGrade;
  });

  const togglePassword = (id: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopy = (text: string, label: string, key: string) => {
    onCopy(text, label);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-teal-600 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau username..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-teal-50/20 border border-teal-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-teal-50/40 border border-teal-200 px-2.5 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-transparent text-teal-900 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="all">Semua Kelas ({students.length})</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g} ({students.filter((s) => s.grade === g).length})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Cards */}
      {filteredStudents.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-teal-200">
          <p className="text-sm font-semibold text-slate-700">Tidak ada akun siswa yang sesuai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const isPwRevealed = Boolean(revealedPasswords[student.id]);
            const uCopied = copiedKey === `card-u-${student.id}`;
            const pCopied = copiedKey === `card-p-${student.id}`;

            return (
              <div
                key={student.id}
                className="bg-white rounded-xl border border-teal-200 p-4 shadow-xs hover:border-teal-400 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card top */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-teal-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {student.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <span className="text-teal-700 font-medium">{student.grade}</span>
                        </div>
                        {student.nik && (
                          <p className="text-[11px] font-mono font-semibold text-teal-900 mt-0.5">
                            NIK: {student.nik}
                          </p>
                        )}
                        {student.birthDate && (
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Lahir: {formatDateIndo(student.birthDate)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEdit(student)}
                        className="p-1 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(student.id, student.name)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Credentials Box */}
                  <div className="mt-3.5 space-y-2.5 bg-teal-50/40 p-3 rounded-lg border border-teal-100 text-xs">
                    {/* Username row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <AtSign className="w-3.5 h-3.5 text-teal-600" />
                        <span>Username (NIS):</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                          {student.username}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(
                              student.username,
                              `Username "${student.username}"`,
                              `card-u-${student.id}`
                            )
                          }
                          className="p-1 text-slate-400 hover:text-teal-700 rounded transition-colors cursor-pointer"
                          title="Salin username"
                        >
                          {uCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Key className="w-3.5 h-3.5 text-teal-600" />
                        <span>Password:</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-teal-200 min-w-[70px] text-center">
                          {isPwRevealed ? student.password : '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePassword(student.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
                          title={isPwRevealed ? 'Sembunyikan' : 'Tampilkan'}
                        >
                          {isPwRevealed ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            handleCopy(
                              student.password,
                              `Password untuk "${student.name}"`,
                              `card-p-${student.id}`
                            )
                          }
                          className="p-1 text-slate-400 hover:text-teal-700 rounded transition-colors cursor-pointer"
                          title="Salin kata sandi"
                        >
                          {pCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {student.notes && (
                    <p className="mt-2 text-[11px] text-slate-500 italic">
                      Catatan: {student.notes}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2 text-[10px] text-teal-700 border-t border-teal-50 flex items-center justify-between">
                  <span>SD ASY - SYIFA 2</span>
                  <span>Akun Aktif</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
