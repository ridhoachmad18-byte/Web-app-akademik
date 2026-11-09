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
export function generateRandomPassword(prefix = 'Akad'): string {
  const words = ['Pintar', 'Cerdas', 'Juara', 'Bisa', 'Hebat', 'Maju', 'Semangat', 'Bintang'];
  const randomWord = words[Math.floor(Math.random() * words.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000);
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
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
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
 * Export students array to downloadable CSV
 */
export function exportStudentsToCsv(students: Student[], schoolName: string): void {
  const headers = ['No', 'Nama Siswa', 'Tanggal Lahir', 'Kelas', 'NIS', 'Username', 'Password', 'Catatan'];
  const rows = students.map((std, idx) => [
    idx + 1,
    `"${std.name.replace(/"/g, '""')}"`,
    `"${std.birthDate ? formatDateIndo(std.birthDate) : '-'}"`,
    `"${std.grade.replace(/"/g, '""')}"`,
    `"${(std.nis || '-').replace(/"/g, '""')}"`,
    `"${std.username.replace(/"/g, '""')}"`,
    `"${std.password.replace(/"/g, '""')}"`,
    `"${(std.notes || '-').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
    + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const cleanSchool = schoolName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `data_akun_siswa_${cleanSchool || 'akademik'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
