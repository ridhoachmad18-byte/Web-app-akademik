import { Student } from '../types/student';

export interface SpreadsheetInfo {
  spreadsheetId?: string;
  spreadsheetUrl: string;
  spreadsheetTitle?: string;
  sheetName?: string;
  appsScriptUrl?: string;
  lastSyncedAt?: number;
}

export const DEFAULT_SPREADSHEET_NAME = 'Data Akun Siswa - SD ASY - SYIFA 2';

export const HEADER_ROW = [
  'ID Siswa',
  'Nama Lengkap Siswa',
  'NIK Siswa (16 Digit)',
  'Tanggal Lahir (YYYY-MM-DD)',
  'Kelas / Rombel',
  'NIS',
  'Username Akademik',
  'Password / Sandi',
  'Catatan',
  'Waktu Pembuatan / Update',
];

export const parseGoogleSheetId = (input: string): string | null => {
  if (!input) return null;
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  if (/^[a-zA-Z0-9-_]{20,60}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
};

export const buildGoogleSheetUrl = (idOrUrl: string): string => {
  const id = parseGoogleSheetId(idOrUrl);
  if (id) {
    return `https://docs.google.com/spreadsheets/d/${id}/edit`;
  }
  if (idOrUrl.startsWith('http://') || idOrUrl.startsWith('https://')) {
    return idOrUrl;
  }
  return `https://docs.google.com/spreadsheets/d/${idOrUrl}/edit`;
};

// Helper: Parse CSV text into row arrays, handling quoted fields
export function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuote = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// Convert parsed CSV rows into Student objects
export function parseCsvToStudents(csvText: string): Student[] {
  const rows = parseCsvRows(csvText);
  if (rows.length <= 1) return [];

  // Determine column indexes from header row
  const header = rows[0].map((h) => h.toLowerCase().trim());
  let nameIdx = header.findIndex((h) => h.includes('nama'));
  let nikIdx = header.findIndex((h) => h.includes('nik'));
  let birthIdx = header.findIndex((h) => h.includes('lahir') || h.includes('tanggal'));
  let gradeIdx = header.findIndex((h) => h.includes('kelas') || h.includes('rombel'));
  let nisIdx = header.findIndex((h) => h.includes('nis'));
  let userIdx = header.findIndex((h) => h.includes('user') || h.includes('username'));
  let passIdx = header.findIndex((h) => h.includes('pass') || h.includes('sandi'));
  let notesIdx = header.findIndex((h) => h.includes('catat') || h.includes('ket'));

  // Fallback default index positions if headers are standard
  if (nameIdx === -1) nameIdx = 1;
  if (nikIdx === -1) nikIdx = 2;
  if (birthIdx === -1) birthIdx = 3;
  if (gradeIdx === -1) gradeIdx = 4;
  if (nisIdx === -1) nisIdx = 5;
  if (userIdx === -1) userIdx = 6;
  if (passIdx === -1) passIdx = 7;
  if (notesIdx === -1) notesIdx = 8;

  const students: Student[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = row[nameIdx] || '';
    if (!name.trim()) continue;

    const rawNik = (row[nikIdx] || '').replace(/\D/g, '').slice(0, 16);
    const rawBirth = (row[birthIdx] || '2017-05-12').trim();
    const rawGrade = (row[gradeIdx] || 'Kelas 1A').trim();
    const rawNis = (row[nisIdx] || '').trim();
    const rawUser = (row[userIdx] || `siswa.${Date.now()}-${i}`).trim();
    const rawPass = (row[passIdx] || 'Siswa#AsySyifa24').trim();
    const rawNotes = (row[notesIdx] || '').trim();

    students.push({
      id: row[0] && row[0].startsWith('std-') ? row[0] : `std-gs-${Date.now()}-${i}`,
      name: name.trim(),
      nik: rawNik || undefined,
      birthDate: rawBirth,
      grade: rawGrade,
      nis: rawNis || undefined,
      username: rawUser,
      password: rawPass,
      notes: rawNotes || undefined,
      createdAt: Date.now() - i * 1000,
      updatedAt: Date.now(),
    });
  }

  return students;
}

// Fetch directly from public Google Sheet via CSV Export (100% Free, No Billing, No API Key)
export async function fetchStudentsFromGoogleSheetUrl(urlOrId: string): Promise<Student[]> {
  const sheetId = parseGoogleSheetId(urlOrId);
  if (!sheetId) {
    throw new Error('ID atau link Google Spreadsheet tidak valid.');
  }

  const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

  try {
    const res = await fetch(exportUrl);
    if (!res.ok) {
      throw new Error(
        `Gagal mengakses Google Spreadsheet (${res.status}). Pastikan spreadsheet disetel ke "Siapa saja yang memiliki link dapat melihat" (Anyone with the link can view).`
      );
    }
    const csvText = await res.text();
    const parsedStudents = parseCsvToStudents(csvText);
    if (parsedStudents.length === 0) {
      throw new Error('Data pada spreadsheet kosong atau format baris tidak sesuai.');
    }
    return parsedStudents;
  } catch (err: any) {
    console.error('Fetch Google Sheet CSV error:', err);
    throw err;
  }
}

// Ready-to-use Google Apps Script for 100% free zero-billing two-way sync
export const FREE_APPS_SCRIPT_CODE = `// ==============================================================
// GOOGLE APPS SCRIPT: SYNC SD ASY - SYIFA 2 (100% GRATIS TANPA BILLING)
// Pasang di: Google Spreadsheet -> Menu "Ekstensi" -> "Apps Script"
// ==============================================================

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  }
  var students = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[1]) continue;
    students.push({
      id: String(r[0] || 'std-' + i),
      name: String(r[1] || ''),
      nik: String(r[2] || '').replace(/\\D/g, ''),
      birthDate: String(r[3] || ''),
      grade: String(r[4] || 'Kelas 1A'),
      nis: String(r[5] || ''),
      username: String(r[6] || ''),
      password: String(r[7] || ''),
      notes: String(r[8] || '')
    });
  }
  return ContentService.createTextOutput(JSON.stringify(students)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var students = data.students || [];
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.clearContents();
    
    // Header
    sheet.appendRow([
      'ID Siswa', 'Nama Lengkap Siswa', 'NIK Siswa (16 Digit)', 'Tanggal Lahir (YYYY-MM-DD)', 
      'Kelas / Rombel', 'NIS', 'Username Akademik', 'Password / Sandi', 'Catatan', 'Waktu Update'
    ]);
    
    // Rows
    for (var i = 0; i < students.length; i++) {
      var s = students[i];
      sheet.appendRow([
        s.id, s.name, "'" + (s.nik || ''), s.birthDate || '', 
        s.grade || '', s.nis || '', s.username || '', s.password || '', 
        s.notes || '', new Date().toISOString()
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok', count: students.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
