import React from 'react';
import { 
  Trophy, 
  UploadCloud, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Award, 
  Clock, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { AthleteProfile, MatchSubmission } from '../types';
import { AthletePassportCard } from './AthletePassportCard';
import { getEloTier } from '../data/constants';

interface PassportTabViewProps {
  athlete: AthleteProfile | null;
  athleteMatches: MatchSubmission[];
  onOpenOnboarding: () => void;
  onNavigateToMatches: () => void;
  onNavigateToLeaderboard: () => void;
}

export const PassportTabView: React.FC<PassportTabViewProps> = ({
  athlete,
  athleteMatches,
  onOpenOnboarding,
  onNavigateToMatches,
  onNavigateToLeaderboard,
}) => {
  if (!athlete) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 px-4">
        <div className="h-16 w-16 mx-auto rounded-3xl bg-[#071326] border border-[#C8A75E]/40 flex items-center justify-center text-[#DFCA88] mb-4 shadow-xl shadow-[#C8A75E]/10">
          <ShieldCheck className="h-8 w-8 text-[#C8A75E]" />
        </div>
        <h2 className="text-2xl font-bold text-white font-display">PASPOR ATLET BELUM DIBUAT</h2>
        <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
          Daftarkan identitas resmi atlet esports Anda (KTP/Kartu Pelajar) untuk mendapatkan nomor Gameskii DIY ID resmi dan mulai bersaing di klasemen ELO DIY.
        </p>
        <button
          onClick={onOpenOnboarding}
          className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-[#DFCA88] via-[#C8A75E] to-[#9F7E36] text-[#0B1D3A] font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#C8A75E]/20 hover:opacity-95 transition-all"
        >
          Buat Paspor Digital Sekarang
        </button>
      </div>
    );
  }

  const tier = getEloTier(athlete.elo_points);
  const winRate = athlete.matches_played > 0 
    ? Math.round((athlete.wins / athlete.matches_played) * 100) 
    : 0;

  // Next tier calculation
  let nextTierPoints = 1400;
  let nextTierName = 'Master DIY';
  if (athlete.elo_points >= 1600) {
    nextTierPoints = 2000;
    nextTierName = 'Grand Master Legend DIY';
  } else if (athlete.elo_points >= 1400) {
    nextTierPoints = 1600;
    nextTierName = 'Grand Master DIY';
  } else if (athlete.elo_points >= 1200) {
    nextTierPoints = 1400;
    nextTierName = 'Master DIY';
  } else if (athlete.elo_points >= 1000) {
    nextTierPoints = 1200;
    nextTierName = 'Challenger DIY';
  }
  const progressPercent = Math.min(100, Math.max(10, Math.round((athlete.elo_points / nextTierPoints) * 100)));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#3B3B3B] bg-[#071326] p-6 sm:p-8">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <img 
            src="/src/assets/images/esports_arena_1790765346565.jpg" 
            alt="Arena Background" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#DFCA88] bg-[#C8A75E]/15 border border-[#C8A75E]/30 px-2.5 py-0.5 rounded-full">
                ● Status: Terverifikasi ESI DIY
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {athlete.regency}
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-white tracking-tight">
              Selamat Bertanding, <span className="text-[#DFCA88]">{athlete.ign}</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Paspor Anda terdaftar di sistem Gameskii untuk kompetisi Kejurda ESI DIY, BePro Series, dan Official Tournament.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToMatches}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#DFCA88] to-[#C8A75E] hover:opacity-95 text-[#0B1D3A] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#C8A75E]/20 transition-all shrink-0"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload Result Baru</span>
            </button>
            <button
              onClick={onNavigateToLeaderboard}
              className="px-4 py-2.5 rounded-xl bg-[#0B1D3A] hover:bg-[#3B3B3B]/60 text-white font-semibold text-xs border border-[#3B3B3B] flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Trophy className="h-4 w-4 text-[#C8A75E]" />
              <span>Cek Klasemen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Athlete Card */}
      <div>
        <AthletePassportCard athlete={athlete} onEditProfile={onOpenOnboarding} />
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Tier Progress */}
        <div className="rounded-2xl border border-[#3B3B3B] bg-[#071326] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span className="font-semibold uppercase tracking-wider font-mono">PROGRESS TIER ELO</span>
            <span className="font-bold text-[#DFCA88] font-mono">{athlete.elo_points} / {nextTierPoints}</span>
          </div>
          <div className="w-full bg-[#0B1D3A] h-2.5 rounded-full overflow-hidden border border-[#3B3B3B]">
            <div 
              className="h-full bg-gradient-to-r from-[#DFCA88] to-[#C8A75E] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-300 mt-2.5 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-[#C8A75E]" />
            <span>Target selanjutnya: <strong className="text-white">{nextTierName}</strong></span>
          </p>
        </div>

        {/* Win-Loss Breakdown */}
        <div className="rounded-2xl border border-[#3B3B3B] bg-[#071326] p-5 shadow-sm">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">REKOR KEMENANGAN</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono tabular-nums">{athlete.wins}</span>
            <span className="text-xs text-slate-400">Menang</span>
            <span className="text-slate-600">/</span>
            <span className="text-2xl font-black text-rose-400 font-mono tabular-nums">
              {Math.max(0, athlete.matches_played - athlete.wins)}
            </span>
            <span className="text-xs text-slate-400">Kalah</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-2">
            Win Rate: <strong className="text-emerald-400">{winRate}%</strong> dari total {athlete.matches_played} turnamen resmi.
          </p>
        </div>

        {/* Regency & ESI Status */}
        <div className="rounded-2xl border border-[#3B3B3B] bg-[#071326] p-5 shadow-sm">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">DOMISILI & ROLE</span>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-bold text-white">{athlete.regency}</span>
            <span className="text-xs font-mono text-[#DFCA88] bg-[#C8A75E]/15 px-2 py-0.5 rounded border border-[#C8A75E]/30">
              {athlete.role}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-2">
            Terdaftar di bawah naungan Pengkab/Pengkot ESI {athlete.regency}.
          </p>
        </div>

      </div>

      {/* Recent Athlete Matches */}
      <div className="rounded-3xl border border-[#3B3B3B] bg-[#071326] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-display">RIWAYAT TURNAMEN SAYA</h3>
            <p className="text-xs text-slate-400">Hasil turnamen yang telah diunggah dan status verifikasinya</p>
          </div>
          <button
            onClick={onNavigateToMatches}
            className="text-xs text-[#DFCA88] hover:text-white font-semibold flex items-center gap-1"
          >
            <span>Upload Hasil Baru</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {athleteMatches.length === 0 ? (
          <div className="rounded-2xl bg-[#0B1D3A]/60 border border-[#3B3B3B] p-8 text-center">
            <Clock className="h-8 w-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-200">Belum ada riwayat hasil turnamen yang diupload</p>
            <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
              Upload screenshot standing atau scoreboard turnamen pertama Anda untuk memperoleh poin ELO.
            </p>
            <button
              onClick={onNavigateToMatches}
              className="px-4 py-2 rounded-xl bg-[#C8A75E] text-[#0B1D3A] font-bold text-xs shadow-sm hover:bg-[#DFCA88]"
            >
              Upload Result Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {athleteMatches.slice(0, 5).map((m) => (
              <div 
                key={m.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0B1D3A] border border-[#3B3B3B] text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg font-display text-sm font-bold bg-[#C8A75E]/20 text-[#DFCA88] border border-[#C8A75E]/40">
                    {m.result}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{m.match_type}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      KDA: {m.kills}/{m.deaths}/{m.assists} · {m.game_name}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    m.status === 'Verified'
                      ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/40'
                      : m.status === 'Pending Review'
                      ? 'bg-amber-950/70 text-amber-300 border border-amber-700/40'
                      : 'bg-rose-950/70 text-rose-300 border border-rose-700/40'
                  }`}>
                    {m.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(m.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
