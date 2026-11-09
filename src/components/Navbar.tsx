import React from 'react';
import {
  UserPlus,
  Megaphone,
  Settings2,
  Printer,
  BookOpen,
  Lock,
  LogOut,
  ShieldCheck,
  FileSpreadsheet,
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'announcement' | 'admin' | 'print' | 'guide';
  setActiveTab: (tab: 'announcement' | 'admin' | 'print' | 'guide') => void;
  onOpenAddModal: () => void;
  totalStudents: number;
  isAdmin: boolean;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  logoUrl?: string;
  schoolName: string;
  spreadsheetUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  totalStudents,
  isAdmin,
  onOpenLoginModal,
  onLogout,
  logoUrl = '/assets/aistudio/images__1__7d6e64c5.png',
  schoolName = 'SD ASY - SYIFA 2',
  spreadsheetUrl,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-teal-100 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Brand wordmark with School Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('announcement')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <img
                src={logoUrl}
                alt={`Logo ${schoolName}`}
                className="w-9 h-9 object-contain drop-shadow-xs group-hover:scale-105 transition-transform shrink-0"
                onError={(e) => {
                  // Fallback if image fails to render
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <div>
                <span className="text-base font-bold tracking-tight text-teal-950 block leading-tight">
                  {schoolName}
                </span>
                <span className="text-[11px] text-teal-700 font-medium tracking-wide">
                  Portal Akun Akademik
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Concise navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('announcement')}
              className={`hover:text-teal-800 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'announcement'
                  ? 'text-teal-700 font-semibold border-b-2 border-teal-600 -mb-[2px]'
                  : ''
              }`}
            >
              <Megaphone className="w-4 h-4 text-teal-600" />
              <span>Pengumuman Siswa</span>
            </button>

            {/* Admin-only Navigations */}
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`hover:text-teal-800 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'admin'
                      ? 'text-teal-700 font-semibold border-b-2 border-teal-600 -mb-[2px]'
                      : ''
                  }`}
                >
                  <Settings2 className="w-4 h-4 text-teal-600" />
                  <span>Kelola Data Siswa ({totalStudents})</span>
                </button>

                <button
                  onClick={() => setActiveTab('print')}
                  className={`hover:text-teal-800 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'print'
                      ? 'text-teal-700 font-semibold border-b-2 border-teal-600 -mb-[2px]'
                      : ''
                  }`}
                >
                  <Printer className="w-4 h-4 text-teal-600" />
                  <span>Cetak Slip</span>
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('guide')}
              className={`hover:text-teal-800 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'guide'
                  ? 'text-teal-700 font-semibold border-b-2 border-teal-600 -mb-[2px]'
                  : ''
              }`}
            >
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>Panduan</span>
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                title="Buka Data Siswa di Google Spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden lg:inline">Google Sheets</span>
                <ExternalLink className="w-3 h-3 text-emerald-500" />
              </a>
            )}

            {isAdmin ? (
              <>
                <button
                  onClick={onOpenAddModal}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Input Akun Siswa</span>
                </button>

                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Keluar dari mode admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 active:bg-teal-200 rounded-lg transition-colors cursor-pointer"
                title="Khusus guru / administrator sekolah"
              >
                <Lock className="w-3.5 h-3.5 text-teal-700" />
                <span>Akses Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center gap-2 py-2 overflow-x-auto border-t border-teal-100 no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('announcement')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'announcement'
                ? 'bg-teal-100 text-teal-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-teal-600" />
            <span>Pengumuman</span>
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-teal-100 text-teal-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Kelola ({totalStudents})</span>
              </button>
              <button
                onClick={() => setActiveTab('print')}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'print'
                    ? 'bg-teal-100 text-teal-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Printer className="w-3.5 h-3.5 text-teal-600" />
                <span>Cetak Slip</span>
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-teal-100 text-teal-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-600" />
            <span>Panduan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
