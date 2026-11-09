import { Student, SchoolConfig } from '../types/student';
import { fetchStudentsFromGoogleSheetUrl } from './googleSheets';

export interface StorageMetadata {
  spreadsheetUrl?: string;
  appsScriptUrl?: string;
  lastSyncedAt?: number;
}

// 1. Fetch data directly from linked Google Spreadsheet URL (100% Free, Zero Billing)
export async function fetchGoogleSheetData(sheetUrl: string): Promise<Student[] | null> {
  if (!sheetUrl || !sheetUrl.trim()) return null;
  try {
    const students = await fetchStudentsFromGoogleSheetUrl(sheetUrl);
    return students;
  } catch (err: any) {
    console.warn('Gagal membaca Google Sheets via CSV:', err.message);
    throw err;
  }
}

// 2. Free Google Apps Script Webhook Sync (100% Free, Zero Billing)
export async function syncWithGoogleAppsScript(
  appsScriptUrl: string,
  action: 'pull' | 'push',
  students?: Student[]
): Promise<Student[] | null> {
  try {
    const cleanUrl = appsScriptUrl.trim();
    if (!cleanUrl.startsWith('https://script.google.com/macros/s/')) {
      throw new Error('URL Apps Script harus berformat https://script.google.com/macros/s/.../exec');
    }

    if (action === 'push') {
      const res = await fetch(cleanUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'sync_students',
          students: students || [],
          timestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Gagal mengirim data ke Google Sheets script');
      return students || null;
    } else {
      const res = await fetch(`${cleanUrl}?action=get_students&t=${Date.now()}`);
      if (!res.ok) throw new Error('Gagal mengambil data dari Google Sheets script');
      const data = await res.json();
      if (Array.isArray(data)) {
        return data as Student[];
      } else if (data && Array.isArray(data.students)) {
        return data.students as Student[];
      }
      return null;
    }
  } catch (err: any) {
    console.error('Google Apps Script error:', err);
    throw err;
  }
}
