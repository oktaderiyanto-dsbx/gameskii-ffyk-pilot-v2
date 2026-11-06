import React, { useState } from 'react';
import { 
  Shield, 
  MapPin, 
  Crosshair, 
  Trophy, 
  Copy, 
  Check, 
  Edit3, 
  QrCode,
  Download,
  Gamepad2
} from 'lucide-react';
import { AthleteProfile } from '../types';
import { getEloTier } from '../data/constants';
import { QRCodeSvg } from './QRCodeSvg';

interface AthletePassportCardProps {
  athlete: AthleteProfile;
  onEditProfile?: () => void;
  isCompact?: boolean;
}

export const AthletePassportCard: React.FC<AthletePassportCardProps> = ({
  athlete,
  onEditProfile,
  isCompact = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const tier = getEloTier(athlete.elo_points);
  const winRate = athlete.matches_played > 0 
    ? Math.round((athlete.wins / athlete.matches_played) * 100) 
    : 0;

  const handleCopyId = () => {
    navigator.clipboard.writeText(athlete.gameskii_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCard = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const verifyUrl = `https://gameskii.id/verify/${athlete.gameskii_id}`;

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* The Physical-Feel DIY Esports Passport Card */}
      <div 
        id="gameskii-passport-card"
        className="relative rounded-3xl overflow-hidden border border-[#C8A75E]/50 bg-gradient-to-b from-[#102548] via-[#0B1D3A] to-[#071326] p-6 sm:p-7 shadow-2xl shadow-[#0B1D3A]/80 card-hologram"
      >
        {/* Decorative Top Antique Gold Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#DFCA88] to-transparent" />
        
        {/* Top Header of the DIY Athlete Card */}
        <div className="flex items-start justify-between border-b border-[#3B3B3B] pb-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-2xl overflow-hidden border border-[#C8A75E]/60 bg-[#071326] flex items-center justify-center shadow-lg shadow-[#C8A75E]/15">
              <img 
                src="/src/assets/images/gameskii_crest_1790765331117.jpg" 
                alt="Gameskii DIY Crest" 
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl tracking-widest text-white leading-none font-bold">
                  DIY ATHLETE CARD
                </span>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#DFCA88]">
                PENGDA ESI D.I. YOGYAKARTA • PASPOR ATLET RESMI
              </p>
            </div>
          </div>

          {/* Regency Stamp Badge */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">REGENCY</span>
            <div className="mt-0.5 inline-flex items-center gap-1.5 rounded-lg border border-[#C8A75E]/40 bg-[#C8A75E]/15 px-2.5 py-1 text-xs font-bold text-[#DFCA88]">
              <MapPin className="h-3 w-3 text-[#C8A75E]" />
              <span>{athlete.regency}</span>
            </div>
          </div>
        </div>

        {/* Card Body: Athlete Profile & DIY ID */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
          
          {/* Left Column: Avatar & Gameskii DIY ID QR */}
          <div className="sm:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="relative group cursor-pointer" onClick={() => setShowQrModal(true)}>
              <div className="relative rounded-2xl p-1 bg-gradient-to-br from-[#DFCA88] via-[#C8A75E] to-[#8C6D27] shadow-xl shadow-[#C8A75E]/20">
                <div className="w-24 h-24 rounded-xl bg-[#071326] flex flex-col items-center justify-center overflow-hidden relative">
                  <QRCodeSvg value={verifyUrl} size={88} />
                </div>
              </div>
              <div className="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-slate-400 hover:text-[#DFCA88]">
                <QrCode className="h-3 w-3 text-[#C8A75E]" />
                <span>Pindai QR ID</span>
              </div>
            </div>

            <div className="mt-3">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">GAMESKII DIY ID</span>
              <div 
                onClick={handleCopyId}
                className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#DFCA88] bg-[#071326] px-2.5 py-1 rounded-md border border-[#C8A75E]/40 hover:border-[#C8A75E] transition-colors cursor-pointer group"
                title="Klik untuk menyalin Gameskii ID"
              >
                <span>{athlete.gameskii_id}</span>
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-400 group-hover:text-[#DFCA88]" />
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Bio, Game role & ELO Status */}
          <div className="sm:col-span-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">IN-GAME NAME (IGN)</span>
                  <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    {athlete.ign}
                    <span className="inline-block h-2 w-2 rounded-full bg-[#C8A75E] animate-pulse" title="Status Aktif ESI DIY" />
                  </h3>
                </div>

                {/* ELO Point Badge */}
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">POIN ELO DIY</span>
                  <div className={`mt-0.5 inline-flex items-center gap-1.5 rounded-xl border ${tier.border} ${tier.bg} px-3 py-1 shadow-sm`}>
                    <Trophy className={`h-4 w-4 ${tier.color}`} />
                    <span className={`font-mono text-lg font-black tracking-tight ${tier.color} tabular-nums`}>
                      {athlete.elo_points}
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Real Name & Game ID */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-[#3B3B3B] pt-3">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">NAMA LENGKAP (KTP)</p>
                  <p className="font-semibold text-slate-100 truncate">{athlete.full_name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">ID & SERVER GAME</p>
                  <p className="font-mono text-[#DFCA88] truncate">{athlete.game_id}</p>
                </div>
              </div>

              {/* Game & Primary Role */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-[#071326] border border-[#3B3B3B] rounded-lg px-2.5 py-1 text-xs">
                  <Gamepad2 className="h-3 w-3 text-[#C8A75E]" />
                  <span className="text-slate-300 font-semibold">{athlete.primary_game}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#C8A75E]/15 border border-[#C8A75E]/30 rounded-lg px-2.5 py-1 text-xs">
                  <Crosshair className="h-3 w-3 text-[#C8A75E]" />
                  <span className="text-slate-300">Role:</span>
                  <span className="font-bold text-[#DFCA88]">{athlete.role}</span>
                </div>
                {athlete.team_name && (
                  <div className="flex items-center gap-1.5 bg-[#071326] border border-[#3B3B3B] rounded-lg px-2.5 py-1 text-xs">
                    <span className="text-slate-400">Tim:</span>
                    <span className="font-medium text-slate-200">{athlete.team_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Performance Metrics Bar */}
        <div className="mt-6 rounded-2xl bg-[#071326] border border-[#3B3B3B] p-3.5">
          <div className="grid grid-cols-3 divide-x divide-[#3B3B3B] text-center">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">WIN RATE</p>
              <p className="text-xl font-black text-emerald-400 font-mono tabular-nums">{winRate}%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">MATCHES</p>
              <p className="text-xl font-black text-[#DFCA88] font-mono tabular-nums">{athlete.matches_played}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">VICTORIES</p>
              <p className="text-xl font-black text-amber-400 font-mono tabular-nums">{athlete.wins}</p>
            </div>
          </div>
        </div>

        {/* Security & Verification Footer */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-[#3B3B3B]">
          <div className="flex items-center gap-1.5 text-slate-300 font-mono">
            <Shield className="h-3.5 w-3.5 text-[#C8A75E]" />
            <span>TERVERIFIKASI SISTEM DATABASE ESI DIY</span>
          </div>
          <span className="text-[#DFCA88] font-mono font-bold">{tier.name}</span>
        </div>
      </div>

      {/* Action Bar Below Card */}
      {!isCompact && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#071326] border border-[#3B3B3B] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-[#C8A75E]/60 hover:text-white transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-[#C8A75E]" />}
              <span>{copied ? 'ID Disalin!' : 'Salin Gameskii DIY ID'}</span>
            </button>

            <button
              onClick={handleDownloadCard}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#071326] border border-[#3B3B3B] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-[#C8A75E]/60 hover:text-white transition-colors"
            >
              {downloadSuccess ? <Check className="h-4 w-4 text-emerald-400" /> : <Download className="h-4 w-4 text-[#C8A75E]" />}
              <span>{downloadSuccess ? 'Tersimpan!' : 'Unduh Paspor'}</span>
            </button>
          </div>

          {onEditProfile && (
            <button
              onClick={onEditProfile}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8A75E]/20 border border-[#C8A75E]/50 px-3.5 py-2 text-xs font-bold text-[#DFCA88] hover:bg-[#C8A75E]/30 transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Profil Paspor</span>
            </button>
          )}
        </div>
      )}

      {/* QR Code Big Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0B1D3A] border border-[#3B3B3B] p-6 text-center shadow-2xl">
            <h4 className="text-lg font-bold text-white">QR Verifikasi Atlet DIY</h4>
            <p className="text-xs text-slate-300 mt-1">
              Pindai QR untuk memvalidasi paspor digital dan rekam jejak poin atlet resmi di turnamen DIY.
            </p>
            
            <div className="my-6 flex justify-center">
              <div className="p-3 bg-white rounded-2xl shadow-xl">
                <QRCodeSvg value={verifyUrl} size={180} />
              </div>
            </div>

            <div className="bg-[#071326] rounded-xl p-3 border border-[#3B3B3B] font-mono text-xs text-[#DFCA88] mb-6">
              {athlete.gameskii_id}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#071326] hover:bg-[#3B3B3B] text-sm font-semibold text-white border border-[#3B3B3B] transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
