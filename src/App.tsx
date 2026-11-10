/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  GraduationCap,
  Globe,
  RotateCcw,
  Plus,
  AlertTriangle,
  Settings2,
  Megaphone,
  Table as TableIcon,
  LayoutGrid,
  ShieldCheck,
  KeyRound,
  LogOut,
  Lock,
} from 'lucide-react';
import { Student, SchoolConfig } from './types/student';
import { INITIAL_STUDENTS, DEFAULT_SCHOOL_CONFIG } from './data/initialData';
import { copyToClipboard, exportStudentsToCsv, exportStudentsToExcel } from './utils/helpers';
import { Navbar } from './components/Navbar';
import { StudentAnnouncementView } from './components/StudentAnnouncementView';
import { StudentTable } from './components/StudentTable';
import { StudentCardGrid } from './components/StudentCardGrid';
import { StudentFormModal } from './components/StudentFormModal';
import { BatchImportModal } from './components/BatchImportModal';
import { PrintSlipsModal } from './components/PrintSlipsModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { TeacherGuide } from './components/TeacherGuide';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ChangeAdminPasswordModal } from './components/ChangeAdminPasswordModal';
import { GoogleSheetsBar } from './components/GoogleSheetsBar';
import { Toast, ToastMessage } from './components/Toast';
import {
  fetchGoogleSheetData,
  syncWithGoogleAppsScript,
} from './services/dataSync';

const STORAGE_KEY_STUDENTS = 'portal_asy_syifa_students_v5';
const STORAGE_KEY_CONFIG = 'portal_asy_syifa_config_v5';
const STORAGE_KEY_ADMIN_PASS = 'portal_asy_syifa_admin_pass_v5';
const STORAGE_KEY_ADMIN_LOGGED_IN = 'portal_asy_syifa_admin_auth_v5';
const STORAGE_KEY_SHEET_URL = 'portal_asy_syifa_sheet_url_v5';
const STORAGE_KEY_SCRIPT_URL = 'portal_asy_syifa_script_url_v5';

