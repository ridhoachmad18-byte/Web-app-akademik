import React, { useState, useRef } from 'react';
import {
  X,
  FileText,
  Check,
  AlertCircle,
  Info,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { Student } from '../types/student';
import {
  generateUsernameFromName,
  generateRandomPassword,
  formatDateIndo,
  exportTemplateCsv,
  exportTemplateExcel,
} from '../utils/helpers';
import { parseCsvRows } from '../services/googleSheets';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process raw text (from paste or file upload)
  const parseRawText = (rawContent: string) => {
    setError(null);
    if (!rawContent.trim()) {
      setError('Silakan tempel teks atau unggah file CSV data siswa.');
      setPreviewList([]);
      return;
    }

    const rows = parseCsvRows(rawContent);
    if (rows.length === 0) {
      setError('Format data tidak dapat dibaca.');
      return;
    }

    // Check if row 0 is header
    const firstRowText = rows[0].join(' ').toLowerCase();
    const hasHeader =
      firstRowText.includes('nama') ||
      firstRowText.includes('nik') ||
      firstRowText.includes('user') ||
      firstRowText.includes('kelas') ||
      firstRowText.includes('no');

    const dataRows = hasHeader ? rows.slice(1) : rows;
    const parsed: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    // Header index mapping for 8-column format:
    // NO (0), NAMA (1), NIK (2), LAHIR (3), KELAS (4), USERNAME/NIS (5), PASS (6), CATATAN (7)
    let nameIdx = 1;
    let nikIdx = 2;
    let birthIdx = 3;
    let gradeIdx = 4;
    let userIdx = 5;
    let passIdx = 6;
    let notesIdx = 7;

    if (hasHeader) {
      const h = rows[0].map((c) => c.toLowerCase().trim());
      const fName = h.findIndex((x) => x.includes('nama'));
      const fNik = h.findIndex((x) => x.includes('nik'));
      const fBirth = h.findIndex((x) => x.includes('lahir') || x.includes('tanggal'));
      const fGrade = h.findIndex((x) => x.includes('kelas') || x.includes('rombel'));
      const fUser = h.findIndex((x) => x.includes('user') || x.includes('nis'));
      const fPass = h.findIndex((x) => x.includes('pass') || x.includes('sandi'));
      const fNotes = h.findIndex((x) => x.includes('catat') || x.includes('ket') || x.includes('status'));

      if (fName !== -1) nameIdx = fName;
      if (fNik !== -1) nikIdx = fNik;
      if (fBirth !== -1) birthIdx = fBirth;
      if (fGrade !== -1) gradeIdx = fGrade;
      if (fUser !== -1) userIdx = fUser;
      if (fPass !== -1) passIdx = fPass;
      if (fNotes !== -1) notesIdx = fNotes;
    } else {
      // If no header, check if row has NO column or starts with Name directly
      if (dataRows[0] && dataRows[0].length >= 2) {
        const firstCol = dataRows[0][0].trim();
        // If first column is a number like 1, 2, 3, then it's 'NO' column
        if (/^\d{1,4}$/.test(firstCol) && dataRows[0].length >= 3) {
          nameIdx = 1;
          nikIdx = 2;
          birthIdx = 3;
          gradeIdx = 4;
          userIdx = 5;
          passIdx = 6;
          notesIdx = 7;
        } else {
          // Starts directly with Nama, NIK, ...
          nameIdx = 0;
          nikIdx = 1;
          birthIdx = 2;
          gradeIdx = 3;
          userIdx = 4;
          passIdx = 5;
          notesIdx = 6;
        }
      }
    }

    for (let i = 0; i < dataRows.length; i++) {
      const r = dataRows[i];
      const studentName = (r[nameIdx] || '').replace(/^[="']+|["']+$/g, '').trim();
      if (!studentName) continue;

      // Clean NIK
      const rawNik = (r[nikIdx] || '').replace(/\D/g, '').slice(0, 16);
      const studentBirth = (r[birthIdx] || '2017-05-12').replace(/^[="']+|["']+$/g, '').trim();
      const studentGrade = (r[gradeIdx] || targetGrade || 'Kelas 1A').replace(/^[="']+|["']+$/g, '').trim();
      const studentUser = (r[userIdx] || generateUsernameFromName(studentName)).replace(/^[="']+|["']+$/g, '').trim();
      const studentPass = (r[passIdx] || generateRandomPassword('AsySyifa')).replace(/^[="']+|["']+$/g, '').trim();
      const studentNotes = (r[notesIdx] || '').replace(/^[="']+|["']+$/g, '').trim();

      parsed.push({
        name: studentName,
        birthDate: studentBirth || '2017-05-12',
        nik: rawNik || undefined,
        grade: studentGrade || targetGrade || 'Kelas 1A',
        username: studentUser,
        password: studentPass,
        notes: studentNotes || undefined,
      });
    }

    if (parsed.length === 0) {
      setError('Tidak ada baris siswa yang valid ditemukan. Pastikan kolom nama terisi.');
      return;
    }

    setPreviewList(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || '');
      setText(content);
      parseRawText(content);
    };
    reader.readAsText(file);
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

  const handleDownloadExcelTemplate = () => {
    exportTemplateExcel('SD ASY - SYIFA 2');
  };

  const handleDownloadCsvTemplate = () => {
    exportTemplateCsv('SD ASY - SYIFA 2');
  };

  const loadExample = () => {
    const sampleCsv =
      `NO,NAMA LENGKAP SISWA,NIK SISWA (16 DIGIT),TANGGAL LAHIR (YYYY-MM-DD),KELAS,USERNAME AKADEMIK (NIS),PASSWORD / SANDI,CATATAN\n` +
      `1,Muhammad Al-Fatih Pratama,3273012401010001,2017-05-12,Kelas 1A,240101,Siswa#AsySyifa24,Siswa Baru\n` +
      `2,Aisyah Putri Azzahra,3273012401020002,2017-08-20,Kelas 1A,240102,Siswa#Aisyah24,Siswa Baru\n` +
      `3,Bilal Ramadhan Putra,3273022302050003,2016-09-15,Kelas 2B,230205,Siswa#Bilal24,Reguler\n` +
      `4,Khadijah Zahra Nabila,3273032203100004,2015-11-04,Kelas 3A,220310,Siswa#Khadijah24,Reguler\n` +
      `5,Rayyan Hamizan Khalif,3273042104150005,2014-03-22,Kelas 4A,210415,Siswa#Rayyan24,Reguler`;
    setText(sampleCsv);
    parseRawText(sampleCsv);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-teal-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-teal-100 bg-teal-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-teal-950">
                Impor Data Akun Siswa (Sesuai Format Spreadsheet)
              </h3>
              <p className="text-xs text-teal-800">
                SD ASY - SYIFA 2 · Urutan kolom sama persis dengan tabel web aplikasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Format Guidance & Download Template Banner */}
          <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-4 text-xs text-teal-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-teal-900">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Susunan 8 Kolom Spreadsheet yang Sesuai:</span>
              </p>
              <p className="text-[11px] text-teal-800 leading-relaxed font-mono">
                NO · NAMA LENGKAP · NIK (16 DIGIT) · TANGGAL LAHIR · KELAS · USERNAME AKADEMIK (NIS) · PASSWORD · CATATAN
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadExcelTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
                title="Unduh file template Excel (.xls) bersekat ke samping tanpa tanda kutip"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>Unduh Template Excel (.xls)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCsvTemplate}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Unduh file template CSV"
              >
                <Download className="w-3 h-3 text-slate-500" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Action Row: Upload file or paste text */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 text-xs font-semibold text-teal-900 bg-white hover:bg-teal-50 border border-teal-300 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-teal-700" />
                <span>Pilih File CSV dari Komputer</span>
              </button>

              <button
                type="button"
                onClick={loadExample}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold underline cursor-pointer ml-1"
              >
                Muat Contoh Data
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                Default Kelas:
              </label>
              <input
                type="text"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                placeholder="Kelas 1A"
                className="w-24 px-2.5 py-1 text-xs bg-white border border-teal-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Textarea for pasting */}
          <div>
            <textarea
              rows={5}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setPreviewList([]);
              }}
              placeholder={`Atau tempel baris data dari Google Sheets / Excel di sini...\nContoh:\n1, Aisyah Putri Azzahra, 3273012401020002, 2017-08-20, Kelas 1A, 240102, Siswa#Aisyah24, Siswa Baru`}
              className="w-full p-3 text-xs font-mono bg-teal-50/20 border border-teal-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {previewList.length === 0 ? (
            <button
              type="button"
              onClick={() => parseRawText(text)}
              disabled={!text.trim()}
              className="w-full py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Pratinjau Data Siswa
            </button>
          ) : (
            /* Preview Table matching Web App Table */
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pratinjau Hasil Impor ({previewList.length} Siswa Terbaca):</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewList([])}
                  className="text-xs text-teal-700 hover:text-teal-900 font-semibold underline cursor-pointer"
                >
                  Ubah Teks Kembali
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto overflow-x-auto border border-teal-200 rounded-xl shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-teal-50 border-b border-teal-200 text-teal-950 font-bold text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3 text-center w-10">No</th>
                      <th className="py-2.5 px-3 min-w-[170px]">Nama Lengkap</th>
                      <th className="py-2.5 px-3 min-w-[140px]">NIK (16 Digit)</th>
                      <th className="py-2.5 px-3 min-w-[100px]">Lahir</th>
                      <th className="py-2.5 px-3 w-24">Kelas</th>
                      <th className="py-2.5 px-3 min-w-[140px]">Username Akademik (NIS)</th>
                      <th className="py-2.5 px-3 min-w-[120px]">Password</th>
                      <th className="py-2.5 px-3 min-w-[100px]">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-teal-50">
                    {previewList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-teal-50/40">
                        <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{item.name}</td>
                        <td className="py-2 px-3 font-mono">
                          {item.nik && item.nik.length === 16 ? (
                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {item.nik}
                            </span>
                          ) : (
                            <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              {item.nik || 'Otomatis'}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-600">{formatDateIndo(item.birthDate)}</td>
                        <td className="py-2 px-3 text-teal-800 font-medium">{item.grade}</td>
                        <td className="py-2 px-3 font-mono text-teal-700 font-semibold">{item.username}</td>
                        <td className="py-2 px-3 font-mono text-slate-800">{item.password}</td>
                        <td className="py-2 px-3 text-slate-500 text-[11px]">{item.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-teal-100">
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
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan {previewList.length} Akun Siswa</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
