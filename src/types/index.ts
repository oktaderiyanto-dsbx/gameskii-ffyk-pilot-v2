export type Regency = 'Sleman' | 'Bantul' | 'Yogyakarta' | 'Gunungkidul' | 'Kulon Progo' | 'Belum Terverifikasi';

export type RegencyCode = 'SLM' | 'BTL' | 'YOG' | 'GKD' | 'KLP' | 'UNK';

export type GameName = 'Mobile Legends' | 'Free Fire' | 'PUBG Mobile' | 'e-Football Console';

export type GameRole = 
  | 'Jungler'
  | 'Roamer'
  | 'Midlaner'
  | 'Goldlaner'
  | 'Explaner'
  | 'Rusher'
  | 'Flanker'
  | 'Support'
  | 'Sniper'
  | 'Fragger'
  | 'Scout'
  | 'In-Game Leader (IGL)'
  | 'Striker'
  | 'Belum Ditentukan';

export type MatchType = 
  | 'BePro Series'
  | 'Tournament by Game Developer'
  | 'Verified by ESI';

export type TournamentRank = 
  | '#1'
  | '#2'
  | '#3'
  | '#4'
  | '#5-#8'
  | '#9-#16'
  | 'Win'
  | 'Loss';

export type MatchResult = TournamentRank;

export type MatchStatus = 'Verified' | 'Pending Review' | 'Disputed';

export interface AthleteProfile {
  id: string;
  user_id: string;
  full_name: string;
  ign: string;
  game_id: string;
  regency: Regency;
  regency_code: RegencyCode;
  role: GameRole;
  primary_game: GameName;
  whatsapp: string;
  gameskii_id: string; // Format: DIY-[REGENCY_CODE]-[4_RANDOM_DIGITS]
  elo_points: number;
  matches_played: number;
  wins: number;
  avatar_url?: string;
  rank_tier: string;
  team_name?: string;
  created_at: string;
  updated_at?: string;
  // Provisional pilot source fields, not proof of official eligibility.
  uid_fingerprint?: string;
  seed_status?: 'PROVISIONAL_ROSTER_MATCH';
  source_event_ids?: string[];
}

export interface MatchSubmission {
  id: string;
  user_id: string;
  player_ign: string;
  gameskii_id: string;
  regency: Regency;
  match_type: MatchType;
  game_name: GameName;
  result: TournamentRank;
  rank_position?: number; // New submissions: 1 to 3; legacy 4-16 yield zero points
  kills: number;
  deaths: number;
  assists: number;
  proof_url: string;
  status: MatchStatus;
  dispute_reason?: string;
  disputed_by?: string;
  disputed_at?: string;
  verified_at?: string;
  created_at: string;
}

export interface RegencyInfo {
  name: Regency;
  code: RegencyCode;
  color: string;
}
