import React from 'react';
import { BirdConfig } from '../types';
import { sound } from '../audio/soundEngine';

interface HUDProps {
  level: number;
  roundIndex: number;
  score: number;
  birdConfig: BirdConfig;
  wind: number;
  inFlight: boolean;
  powerUsed: boolean;
  onOpenMenu: () => void;
  onActivatePower: () => void;
  playerName: string;
  playerClass: string;
  remainingTargets: number;
  missedMessage: string | null;
  powerNotification?: {
    type: 'reward' | 'demote';
    birdName: string;
    birdIcon: string;
  } | null;
}

export const HUD: React.FC<HUDProps> = ({
  level,
  roundIndex,
  score,
  birdConfig,
  wind,
  inFlight,
  powerUsed,
  onOpenMenu,
  onActivatePower,
  playerName,
  playerClass,
  remainingTargets,
  missedMessage,
  powerNotification
}) => {
  const getMaterialBadge = (lvl: number) => {
    if (lvl <= 5) {
      return {
        label: '💎 Menara Kaca (Mudah Pecah)',
        bg: 'bg-cyan-500/90 text-white border-cyan-300'
      };
    } else if (lvl <= 10) {
      return {
        label: '🪵 Menara Kayu (Sederhana Keras)',
        bg: 'bg-amber-700/90 text-white border-amber-500'
      };
    } else {
      return {
        label: '🏛️ Menara Konkrit (Paling Keras)',
        bg: 'bg-slate-700/90 text-white border-slate-500'
      };
    }
  };

  const mat = getMaterialBadge(level);
  const hasPower = birdConfig.power !== 'none';

  return (
    <>
      {/* Top Left Menu Button */}
      <button
        onClick={() => {
          sound.click();
          onOpenMenu();
        }}
        className="fixed top-3 left-3 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white border-2 border-white shadow-lg flex items-center justify-center text-xl font-bold hover:scale-105 active:scale-95 transition-transform"
        title="Buka Menu"
        aria-label="Menu"
      >
        ☰
      </button>

      {/* Top Center Status Bar */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 max-w-[94vw]">
        <div className="bg-white/95 backdrop-blur-sm border-2 border-amber-500 rounded-full px-4 py-1.5 shadow-md flex items-center gap-2.5 text-xs md:text-sm font-semibold text-slate-700">
          <div className="hidden sm:block text-slate-500 truncate max-w-[120px]">
            {playerName} ({playerClass})
          </div>
          <div className="text-orange-600 font-bold whitespace-nowrap">
            Aras {level} <span className="text-slate-400">|</span> Pusingan {roundIndex + 1}/5
          </div>
          <div className="text-emerald-600 font-extrabold whitespace-nowrap">
            ⭐ {score}
          </div>
          <div className="bg-amber-100 text-amber-900 border border-amber-300 rounded-full px-2 py-0.5 text-xs font-black">
            🐥 Sasaran: {remainingTargets}
          </div>
        </div>

        {/* Material Badge */}
        <div className={`border rounded-full px-3 py-0.5 text-[11px] md:text-xs font-black shadow-sm ${mat.bg}`}>
          {mat.label}
        </div>
      </div>

      {/* Top Right Bird Badge */}
      <div className="fixed top-3 right-3 z-30 flex flex-col items-end gap-1">
        <div
          className={`px-3 py-1.5 rounded-2xl shadow-md flex items-center gap-2 text-xs md:text-sm font-extrabold transition-all ${
            hasPower
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-2 border-yellow-200 ring-2 ring-yellow-400/50 animate-pulse'
              : 'bg-white/95 border-2 border-slate-300 text-slate-800'
          }`}
        >
          <span className="text-xl">{birdConfig.icon}</span>
          <div className="flex flex-col text-left">
            <span className="leading-tight">{birdConfig.name}</span>
            <span className="text-[10px] opacity-90 font-medium">
              {hasPower ? `⚡ ${birdConfig.powerName}` : 'Burung Biasa (Standard)'}
            </span>
          </div>
        </div>
        {!hasPower && (
          <span className="hidden sm:block text-[10px] text-slate-700 bg-white/90 px-2 py-0.5 rounded-md border border-slate-300 font-bold shadow-sm">
            💡 Jawab betul soalan untuk tebus kuasa!
          </span>
        )}
      </div>

      {/* Wind Indicator (if present in level) */}
      {Math.abs(wind) > 0.001 && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20 bg-black/60 text-sky-200 border border-sky-300 rounded-full px-3 py-0.5 text-xs font-bold tracking-wide">
          💨 Angin: {wind > 0 ? `➔ +${Math.round(wind * 1000)}` : `⬅ ${Math.round(wind * 1000)}`}
        </div>
      )}

      {/* Mid-Air Special Power Activation Button */}
      {inFlight && hasPower && !powerUsed && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-1.5 animate-bounce">
          <button
            onClick={() => {
              onActivatePower();
            }}
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white font-black text-sm md:text-lg px-6 py-3.5 rounded-full border-4 border-white shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="text-2xl">{birdConfig.icon}</span>
            <span>AKTIFKAN {birdConfig.powerName.toUpperCase()}!</span>
          </button>
          <span className="text-[10px] md:text-xs font-black text-white bg-black/80 px-3 py-1 rounded-full shadow-md">
            ⚡ Ketik Skrin / Tekan Sini / Tekan Spacebar
          </span>
        </div>
      )}

      {/* Mid-Air Power Used Status */}
      {inFlight && hasPower && powerUsed && (
        <div className="fixed bottom-6 right-6 z-40 bg-emerald-600 text-white font-black text-xs md:text-sm px-5 py-2.5 rounded-full border-2 border-white shadow-xl animate-pulse flex items-center gap-2">
          <span>✨</span>
          <span>Kuasa {birdConfig.powerName} Diaktifkan!</span>
        </div>
      )}

      {/* Power Notification Banner (Earned or Demoted) */}
      {powerNotification && !inFlight && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 animate-slideDown max-w-[94vw]">
          {powerNotification.type === 'reward' ? (
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-2 border-white rounded-full px-5 py-2 text-xs md:text-sm font-black shadow-2xl flex items-center gap-2">
              <span className="text-lg">🎉</span>
              <span>
                TAHNIAH! Anda dihadiahkan <strong>{powerNotification.birdName}</strong> {powerNotification.birdIcon} untuk pusingan ini!
              </span>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white border-2 border-white rounded-full px-5 py-2 text-xs md:text-sm font-black shadow-2xl flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>
                Kuasa dinyahaktifkan! Sila gunakan <strong>Burung Biasa</strong> 🎯 untuk pusingan ini.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Miss notification banner */}
      {missedMessage && !inFlight && !powerNotification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-30 bg-rose-600 text-white border-2 border-white rounded-full px-4 py-1.5 text-xs md:text-sm font-black shadow-xl animate-bounce">
          {missedMessage}
        </div>
      )}

      {/* Slingshot Aim Guidance Tip */}
      {!inFlight && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-black/80 text-white border border-amber-400 rounded-full px-5 py-2 text-xs md:text-sm font-bold text-center shadow-lg max-w-[92vw]">
          🎯 Tarik ke <span className="text-amber-300 font-black">belakang</span> (kiri-bawah) untuk lepaskan tembakan!
        </div>
      )}
    </>
  );
};
