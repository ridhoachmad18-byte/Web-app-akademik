import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  Check,
  AlertCircle,
  Link as LinkIcon,
  Sparkles,
  Download,
  Upload,
  Copy,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import { FREE_APPS_SCRIPT_CODE, buildGoogleSheetUrl, parseGoogleSheetId } from '../services/googleSheets';

interface GoogleSheetsBarProps {
  spreadsheetUrl: string;
  appsScriptUrl: string;
  isSyncing: boolean;
  onSaveLinks: (sheetUrl: string, scriptUrl: string) => void;
  onSyncWebhook: (action: 'pull' | 'push') => void;
  onPullFromSheetUrl: () => void;
  onExportCsv: () => void;
  onOpenBatchImport: () => void;
  onCopyText: (text: string, label: string) => void;
}

export const GoogleSheetsBar: React.FC<GoogleSheetsBarProps> = ({
  spreadsheetUrl,
  appsScriptUrl,
  isSyncing,
  onSaveLinks,
  onSyncWebhook,
  onPullFromSheetUrl,
  onExportCsv,
  onOpenBatchImport,
  onCopyText,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [inputSheetUrl, setInputSheetUrl] = useState(spreadsheetUrl);
  const [inputScriptUrl, setInputScriptUrl] = useState(appsScriptUrl);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveLinks(inputSheetUrl.trim(), inputScriptUrl.trim());
    setIsEditing(false);
  };

  const hasSheetLink = Boolean(spreadsheetUrl);
  const hasScriptLink = Boolean(appsScriptUrl);

  return (
    <div className="bg-white rounded-xl border border-teal-200 shadow-xs overflow-hidden">
      {/* Top Banner: Status & Quick Actions */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 shadow-2xs">
            <FileSpreadsheet className="w-5 h-5 text-teal-700" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-teal-950">
                Penyimpanan & Tautan Google Spreadsheet
              </h4>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>100% Gratis & Bebas Billing</span>
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Tautkan Google Spreadsheet sekolah Anda di sini. Data siswa dapat disinkronkan langsung dari spreadsheet atau dibuka dalam satu klik tanpa memerlukan akun Google Cloud berbayar.
            </p>

            {/* Linked Google Spreadsheet Badge */}
            {hasSheetLink && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300 transition-colors shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Buka Google Spreadsheet Sekolah</span>
                  <ExternalLink className="w-3 h-3 text-emerald-500" />
                </a>

                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-[11px] text-teal-700 hover:text-teal-950 font-medium underline cursor-pointer"
                >
                  {isEditing ? 'Tutup Pengaturan Link' : 'Ganti Link Spreadsheet'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
          {!hasSheetLink && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Tautkan Google Spreadsheet</span>
            </button>
          )}

          {hasSheetLink && (
            <button
              type="button"
              onClick={onPullFromSheetUrl}
              disabled={isSyncing}
              className="px-3 py-2 text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Tarik data terbaru dari Google Spreadsheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Tarik dari Spreadsheet</span>
            </button>
          )}

          <button
            type="button"
            onClick={onExportCsv}
            className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download CSV untuk dibuka di Google Sheets atau Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Unduh CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenBatchImport}
            className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Import data CSV/Excel dari Google Sheets"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Impor Data</span>
          </button>
        </div>
      </div>

      {/* Edit Form Drawer */}
      {isEditing && (
        <div className="p-4 sm:p-5 bg-teal-50/70 border-t border-teal-200 animate-in fade-in">
          <form onSubmit={handleSave} className="space-y-4 max-w-3xl">
            <div>
              <label className="block text-xs font-bold text-teal-950 mb-1">
                Link URL Google Spreadsheet Sekolah:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={inputSheetUrl}
                  onChange={(e) => setInputSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5n.../edit"
                  className="flex-1 px-3 py-2 text-xs bg-white border border-teal-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-2xs cursor-pointer"
                >
                  Simpan Link
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Masukkan link Google Spreadsheet tempat Anda menyimpan data siswa. Pastikan spreadsheet diatur ke mode <em>&quot;Siapa saja yang memiliki link dapat melihat&quot;</em> agar data dapat ditarik langsung ke web portal ini secara otomatis.
              </p>
            </div>

            {/* Optional Apps Script Webhook for 100% Free Live Auto-Sync */}
            <div className="pt-3 border-t border-teal-200/60">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-teal-950">
                  (Opsional) URL Webhook Google Apps Script untuk Simpan Otomatis:
                </label>
                <button
                  type="button"
                  onClick={() => setShowScriptModal(!showScriptModal)}
                  className="text-[11px] text-teal-800 hover:text-teal-950 font-semibold underline cursor-pointer"
                >
                  {showScriptModal ? 'Sembunyikan Panduan Script' : 'Cara Pasang Script Gratis (1 Menit)'}
                </button>
              </div>
              <input
                type="url"
                value={inputScriptUrl}
                onChange={(e) => setInputScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="w-full px-3 py-2 text-xs bg-white border border-teal-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Fitur ini 100% gratis menggunakan Google Apps Script bawaan Google Sheet tanpa memerlukan Google Cloud Billing ataupun OAuth berbayar.
              </p>
            </div>
          </form>

          {/* Script Guide */}
          {showScriptModal && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-teal-300 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Kode Google Apps Script (Gratis & Tanpa Billing)</span>
                </h5>
                <button
                  type="button"
                  onClick={() => onCopyText(FREE_APPS_SCRIPT_CODE, 'Kode Google Apps Script')}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Salin Kode Script</span>
                </button>
              </div>

              <ol className="text-xs text-slate-600 list-decimal list-inside space-y-1 leading-relaxed">
                <li>Buka Google Spreadsheet sekolah Anda.</li>
                <li>Klik menu <strong>Ekstensi</strong> &rarr; <strong>Apps Script</strong>.</li>
                <li>Hapus kode yang ada, lalu tempelkan (paste) kode script di bawah ini.</li>
                <li>Klik <strong>Deploy</strong> (Terapkan) &rarr; <strong>New Deployment</strong> &rarr; Pilih jenis <strong>Web App</strong>.</li>
                <li>Setel <em>Who has access</em> (Siapa yang dapat mengakses) ke <strong>Anyone (Siapa saja)</strong>.</li>
                <li>Salin URL Web App yang muncul, lalu tempelkan ke kolom input di atas.</li>
              </ol>

              <pre className="text-[11px] font-mono bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto max-h-48 border border-slate-700">
                {FREE_APPS_SCRIPT_CODE}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
