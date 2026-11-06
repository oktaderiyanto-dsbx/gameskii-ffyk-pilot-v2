import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Shield, Sparkles, X, ArrowRight, Gamepad2, MapPin } from 'lucide-react';
import { AthleteProfile, GameName, GameRole, Regency } from '../types';
import { 
  GAME_OPTIONS, 
  generateGameskiiId, 
  getEloTier, 
  getRegencyCode, 
  getRolesByGame, 
  REGENCY_OPTIONS 
} from '../data/constants';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: AthleteProfile) => void;
  initialProfile?: AthleteProfile | null;
  userId?: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSaveProfile,
  initialProfile,
  userId = 'usr-' + Math.random().toString(36).substring(2, 9),
}) => {
  const [fullName, setFullName] = useState(initialProfile?.full_name || '');
  const [ign, setIgn] = useState(initialProfile?.ign || '');
  const [gameId, setGameId] = useState(initialProfile?.game_id || '');
  const [regency, setRegency] = useState<Regency>(initialProfile?.regency || 'Sleman');
  const [primaryGame, setPrimaryGame] = useState<GameName>(initialProfile?.primary_game || 'Mobile Legends');
  const [role, setRole] = useState<GameRole>(initialProfile?.role || 'Jungler');
  const [whatsapp, setWhatsapp] = useState(initialProfile?.whatsapp || '');
  const [teamName, setTeamName] = useState(initialProfile?.team_name || '');
  
  const [previewId, setPreviewId] = useState(initialProfile?.gameskii_id || generateGameskiiId('Sleman'));
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialProfile) {
      setFullName(initialProfile.full_name);
      setIgn(initialProfile.ign);
      setGameId(initialProfile.game_id);
      setRegency(initialProfile.regency);
      setPrimaryGame(initialProfile.primary_game);
      setRole(initialProfile.role);
      setWhatsapp(initialProfile.whatsapp);
      setTeamName(initialProfile.team_name || '');
      setPreviewId(initialProfile.gameskii_id);
    } else {
      setPreviewId(generateGameskiiId(regency));
    }
  }, [initialProfile, regency]);

  if (!isOpen) return null;

  const currentRoles = getRolesByGame(primaryGame);

  const handleRegencyChange = (newRegency: Regency) => {
    setRegency(newRegency);
    if (!initialProfile) {
      setPreviewId(generateGameskiiId(newRegency));
    }
  };

  const handleGameChange = (game: GameName) => {
    setPrimaryGame(game);
    const available = getRolesByGame(game);
    setRole(available[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Nama lengkap sesuai KTP/Kartu Pelajar wajib diisi.');
      return;
    }
    if (!ign.trim()) {
      setErrorMsg('In-Game Name (IGN) wajib diisi.');
      return;
    }
    if (!gameId.trim()) {
      setErrorMsg('ID Game & Server wajib diisi (contoh: 38291048 (2094)).');
      return;
    }
    if (!whatsapp.trim() || whatsapp.length < 9) {
      setErrorMsg('Nomor WhatsApp aktif wajib diisi untuk verifikasi turnamen.');
      return;
    }

    const regCode = getRegencyCode(regency);
    const newGameskiiId = initialProfile?.gameskii_id || previewId;

    const savedProfile: AthleteProfile = {
      id: initialProfile?.id || 'ath-' + Date.now(),
      user_id: initialProfile?.user_id || userId,
      full_name: fullName.trim(),
      ign: ign.trim(),
      game_id: gameId.trim(),
      regency,
      regency_code: regCode,
      role,
      primary_game: primaryGame,
      whatsapp: whatsapp.trim(),
      gameskii_id: newGameskiiId,
      elo_points: initialProfile?.elo_points || 1200,
      matches_played: initialProfile?.matches_played || 0,
      wins: initialProfile?.wins || 0,
      rank_tier: initialProfile?.rank_tier || getEloTier(initialProfile?.elo_points || 1200).name,
      team_name: teamName.trim(),
      created_at: initialProfile?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Confetti celebration with gold & navy
    try {
      confetti({
        particleCount: 70,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#DFCA88', '#C8A75E', '#0B1D3A', '#FFFFFF'],
      });
    } catch (e) {
      console.warn(e);
    }

    onSaveProfile(savedProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 rounded-3xl bg-[#0B1D3A] border border-[#3B3B3B] shadow-2xl p-6 sm:p-8">
        
        {/* Close Button */}
        {initialProfile && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#071326] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="text-left">
          <div className="inline-flex items-center gap-2 rounded-lg bg-[#C8A75E]/15 border border-[#C8A75E]/30 px-3 py-1 text-xs font-semibold text-[#DFCA88]">
            <Sparkles className="h-3.5 w-3.5 text-[#C8A75E]" />
            <span>Pendaftaran Paspor Resmi Atlet ESI DIY</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white font-display">
            {initialProfile ? 'PERBARUI PASPOR ATLET' : 'AKTIVASI PASPOR ATLET ESPORTS DIY'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Lengkapi data diri resmi untuk penerbitan DIY Athlete Card dan pencatatan poin atlet di turnamen resmi D.I. Yogyakarta.
          </p>
        </div>

        {/* Preview of Generated DIY ID */}
        <div className="mt-5 p-3 rounded-2xl bg-[#071326] border border-[#C8A75E]/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">ESTIMASI DIY ATHLETE ID</span>
            <p className="font-mono text-base font-bold text-[#DFCA88] tracking-wider">
              {previewId}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">WILAYAH</span>
            <p className="text-xs font-semibold text-slate-200">{regency}</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-left">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Nama Lengkap <span className="text-[#C8A75E]">*</span> <span className="text-[11px] text-slate-400 font-normal">(Sesuai KTP / Kartu Pelajar)</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Bagus Arya Pratama"
              className="w-full rounded-xl bg-[#071326] border border-[#3B3B3B] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#C8A75E] focus:outline-none"
            />
          </div>

          {/* Game Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Game Name <span className="text-[#C8A75E]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GAME_OPTIONS.map((game) => (
                <button
                  key={game}
                  type="button"
                  onClick={() => handleGameChange(game)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    primaryGame === game
                      ? 'border-[#C8A75E] bg-[#C8A75E]/20 text-[#DFCA88]'
                      : 'border-[#3B3B3B] bg-[#071326] text-slate-400 hover:text-white'
                  }`}
                >
                  <Gamepad2 className="h-3.5 w-3.5" />
                  <span className="truncate">{game}</span>
                </button>
              ))}
            </div>
          </div>

          {/* IGN & Server ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                In-Game Name (IGN) <span className="text-[#C8A75E]">*</span>
              </label>
              <input
                type="text"
                required
                value={ign}
                onChange={(e) => setIgn(e.target.value)}
                placeholder="Contoh: Xypher.Jogja"
                className="w-full rounded-xl bg-[#071326] border border-[#3B3B3B] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#C8A75E] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                ID & Server Game <span className="text-[#C8A75E]">*</span>
              </label>
              <input
                type="text"
                required
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                placeholder="Contoh: 392019482 (2094)"
                className="w-full rounded-xl bg-[#071326] border border-[#3B3B3B] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#C8A75E] focus:outline-none"
              />
            </div>
          </div>

          {/* Regency Dropdown & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Kabupaten / Kota DIY <span className="text-[#C8A75E]">*</span>
              </label>
              <select
                value={regency}
                onChange={(e) => handleRegencyChange(e.target.value as Regency)}
                className="w-full rounded-xl bg-[#071326] border border-[#3B3B3B] px-3.5 py-2.5 text-sm text-white focus:border-[#C8A75E] focus:outline-none"
              >
                {REGENCY_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.name} className="bg-[#0B1D3A]">
                    {opt.name} ({opt.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Primary Game Role <span className="text-[#C8A75E]">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as GameRole)}
                className="w-full rounded-xl bg-[#071326] border border-[#3B3B3B] px-3.5 py-2.5 text-sm text-white focus:border-[#C8A75E] focus:outline-none"
              >
                {currentRoles.map((r) => (
                  <option key={r} value={r} className="bg-[#0B1D3A]">
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* WhatsApp & Team Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Nomor WhatsApp Aktif <span className="text-[#C8A75E]">*</span>
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="08123456789"
                className="w-full rounded-xl bg-[#071326] border border-[#3B3B3B] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#C8A75E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Nama Tim / Komunitas <span className="text-slate-500">(Opsional)</span>
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Contoh: Sleman Falcons ESI"
                className="w-full rounded-xl bg-[#071326] border border-[#3B3B3B] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#C8A75E] focus:outline-none"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#DFCA88] via-[#C8A75E] to-[#9F7E36] text-[#0B1D3A] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-[#C8A75E]/20 active:scale-[0.99] transition-all"
            >
              <span>{initialProfile ? 'Simpan Perubahan Paspor' : 'Terbitkan Paspor Digital DIY'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
