import { Student } from '../types/student';

/**
 * Generate a clean academic username based on student name (or fallback)
 */
export function generateUsernameFromName(name: string): string {
  if (!name.trim()) return '';

  // Clean special characters and accents
  const cleaned = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'siswa' + Math.floor(1000 + Math.random() * 9000);
  if (parts.length === 1) return parts[0];

  return `${parts[0]}.${parts[parts.length - 1]}`;
}

/**
 * Generate a memorable yet secure default academic password
 */
export function generateRandomPassword(prefix = 'AsySyifa'): string {
  const words = ['Pintar', 'Cerdas', 'Juara', 'Bisa', 'Hebat', 'Maju', 'Semangat', 'Bintang'];
  const randomWord = words[Math.floor(Math.random() * words.length)];
  const randomNum = Math.floor(10 + Math.random() * 90);
  const symbols = ['#', '@', '!'];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  return `${prefix}${symbol}${randomWord}${randomNum}`;
}

/**
 * Copy text to clipboard with modern API & fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

/**
 * Format YYYY-MM-DD to Indonesian friendly format (e.g. 12 Mei 2017)
 */
export function formatDateIndo(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ];
      if (months[monthIdx]) {
        return `${day} ${months[monthIdx]} ${year}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
}

/**
 * Mask NIK for privacy display (e.g. 327301********01)
 */
export function maskNik(nik?: string): string {
  if (!nik) return '-';
  const clean = nik.trim();
  if (clean.length < 8) return clean;
  return `${clean.slice(0, 6)}******${clean.slice(-4)}`;
}

/**
 * Kolom Standar yang Sesuai dengan Tampilan Web App (Tanpa NIS karena Username = NIS):
 * NO | NAMA LENGKAP SISWA | NIK SISWA (16 DIGIT) | TANGGAL LAHIR (YYYY-MM-DD) | KELAS | USERNAME AKADEMIK (NIS) | PASSWORD / SANDI | CATATAN
 */
export const CSV_STUDENT_HEADERS = [
  'NO',
  'NAMA LENGKAP SISWA',
  'NIK SISWA (16 DIGIT)',
  'TANGGAL LAHIR (YYYY-MM-DD)',
  'KELAS',
  'USERNAME AKADEMIK (NIS)',
  'PASSWORD / SANDI',
  'CATATAN',
];

/**
 * EXPORT EXCEL RESMI (.xls):
 * Membuka langsung sebagai TABEL BERSEKAT KE SAMPING di Excel & Google Sheets.
 * - Tanpa kolom NIS terpisah (karena Username adalah NIS)
 * - Tanpa tanda kutip (")
 * - 8 Kolom berjejer rapi ke samping
 * - NIK 16 digit utuh (format teks mso-number-format)
 * - Header warna Hijau Toska khas SD ASY - SYIFA 2
 */
export function exportStudentsToExcel(students: Student[], schoolName: string): void {
  const tableRows = students
    .map((std, idx) => {
      const cleanNik = (std.nik || '').replace(/\D/g, '').slice(0, 16);
      return `
      <tr>
        <td style="text-align: center; font-family: monospace;">${idx + 1}</td>
        <td style="font-weight: 600;">${escapeHtml(std.name)}</td>
        <td style="mso-number-format:'\\@'; text-align: center; font-family: Consolas, monospace; font-weight: bold; color: #0f766e;">${cleanNik || '-'}</td>
        <td style="text-align: center; font-family: monospace;">${escapeHtml(std.birthDate || '2017-05-12')}</td>
        <td style="text-align: center; font-weight: 500;">${escapeHtml(std.grade || 'Kelas 1A')}</td>
        <td style="mso-number-format:'\\@'; font-family: Consolas, monospace; color: #047857; font-weight: bold; text-align: center;">${escapeHtml(std.username)}</td>
        <td style="mso-number-format:'\\@'; font-family: Consolas, monospace; font-weight: bold;">${escapeHtml(std.password)}</td>
        <td style="color: #475569;">${escapeHtml(std.notes || '-')}</td>
      </tr>`;
    })
    .join('');

  const excelHtml = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>Data Akun Siswa</x:Name>
            <x:WorksheetOptions>
              <x:DisplayGridlines/>
            </x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
      body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1e293b; }
      table { border-collapse: collapse; width: 100%; }
      th {
        background-color: #0f766e;
        color: #ffffff;
        font-weight: bold;
        text-align: center;
        border: 1px solid #0d5e56;
        padding: 10px 14px;
        font-size: 11pt;
        white-space: nowrap;
      }
      td {
        border: 1px solid #cbd5e1;
        padding: 8px 12px;
        vertical-align: middle;
        font-size: 10.5pt;
      }
    </style>
  </head>
  <body>
    <h3 style="color: #0f766e; margin-bottom: 4px;">DATA AKUN AKADEMIK SISWA — ${escapeHtml(schoolName.toUpperCase())}</h3>
    <p style="font-size: 10pt; color: #64748b; margin-top: 0; margin-bottom: 12px;">Format Resmi Tabel Excel · Username Akademik menggunakan NIS Siswa</p>
    <table>
      <thead>
        <tr>
          <th style="width: 50px;">NO</th>
          <th style="width: 250px;">NAMA LENGKAP SISWA</th>
          <th style="width: 200px;">NIK SISWA (16 DIGIT)</th>
          <th style="width: 150px;">TANGGAL LAHIR (YYYY-MM-DD)</th>
          <th style="width: 110px;">KELAS</th>
          <th style="width: 200px;">USERNAME AKADEMIK (NIS)</th>
          <th style="width: 180px;">PASSWORD / SANDI</th>
          <th style="width: 160px;">CATATAN</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  </body>
  </html>`;

  const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanSchool = schoolName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `tabel_data_siswa_${cleanSchool || 'sd_asy_syifa_2'}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * EXPORT CSV DENGAN PEMISAH OTOMATIS (sep=,):
 * Membuka langsung ke samping di Excel (Tanpa kolom NIS terpisah).
 */
export function exportStudentsToCsv(students: Student[], schoolName: string): void {
  const rows = students.map((std, idx) => {
    const cleanNik = (std.nik || '').replace(/\D/g, '').slice(0, 16);
    return [
      idx + 1,
      cleanCsvField(std.name),
      `'${cleanNik}`,
      cleanCsvField(std.birthDate || '2017-05-12'),
      cleanCsvField(std.grade || 'Kelas 1A'),
      cleanCsvField(std.username), // Username adalah NIS
      cleanCsvField(std.password),
      cleanCsvField(std.notes || ''),
    ].join(',');
  });

  const csvContent =
    '\uFEFF' +
    'sep=,\r\n' +
    CSV_STUDENT_HEADERS.join(',') +
    '\r\n' +
    rows.join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanSchool = schoolName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `data_siswa_${cleanSchool || 'sd_asy_syifa_2'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * DOWNLOAD TEMPLATE EXCEL KOSONG (.xls)
 * Tanpa NIS karena Username = NIS
 */
export function exportTemplateExcel(schoolName: string): void {
  const sampleStudents: Student[] = [
    {
      id: 'template-1',
      name: 'Aisyah Putri Azzahra',
      nik: '3273012401020002',
      birthDate: '2017-08-20',
      grade: 'Kelas 1A',
      username: '240102',
      password: 'Siswa#Aisyah24',
      notes: 'Siswa Baru',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'template-2',
      name: 'Bilal Ramadhan Putra',
      nik: '3273022302050003',
      birthDate: '2016-09-15',
      grade: 'Kelas 2B',
      username: '230205',
      password: 'Siswa#Bilal24',
      notes: 'Reguler',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  exportStudentsToExcel(sampleStudents, `${schoolName}_template_kosong`);
}

/**
 * Download a blank, ready-to-fill CSV template for Google Sheets / Excel
 */
export function exportTemplateCsv(schoolName: string): void {
  const sampleRows = [
    [
      1,
      'Aisyah Putri Azzahra',
      "'3273012401020002",
      '2017-08-20',
      'Kelas 1A',
      '240102',
      'Siswa#Aisyah24',
      'Siswa Baru',
    ].join(','),
    [
      2,
      'Bilal Ramadhan Putra',
      "'3273022302050003",
      '2016-09-15',
      'Kelas 2B',
      '230205',
      'Siswa#Bilal24',
      'Reguler',
    ].join(','),
  ];

  const csvContent =
    '\uFEFF' +
    'sep=,\r\n' +
    CSV_STUDENT_HEADERS.join(',') +
    '\r\n' +
    sampleRows.join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanSchool = schoolName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `template_import_siswa_${cleanSchool || 'sd_asy_syifa_2'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function cleanCsvField(val?: string): string {
  if (!val) return '';
  const str = String(val).trim();
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function escapeHtml(str?: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
