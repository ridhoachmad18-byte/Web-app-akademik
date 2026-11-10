import React, { useState } from 'react';
import { Printer, X, Globe, Filter } from 'lucide-react';
import { Student, SchoolConfig } from '../types/student';
import { formatDateIndo } from '../utils/helpers';

interface PrintSlipsModalProps {
  students: Student[];
  schoolConfig: SchoolConfig;
  onUpdateSchoolConfig: (config: SchoolConfig) => void;
  onClose: () => void;
}

export const PrintSlipsModal: React.FC<PrintSlipsModalProps> = ({
  students,
  schoolConfig,
  onUpdateSchoolConfig,
  onClose,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    students.map((s) => s.id)
  );

  const [localSchoolName, setLocalSchoolName] = useState(schoolConfig.schoolName);
  const [localAppUrl, setLocalAppUrl] = useState(schoolConfig.academicAppUrl);
  const [isEditingConfig, setIsEditingConfig] = useState(false);

  const logoSrc = schoolConfig.logoUrl || '/assets/aistudio/images__1__7d6e64c5.png';
  const grades = Array.from(new Set(students.map((s) => s.grade))).sort();

  const handleGradeFilter = (grade: string) => {
    setSelectedGrade(grade);
    if (grade === 'all') {
      setSelectedStudentIds(students.map((s) => s.id));
    } else {
      setSelectedStudentIds(students.filter((s) => s.grade === grade).map((s) => s.id));
    }
  };

  const selectAll = () => {
    if (selectedGrade === 'all') {
      setSelectedStudentIds(students.map((s) => s.id));
    } else {
      setSelectedStudentIds(students.filter((s) => s.grade === selectedGrade).map((s) => s.id));
    }
  };

  const deselectAll = () => {
    setSelectedStudentIds([]);
  };

  const handleSaveConfig = () => {
    onUpdateSchoolConfig({
      ...schoolConfig,
      schoolName: localSchoolName,
      academicAppUrl: localAppUrl,
    });
    setIsEditingConfig(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const printableStudents = students.filter((s) => selectedStudentIds.includes(s.id));

  return (
    <div className="space-y-4">
      {/* Controls Bar (Hidden during print via no-print class) */}
      <div className="no-print bg-white p-4 rounded-xl border border-teal-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 p-1 bg-white border border-teal-200 rounded-lg shadow-2xs shrink-0">
              <img
                src={logoSrc}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-teal-950 flex items-center gap-2">
                <Printer className="w-4 h-4 text-teal-600" />
                <span>Format Cetak Slip Login Siswa · {schoolConfig.schoolName}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Siap dicetak di kertas A4 dan digunting untuk dibagikan kepada masing-masing siswa / orang tua.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsEditingConfig(!isEditingConfig)}
              className="px-3 py-1.5 text-xs font-medium text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer"
            >
              {isEditingConfig ? 'Tutup Pengaturan Kop' : 'Ubah Nama Sekolah & URL'}
            </button>
            <button
              onClick={handlePrint}
              disabled={printableStudents.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Sekarang ({printableStudents.length} Slip)</span>
            </button>
          </div>
        </div>

        {/* School config form drawer */}
        {isEditingConfig && (
          <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in">
            <div>
              <label className="block font-semibold text-teal-950 mb-1">Nama Sekolah / Instansi:</label>
              <input
                type="text"
                value={localSchoolName}
                onChange={(e) => setLocalSchoolName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-teal-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-teal-950 mb-1">URL Aplikasi Akademik:</label>
              <input
                type="text"
                value={localAppUrl}
                onChange={(e) => setLocalAppUrl(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-teal-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-800"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                onClick={handleSaveConfig}
                className="px-3 py-1 bg-teal-700 text-white rounded-md font-medium text-xs hover:bg-teal-800 cursor-pointer"
              >
                Terapkan pada Slip
              </button>
            </div>
          </div>
        )}

        {/* Filter per kelas & Select All */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-teal-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-teal-950">Pilih Kelas:</span>
            <select
              value={selectedGrade}
              onChange={(e) => handleGradeFilter(e.target.value)}
              className="bg-teal-50/60 border border-teal-200 px-2.5 py-1 rounded-md text-teal-900 font-medium"
            >
              <option value="all">Semua Kelas</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={selectAll}
              className="text-teal-700 hover:text-teal-900 font-medium hover:underline cursor-pointer"
            >
              Pilih Semua ({students.length})
            </button>
            <span className="text-teal-200">|</span>
            <button
              onClick={deselectAll}
              className="text-slate-500 hover:text-slate-700 font-medium hover:underline cursor-pointer"
            >
              Batalkan Pilihan
            </button>
          </div>
        </div>
      </div>

      {/* Slips Grid Preview & Actual Printable Content with Official Logo */}
      {printableStudents.length === 0 ? (
        <div className="no-print py-12 text-center bg-white rounded-xl border border-teal-200">
          <p className="text-xs text-slate-500">
            Tidak ada siswa yang dipilih untuk dicetak. Silakan pilih kelas atau klik "Pilih Semua".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:block print-cards-grid">
          {printableStudents.map((student) => (
            <div
              key={student.id}
              className="print-card bg-white p-4 rounded-xl border border-dashed border-teal-300 shadow-2xs relative overflow-hidden"
            >
              {/* Slip Header with School Logo */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-teal-200">
                <div className="flex items-center gap-2.5">
                  <img
                    src={logoSrc}
                    alt="Logo"
                    className="w-7 h-7 object-contain"
                  />
                  <div>
                    <h5 className="font-bold text-xs text-teal-950 leading-tight">
                      {schoolConfig.schoolName}
                    </h5>
                    <p className="text-[10px] text-teal-700 font-medium">
                      KARTU LOGIN APLIKASI AKADEMIK SISWA
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {schoolConfig.academicYear}
                </span>
              </div>

              {/* Student Info */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Nama Siswa
                  </span>
                  <p className="font-bold text-slate-900 text-xs truncate">{student.name}</p>
                  {student.nik && (
                    <p className="text-[10px] font-mono text-teal-800 font-semibold">
                      NIK: {student.nik}
                    </p>
                  )}
                  {student.birthDate && (
                    <p className="text-[9px] text-slate-500">
                      Lahir: {formatDateIndo(student.birthDate)}
                    </p>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Kelas / Rombel
                  </span>
                  <p className="font-medium text-teal-900 text-xs">
                    {student.grade}
                  </p>
                </div>
              </div>

              {/* Credentials Box */}
              <div className="bg-teal-50/50 border border-teal-200 rounded-lg p-2.5 space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px] font-sans">Username (NIS):</span>
                  <strong className="text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                    {student.username}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px] font-sans">Password:</span>
                  <strong className="text-slate-900 bg-white px-2 py-0.5 rounded border border-teal-200">
                    {student.password}
                  </strong>
                </div>
              </div>

              {/* Footer Guide */}
              <div className="mt-2.5 pt-2 border-t border-teal-50 flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center gap-1 text-teal-700">
                  <Globe className="w-3 h-3 text-teal-600" />
                  <span className="truncate max-w-[180px]">{schoolConfig.academicAppUrl}</span>
                </div>
                <span className="italic text-slate-400">Jaga kerahasiaan sandi</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