export default function App() {
  // 1. Data States
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load students from localStorage', e);
    }
    return INITIAL_STUDENTS;
  });

  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.schoolName && parsed.schoolName.includes('SD ASY - SYIFA 2')) {
          return {
            ...DEFAULT_SCHOOL_CONFIG,
            ...parsed,
            logoUrl: DEFAULT_SCHOOL_CONFIG.logoUrl,
          };
        }
      }
    } catch (e) {
      console.error('Failed to load school config from localStorage', e);
    }
    return DEFAULT_SCHOOL_CONFIG;
  });

  // Google Spreadsheet & Webhook Links
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_SHEET_URL) || '';
  });
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_SCRIPT_URL) || '';
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Admin Security States
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_ADMIN_PASS) || 'admin123';
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_ADMIN_LOGGED_IN) === 'true';
  });

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 2. Auto-load from linked Google Sheet on mount if present
  useEffect(() => {
    let isMounted = true;
    async function loadSheetOnMount() {
      const savedSheet = localStorage.getItem(STORAGE_KEY_SHEET_URL);
      if (savedSheet && savedSheet.trim()) {
        try {
          const remoteStudents = await fetchGoogleSheetData(savedSheet);
          if (isMounted && remoteStudents && remoteStudents.length > 0) {
            setStudents(remoteStudents);
          }
        } catch {
          // If sheet is private or offline, fallback to local students
        }
      }
    }
    loadSheetOnMount();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save students to localStorage', e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(schoolConfig));
    } catch (e) {
      console.error('Failed to save config to localStorage', e);
    }
  }, [schoolConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_PASS, adminPassword);
    } catch (e) {
      console.error('Failed to save admin pass', e);
    }
  }, [adminPassword]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_LOGGED_IN, isAdminLoggedIn ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to save auth state', e);
    }
  }, [isAdminLoggedIn]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SHEET_URL, spreadsheetUrl);
  }, [spreadsheetUrl]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SCRIPT_URL, appsScriptUrl);
  }, [appsScriptUrl]);

  // 3. Navigation & View States
  const [activeTab, setActiveTab] = useState<'announcement' | 'admin' | 'print' | 'guide'>('announcement');
  const [adminSubView, setAdminSubView] = useState<'table' | 'cards'>('table');

  // 4. Modals & Dialogs
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [viewingDetailStudent, setViewingDetailStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 5. Admin Authentication Handlers
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminLoginModalOpen(false);
    setActiveTab('admin');
    addToast('success', 'Berhasil Masuk sebagai Admin', 'Anda sekarang dapat menginput dan mengelola data akun siswa.');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setActiveTab('announcement');
    addToast('info', 'Keluar dari Mode Admin', 'Sistem kembali ke halaman pengumuman siswa.');
  };

  const handleChangeAdminPassword = (newPass: string) => {
    setAdminPassword(newPass);
    addToast('success', 'Kata Sandi Admin Diperbarui', 'Gunakan kata sandi baru ini untuk login berikutnya.');
  };

  const requireAdminAccess = (action: () => void) => {
    if (isAdminLoggedIn) {
      action();
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  // Google Sheets Handlers
  const handleSaveLinks = async (newSheetUrl: string, newScriptUrl: string) => {
    setSpreadsheetUrl(newSheetUrl);
    setAppsScriptUrl(newScriptUrl);
    localStorage.setItem(STORAGE_KEY_SHEET_URL, newSheetUrl);
    localStorage.setItem(STORAGE_KEY_SCRIPT_URL, newScriptUrl);

    if (newSheetUrl.trim()) {
      try {
        setIsSyncing(true);
        const remote = await fetchGoogleSheetData(newSheetUrl);
        if (remote && remote.length > 0) {
          setStudents(remote);
          addToast('success', 'Tersambung ke Google Spreadsheet', `Berhasil memuat ${remote.length} siswa dari spreadsheet.`);
          return;
        }
      } catch (err: any) {
        // Just save link if fetch fails
      } finally {
        setIsSyncing(false);
      }
    }

    addToast('success', 'Tautan Berhasil Disimpan', 'Tautan Google Spreadsheet kini tersimpan di aplikasi.');
  };

  const handlePullFromSheetUrl = async () => {
    if (!spreadsheetUrl) {
      addToast('error', 'Link Spreadsheet Belum Diisi', 'Silakan masukkan link Google Spreadsheet Anda terlebih dahulu.');
      return;
    }
    try {
      setIsSyncing(true);
      const remote = await fetchGoogleSheetData(spreadsheetUrl);
      if (remote && remote.length > 0) {
        setStudents(remote);
        addToast('success', 'Data Diperbarui dari Google Sheets', `Berhasil menyinkronkan ${remote.length} siswa dari spreadsheet.`);
      } else {
        addToast('info', 'Spreadsheet Kosong', 'Tidak ada baris siswa ditemukan di spreadsheet.');
      }
    } catch (err: any) {
      addToast('error', 'Gagal Membaca Spreadsheet', err.message || 'Periksa pengaturan berbagi Google Spreadsheet.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncWebhook = async (action: 'pull' | 'push') => {
    if (!appsScriptUrl) {
      addToast('error', 'URL Webhook Belum Diisi', 'Silakan masukkan URL Webhook Google Apps Script terlebih dahulu.');
      return;
    }
    try {
      setIsSyncing(true);
      if (action === 'pull') {
        const remoteStudents = await syncWithGoogleAppsScript(appsScriptUrl, 'pull');
        if (remoteStudents && remoteStudents.length > 0) {
          setStudents(remoteStudents);
          addToast('success', 'Sinkronisasi Berhasil', `Berhasil menarik ${remoteStudents.length} data siswa dari Google Sheets.`);
        } else {
          addToast('info', 'Spreadsheet Kosong', 'Tidak ada data siswa ditemukan di spreadsheet.');
        }
      } else {
        await syncWithGoogleAppsScript(appsScriptUrl, 'push', students);
        addToast('success', 'Terkirim ke Google Sheets', `${students.length} siswa berhasil disimpan ke spreadsheet.`);
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Gagal Sinkronisasi', err.message || 'Periksa URL Webhook Google Apps Script Anda.');
    } finally {
      setIsSyncing(false);
    }
  };

  // 6. Data Action Handlers
  const handleSaveStudent = async (
    data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    let nextList: Student[];

    if (editId) {
      nextList = students.map((s) =>
        s.id === editId
          ? {
              ...s,
              ...data,
              updatedAt: Date.now(),
            }
          : s
      );
      setStudents(nextList);
      addToast('success', 'Akun Siswa Diperbarui', `Data akun ${data.name} berhasil disimpan.`);
    } else {
      const newStudent: Student = {
        ...data,
        id: `std-${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      nextList = [newStudent, ...students];
      setStudents(nextList);
      addToast(
        'success',
        'Akun Siswa Ditambahkan',
        `Akun untuk ${data.name} (@${data.username}) siap diumumkan.`
      );
    }

    // Background push to Apps Script webhook if configured
    if (appsScriptUrl) {
      syncWithGoogleAppsScript(appsScriptUrl, 'push', nextList).catch((e) =>
        console.warn('Webhook auto-push note:', e)
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    const nextList = students.filter((s) => s.id !== studentToDelete.id);
    setStudents(nextList);
    addToast('info', 'Akun Dihapus', `Data akun untuk ${studentToDelete.name} telah dihapus.`);
    setStudentToDelete(null);

    // Background push to Apps Script webhook if configured
    if (appsScriptUrl) {
      syncWithGoogleAppsScript(appsScriptUrl, 'push', nextList).catch((e) =>
        console.warn('Webhook auto-push note:', e)
      );
    }
  };

  const handleBatchImport = async (newStudents: Student[]) => {
    const nextList = [...newStudents, ...students];
    setStudents(nextList);
    addToast(
      'success',
      'Import Massal Berhasil',
      `${newStudents.length} akun siswa berhasil ditambahkan ke database.`
    );

    // Background push to Apps Script webhook if configured
    if (appsScriptUrl) {
      syncWithGoogleAppsScript(appsScriptUrl, 'push', nextList).catch((e) =>
        console.warn('Webhook auto-push note:', e)
      );
    }
  };

  const handleCopy = async (text: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      addToast('success', 'Tersalin ke Clipboard!', `${label} berhasil disalin.`);
    } else {
      addToast('error', 'Gagal Menyalin', 'Silakan salin teks secara manual.');
    }
  };

  const handleExportExcel = () => {
    exportStudentsToExcel(students, schoolConfig.schoolName);
    addToast('success', 'File Tabel Excel (.xls) Diunduh', 'Tabel bergaris ke samping tanpa tanda kutip siap dibuka di Excel / Google Sheets.');
  };

  const handleExportCsv = () => {
    exportStudentsToCsv(students, schoolConfig.schoolName);
    addToast('success', 'File CSV Diunduh', 'Data seluruh akun siswa berhasil diekspor.');
  };

  const handleResetSampleData = () => {
    setStudents(INITIAL_STUDENTS);
    setShowResetConfirm(false);
    addToast('info', 'Data Contoh Dimuat', 'Daftar akun siswa dikembalikan ke data sampel SD ASY - SYIFA 2.');
  };

  const handleClearAllData = () => {
    setStudents([]);
    setShowResetConfirm(false);
    addToast('info', 'Data Dikosongkan', 'Semua akun siswa telah dihapus.');
  };

  const existingGrades = Array.from(new Set(students.map((s) => s.grade))).sort();

  return (
    <div className="min-h-screen bg-teal-50/20 flex flex-col text-slate-900">
      {/* 1. Header Navigation Bar with SD ASY - SYIFA 2 Logo & Admin Guard */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'admin' || tab === 'print') {
            requireAdminAccess(() => setActiveTab(tab));
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenAddModal={() => {
          requireAdminAccess(() => {
            setEditingStudent(null);
            setIsFormModalOpen(true);
          });
        }}
        totalStudents={students.length}
        isAdmin={isAdminLoggedIn}
        onOpenLoginModal={() => setIsAdminLoginModalOpen(true)}
        onLogout={handleAdminLogout}
        logoUrl={schoolConfig.logoUrl}
        schoolName={schoolConfig.schoolName}
        spreadsheetUrl={spreadsheetUrl}
      />

      {/* Admin indicator banner if logged in (Toska Theme) */}
      {isAdminLoggedIn && (
        <div className="no-print bg-teal-900 text-teal-100 px-4 py-2 text-xs flex items-center justify-between border-b border-teal-800 shadow-2xs">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-300" />
              <span>
                <strong>Mode Admin Aktif ({schoolConfig.schoolName}):</strong> Akses penuh kelola data akun siswa.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="hover:text-white underline text-[11px] font-medium cursor-pointer"
              >
                Ganti Sandi Admin
              </button>
              <button
                onClick={handleAdminLogout}
                className="hover:text-white bg-teal-800 px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* A. VIEW 1: PENGUMUMAN AKUN SISWA (Tampil username & password khusus anak bersangkutan berdasarkan NIK) */}
        {activeTab === 'announcement' && (
          <StudentAnnouncementView
            students={students}
            schoolConfig={schoolConfig}
            onCopy={handleCopy}
            onOpenTeacherPanel={() => {
              requireAdminAccess(() => setActiveTab('admin'));
            }}
            spreadsheetUrl={spreadsheetUrl}
          />
        )}

        {/* B. VIEW 2: PANEL GURU / PENGELOLA DATA (HANYA BISA DIAKSES JIKA SUDAH LOGIN ADMIN) */}
        {activeTab === 'admin' && (
          isAdminLoggedIn ? (
            <div className="space-y-6">
              {/* Header Panel Guru */}
              <div className="bg-white rounded-xl border border-teal-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 p-1.5 bg-white border border-teal-200 rounded-xl shadow-2xs shrink-0">
                    <img
                      src={schoolConfig.logoUrl || '/assets/aistudio/images__1__7d6e64c5.png'}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span className="font-semibold text-teal-800">{schoolConfig.schoolName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-teal-700 font-semibold">Panel Khusus Administrator</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 font-semibold">
                        Penyimpanan Lokal & Google Spreadsheet
                      </span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-teal-950 mt-0.5">
                      Kelola & Input Data Akun Siswa
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kelola dan input username serta password siswa yang dapat langsung dihubungkan dengan Google Spreadsheet sekolah.
                    </p>
                  </div>
                </div>

                {/* View toggle (Tabel vs Kartu) & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center p-1 bg-teal-50 border border-teal-200 rounded-lg">
                    <button
                      onClick={() => setAdminSubView('table')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                        adminSubView === 'table'
                          ? 'bg-white text-teal-950 shadow-xs font-semibold'
                          : 'text-teal-800 hover:text-teal-950'
                      }`}
                    >
                      <TableIcon className="w-3.5 h-3.5" />
                      <span>Tabel</span>
                    </button>
                    <button
                      onClick={() => setAdminSubView('cards')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                        adminSubView === 'cards'
                          ? 'bg-white text-teal-950 shadow-xs font-semibold'
                          : 'text-teal-800 hover:text-teal-950'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Kartu</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="px-3 py-1.5 text-xs font-medium text-teal-900 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    title="Opsi reset atau bersihkan data"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Opsi Data</span>
                  </button>
                </div>
              </div>

              {/* Google Sheets Sync & Storage Bar (100% Free & No Billing) */}
              <GoogleSheetsBar
                spreadsheetUrl={spreadsheetUrl}
                appsScriptUrl={appsScriptUrl}
                isSyncing={isSyncing}
                onSaveLinks={handleSaveLinks}
                onSyncWebhook={handleSyncWebhook}
                onPullFromSheetUrl={handlePullFromSheetUrl}
                onExportExcel={handleExportExcel}
                onExportCsv={handleExportCsv}
                onOpenBatchImport={() => setIsBatchModalOpen(true)}
                onCopyText={handleCopy}
              />

              {/* Sub-view: Table or Cards */}
              {adminSubView === 'table' ? (
                <StudentTable
                  students={students}
                  onEdit={(student) => {
                    setEditingStudent(student);
                    setIsFormModalOpen(true);
                  }}
                  onDelete={(id, name) => setStudentToDelete({ id, name })}
                  onViewCard={(student) => setViewingDetailStudent(student)}
                  onCopy={handleCopy}
                  onOpenBatchImport={() => setIsBatchModalOpen(true)}
                  onExportExcel={handleExportExcel}
                  onExportCsv={handleExportCsv}
                  onAddNew={() => {
                    setEditingStudent(null);
                    setIsFormModalOpen(true);
                  }}
                />
              ) : (
                <StudentCardGrid
                  students={students}
                  onEdit={(student) => {
                    setEditingStudent(student);
                    setIsFormModalOpen(true);
                  }}
                  onDelete={(id, name) => setStudentToDelete({ id, name })}
                  onCopy={handleCopy}
                  onAddNew={() => {
                    setEditingStudent(null);
                    setIsFormModalOpen(true);
                  }}
                />
              )}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-teal-200 max-w-lg mx-auto p-8 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-teal-950">Akses Terkunci (Khusus Admin SD ASY - SYIFA 2)</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Halaman kelola data akun hanya dapat dibuka oleh admin atau guru sekolah. Silakan masukkan kata sandi admin untuk melanjutkan.
              </p>
              <button
                onClick={() => setIsAdminLoginModalOpen(true)}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs cursor-pointer"
              >
                Masukkan Kata Sandi Admin
              </button>
            </div>
          )
        )}

        {/* C. VIEW 3: CETAK SLIP SISWA (KHUSUS ADMIN) */}
        {activeTab === 'print' && (
          isAdminLoggedIn ? (
            <PrintSlipsModal
              students={students}
              schoolConfig={schoolConfig}
              onUpdateSchoolConfig={setSchoolConfig}
              onClose={() => setActiveTab('announcement')}
            />
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-teal-200 max-w-lg mx-auto p-8 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-teal-950">Akses Cetak Slip Khusus Admin</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Silakan login sebagai admin SD ASY - SYIFA 2 untuk mencetak slip kartu login siswa.
              </p>
              <button
                onClick={() => setIsAdminLoginModalOpen(true)}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs cursor-pointer"
              >
                Login sebagai Admin
              </button>
            </div>
          )
        )}

        {/* D. VIEW 4: PANDUAN PENGGUNAAN */}
        {activeTab === 'guide' && <TeacherGuide onSwitchTab={setActiveTab} />}
      </main>

      {/* 3. Footer */}
      <footer className="no-print mt-auto border-t border-teal-100 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img
              src={schoolConfig.logoUrl || '/assets/aistudio/images__1__7d6e64c5.png'}
              alt="Logo"
              className="w-5 h-5 object-contain"
            />
            <p className="text-teal-950 font-medium">
              © {new Date().getFullYear()} {schoolConfig.schoolName} — Portal Pengumuman Akun Akademik
            </p>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Privasi Terjaga</span>
            <span aria-hidden="true">·</span>
            {isAdminLoggedIn ? (
              <button
                onClick={handleAdminLogout}
                className="hover:text-rose-600 transition-colors cursor-pointer"
              >
                Keluar Admin
              </button>
            ) : (
              <button
                onClick={() => setIsAdminLoginModalOpen(true)}
                className="hover:text-teal-700 transition-colors cursor-pointer"
              >
                Login Admin
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* 4. Modals & Dialogs */}
      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
        currentAdminPassword={adminPassword}
      />

      {/* Change Admin Password Modal */}
      <ChangeAdminPasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        currentPassword={adminPassword}
        onSaveNewPassword={handleChangeAdminPassword}
      />

      {/* Form Input / Edit Student Modal */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
        editingStudent={editingStudent}
        existingGrades={existingGrades}
      />

      {/* Batch Import Modal */}
      <BatchImportModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onImport={handleBatchImport}
        defaultGrade={existingGrades[0] || 'Kelas 1A'}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={viewingDetailStudent}
        schoolConfig={schoolConfig}
        onClose={() => setViewingDetailStudent(null)}
        onCopy={handleCopy}
        onEdit={(student) => {
          setEditingStudent(student);
          setIsFormModalOpen(true);
        }}
      />

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Hapus Akun Siswa?</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun akademik untuk{' '}
              <strong>{studentToDelete.name}</strong>? Data akun siswa ini tidak akan muncul lagi di
              halaman pengumuman SD ASY - SYIFA 2.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-3.5 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset & Clear Data Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-teal-200 animate-in fade-in zoom-in-95">
            <h4 className="text-sm font-bold text-teal-950 mb-1">Pengaturan Data Aplikasi</h4>
            <p className="text-xs text-slate-500 mb-4">
              Pilih tindakan pengelolaan data akun yang tersimpan pada aplikasi:
            </p>

            <div className="space-y-3">
              <div className="p-3 border border-teal-200 bg-teal-50/40 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-teal-950">Muat Ulang Data Contoh</p>
                  <p className="text-[11px] text-teal-700">
                    Mengisi kembali 8 akun contoh siswa SD ASY - SYIFA 2
                  </p>
                </div>
                <button
                  onClick={handleResetSampleData}
                  className="px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-100 hover:bg-teal-200 rounded-lg cursor-pointer"
                >
                  Muat Contoh
                </button>
              </div>

              <div className="p-3 border border-rose-100 bg-rose-50/40 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-rose-800">Kosongkan Semua Data</p>
                  <p className="text-[11px] text-rose-600">
                    Menghapus seluruh daftar akun siswa di database
                  </p>
                </div>
                <button
                  onClick={handleClearAllData}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
                >
                  Kosongkan
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
