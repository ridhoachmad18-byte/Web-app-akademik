import React, { useState } from 'react';
import { X, Copy, Check, Eye, EyeOff, Globe } from 'lucide-react';
import { Student, SchoolConfig } from '../types/student';
import { formatDateIndo } from '../utils/helpers';

interface StudentDetailModalProps {
  student: Student | null;
  schoolConfig: SchoolConfig;
  onClose: () => void;
  onCopy: (text: string, label: string) => void;
  onEdit: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  schoolConfig,
  onClose,
  onCopy,
  onEdit,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  if (!student) return null;

  const logoSrc = schoolConfig.logoUrl || '/assets/aistudio/images__1__7d6e64c5.png';

  const handleCopyUser = () => {
    onCopy(student.username, `Username "${student.username}"`);
    setCopiedUser(true);
    setTimeout(() => setCopiedUser(false), 1500);
  };

  const handleCopyPass = () => {
    onCopy(student.password, `Password untuk "${student.name}"`);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-teal-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header with toska gradient and school logo */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-800 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white p-1 rounded-xl shadow-md border border-white/40 flex items-center justify-center shrink-0">
              <img
                src={logoSrc}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-[11px] text-teal-200 uppercase tracking-wider block font-semibold">
                Kartu Akses Akademik Siswa
              </span>
              <h3 className="text-base font-bold leading-tight">{student.name}</h3>
              <p className="text-xs text-teal-100 mt-0.5">
                {student.grade} {student.nik ? `· NIK: ${student.nik}` : ''} {student.nis ? `· NIS ${student.nis}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Credentials Box */}
        <div className="p-6 space-y-4">
          <div className="bg-teal-50/40 border border-teal-200 rounded-xl p-4 space-y-3">
            {/* Username */}
            <div>
              <span className="text-[11px] text-teal-800 font-semibold block mb-1">
                Username Akademik
              </span>
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-teal-200">
                <code className="text-xs font-mono font-bold text-teal-800">
                  {student.username}
                </code>
                <button
                  onClick={handleCopyUser}
                  className="p-1 text-slate-400 hover:text-teal-700 rounded transition-colors"
                  title="Salin username"
                >
                  {copiedUser ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-teal-800 font-semibold">
                  Kata Sandi (Password)
                </span>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-teal-700 hover:text-teal-900 font-medium hover:underline flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Sembunyikan' : 'Perlihatkan'}</span>
                </button>
              </div>
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-teal-200">
                <code className="text-xs font-mono font-bold text-slate-900">
                  {showPassword ? student.password : '••••••••••••'}
                </code>
                <button
                  onClick={handleCopyPass}
                  className="p-1 text-slate-400 hover:text-teal-700 rounded transition-colors"
                  title="Salin password"
                >
                  {copiedPass ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Academic Portal Meta */}
          <div className="text-xs space-y-2 text-slate-600 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Instansi / Sekolah:</span>
              <span className="font-semibold text-teal-950">{schoolConfig.schoolName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Portal Akademik:</span>
              <span className="font-mono text-teal-700 truncate max-w-[200px] font-medium">
                {schoolConfig.academicAppUrl}
              </span>
            </div>
            {student.notes && (
              <div className="flex items-start justify-between pt-1">
                <span className="text-slate-400">Catatan:</span>
                <span className="text-slate-700 text-right italic">{student.notes}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer"
            >
              Edit Data Siswa
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
