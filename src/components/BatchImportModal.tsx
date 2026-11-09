import React, { useState } from 'react';
import { X, FileText, Check, AlertCircle, Info, Upload } from 'lucide-react';
import { Student } from '../types/student';
import { generateUsernameFromName, generateRandomPassword, formatDateIndo } from '../utils/helpers';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newStudents: Student[]) => void;
  defaultGrade?: string;
}

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  defaultGrade = 'Kelas 1A',
}) => {
  const [text, setText] = useState('');
  const [targetGrade, setTargetGrade] = useState(defaultGrade);
  const [previewList, setPreviewList] = useState<Omit<Student, 'id' | 'createdAt' | 'updatedAt'>[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = () => {
    setError(null);
    if (!text.trim()) {
      setError('Silakan tempel teks data siswa terlebih dahulu.');
      return;
    }

    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsed: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    for (const line of lines) {
      const parts = line.includes('\t')
        ? line.split('\t')
        : line.includes(';')
        ? line.split(';')
        : line.includes(',')
        ? line.split(',')
        : [line];

      const cleanParts = parts.map((p) => p.trim());
      const studentName = cleanParts[0];

      if (!studentName) continue;

      // Smart column parsing: detect NIK (16 digit) or Tanggal Lahir (YYYY-MM-DD)
      let studentBirthDate = '2017-05-12';
      let studentNik = '';
      let studentUsername = '';
      let studentPassword = '';
      let studentGrade = targetGrade || 'Kelas 1A';

      const part1 = cleanParts[1] || '';

      if (part1.replace(/\D/g, '').length >= 12) {
        // Format with NIK
        studentNik = part1.replace(/\D/g, '').slice(0, 16);
        studentUsername = cleanParts[2] || generateUsernameFromName(studentName);
        studentPassword = cleanParts[3] || generateRandomPassword('AsySyifa');
        studentGrade = cleanParts[4] || targetGrade || 'Kelas 1A';
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(part1)) {
        studentBirthDate = part1;
        studentUsername = cleanParts[2] || generateUsernameFromName(studentName);
        studentPassword = cleanParts[3] || generateRandomPassword('AsySyifa');
        studentGrade = cleanParts[4] || targetGrade || 'Kelas 1A';
      } else if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(part1)) {
        const segs = part1.split(/[/-]/);
        const day = segs[0].padStart(2, '0');
        const month = segs[1].padStart(2, '0');
        const year = segs[2];
        studentBirthDate = `${year}-${month}-${day}`;
        studentUsername = cleanParts[2] || generateUsernameFromName(studentName);
        studentPassword = cleanParts[3] || generateRandomPassword('AsySyifa');
        studentGrade = cleanParts[4] || targetGrade || 'Kelas 1A';
      } else {
        // Fallback: Nama, Username, Password, Kelas
        studentUsername = cleanParts[1] || generateUsernameFromName(studentName);
        studentPassword = cleanParts[2] || generateRandomPassword('AsySyifa');
        studentGrade = cleanParts[3] || targetGrade || 'Kelas 1A';
      }

      // If NIK is empty, generate 16 digit NIK
      if (!studentNik) {
        studentNik = `327301${Date.now().toString().slice(-10)}`;
      }

      parsed.push({
        name: studentName,
        birthDate: studentBirthDate,
        nik: studentNik,
        username: studentUsername,
        password: studentPassword,
        grade: studentGrade,
        notes: 'Import Massal NIK',
      });
    }

    if (parsed.length === 0) {
      setError('Tidak ada data valid yang dapat dibaca.');
      return;
    }

    setPreviewList(parsed);
  };

  const handleConfirmImport = () => {
    const studentsToAdd: Student[] = previewList.map((item, index) => ({
      ...item,
      id: `std-import-${Date.now()}-${index}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    onImport(studentsToAdd);
    onClose();
  };

  const loadExample = () => {
    setText(
      `Muhammad Al-Fatih, 3273012401010001, fatih.pratama, AsySyifa#24Fatih, Kelas 1A\n` +
      `Aisyah Putri Azzahra, 3273012401020002, aisyah.azzahra, AsySyifa#24Aisyah, Kelas 1A\n` +
      `Bilal Ramadhan, 3273022302050003, bilal.ramadhan, AsySyifa#24Bilal, Kelas 2B\n` +
      `Khadijah Zahra Nabila, 3273032203100004\n` +
      `Rayyan Hamizan, 3273042104150005`
    );
    setPreviewList([]);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-teal-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-teal-100 bg-teal-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-teal-950">
                Import Massal Data Siswa & NIK
              </h3>
              <p className="text-xs text-teal-700">
                SD ASY - SYIFA 2 · Tempel daftar nama dan NIK dari Excel/Word
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-teal-50/60 border border-teal-200 rounded-lg p-3 text-xs text-teal-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Format yang didukung:</p>
              <p className="mt-0.5 text-teal-800">
                Format utama: <code className="bg-white px-1.5 py-0.5 rounded border border-teal-200 font-mono text-[11px]">Nama, NIK (16 digit), Username, Password, Kelas</code>
                <br />
                Atau cukup: <code className="bg-white px-1.5 py-0.5 rounded border border-teal-200 font-mono text-[11px]">Nama, NIK</code> (Username & kata sandi akan otomatis dibuat).
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                Default Kelas:
              </label>
              <input
                type="text"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                placeholder="Kelas 1A"
                className="px-2.5 py-1 text-xs bg-white border border-teal-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-800"
              />
            </div>
            <button
              type="button"
              onClick={loadExample}
              className="text-xs text-teal-700 hover:text-teal-900 hover:underline font-semibold cursor-pointer"
            >
              Muat Format Contoh
            </button>
          </div>

          <div>
            <textarea
              rows={6}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setPreviewList([]);
              }}
              placeholder={`Contoh:\nMuhammad Al-Fatih, 3273012401010001, fatih.pratama, AsySyifa#24Fatih, Kelas 1A\nAisyah Putri Azzahra, 3273012401020002`}
              className="w-full p-3 text-xs font-mono bg-teal-50/20 border border-teal-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {previewList.length === 0 ? (
            <button
              type="button"
              onClick={handleParse}
              className="w-full py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
            >
              Pratinjau Data Siswa ({text.split('\n').filter((l) => l.trim()).length} baris)
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-teal-950">
                  Pratinjau Hasil Pembacaan ({previewList.length} Akun Siap Disimpan):
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewList([])}
                  className="text-xs text-teal-700 hover:text-teal-900 cursor-pointer"
                >
                  Edit Teks Kembali
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto border border-teal-200 rounded-lg divide-y divide-teal-50 text-xs">
                {previewList.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-teal-50/60">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-teal-800">
                        Lahir: <strong className="font-semibold">{formatDateIndo(item.birthDate)}</strong> · {item.grade}
                      </p>
                    </div>
                    <div className="text-right font-mono text-[11px]">
                      <p className="text-teal-700 font-semibold">@{item.username}</p>
                      <p className="text-slate-600">{item.password}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Tambahkan {previewList.length} Siswa ke Database</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
