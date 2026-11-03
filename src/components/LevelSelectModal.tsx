import React from 'react';
import { LevelProgress } from '../types';
import { sound } from '../audio/soundEngine';

interface LevelSelectModalProps {
  progress: LevelProgress;
  onSelectLevel: (lvl: number) => void;
  onBack: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  progress,
  onSelectLevel,
  onBack
}) => {
  const getDifficultyLabel = (lvl: number) => {
    if (lvl <= 3) return 'Pemula (Asas Kuasa Dua)';
    if (lvl <= 6) return 'Sederhana (Pecahan & Perpuluhan)';
    if (lvl <= 9) return 'Lanjutan (Pemfaktoran Perdana)';
    if (lvl <= 12) return 'Sukar (Alat Teknologi & Gabungan)';
    return 'Pakar (Kontekstual SPM & KBAT)';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border-4 border-amber-500 shadow-2xl p-6 md:p-8 max-w-xl w-full text-center relative overflow-hidden">
        <h2 className="text-2xl md:text-3xl font-black text-orange-600 mb-1">
          🎯 Pilih Aras Misi (1 - 15)
        </h2>
        <p className="text-xs md:text-sm text-slate-500 font-medium mb-6">
          Selesaikan setiap aras untuk membuka halangan dan menara seterusnya!
        </p>

        {/* 15 Level Grid */}
        <div className="grid grid-cols-5 gap-3 my-4 max-h-[50vh] overflow-y-auto p-1">
          {Array.from({ length: 15 }, (_, i) => i + 1).map((lvl) => {
            const isUnlocked = lvl <= progress.unlockedLevel;
            const stars = progress.levelStars[lvl] || 0;

            return (
              <button
                key={lvl}
                disabled={!isUnlocked}
                onClick={() => {
                  sound.click();
                  onSelectLevel(lvl);
                }}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all shadow-md relative ${
                  isUnlocked
                    ? 'bg-amber-50 border-3 border-amber-500 hover:scale-105 active:scale-95 text-amber-900'
                    : 'bg-slate-200 border-2 border-slate-300 text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <span className="text-lg md:text-xl font-black">
                  {isUnlocked ? lvl : '🔒'}
                </span>
                {isUnlocked && (
                  <div className="text-xs text-amber-500 mt-0.5 tracking-tighter">
                    {stars === 3 ? '⭐⭐⭐' : stars === 2 ? '⭐⭐' : stars === 1 ? '⭐' : '☆☆☆'}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Info Legend */}
        <div className="text-xs text-slate-600 bg-amber-50/70 border border-amber-200 rounded-xl p-3 my-4 text-left">
          <div className="font-bold text-amber-900 mb-1">Peringkat Kesukaran:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
            <div>• Aras 1-3: {getDifficultyLabel(2)}</div>
            <div>• Aras 4-6: {getDifficultyLabel(5)}</div>
            <div>• Aras 7-9: {getDifficultyLabel(8)}</div>
            <div>• Aras 10-12: {getDifficultyLabel(11)}</div>
            <div className="sm:col-span-2 text-rose-700 font-semibold">• Aras 13-15: {getDifficultyLabel(14)}</div>
          </div>
        </div>

        <button
          onClick={() => {
            sound.click();
            onBack();
          }}
          className="w-full py-3 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md text-sm transition-transform active:scale-95"
        >
          ⬅️ Kembali Ke Menu Utama
        </button>
      </div>
    </div>
  );
};
