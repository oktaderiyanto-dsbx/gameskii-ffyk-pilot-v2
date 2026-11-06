/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  getLocalActiveAthlete, 
  getLocalAthletes, 
  getLocalMatches, 
  getStoredSupabaseConfig, 
  getSupabaseClient, 
  saveLocalActiveAthlete, 
  saveLocalAthletes, 
  saveLocalMatches 
} from './lib/supabase';
import { AthleteProfile, MatchSubmission } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PassportTabView } from './components/PassportTabView';
import { MatchSubmissionView } from './components/MatchSubmissionView';
import { LeaderboardView } from './components/LeaderboardView';
import { OnboardingModal } from './components/OnboardingModal';
import { AuthModal } from './components/AuthModal';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';
import { getEloTier, getRankEloDelta } from './data/constants';
import { fingerprintFreeFireUid } from './lib/athleteIdentity';
import { Check } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'passport' | 'matches' | 'leaderboard'>('passport');
  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const [matches, setMatches] = useState<MatchSubmission[]>([]);
  const [activeAthlete, setActiveAthlete] = useState<AthleteProfile | null>(null);

  // Modals
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Supabase connection status
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Show toast utility
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load initial data
  useEffect(() => {
    const config = getStoredSupabaseConfig();
    setIsSupabaseConnected(config.isConfigured);

    // Load from local storage or mock
    const initialAthletes = getLocalAthletes();
    const initialMatches = getLocalMatches();
    const initialUser = getLocalActiveAthlete();

    setAthletes(initialAthletes);
    setMatches(initialMatches);
    setActiveAthlete(initialUser);

    // If live Supabase client exists, attempt fetch
    const supabase = getSupabaseClient();
    if (supabase) {
      (async () => {
        try {
          const { data: remoteProfiles } = await supabase
            .from('profiles')
            .select('*')
            .order('elo_points', { ascending: false });

          if (remoteProfiles && remoteProfiles.length > 0) {
            // Pilot data is a read-only local fixture. Remote user profiles do not overwrite it.
            setAthletes((local) => {
              const ids = new Set(remoteProfiles.map((p) => p.gameskii_id));
              return [...remoteProfiles, ...local.filter((a) => !ids.has(a.gameskii_id))];
            });
          }

          const { data: remoteMatches } = await supabase
            .from('matches')
            .select('*')
            .order('created_at', { ascending: false });

          if (remoteMatches && remoteMatches.length > 0) {
            setMatches(remoteMatches);
          }
        } catch (e) {
          console.warn('Could not fetch from live Supabase, using local data fallback.', e);
        }
      })();
    }
  }, []);

  // Save changes locally whenever state changes
  const handleUpdateAthletes = (updated: AthleteProfile[]) => {
    setAthletes(updated);
    saveLocalAthletes(updated);
  };

  const handleUpdateMatches = (updated: MatchSubmission[]) => {
    setMatches(updated);
    saveLocalMatches(updated);
  };

  // Handle Profile Save from Onboarding
  const handleSaveProfile = async (newProfile: AthleteProfile) => {
    // Link a player's FF UID to their historical tags, never by mutable team or nickname.
    // This is a LOCAL PROTOTYPE lookup, NOT a verified ownership/identity claim.
    const incomingFingerprint = newProfile.primary_game === 'Free Fire'
      ? await fingerprintFreeFireUid(newProfile.game_id)
      : null;
    const sourceProfile = incomingFingerprint
      ? athletes.find((a) => a.uid_fingerprint === incomingFingerprint)
      : undefined;
    const linkedProfile: AthleteProfile = sourceProfile ? {
      ...newProfile,
      id: sourceProfile.id,
      gameskii_id: sourceProfile.gameskii_id,
      elo_points: sourceProfile.elo_points,
      matches_played: sourceProfile.matches_played,
      wins: sourceProfile.wins,
      rank_tier: sourceProfile.rank_tier,
      uid_fingerprint: sourceProfile.uid_fingerprint,
      source_event_ids: sourceProfile.source_event_ids,
      seed_status: 'PROVISIONAL_ROSTER_MATCH',
    } : newProfile;

    setActiveAthlete(linkedProfile);
    saveLocalActiveAthlete(linkedProfile);

    // Update in athletes list
    const existingIndex = athletes.findIndex((a) => a.id === linkedProfile.id || a.gameskii_id === linkedProfile.gameskii_id);
    let updatedList: AthleteProfile[];
    if (existingIndex >= 0) {
      updatedList = [...athletes];
      updatedList[existingIndex] = linkedProfile;
    } else {
      updatedList = [linkedProfile, ...athletes];
    }
    handleUpdateAthletes(updatedList);

    // Sync to Supabase if connected
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        // Bundled athlete IDs are pseudonymous fixture IDs, not Supabase UUIDs.
        // Do not push pilot-linked profiles through the legacy auth schema.
        if (!sourceProfile) await supabase.from('profiles').upsert([linkedProfile]);
      } catch (err) {
        console.error('Supabase profile upsert error:', err);
      }
    }

    showToast(sourceProfile
      ? `UID Free Fire tertaut dengan riwayat ${linkedProfile.source_event_ids?.length || 0} kompetisi (PROTOTIPE; belum verifikasi kepemilikan).`
      : `Paspor atlet ${linkedProfile.ign} (${linkedProfile.gameskii_id}) berhasil diterbitkan!`);
  };

  // Handle Tournament Result Submit
  const handleSubmitMatch = async (submission: Omit<MatchSubmission, 'id' | 'created_at'>) => {
    const newMatch: MatchSubmission = {
      ...submission,
      id: 'match-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    const updated = [newMatch, ...matches];
    handleUpdateMatches(updated);

    // Sync to Supabase if connected
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('matches').insert([newMatch]);
      } catch (err) {
        console.error('Supabase match insert error:', err);
      }
    }

    showToast('Hasil turnamen berhasil di-upload! Menunggu verifikasi wasit ESI DIY.');
  };

  // Handle Match Dispute / Report
  const handleDisputeMatch = async (matchId: string, reason: string, disputedBy: string) => {
    const updated = matches.map((m) => {
      if (m.id === matchId) {
        return {
          ...m,
          status: 'Disputed' as const,
          dispute_reason: reason,
          disputed_by: disputedBy,
          disputed_at: new Date().toISOString(),
        };
      }
      return m;
    });

    handleUpdateMatches(updated);

    // Sync to Supabase if connected
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('matches')
          .update({
            status: 'Disputed',
            dispute_reason: reason,
            disputed_by: disputedBy,
            disputed_at: new Date().toISOString(),
          })
          .eq('id', matchId);
      } catch (err) {
        console.error(err);
      }
    }

    showToast('Sanggahan hasil turnamen berhasil diajukan ke komisi wasit ESI DIY.', 'error');
  };

  // Referee / Wasit Simulation: Verify Match & Recalculate ELO
  const handleVerifyMatch = async (matchId: string) => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch || targetMatch.status !== 'Pending Review') return;

    const rankNum = targetMatch.rank_position || parseInt(targetMatch.result.replace('#', ''));
    if (![1, 2, 3].includes(rankNum)) {
      showToast('Hanya juara 1–3 yang dapat diberi poin ranking.', 'error');
      return;
    }
    const eloDelta = getRankEloDelta(rankNum);
    const isWin = rankNum === 1; // Wins = champion titles, not other podium ranks.

    // 1. Update Match status
    const updatedMatches = matches.map((m) => {
      if (m.id === matchId) {
        return {
          ...m,
          status: 'Verified' as const,
          verified_at: new Date().toISOString(),
        };
      }
      return m;
    });
    handleUpdateMatches(updatedMatches);

    // 2. Update Athlete ELO and stats
    const updatedAthletes = athletes.map((a) => {
      if (a.gameskii_id === targetMatch.gameskii_id || a.user_id === targetMatch.user_id) {
        const newElo = Math.max(800, a.elo_points + eloDelta);
        const newTier = getEloTier(newElo).name;
        return {
          ...a,
          elo_points: newElo,
          matches_played: a.matches_played + 1,
          wins: isWin ? a.wins + 1 : a.wins,
          rank_tier: newTier,
          updated_at: new Date().toISOString(),
        };
      }
      return a;
    });
    handleUpdateAthletes(updatedAthletes);

    // If the active user was verified, update active user too
    if (activeAthlete && (activeAthlete.gameskii_id === targetMatch.gameskii_id || activeAthlete.user_id === targetMatch.user_id)) {
      const newActiveElo = Math.max(800, activeAthlete.elo_points + eloDelta);
      const updatedActive: AthleteProfile = {
        ...activeAthlete,
        elo_points: newActiveElo,
        matches_played: activeAthlete.matches_played + 1,
        wins: isWin ? activeAthlete.wins + 1 : activeAthlete.wins,
        rank_tier: getEloTier(newActiveElo).name,
        updated_at: new Date().toISOString(),
      };
      setActiveAthlete(updatedActive);
      saveLocalActiveAthlete(updatedActive);
    }

    // Sync to Supabase
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('matches')
          .update({
            status: 'Verified',
            verified_at: new Date().toISOString(),
          })
          .eq('id', matchId);
      } catch (err) {
        console.error(err);
      }
    }

    showToast(`Wasit memverifikasi ${targetMatch.player_ign} (Rank #${rankNum}): ${eloDelta > 0 ? `+${eloDelta}` : eloDelta} Poin ELO!`, 'success');
  };

  // Matches for active athlete
  const activeAthleteMatches = activeAthlete 
    ? matches.filter((m) => m.gameskii_id === activeAthlete.gameskii_id || m.user_id === activeAthlete.user_id)
    : [];

  const pendingMatchesCount = matches.filter((m) => m.status === 'Pending Review').length;

  return (
    <div className="min-h-screen bg-[#0B1D3A] text-slate-100 flex flex-col selection:bg-[#C8A75E] selection:text-[#0B1D3A]">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeAthlete={activeAthlete}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-12">
        {activeTab === 'passport' && (
          <PassportTabView
            athlete={activeAthlete}
            athleteMatches={activeAthleteMatches}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onNavigateToMatches={() => setActiveTab('matches')}
            onNavigateToLeaderboard={() => setActiveTab('leaderboard')}
          />
        )}

        {activeTab === 'matches' && (
          <MatchSubmissionView
            activeAthlete={activeAthlete}
            matches={matches}
            onSubmitMatch={handleSubmitMatch}
            onDisputeMatch={handleDisputeMatch}
            onVerifyMatch={handleVerifyMatch}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            athletes={athletes}
            onSelectAthlete={(ath) => {
              setActiveAthlete(ath);
              saveLocalActiveAthlete(ath);
              setActiveTab('passport');
              showToast(`Menampilkan paspor atlet: ${ath.ign}`);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="hidden md:block border-t border-[#3B3B3B] bg-[#071326] py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg text-white font-bold">GAMESKII DIY</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">Digital Esports Athlete Passport & Regional Leaderboard System</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Daerah Istimewa Yogyakarta</span>
            <span>·</span>
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="text-[#DFCA88] hover:underline"
            >
              Supabase Schema & RLS
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingMatchesCount={pendingMatchesCount}
      />

      {/* Onboarding Profile Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSaveProfile={handleSaveProfile}
        initialProfile={activeAthlete}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        activeAthlete={activeAthlete}
        onSelectAthlete={(ath) => {
          setActiveAthlete(ath);
          saveLocalActiveAthlete(ath);
          showToast(`Aktif sebagai ${ath?.ign || 'Guest'}`);
        }}
        onTriggerOnboarding={() => {
          setIsAuthOpen(false);
          setIsOnboardingOpen(true);
        }}
      />

      {/* Supabase Config & SQL Modal */}
      <SupabaseSetupModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigUpdated={() => {
          const config = getStoredSupabaseConfig();
          setIsSupabaseConnected(config.isConfigured);
          showToast(
            config.isConfigured 
              ? 'Konfigurasi Supabase berhasil disimpan!' 
              : 'Kembali ke mode penyimpanan lokal out-of-the-box.'
          );
        }}
      />

      {/* Global Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 animate-bounce">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : toastMessage.type === 'info'
              ? 'bg-[#C8A75E]/20 border-[#C8A75E]/50 text-[#DFCA88]'
              : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          }`}>
            <Check className="h-4 w-4 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

    </div>
  );
}
