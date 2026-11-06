-- GAMESKII FFYK PILOT: optional Supabase *read-only supporting database*.
-- Run pilot_schema.sql THEN pilot_seed.sql manually in Supabase SQL Editor.
-- The AI Studio prototype runs offline from src/data/pilot-free-fire.json.
-- THIS IS NOT a real identity certificate or official ranking.
-- No raw FF UID, phone, national ID, email, address, bank detail or payment proof.

CREATE TABLE IF NOT EXISTS public.pilot_competitions (
  id text PRIMARY KEY,
  name text NOT NULL,
  year text NOT NULL,
  game text NOT NULL CHECK (game='Free Fire'),
  divisions text NOT NULL,
  source_url text NOT NULL,
  source_registration_tab text NOT NULL,
  source_final_tab text NOT NULL,
  source_rows text,
  audit_status text NOT NULL
);
CREATE TABLE IF NOT EXISTS public.pilot_final_standings (
  id text PRIMARY KEY,
  competition_id text NOT NULL REFERENCES public.pilot_competitions(id),
  division text NOT NULL,
  rank integer NOT NULL CHECK (rank>=1 AND rank<=16),
  team_name text NOT NULL,
  final_points integer NOT NULL,
  booyah integer,
  registration_match text NOT NULL,
  source_tab text NOT NULL,
  source_row integer NOT NULL,
  source_url text NOT NULL,
  UNIQUE (competition_id,division,rank)
);
CREATE TABLE IF NOT EXISTS public.pilot_podiums (
  id text PRIMARY KEY REFERENCES public.pilot_final_standings(id),
  competition_id text NOT NULL REFERENCES public.pilot_competitions(id),
  division text NOT NULL,
  team_name text NOT NULL,
  rank integer NOT NULL CHECK (rank BETWEEN 1 AND 3),
  final_points integer NOT NULL,
  achievement_delta integer NOT NULL CHECK (
    (rank=1 AND achievement_delta=50) OR
    (rank=2 AND achievement_delta=35) OR
    (rank=3 AND achievement_delta=25)
  ),
  registration_match text NOT NULL,
  roster_status text NOT NULL,
  registration_rows jsonb NOT NULL DEFAULT '[]',
  roster_flags jsonb NOT NULL DEFAULT '[]',
  source_url text NOT NULL
);
CREATE TABLE IF NOT EXISTS public.pilot_athletes (
  id text PRIMARY KEY,
  uid_fingerprint char(64) UNIQUE NOT NULL,
  nickname text NOT NULL,
  masked_game_uid text,
  gameskii_id text UNIQUE NOT NULL,
  rank_scope text NOT NULL DEFAULT 'PROVISIONAL_PILOT'
);
CREATE TABLE IF NOT EXISTS public.pilot_roster_tags (
  id bigserial PRIMARY KEY,
  competition_id text NOT NULL REFERENCES public.pilot_competitions(id),
  division text NOT NULL,
  team_name text NOT NULL,
  rank integer NOT NULL CHECK (rank BETWEEN 1 AND 3),
  result_id text NOT NULL REFERENCES public.pilot_podiums(id),
  nickname text NOT NULL,
  uid_fingerprint char(64),
  uid_masked text,
  registration_row integer NOT NULL,
  slot integer NOT NULL,
  potential_active boolean NOT NULL,
  tag_status text NOT NULL,
  awarded boolean NOT NULL DEFAULT false,
  UNIQUE(result_id,registration_row,slot)
);
CREATE TABLE IF NOT EXISTS public.pilot_achievement_attributions (
  athlete_id text NOT NULL REFERENCES public.pilot_athletes(id),
  uid_fingerprint char(64) NOT NULL REFERENCES public.pilot_athletes(uid_fingerprint),
  result_id text NOT NULL REFERENCES public.pilot_podiums(id),
  competition_id text NOT NULL REFERENCES public.pilot_competitions(id),
  division text NOT NULL,
  team_at_event text NOT NULL,
  rank integer NOT NULL CHECK (rank BETWEEN 1 AND 3),
  achievement_delta integer NOT NULL CHECK (achievement_delta IN (50,35,25)),
  status text NOT NULL DEFAULT 'PROVISIONAL_ROSTER_MATCH',
  source_url text NOT NULL,
  PRIMARY KEY (uid_fingerprint,competition_id,division)
);
CREATE OR REPLACE VIEW public.pilot_ff_athlete_leaderboard AS
SELECT a.id AS athlete_id, a.nickname, a.masked_game_uid, a.gameskii_id,
  1200 + COALESCE(SUM(p.achievement_delta),0) AS rating_points,
  COUNT(p.result_id)::integer AS recorded_podiums,
  COUNT(p.result_id) FILTER (WHERE p.rank=1)::integer AS recorded_titles,
  COUNT(DISTINCT p.team_at_event)::integer AS historic_team_count,
  'PROVISIONAL_NOT_OFFICIAL'::text AS verification_status
FROM public.pilot_athletes a
LEFT JOIN public.pilot_achievement_attributions p ON p.uid_fingerprint=a.uid_fingerprint
GROUP BY a.id,a.nickname,a.masked_game_uid,a.gameskii_id;

-- Anonymous clients may READ pseudonymous pilot data. Only privileged service-role
-- migrations/SQL editor may WRITE: no open insert/update/delete policies.
ALTER TABLE public.pilot_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_final_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_podiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_roster_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_achievement_attributions ENABLE ROW LEVEL SECURITY;
DO $$
DECLARE tab text;
BEGIN
  FOREACH tab IN ARRAY ARRAY[
    'pilot_competitions','pilot_final_standings','pilot_podiums',
    'pilot_athletes','pilot_roster_tags','pilot_achievement_attributions'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS pilot_select ON public.%I', tab);
    EXECUTE format('CREATE POLICY pilot_select ON public.%I FOR SELECT USING (true)', tab);
    EXECUTE format('REVOKE INSERT,UPDATE,DELETE ON public.%I FROM anon,authenticated', tab);
  END LOOP;
END $$;
