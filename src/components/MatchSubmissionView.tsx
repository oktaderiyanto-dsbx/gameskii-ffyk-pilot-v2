import React, { useState } from 'react';
import { 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Trophy, 
  FileText, 
  Check, 
  X, 
  Eye, 
  Sparkles,
  Medal,
  Award
} from 'lucide-react';
import { AthleteProfile, GameName, MatchStatus, MatchSubmission, MatchType, TournamentRank } from '../types';
import { getSupabaseClient } from '../lib/supabase';
import { GAME_OPTIONS, getRankEloDelta } from '../data/constants';

interface MatchSubmissionViewProps {
  activeAthlete: AthleteProfile | null;
  matches: MatchSubmission[];
  onSubmitMatch: (match: Omit<MatchSubmission, 'id' | 'created_at'>) => void;
  onDisputeMatch: (matchId: string, reason: string, disputedBy: string) => void;
  onVerifyMatch: (matchId: string) => void;
  onOpenOnboarding: () => void;
}

export const MatchSubmissionView: React.FC<MatchSubmissionViewProps> = ({
  activeAthlete,
  matches,
  onSubmitMatch,
  onDisputeMatch,
  onVerifyMatch,
  onOpenOnboarding,
}) => {
  // Form State
  const [matchType, setMatchType] = useState<MatchType>('Verified by ESI');
  const [gameName, setGameName] = useState<GameName>(activeAthlete?.primary_game || 'Mobile Legends');
  const [selectedRank, setSelectedRank] = useState<number>(1); // Podium only (rank 1-3)
  const [kills, setKills] = useState<number>(8);
  const [deaths, setDeaths] = useState<number>(2);
  const [assists, setAssists] = useState<number>(10);
  const [proofUrl, setProofUrl] = useState<string>('');
  const [proofFileName, setProofFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Filter State for Recent Submissions
  const [statusFilter, setStatusFilter] = useState<'All' | MatchStatus>('All');
  
  // Dispute Modal State
  const [selectedDisputeMatch, setSelectedDisputeMatch] = useState<MatchSubmission | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputedByName, setDisputedByName] = useState(activeAthlete ? activeAthlete.ign : 'Opponent');

  // Preview Proof Modal
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);

  // KDA calculation
  const calculatedKda = ((kills + assists) / Math.max(1, deaths)).toFixed(2);
  const eloDelta = getRankEloDelta(selectedRank);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('File bukti turnamen harus berupa gambar (JPG, PNG, atau WebP).');
      return;
    }

    setProofFileName(file.name);
    setIsUploading(true);
    setFormError('');

    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        // Real Supabase storage upload to 'match-proofs'
        const fileExt = file.name.split('.').pop();
        const filePath = `${activeAthlete?.gameskii_id || 'guest'}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('match-proofs')
          .upload(filePath, file);

        if (uploadError) {
          console.warn('Supabase storage upload error, fallback to local object URL:', uploadError);
          const reader = new FileReader();
          reader.onload = () => {
            setProofUrl(reader.result as string);
            setIsUploading(false);
          };
          reader.readAsDataURL(file);
          return;
        }

        const { data } = supabase.storage.from('match-proofs').getPublicUrl(filePath);
        setProofUrl(data.publicUrl);
      } else {
        // Fallback: Read as base64 Data URL for local persistence
        const reader = new FileReader();
        reader.onload = () => {
          setProofUrl(reader.result as string);
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error(err);
      setFormError('Gagal memproses file screenshot bukti match.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!activeAthlete) {
      setFormError('Harap lengkapi dan aktifkan Paspor Atlet terlebih dahulu.');
      return;
    }

    if (!proofUrl) {
      setFormError('Screenshot bukti turnamen (Scoreboard endgame/standing) wajib diunggah.');
      return;
    }

    if (![1, 2, 3].includes(selectedRank)) {
      setFormError('Hanya peringkat 1, 2, dan 3 yang dapat diajukan.');
      return;
    }

    const rankLabel: TournamentRank = `#${selectedRank}` as TournamentRank;

    onSubmitMatch({
      user_id: activeAthlete.user_id,
      player_ign: activeAthlete.ign,
      gameskii_id: activeAthlete.gameskii_id,
      regency: activeAthlete.regency,
      match_type: matchType,
      game_name: gameName,
      result: rankLabel,
      rank_position: selectedRank,
      kills: Number(kills) || 0,
      deaths: Number(deaths) || 0,
      assists: Number(assists) || 0,
      proof_url: proofUrl,
      status: 'Pending Review',
    });

    setFormSuccess(`Hasil Turnamen (Rank #${selectedRank}) berhasil di-upload dan menunggu verifikasi wasit ESI DIY!`);
    setProofUrl('');
    setProofFileName('');
    setKills(5);
    setDeaths(2);
    setAssists(7);

    setTimeout(() => {
      setFormSuccess('');
    }, 4000);
  };

  const handleConfirmDispute = () => {
    if (!selectedDisputeMatch) return;
    if (!disputeReason.trim()) return;

    onDisputeMatch(selectedDisputeMatch.id, disputeReason.trim(), disputedByName);
    setSelectedDisputeMatch(null);
    setDisputeReason('');
  };

  const filteredMatches = matches.filter((m) => {
    if (statusFilter === 'All') return true;
    return m.status === statusFilter;
  });

  // New submissions: only podium positions are eligible for ranking.
  const rankOptions = [1, 2, 3];

  return (
    <div className="space-y-8">
      
      {/* Intro Banner */}
      <div className="rounded-3xl border border-[#3B3B3B] bg-gradient-to-r from-[#102548] via-[#0B1D3A] to-[#071326] p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-lg bg-[#C8A75E]/15 border border-[#C8A75E]/30 px-3 py-1 text-xs font-semibold text-[#DFCA88]">
            <Trophy className="h-3.5 w-3.5 text-[#C8A75E]" />
            <span>Sistem Validasi Turnamen Resmi DIY</span>
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-white font-display">
            SUBMISSION HASIL TURNAMEN & VERIFIKASI WASIT
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Upload bukti standing atau scoreboard endgame turnamen (BePro Series, Tournament by Game Developer, Verified by ESI).
          </p>
        </div>
      </div>

      {/* Grid: Left = Submission Form, Right = Recent Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Tournament Result Form */}
        <div className="lg:col-span-5 rounded-3xl border border-[#3B3B3B] bg-[#071326] p-6 sm:p-7 shadow-xl">
          
          <div className="flex items-center justify-between border-b border-[#3B3B3B] pb-4 mb-5">
            <div>
              <h2 className="text-xl font-bold text-white font-display">UPLOAD HASIL TURNAMEN</h2>
              <p className="text-xs text-slate-400">Peringkat 1-16 & screenshot standing resmi</p>
            </div>
            {activeAthlete && (
              <span className="font-mono text-xs text-[#DFCA88] bg-[#C8A75E]/15 px-2 py-1 rounded-md border border-[#C8A75E]/30">
                {activeAthlete.gameskii_id}
              </span>
            )}
          </div>

          {!activeAthlete ? (
            <div className="text-center py-8">
              <ShieldAlert className="h-12 w-12 text-[#C8A75E] mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">Paspor Belum Diaktifkan</h3>
              <p className="text-xs text-slate-300 mt-1 mb-4">
                Anda harus melengkapi profil paspor atlet DIY terlebih dahulu sebelum mengunggah hasil turnamen.
              </p>
              <button
                onClick={onOpenOnboarding}
                className="px-4 py-2.5 rounded-xl bg-[#C8A75E] hover:bg-[#DFCA88] text-[#0B1D3A] font-bold text-xs shadow-lg shadow-[#C8A75E]/20"
              >
                Aktivasi Paspor Sekarang
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Match Type Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Kategori Turnamen <span className="text-[#C8A75E]">*</span>
                </label>
                <select
                  value={matchType}
                  onChange={(e) => setMatchType(e.target.value as MatchType)}
                  className="w-full rounded-xl bg-[#0B1D3A] border border-[#3B3B3B] px-3.5 py-2.5 text-xs text-white focus:border-[#C8A75E] focus:outline-none"
                >
                  <option value="BePro Series">BePro Series (Komunitas & Cafe DIY)</option>
                  <option value="Tournament by Game Developer">Tournament by Game Developer (Official Publisher)</option>
                  <option value="Verified by ESI">Verified by ESI (Kejurda & Turnamen Resmi ESI DIY)</option>
                </select>
              </div>

              {/* Game Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Game Name <span className="text-[#C8A75E]">*</span>
                </label>
                <select
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value as GameName)}
                  className="w-full rounded-xl bg-[#0B1D3A] border border-[#3B3B3B] px-3.5 py-2.5 text-xs text-white focus:border-[#C8A75E] focus:outline-none"
                >
                  {GAME_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Match Result: podium-only selector; existing layout and styling retained */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Peringkat Akhir Turnamen (Rank #1 - #3) <span className="text-[#C8A75E]">*</span>
                  </label>
                  <span className={`text-[11px] font-mono font-bold ${eloDelta > 0 ? 'text-[#DFCA88]' : 'text-rose-400'}`}>
                    Estimasi ELO: {eloDelta > 0 ? `+${eloDelta}` : eloDelta} Poin
                  </span>
                </div>

                {/* 3 podium rank selectors */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {rankOptions.map((rank) => {
                    const isSelected = selectedRank === rank;
                    return (
                      <button
                        key={rank}
                        type="button"
                        onClick={() => setSelectedRank(rank)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-[#C8A75E] border-[#DFCA88] text-[#0B1D3A] shadow-md shadow-[#C8A75E]/30 scale-105'
                            : rank === 1
                            ? 'bg-[#C8A75E]/20 border-[#C8A75E]/50 text-[#DFCA88] hover:bg-[#C8A75E]/30'
                            : 'bg-[#0B1D3A] border-[#3B3B3B] text-slate-300 hover:text-white hover:border-slate-500'
                        }`}
                      >
                        #{rank}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>#1 Champion (+50)</span>
                  <span>#2 Runner Up (+35)</span>
                  <span>#3 Third Place (+25)</span>
                </div>
              </div>

              {/* Personal KDA Inputs */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-200">
                    Statistik KDA Personal
                  </label>
                  <span className="text-[11px] font-mono text-[#DFCA88]">
                    KDA Ratio: <strong>{calculatedKda}</strong>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono">KILLS</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={kills}
                      onChange={(e) => setKills(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full rounded-xl bg-[#0B1D3A] border border-[#3B3B3B] px-3 py-2 text-center text-sm font-mono text-white focus:border-[#C8A75E] focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono">DEATHS</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={deaths}
                      onChange={(e) => setDeaths(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full rounded-xl bg-[#0B1D3A] border border-[#3B3B3B] px-3 py-2 text-center text-sm font-mono text-white focus:border-[#C8A75E] focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono">ASSISTS</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={assists}
                      onChange={(e) => setAssists(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full rounded-xl bg-[#0B1D3A] border border-[#3B3B3B] px-3 py-2 text-center text-sm font-mono text-white focus:border-[#C8A75E] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Screenshot File Uploader */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Screenshot Bukti Turnamen (Scoreboard / Standing) <span className="text-[#C8A75E]">*</span>
                </label>
                
                <div className="relative rounded-2xl border-2 border-dashed border-[#3B3B3B] hover:border-[#C8A75E]/60 bg-[#0B1D3A]/60 p-4 transition-colors text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  
                  {proofUrl ? (
                    <div className="space-y-2">
                      <div className="h-28 w-full rounded-xl overflow-hidden bg-[#071326] border border-[#3B3B3B] relative group">
                        <img 
                          src={proofUrl} 
                          alt="Screenshot Proof" 
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs font-semibold text-white">Ganti Foto</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-emerald-400 flex items-center justify-center gap-1">
                        <Check className="h-3 w-3" />
                        <span className="truncate max-w-[200px]">{proofFileName || 'Bukti siap diunggah'}</span>
                      </p>
                    </div>
                  ) : (
                    <div className="py-2">
                      <UploadCloud className="h-8 w-8 text-[#C8A75E] mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-slate-200">
                        {isUploading ? 'Mengunggah ke Supabase Storage...' : 'Ketuk untuk upload bukti screenshot'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Format PNG, JPG atau WebP (Storage Bucket: match-proofs)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#DFCA88] via-[#C8A75E] to-[#9F7E36] text-[#0B1D3A] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 shadow-md shadow-[#C8A75E]/20 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                <span>Upload & Ajukan Verifikasi Poin ELO</span>
              </button>

            </form>
          )}

        </div>

        {/* Right Section: Table of Recent Submissions */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#071326] p-4 rounded-2xl border border-[#3B3B3B]">
            <div>
              <h2 className="text-lg font-bold text-white font-display">DAFTAR HASIL TURNAMEN TERBARU</h2>
              <p className="text-xs text-slate-400">Status verifikasi turnamen dan pencatatan poin atlet DIY</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-[#0B1D3A] p-1 rounded-xl border border-[#3B3B3B] text-xs">
              {(['All', 'Verified', 'Pending Review', 'Disputed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-[#C8A75E]/20 text-[#DFCA88] border border-[#C8A75E]/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {status === 'All' ? 'Semua' : status}
                </button>
              ))}
            </div>
          </div>

          {/* List of Match Cards */}
          <div className="space-y-3">
            {filteredMatches.length === 0 ? (
              <div className="rounded-2xl border border-[#3B3B3B] bg-[#071326]/60 p-8 text-center">
                <FileText className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">Belum ada turnamen untuk filter ini</p>
                <p className="text-xs text-slate-500 mt-1">Upload hasil turnamen baru pada form di samping.</p>
              </div>
            ) : (
              filteredMatches.map((m) => {
                const rankNum = m.rank_position || parseInt(m.result.replace('#', '')) || 1;
                const delta = getRankEloDelta(rankNum);
                const kda = ((m.kills + m.assists) / Math.max(1, m.deaths)).toFixed(1);

                return (
                  <div
                    key={m.id}
                    className="rounded-2xl border border-[#3B3B3B] bg-[#071326] p-4 hover:border-[#C8A75E]/50 transition-colors shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      
                      {/* Left: Rank pill & player ign */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-lg font-black border ${
                            rankNum === 1
                              ? 'bg-[#C8A75E] text-[#0B1D3A] border-[#DFCA88]'
                              : rankNum <= 3
                              ? 'bg-[#C8A75E]/20 text-[#DFCA88] border-[#C8A75E]/50'
                              : 'bg-[#0B1D3A] text-slate-300 border-[#3B3B3B]'
                          }`}
                        >
                          #{rankNum}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{m.player_ign}</span>
                            <span className="font-mono text-[11px] text-[#DFCA88] bg-[#C8A75E]/15 px-1.5 py-0.5 rounded border border-[#C8A75E]/30">
                              {m.gameskii_id}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {m.match_type} · {m.regency}
                          </p>
                        </div>
                      </div>

                      {/* Right: Status Badge */}
                      <div className="flex flex-col items-end">
                        {m.status === 'Verified' && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            <span>Verified</span>
                          </span>
                        )}
                        {m.status === 'Pending Review' && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-950/50 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                            <Clock className="h-3 w-3 text-amber-400" />
                            <span>Pending Review</span>
                          </span>
                        )}
                        {m.status === 'Disputed' && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-950/50 px-2.5 py-0.5 text-[11px] font-bold text-rose-300">
                            <AlertTriangle className="h-3 w-3 text-rose-400" />
                            <span>Disputed</span>
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 mt-1">
                          {new Date(m.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>

                    </div>

                    {/* Stats strip */}
                    <div className="mt-3 grid grid-cols-4 rounded-xl bg-[#0B1D3A] p-2 text-center text-xs border border-[#3B3B3B]">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono">KDA</span>
                        <p className="font-mono font-bold text-[#DFCA88]">{m.kills}/{m.deaths}/{m.assists}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono">RATIO</span>
                        <p className="font-mono font-bold text-slate-200">{kda}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono">GAME</span>
                        <p className="font-semibold text-slate-300 truncate">{m.game_name}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono">ELO IMPACT</span>
                        <p className={`font-mono font-bold ${delta > 0 ? 'text-[#DFCA88]' : 'text-rose-400'}`}>
                          {delta > 0 ? `+${delta}` : delta} PTS
                        </p>
                      </div>
                    </div>

                    {/* Dispute notice if status is Disputed */}
                    {m.status === 'Disputed' && m.dispute_reason && (
                      <div className="mt-2.5 rounded-xl bg-rose-950/40 border border-rose-900/60 p-2.5 text-xs text-rose-300 flex items-start gap-2">
                        <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Sanggahan dari {m.disputed_by || 'Lawan'}:</p>
                          <p className="text-[11px] text-rose-200/90 mt-0.5">{m.dispute_reason}</p>
                        </div>
                      </div>
                    )}

                    {/* Action buttons on match card */}
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#3B3B3B] text-xs">
                      {/* View Proof Button */}
                      <button
                        onClick={() => setPreviewProofUrl(m.proof_url)}
                        className="inline-flex items-center gap-1 text-slate-300 hover:text-[#DFCA88] font-medium"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Lihat Bukti Scoreboard</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {/* Referee quick verify simulation button if pending */}
                        {m.status === 'Pending Review' && (
                          <button
                            onClick={() => onVerifyMatch(m.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#C8A75E]/20 border border-[#C8A75E]/50 px-2.5 py-1 text-[11px] font-bold text-[#DFCA88] hover:bg-[#C8A75E]/30 transition-colors"
                            title="Simulasi wasit turnamen memvalidasi skor"
                          >
                            <Sparkles className="h-3 w-3 text-[#C8A75E]" />
                            <span>Verifikasi Wasit</span>
                          </button>
                        )}

                        {/* Sanggah / Dispute Button */}
                        {m.status !== 'Disputed' && (
                          <button
                            onClick={() => {
                              setSelectedDisputeMatch(m);
                              setDisputeReason('');
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#0B1D3A] border border-[#3B3B3B] px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:border-rose-500/50 hover:bg-rose-950/40 transition-colors"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            <span>Report / Sanggah</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

      {/* Dispute Modal */}
      {selectedDisputeMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#0B1D3A] border border-[#3B3B3B] p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#3B3B3B]">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-bold text-white text-base">Ajukan Sanggahan Hasil Turnamen</h3>
              </div>
              <button
                onClick={() => setSelectedDisputeMatch(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4 text-xs text-slate-300">
              <p>
                Anda mengajukan sanggahan untuk submission dari <strong className="text-white">{selectedDisputeMatch.player_ign}</strong> ({selectedDisputeMatch.gameskii_id}).
              </p>
              <div className="mt-2 p-2.5 rounded-xl bg-[#071326] border border-[#3B3B3B] font-mono text-[11px]">
                Peringkat: {selectedDisputeMatch.result} · KDA: {selectedDisputeMatch.kills}/{selectedDisputeMatch.deaths}/{selectedDisputeMatch.assists}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Anda / Tim Penantang
                </label>
                <input
                  type="text"
                  value={disputedByName}
                  onChange={(e) => setDisputedByName(e.target.value)}
                  placeholder="Contoh: Wasit ESI / Kapten Tim Lawan"
                  className="w-full rounded-xl bg-[#071326] border border-[#3B3B3B] px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alasan Sanggahan <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Jelaskan ketidaksesuaian data (misal: peringkat standing ronde final tidak sesuai)"
                  className="w-full rounded-xl bg-[#071326] border border-[#3B3B3B] p-3 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedDisputeMatch(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDispute}
                disabled={!disputeReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs"
              >
                Kirim Sanggahan Resmi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proof Preview Modal */}
      {previewProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full rounded-2xl overflow-hidden bg-[#0B1D3A] border border-[#3B3B3B] shadow-2xl">
            <div className="p-3 bg-[#071326] flex items-center justify-between border-b border-[#3B3B3B]">
              <span className="text-xs font-bold text-slate-200">Tangkapan Layar Bukti Turnamen</span>
              <button
                onClick={() => setPreviewProofUrl(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-2 max-h-[75vh] overflow-auto flex items-center justify-center bg-black/60">
              <img
                src={previewProofUrl}
                alt="Proof Preview"
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
