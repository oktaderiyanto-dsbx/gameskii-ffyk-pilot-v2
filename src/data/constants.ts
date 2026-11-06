import { GameName, GameRole, Regency, RegencyCode } from '../types';

export const REGENCY_OPTIONS: { name: Regency; code: RegencyCode; badgeColor: string }[] = [
  { name: 'Sleman', code: 'SLM', badgeColor: 'bg-[#C8A75E]/15 text-[#DFCA88] border-[#C8A75E]/30' },
  { name: 'Bantul', code: 'BTL', badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  { name: 'Yogyakarta', code: 'YOG', badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { name: 'Gunungkidul', code: 'GKD', badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { name: 'Kulon Progo', code: 'KLP', badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
];

export const GAME_OPTIONS: GameName[] = [
  'Mobile Legends',
  'Free Fire',
  'PUBG Mobile',
  'e-Football Console',
];

export const MLBB_ROLES: GameRole[] = ['Jungler', 'Roamer', 'Midlaner', 'Goldlaner', 'Explaner'];
export const FREE_FIRE_ROLES: GameRole[] = ['Rusher', 'Flanker', 'Support', 'Sniper'];
export const PUBGM_ROLES: GameRole[] = ['Fragger', 'Scout', 'In-Game Leader (IGL)', 'Support', 'Sniper'];
export const EFOOTBALL_ROLES: GameRole[] = ['Striker', 'Midlaner', 'Support'];

export function getRolesByGame(game: GameName): GameRole[] {
  switch (game) {
    case 'Mobile Legends': return MLBB_ROLES;
    case 'Free Fire': return FREE_FIRE_ROLES;
    case 'PUBG Mobile': return PUBGM_ROLES;
    case 'e-Football Console': return EFOOTBALL_ROLES;
    default: return MLBB_ROLES;
  }
}

export function getRegencyCode(regency: Regency): RegencyCode {
  switch (regency) {
    case 'Sleman': return 'SLM';
    case 'Bantul': return 'BTL';
    case 'Yogyakarta': return 'YOG';
    case 'Gunungkidul': return 'GKD';
    case 'Kulon Progo': return 'KLP';
    case 'Belum Terverifikasi': return 'UNK';
    default: return 'YOG';
  }
}

// User specified format: DIY-[REGENCY_CODE]-[4_RANDOM_DIGITS] (e.g., DIY-SLM-8829)
export function generateGameskiiId(regency: Regency): string {
  const code = getRegencyCode(regency);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `DIY-${code}-${randomNum}`;
}

export function getEloTier(elo: number): { name: string; color: string; bg: string; border: string } {
  if (elo >= 1600) {
    return { 
      name: 'Grand Master DIY', 
      color: 'text-[#DFCA88]', 
      bg: 'bg-[#C8A75E]/20', 
      border: 'border-[#C8A75E]/60' 
    };
  } else if (elo >= 1400) {
    return { 
      name: 'Master DIY', 
      color: 'text-amber-300', 
      bg: 'bg-amber-950/60', 
      border: 'border-amber-500/50' 
    };
  } else if (elo >= 1200) {
    return { 
      name: 'Challenger DIY', 
      color: 'text-blue-300', 
      bg: 'bg-blue-950/60', 
      border: 'border-blue-500/50' 
    };
  } else if (elo >= 1000) {
    return { 
      name: 'Prospect DIY', 
      color: 'text-slate-300', 
      bg: 'bg-slate-800/60', 
      border: 'border-slate-600' 
    };
  }
  return { 
    name: 'Rookie DIY', 
    color: 'text-slate-400', 
    bg: 'bg-slate-900/60', 
    border: 'border-slate-800' 
  };
}

// Achievement points only, NOT opponent-adjusted Elo.
// Any legacy result outside the podium receives zero points.
export function getRankEloDelta(rank: number): number {
  if (rank === 1) return 50;
  if (rank === 2) return 35;
  if (rank === 3) return 25;
  return 0;
}
