import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AthleteProfile, MatchSubmission } from '../types';
import { PILOT_FREE_FIRE_ATHLETES } from '../data/pilot';

// Keys from env or localStorage
const ENV_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const STORAGE_KEY_URL = 'gameskii_supabase_url';
const STORAGE_KEY_ANON = 'gameskii_supabase_anon_key';

export function getStoredSupabaseConfig() {
  const url = localStorage.getItem(STORAGE_KEY_URL) || ENV_URL;
  const anonKey = localStorage.getItem(STORAGE_KEY_ANON) || ENV_ANON_KEY;
  return { url, anonKey, isConfigured: Boolean(url && anonKey) };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  if (url && anonKey) {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
  }
}

// Singleton client instance
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getStoredSupabaseConfig();
  if (!isConfigured) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}

// Local mock persistence for instant out-of-the-box operation
const LOCAL_STORAGE_ATHLETES = 'gameskii_athletes_data_ff_pilot_v3';
const LOCAL_STORAGE_MATCHES = 'gameskii_matches_data_ff_pilot_v3';
const LOCAL_STORAGE_CURRENT_USER = 'gameskii_current_user_ff_pilot_v3';

export function getLocalAthletes(): AthleteProfile[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ATHLETES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(LOCAL_STORAGE_ATHLETES, JSON.stringify(PILOT_FREE_FIRE_ATHLETES));
  return PILOT_FREE_FIRE_ATHLETES;
}

export function saveLocalAthletes(athletes: AthleteProfile[]) {
  localStorage.setItem(LOCAL_STORAGE_ATHLETES, JSON.stringify(athletes));
}

export function getLocalMatches(): MatchSubmission[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MATCHES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  // No fabricated Verified matches. Imported podium history lives in pilot-free-fire.json.
  localStorage.setItem(LOCAL_STORAGE_MATCHES, '[]');
  return [];
}

export function saveLocalMatches(matches: MatchSubmission[]) {
  localStorage.setItem(LOCAL_STORAGE_MATCHES, JSON.stringify(matches));
}

export function getLocalActiveAthlete(): AthleteProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  // Never auto-login as a real participant imported from a tournament.
  return null;
}

export function setLocalActiveAthlete(athlete: AthleteProfile | null) {
  if (athlete) {
    localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(athlete));
  } else {
    localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER);
  }
}

export const saveLocalActiveAthlete = setLocalActiveAthlete;

// Complete copyable SQL Schema for Supabase
export const SUPABASE_SQL_SCHEMA = `-- ==========================================================
-- GAMESKII MVP: DIY ESPORTS PASSPORT & LEADERBOARD SCHEMA
-- Midnight-Navy Esports System with DIY Format (DIY-REGENCY-XXXX)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==========================================================

-- 1. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    ign TEXT NOT NULL,
    game_id TEXT NOT NULL,
    regency TEXT NOT NULL CHECK (regency IN ('Sleman', 'Bantul', 'Yogyakarta', 'Gunungkidul', 'Kulon Progo', 'Belum Terverifikasi')),
    regency_code TEXT NOT NULL CHECK (regency_code IN ('SLM', 'BTL', 'YOG', 'GKD', 'KLP', 'UNK')),
    role TEXT NOT NULL,
    primary_game TEXT NOT NULL DEFAULT 'Mobile Legends',
    whatsapp TEXT NOT NULL,
    gameskii_id TEXT UNIQUE NOT NULL, -- Format: DIY-SLM-8829
    elo_points INTEGER NOT NULL DEFAULT 1200,
    matches_played INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    rank_tier TEXT NOT NULL DEFAULT 'Challenger DIY',
    team_name TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create MATCHES Table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    player_ign TEXT NOT NULL,
    gameskii_id TEXT NOT NULL,
    regency TEXT NOT NULL,
    match_type TEXT NOT NULL CHECK (match_type IN ('BePro Series', 'Tournament by Game Developer', 'Verified by ESI')),
    game_name TEXT NOT NULL DEFAULT 'Mobile Legends',
    result TEXT NOT NULL CHECK (result IN ('#1', '#2', '#3')),
    rank_position INTEGER NOT NULL DEFAULT 1 CHECK (rank_position IN (1,2,3)),
    kills INTEGER NOT NULL DEFAULT 0,
    deaths INTEGER NOT NULL DEFAULT 0,
    assists INTEGER NOT NULL DEFAULT 0,
    proof_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending Review' CHECK (status IN ('Verified', 'Pending Review', 'Disputed')),
    dispute_reason TEXT,
    disputed_by TEXT,
    disputed_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
-- No public SELECT on private profiles: WhatsApp and raw game ID are personal data.
CREATE POLICY "Users may read their own private profiles"
ON public.profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Matches Policies
CREATE POLICY "Users may read their own submissions"
ON public.matches FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own match submissions" 
ON public.matches FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Regular users may dispute, but may NOT self-verify or change verified records.
-- Production verifier must be an authenticated trusted server/role, not the demo button.
CREATE POLICY "Users can dispute their own pending submissions"
ON public.matches FOR UPDATE
USING (auth.uid() = user_id AND status = 'Pending Review')
WITH CHECK (auth.uid() = user_id AND status IN ('Pending Review','Disputed'));

-- 4. CREATE STORAGE BUCKET: match-proofs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('match-proofs', 'match-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for match-proofs bucket
CREATE POLICY "Public Access for Match Proofs" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'match-proofs');

CREATE POLICY "Authenticated Athletes can upload match proofs" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'match-proofs' AND auth.role() = 'authenticated');

-- 5. FUNCTION & TRIGGER: Auto-calculate ELO on tournament verification
CREATE OR REPLACE FUNCTION public.handle_tournament_verification()
RETURNS TRIGGER AS $$
DECLARE
    delta INTEGER := 0;
    is_win BOOLEAN := false;
BEGIN
    IF (NEW.status = 'Verified' AND (OLD.status IS DISTINCT FROM 'Verified')) THEN
        -- Calculate point delta by rank
        IF (NEW.result = '#1' OR NEW.rank_position = 1) THEN
            delta := 50;
            is_win := true;
        ELSIF (NEW.result = '#2' OR NEW.rank_position = 2) THEN
            delta := 35;
            is_win := true;
        ELSIF (NEW.result = '#3' OR NEW.rank_position = 3) THEN
            delta := 25;
            is_win := true;
        ELSE
            -- Legacy non-podium positions never receive points.
            RETURN NEW;
        END IF;

        UPDATE public.profiles
        SET 
            matches_played = matches_played + 1,
            wins = CASE WHEN is_win THEN wins + 1 ELSE wins END,
            elo_points = GREATEST(800, elo_points + delta),
            rank_tier = CASE 
                WHEN (elo_points + delta) >= 1600 THEN 'Grand Master DIY'
                WHEN (elo_points + delta) >= 1400 THEN 'Master DIY'
                WHEN (elo_points + delta) >= 1200 THEN 'Challenger DIY'
                WHEN (elo_points + delta) >= 1000 THEN 'Prospect DIY'
                ELSE 'Rookie DIY'
            END,
            updated_at = timezone('utc'::text, now())
        WHERE gameskii_id = NEW.gameskii_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_tournament_verified
    AFTER UPDATE OF status ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_tournament_verification();
`;
