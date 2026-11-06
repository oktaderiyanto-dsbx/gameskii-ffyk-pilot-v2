import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Search, 
  MapPin, 
  Crosshair, 
  Sparkles,
  ChevronRight,
  Medal,
  Award
} from 'lucide-react';
import { AthleteProfile, GameRole, Regency } from '../types';
import { getEloTier, REGENCY_OPTIONS } from '../data/constants';
import { AthletePassportCard } from './AthletePassportCard';

interface LeaderboardViewProps {
  athletes: AthleteProfile[];
  onSelectAthlete?: (athlete: AthleteProfile) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  athletes,
  onSelectAthlete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegency, setSelectedRegency] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'elo' | 'winrate' | 'matches'>('elo');
  const [modalAthlete, setModalAthlete] = useState<AthleteProfile | null>(null);

  // Filter & Sort
  const processedAthletes = useMemo(() => {
    let list = [...athletes];

    // Search query by IGN, Real Name, or Gameskii ID
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.ign.toLowerCase().includes(q) ||
          a.full_name.toLowerCase().includes(q) ||
          a.gameskii_id.toLowerCase().includes(q)
      );
    }

    // Regency filter
    if (selectedRegency !== 'All') {
      list = list.filter((a) => a.regency === selectedRegency);
    }

    // Role filter
    if (selectedRole !== 'All') {
      list = list.filter((a) => a.role === selectedRole);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'winrate') {
        const wrA = a.matches_played > 0 ? (a.wins / a.matches_played) * 100 : 0;
        const wrB = b.matches_played > 0 ? (b.wins / b.matches_played) * 100 : 0;
        return wrB - wrA;
      }
      if (sortBy === 'matches') {
        return b.matches_played - a.matches_played;
      }
      return b.elo_points - a.elo_points;
    });

    return list;
  }, [athletes, searchQuery, selectedRegency, selectedRole, sortBy]);

  // Top 3 for podium
  const top3 = useMemo(() => {
    return [...athletes].sort((a, b) => b.elo_points - a.elo_points).slice(0, 3);
  }, [athletes]);

  const allRoles: GameRole[] = [
    'Jungler',
    'Roamer',
    'Midlaner',
    'Goldlaner',
    'Explaner',
    'Rusher',
    'Flanker',
    'Support',
    'Sniper',
    'Fragger',
    'Scout',
    'In-Game Leader (IGL)',
    'Striker',
  ];

  return (
    <div className="space-y-8">
      
      {/* Hero Header */}
      <div className="relative rounded-3xl border border-[#3B3B3B] bg-gradient-to-br from-[#102548] via-[#0B1D3A] to-[#071326] p-6 sm:p-8 overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-lg bg-[#C8A75E]/15 border border-[#C8A75E]/30 px-3 py-1 text-xs font-semibold text-[#DFCA88]">
              <Trophy className="h-3.5 w-3.5 text-[#C8A75E]" />
              <span>Klasemen Resmi Poin Atlet Daerah Istimewa Yogyakarta</span>
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-white font-display">
              POIN ATLET DIY (LEADERBOARD)
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Peringkat atlet resmi dari 5 kabupaten/kota: Sleman, Bantul, Yogyakarta, Gunungkidul, dan Kulon Progo. Skor diperbarui otomatis dari hasil turnamen resmi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#071326] border border-[#3B3B3B] p-3 text-center min-w-[100px]">
              <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400">TOTAL ATLET</span>
              <p className="font-mono text-2xl font-black text-[#DFCA88] tabular-nums">{athletes.length}</p>
            </div>
            <div className="rounded-2xl bg-[#071326] border border-[#3B3B3B] p-3 text-center min-w-[100px]">
              <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400">WILAYAH</span>
              <p className="font-mono text-2xl font-black text-white">5 DIY</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* #2 Silver */}
          <div 
            onClick={() => setModalAthlete(top3[1])}
            className="order-2 md:order-1 rounded-2xl border border-[#3B3B3B] bg-[#071326] p-4 hover:border-slate-400 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-400 text-slate-950 font-display text-lg font-bold border border-slate-300">
                #2
              </span>
              <span className="text-[11px] font-mono text-[#DFCA88]">{top3[1].gameskii_id}</span>
            </div>
            <h3 className="font-bold text-white text-base truncate group-hover:text-[#DFCA88] transition-colors">
              {top3[1].ign}
            </h3>
            <p className="text-xs text-slate-300 truncate">{top3[1].full_name}</p>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#3B3B3B]">
              <span className="text-xs text-[#DFCA88] font-semibold">{top3[1].regency}</span>
              <span className="font-mono text-sm font-black text-white tabular-nums">{top3[1].elo_points} PTS</span>
            </div>
          </div>

          {/* #1 Gold Champion */}
          <div 
            onClick={() => setModalAthlete(top3[0])}
            className="order-1 md:order-2 rounded-2xl border-2 border-[#C8A75E] bg-gradient-to-b from-[#C8A75E]/20 via-[#071326] to-[#0B1D3A] p-5 hover:border-[#DFCA88] transition-all cursor-pointer relative overflow-hidden group shadow-xl shadow-[#C8A75E]/20 md:-mt-2"
          >
            <div className="absolute top-0 right-0 bg-gradient-to-l from-[#C8A75E]/20 to-transparent p-2">
              <Sparkles className="h-5 w-5 text-[#C8A75E] animate-pulse" />
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C8A75E] text-[#0B1D3A] font-display text-xl font-black shadow-md shadow-[#C8A75E]/30">
                #1
              </span>
              <span className="text-xs font-mono font-bold text-[#DFCA88] bg-[#C8A75E]/20 px-2 py-0.5 rounded border border-[#C8A75E]/50">
                CHAMPION DIY
              </span>
            </div>
            <h3 className="font-black text-white text-lg truncate group-hover:text-[#DFCA88] transition-colors">
              {top3[0].ign}
            </h3>
            <p className="text-xs text-slate-300 truncate">{top3[0].full_name} · {top3[0].team_name || 'DIY Athlete'}</p>
            <div className="mt-4 flex items-center justify-between pt-2 border-t border-[#3B3B3B]">
              <span className="text-xs text-[#DFCA88] font-bold">{top3[0].regency} · {top3[0].role}</span>
              <span className="font-mono text-base font-black text-[#DFCA88] tabular-nums">{top3[0].elo_points} PTS</span>
            </div>
          </div>

          {/* #3 Bronze */}
          <div 
            onClick={() => setModalAthlete(top3[2])}
            className="order-3 md:order-3 rounded-2xl border border-[#3B3B3B] bg-[#071326] p-4 hover:border-amber-700 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-700 text-amber-100 font-display text-lg font-bold border border-amber-600">
                #3
              </span>
              <span className="text-[11px] font-mono text-[#DFCA88]">{top3[2].gameskii_id}</span>
            </div>
            <h3 className="font-bold text-white text-base truncate group-hover:text-[#DFCA88] transition-colors">
              {top3[2].ign}
            </h3>
            <p className="text-xs text-slate-300 truncate">{top3[2].full_name}</p>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#3B3B3B]">
              <span className="text-xs text-[#DFCA88] font-semibold">{top3[2].regency}</span>
              <span className="font-mono text-sm font-black text-white tabular-nums">{top3[2].elo_points} PTS</span>
            </div>
          </div>

        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="rounded-3xl border border-[#3B3B3B] bg-[#071326] p-4 sm:p-5 shadow-lg space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari IGN, nama lengkap, atau Gameskii DIY ID..."
              className="w-full rounded-xl bg-[#0B1D3A] border border-[#3B3B3B] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#C8A75E] focus:outline-none"
            />
          </div>

          {/* Regency Filter Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedRegency}
              onChange={(e) => setSelectedRegency(e.target.value)}
              className="w-full rounded-xl bg-[#0B1D3A] border border-[#3B3B3B] px-3 py-2.5 text-xs text-white focus:border-[#C8A75E] focus:outline-none"
            >
              <option value="All">Semua Wilayah DIY (5 Kab/Kota)</option>
              {REGENCY_OPTIONS.map((r) => (
                <option key={r.code} value={r.name} className="bg-[#0B1D3A]">
                  {r.name} ({r.code})
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full rounded-xl bg-[#0B1D3A] border border-[#3B3B3B] px-3 py-2.5 text-xs text-white focus:border-[#C8A75E] focus:outline-none"
            >
              <option value="All">Semua Role Game</option>
              {allRoles.map((role) => (
                <option key={role} value={role} className="bg-[#0B1D3A]">
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'elo' | 'winrate' | 'matches')}
              className="w-full rounded-xl bg-[#0B1D3A] border border-[#3B3B3B] px-3 py-2.5 text-xs text-white focus:border-[#C8A75E] focus:outline-none font-medium"
            >
              <option value="elo">Urut: Poin ELO Tertinggi</option>
              <option value="winrate">Urut: Win-Rate (%)</option>
              <option value="matches">Urut: Total Match</option>
            </select>
          </div>

        </div>

        {/* Quick Regency Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedRegency('All')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              selectedRegency === 'All'
                ? 'bg-[#C8A75E]/20 text-[#DFCA88] border border-[#C8A75E]/50 shadow-sm'
                : 'text-slate-400 hover:text-white bg-[#0B1D3A] border border-[#3B3B3B]'
            }`}
          >
            Semua DIY
          </button>
          {REGENCY_OPTIONS.map((r) => (
            <button
              key={r.code}
              onClick={() => setSelectedRegency(r.name)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedRegency === r.name
                  ? 'bg-[#C8A75E]/20 text-[#DFCA88] border border-[#C8A75E]/50 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-[#0B1D3A] border border-[#3B3B3B]'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

      </div>

      {/* Main Leaderboard Table / Card List */}
      <div className="rounded-3xl border border-[#3B3B3B] bg-[#071326] overflow-hidden shadow-xl">
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#3B3B3B] bg-[#0B1D3A] font-mono text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 text-center w-16">RANK</th>
                <th className="py-3.5 px-4">ATLET ESPORTS & IGN</th>
                <th className="py-3.5 px-4">GAMESKII ID</th>
                <th className="py-3.5 px-4">KAB / KOTA</th>
                <th className="py-3.5 px-4">PRIMARY ROLE</th>
                <th className="py-3.5 px-4 text-center">MATCHES</th>
                <th className="py-3.5 px-4 text-center">WIN-RATE</th>
                <th className="py-3.5 px-4 text-right">POIN ELO</th>
                <th className="py-3.5 px-4 text-center w-16">PASPOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3B3B3B]/60">
              {processedAthletes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Tidak ditemukan atlet dengan kriteria filter tersebut.
                  </td>
                </tr>
              ) : (
                processedAthletes.map((ath, idx) => {
                  const rank = idx + 1;
                  const tier = getEloTier(ath.elo_points);
                  const winRate = ath.matches_played > 0 
                    ? Math.round((ath.wins / ath.matches_played) * 100) 
                    : 0;

                  return (
                    <tr
                      key={ath.id}
                      onClick={() => setModalAthlete(ath)}
                      className="hover:bg-[#0B1D3A]/60 transition-colors cursor-pointer group"
                    >
                      {/* Rank */}
                      <td className="py-4 px-4 text-center">
                        {rank === 1 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#C8A75E] font-display font-black text-[#0B1D3A] text-base shadow-sm">
                            1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-300 font-display font-bold text-slate-900 text-base">
                            2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-700 font-display font-bold text-amber-100 text-base">
                            3
                          </span>
                        ) : (
                          <span className="font-mono font-semibold text-slate-400">#{rank}</span>
                        )}
                      </td>

                      {/* Athlete IGN & Real Name */}
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-bold text-sm text-white group-hover:text-[#DFCA88] transition-colors">
                            {ath.ign}
                          </p>
                          <p className="text-[11px] text-slate-300 truncate max-w-[180px]">
                            {ath.full_name} {ath.team_name ? `· ${ath.team_name}` : ''}
                          </p>
                        </div>
                      </td>

                      {/* Gameskii DIY ID */}
                      <td className="py-4 px-4 font-mono text-[#DFCA88] font-medium">
                        {ath.gameskii_id}
                      </td>

                      {/* Regency */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#0B1D3A] px-2 py-1 text-[11px] font-semibold text-slate-200 border border-[#3B3B3B]">
                          <MapPin className="h-3 w-3 text-[#C8A75E]" />
                          <span>{ath.regency}</span>
                        </span>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-300">
                          <Crosshair className="h-3.5 w-3.5 text-slate-400" />
                          <span>{ath.role}</span>
                        </span>
                      </td>

                      {/* Matches */}
                      <td className="py-4 px-4 text-center font-mono font-medium text-slate-300 tabular-nums">
                        {ath.matches_played}
                      </td>

                      {/* Win Rate */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-mono font-bold text-emerald-400 tabular-nums">
                          {winRate}%
                        </span>
                      </td>

                      {/* ELO Points & Tier */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className="font-mono text-sm font-black text-[#DFCA88] tabular-nums">
                            {ath.elo_points}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {tier.name}
                          </span>
                        </div>
                      </td>

                      {/* Card Action */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-[#0B1D3A] text-slate-400 group-hover:text-[#DFCA88] group-hover:bg-[#3B3B3B] transition-colors">
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards list */}
        <div className="md:hidden divide-y divide-[#3B3B3B]">
          {processedAthletes.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Tidak ditemukan atlet dengan kriteria filter tersebut.
            </div>
          ) : (
            processedAthletes.map((ath, idx) => {
              const rank = idx + 1;
              const winRate = ath.matches_played > 0 
                ? Math.round((ath.wins / ath.matches_played) * 100) 
                : 0;

              return (
                <div
                  key={ath.id}
                  onClick={() => setModalAthlete(ath)}
                  className="p-4 hover:bg-[#0B1D3A]/50 active:bg-[#0B1D3A] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-3">
                    
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-display text-base font-bold ${
                        rank === 1 
                          ? 'bg-[#C8A75E] text-[#0B1D3A] font-black' 
                          : rank === 2 
                          ? 'bg-slate-300 text-slate-950' 
                          : rank === 3 
                          ? 'bg-amber-700 text-white' 
                          : 'bg-[#0B1D3A] text-slate-400 font-mono text-xs border border-[#3B3B3B]'
                      }`}>
                        {rank <= 3 ? rank : `#${rank}`}
                      </span>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-white">{ath.ign}</h4>
                          <span className="text-[10px] font-mono text-[#DFCA88]">{ath.regency_code}</span>
                        </div>
                        <p className="text-xs text-slate-300">{ath.full_name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-base font-black text-[#DFCA88] tabular-nums">
                        {ath.elo_points} <span className="text-[10px] text-slate-400">PTS</span>
                      </p>
                      <p className="text-[11px] font-mono text-emerald-400">WR {winRate}%</p>
                    </div>

                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#3B3B3B]">
                    <span>{ath.role} · {ath.primary_game}</span>
                    <span className="font-mono text-[#DFCA88] text-[10px]">{ath.gameskii_id}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Modal for Athlete Passport Card Preview */}
      {modalAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl my-6">
            <button
              onClick={() => setModalAthlete(null)}
              className="absolute -top-11 right-0 p-2 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 bg-[#071326] px-3 py-1.5 rounded-xl border border-[#3B3B3B]"
            >
              <span>✕ Tutup Paspor</span>
            </button>
            <AthletePassportCard athlete={modalAthlete} />
          </div>
        </div>
      )}

    </div>
  );
};
