import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../audio/soundEngine';

interface LevelClearModalProps {
  level: number;
  score: number;
  stars: number;
  accuracy: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
}

export const LevelClearModal: React.FC<LevelClearModalProps> = ({
  level,
  score,
  stars,
  accuracy,
  onNextLevel,
  onReplay,
  onLevelSelect
}) => {
  useEffect(() => {
    sound.levelClear();
    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      //
    }
  }, []);

  const starString = stars === 3 ? '⭐⭐⭐' : stars === 2 ? '⭐⭐' : '⭐';
  const getEncouragement = () => {
    if (stars === 3) return 'Luar Biasa! Kemahiran Matematik & Bidikan Sempurna!';
    if (stars === 2) return 'Syabas! Usaha yang sangat mantap!';
    return 'Bagus! Teruskan latihan untuk dapat 3 bintang!';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border-4 border-amber-500 shadow-2xl p-6 md:p-8 max-w-md w-full text-center relative overflow-hidden">
        <h2 className="text-3xl font-black text-emerald-600 mb-1">
          🎉 TAHNIAH!
        </h2>
        <p className="text-sm font-bold text-slate-500">
          Aras {level} Berjaya Ditamatkan!
        </p>

        {/* Stars Display */}
        <div className="text-5xl my-4 animate-bounce">
          {starString}
        </div>

        <p className="text-sm md:text-base font-extrabold text-amber-600 mb-5">
          "{getEncouragement()}"
        </p>

        {/* Stats card */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 my-4 grid grid-cols-2 gap-3 text-slate-700">
          <div>
            <div className="text-xs text-slate-500 font-semibold">Markah Aras:</div>
            <div className="text-2xl font-black text-emerald-600">+{score}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Ketepatan Soalan:</div>
            <div className="text-2xl font-black text-orange-600">{accuracy}%</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 mt-5">
          {level < 15 ? (
            <button
              onClick={() => {
                sound.click();
                onNextLevel();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-105 text-white font-black rounded-xl shadow-lg text-base transition-transform active:scale-95"
            >
              ARAS SETERUSNYA (ARAS {level + 1}) ➔
            </button>
          ) : (
            <div className="p-3 bg-amber-100 text-amber-900 font-black rounded-xl text-sm">
              🏆 TAHNIAH! Anda telah menamatkan kesemua 15 Aras Bab 3!
            </div>
          )}

          <button
            onClick={() => {
              sound.click();
              onReplay();
            }}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md text-sm transition-transform active:scale-95"
          >
            🔄 Main Semula Aras Ini
          </button>

          <button
            onClick={() => {
              sound.click();
              onLevelSelect();
            }}
            className="w-full py-3 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md text-sm transition-transform active:scale-95"
          >
            📋 Pilih Aras Lain
          </button>
        </div>
      </div>
    </div>
  );
};
