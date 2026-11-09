import { Student } from '../types/student';

/**
 * Generate a clean academic username based on student name
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

  // First name . last name format (common academic standard)
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
 * CSV Headers exactly matching the Web App Table:
 * NO | NAMA LENGKAP SISWA | NIK SISWA (16 DIGIT) | TANGGAL LAHIR (YYYY-MM-DD) | KELAS | NIS | USERNAME AKADEMIK | PASSWORD / SANDI | CATATAN
 */
export const CSV_STUDENT_HEADERS = [
  'NO',
  'NAMA LENGKAP SISWA',
  'NIK SISWA (16 DIGIT)',
  'TANGGAL LAHIR (YYYY-MM-DD)',
  'KELAS',
  'NIS',
  'USERNAME AKADEMIK',
  'PASSWORD / SANDI',
  'CATATAN',
];

/**
 * Helper to escape CSV cell value
 */
function escapeCsvCell(val: string | number | undefined, asTextFormula = false): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).trim();
  if (asTextFormula) {
    // Preserves 16 digits NIK as text in Google Sheets and Excel
    const cleanDigits = str.replace(/\D/g, '');
    return `="${cleanDigits}"`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Export students array to clean downloadable CSV matching the Web App Table
 */
export function exportStudentsToCsv(students: Student[], schoolName: string): void {
  const rows = students.map((std, idx) => [
    idx + 1,
    escapeCsvCell(std.name),
    escapeCsvCell(std.nik, true), // 16 digit NIK preserved as text formula
    escapeCsvCell(std.birthDate || '2017-05-12'),
    escapeCsvCell(std.grade || 'Kelas 1A'),
    escapeCsvCell(std.nis || ''),
    escapeCsvCell(std.username),
    escapeCsvCell(std.password),
    escapeCsvCell(std.notes || ''),
  ]);

  // UTF-8 BOM (\uFEFF) ensures Excel and Google Sheets open with correct characters
  const csvContent =
    '\uFEFF' +
    CSV_STUDENT_HEADERS.join(',') +
    '\r\n' +
    rows.map((r) => r.join(',')).join('\r\n');

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
 * Download a blank, ready-to-fill CSV template for Google Sheets / Excel
 */
export function exportTemplateCsv(schoolName: string): void {
  const sampleRows = [
    [
      1,
      '"Aisyah Putri Azzahra"',
      '="3273012401020002"',
      '"2017-08-20"',
      '"Kelas 1A"',
      '"240102"',
      '"aisyah.azzahra"',
      '"Siswa#Aisyah24"',
      '"Siswa Baru"',
    ],
    [
      2,
      '"Bilal Ramadhan Putra"',
      '="3273022302050003"',
      '"2016-09-15"',
      '"Kelas 2B"',
      '"230205"',
      '"bilal.ramadhan"',
      '"Siswa#Bilal24"',
      '"Reguler"',
    ],
  ];

  const csvContent =
    '\uFEFF' +
    CSV_STUDENT_HEADERS.join(',') +
    '\r\n' +
    sampleRows.map((r) => r.join(',')).join('\r\n');

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
