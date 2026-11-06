import React from 'react';
import { Shield, Database, LogIn, ChevronDown, Trophy, UploadCloud } from 'lucide-react';
import { AthleteProfile } from '../types';

interface HeaderProps {
  activeTab: 'passport' | 'matches' | 'leaderboard';
  setActiveTab: (tab: 'passport' | 'matches' | 'leaderboard') => void;
  activeAthlete: AthleteProfile | null;
  onOpenAuth: () => void;
  onOpenSupabaseModal: () => void;
  isSupabaseConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeAthlete,
  onOpenAuth,
  onOpenSupabaseModal,
  isSupabaseConnected,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#3B3B3B]/60 bg-[#0B1D3A]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Gameskii Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('passport')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#DFCA88] via-[#C8A75E] to-[#8C6D27] p-0.5 shadow-lg shadow-[#C8A75E]/20 group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0B1D3A]">
                <Shield className="h-5 w-5 text-[#C8A75E]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-2xl font-bold tracking-wider text-white">GAMESKII</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#DFCA88] bg-[#C8A75E]/15 border border-[#C8A75E]/40 px-1.5 py-0.2 rounded">DIY</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium -mt-1 hidden sm:block">Esports Athlete Passport</p>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#071326] border border-[#3B3B3B] rounded-xl p-1">
          <button
            onClick={() => setActiveTab('passport')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'passport'
                ? 'bg-[#C8A75E]/20 text-[#DFCA88] border border-[#C8A75E]/50 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-[#3B3B3B]/40'
            }`}
          >
            Paspor Atlet
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'matches'
                ? 'bg-[#C8A75E]/20 text-[#DFCA88] border border-[#C8A75E]/50 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-[#3B3B3B]/40'
            }`}
          >
            Upload Result
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-[#C8A75E]/20 text-[#DFCA88] border border-[#C8A75E]/50 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-[#3B3B3B]/40'
            }`}
          >
            Leaderboard
          </button>
        </nav>

        {/* Zone 3: Actions (Supabase status + User profile / login) */}
        <div className="flex items-center gap-2.5">
          {/* Supabase status indicator */}
          <button
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${
              isSupabaseConnected
                ? 'border-[#C8A75E]/50 bg-[#C8A75E]/15 text-[#DFCA88] hover:bg-[#C8A75E]/25'
                : 'border-[#3B3B3B] bg-[#071326] text-slate-300 hover:bg-[#3B3B3B]/40'
            }`}
            title="Konfigurasi Database Supabase DIY"
          >
            <Database className="h-3.5 w-3.5 text-[#C8A75E]" />
            <span className="hidden sm:inline">
              {isSupabaseConnected ? 'Supabase Live' : 'Database Setup'}
            </span>
            <span className={`h-2 w-2 rounded-full ${isSupabaseConnected ? 'bg-[#C8A75E] animate-pulse' : 'bg-[#C8A75E]/80'}`} />
          </button>

          {/* User profile / login button */}
          {activeAthlete ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 rounded-xl bg-[#071326] border border-[#3B3B3B] px-2.5 py-1.5 hover:border-[#C8A75E]/60 transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#C8A75E] to-[#9F7E36] text-[#0B1D3A] font-bold text-xs">
                {activeAthlete.ign.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left hidden xs:block">
                <p className="text-xs font-bold text-slate-100 max-w-[100px] truncate leading-tight">
                  {activeAthlete.ign}
                </p>
                <p className="text-[10px] font-mono text-[#DFCA88] leading-tight">
                  {activeAthlete.gameskii_id}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#DFCA88] to-[#C8A75E] px-3.5 py-2 text-xs font-bold text-[#0B1D3A] hover:opacity-95 shadow-md shadow-[#C8A75E]/20 transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Masuk / Daftar</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
