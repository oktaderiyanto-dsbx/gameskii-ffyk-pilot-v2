/**
 * Read-only, privacy-minimized FFYK fixture from the audited 10 competitions.
 * This is a provisional demo ranking, not an official ESI or publisher certification.
 */
import pilot from './pilot-free-fire.json';
import type { AthleteProfile } from '../types';
import { getEloTier } from './constants';
import { getRankEloDelta } from './constants';

export const PILOT_FREE_FIRE_DATABASE = pilot;

// Aggregation keys by stable UID fingerprint, not by team name.
// One team move never erases or duplicates an individual's previous podium award.
const totals = new Map<string, { points: number; podiums: number; titles: number; events: Set<string> }>();
const seen = new Set<string>();
for (const award of pilot.achievement_attributions) {
  const dedup = `${award.uid_fingerprint}:${award.competition_id}:${award.division}`;
  if (seen.has(dedup) || award.status !== 'PROVISIONAL_ROSTER_MATCH') continue;
  seen.add(dedup);
  const prior = totals.get(award.uid_fingerprint) || { points: 0, podiums: 0, titles: 0, events: new Set<string>() };
  prior.points += getRankEloDelta(award.rank);
  prior.podiums += 1;
  prior.titles += award.rank === 1 ? 1 : 0;
  prior.events.add(award.competition_id);
  totals.set(award.uid_fingerprint, prior);
}
export const PILOT_FREE_FIRE_ATHLETES: AthleteProfile[] = pilot.athletes.map((p): AthleteProfile => {
  const t = totals.get(p.uid_fingerprint);
  const points = 1200 + (t?.points || 0);
  return {
    ...p,
    regency: 'Belum Terverifikasi',
    regency_code: 'UNK',
    role: 'Belum Ditentukan',
    primary_game: 'Free Fire',
    elo_points: points,
    matches_played: t?.podiums || 0,
    wins: t?.titles || 0,
    rank_tier: getEloTier(points).name,
    source_event_ids: [...(t?.events || [])],
    seed_status: 'PROVISIONAL_ROSTER_MATCH',
  };
}).sort((a,b) => b.elo_points - a.elo_points);
