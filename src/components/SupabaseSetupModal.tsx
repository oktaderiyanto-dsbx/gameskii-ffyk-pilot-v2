import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Terminal
} from 'lucide-react';
import { getStoredSupabaseConfig, saveStoredSupabaseConfig, SUPABASE_SQL_SCHEMA } from '../lib/supabase';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const currentConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentConfig.anonKey);
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'reset'>('idle');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setSaveStatus('saved');
    onConfigUpdated();
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const handleResetToDemo = () => {
    saveStoredSupabaseConfig('', '');
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    setSaveStatus('reset');
    onConfigUpdated();
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const isLive = Boolean(supabaseUrl && supabaseAnonKey);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-6 rounded-3xl bg-[#0B1D3A] border border-[#3B3B3B] p-6 sm:p-8 text-left shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#071326] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#C8A75E]/20 border border-[#C8A75E]/40 text-[#DFCA88]">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">
              INTEGRASI SUPABASE DATABASE & STORAGE DIY
            </h2>
            <p className="text-xs text-slate-300">
              Konfigurasi database PostgreSQL, Row Level Security (RLS), dan Bucket Storage match-proofs
            </p>
          </div>
        </div>

        {/* Connection Status Banner */}
        <div className={`mt-5 p-4 rounded-2xl border flex items-center justify-between gap-3 ${
          isLive
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : 'bg-[#C8A75E]/15 border-[#C8A75E]/40 text-[#DFCA88]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`h-3 w-3 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-[#C8A75E]'}`} />
            <div>
              <p className="text-xs font-bold">
                {isLive ? 'Terhubung ke Supabase Live' : 'Mode Demo Cepat Aktif (Out-of-the-box)'}
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {isLive 
                  ? 'Data paspor atlet dan match disinkronkan ke project Supabase Anda.' 
                  : 'Mode demo memakai data 10 kompetisi FFYK dan penyimpanan lokal.'}
              </p>
            </div>
          </div>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-[#071326] hover:bg-[#102548] px-3 py-1.5 rounded-lg border border-[#3B3B3B] transition-colors shrink-0"
          >
            <span>Buka Dashboard</span>
            <ExternalLink className="h-3 w-3 text-[#C8A75E]" />
          </a>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Project URL Supabase (<code className="text-[#DFCA88]">VITE_SUPABASE_URL</code>)
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full rounded-xl bg-[#071326] border border-[#3B3B3B] px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-[#C8A75E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Anon Public Key (<code className="text-[#DFCA88]">VITE_SUPABASE_ANON_KEY</code>)
            </label>
            <input
              type="password"
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full rounded-xl bg-[#071326] border border-[#3B3B3B] px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-[#C8A75E] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleResetToDemo}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              Reset ke Mode Demo Lokal
            </button>

            <div className="flex items-center gap-2">
              {saveStatus === 'saved' && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Tersimpan!
                </span>
              )}
              {saveStatus === 'reset' && (
                <span className="text-xs text-amber-400 font-semibold">
                  Kembali ke Demo Lokal
                </span>
              )}
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFCA88] to-[#C8A75E] text-[#0B1D3A] font-bold text-xs shadow-md shadow-[#C8A75E]/20 transition-all hover:opacity-95"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </div>
        </form>

        {/* Copyable SQL Schema Script */}
        <div className="mt-6 pt-5 border-t border-[#3B3B3B]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#C8A75E]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                SQL Schema & RLS Setup Script (Supabase SQL Editor)
              </h3>
            </div>
            <button
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#071326] hover:bg-[#102548] text-xs font-semibold text-[#DFCA88] border border-[#3B3B3B] transition-colors"
            >
              {copiedSql ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedSql ? 'Tersalin ke Clipboard!' : 'Salin Seluruh SQL'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-300 mb-2">
            Jalankan script ini di Supabase SQL Editor untuk membuat tabel <code className="text-[#DFCA88]">profiles</code>, <code className="text-[#DFCA88]">matches</code>, bucket <code className="text-[#DFCA88]">match-proofs</code>, RLS, serta trigger kalkulasi ELO otomatis rank #1-#16.
          </p>

          <div className="relative rounded-2xl bg-[#071326] border border-[#3B3B3B] p-3 max-h-52 overflow-y-auto font-mono text-[11px] text-slate-300 leading-relaxed">
            <pre>{SUPABASE_SQL_SCHEMA}</pre>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#071326] hover:bg-[#102548] text-xs font-semibold text-white border border-[#3B3B3B] transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
