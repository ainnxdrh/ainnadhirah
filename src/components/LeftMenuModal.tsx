import React, { useState } from 'react';
import { sound } from '../audio/soundEngine';
import { StudentRecord } from '../types';

interface LeftMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLevelModal: () => void;
  onRestartLevel: () => void;
  onOpenTeacherPortal: () => void;
  onQuitToMenu: () => void;
  records: StudentRecord[];
}

export const LeftMenuModal: React.FC<LeftMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectLevelModal,
  onRestartLevel,
  onOpenTeacherPortal,
  onQuitToMenu,
  records
}) => {
  const [sfxOn, setSfxOn] = useState<boolean>(sound.isEnabled());
  const [showLeaderboardTab, setShowLeaderboardTab] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleToggleSfx = () => {
    const nextVal = !sfxOn;
    setSfxOn(nextVal);
    sound.setEnabled(nextVal);
    if (nextVal) sound.correct();
  };

  const sortedLeaderboard = [...records].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border-4 border-amber-500 shadow-2xl p-6 md:p-8 max-w-md w-full text-center relative overflow-hidden">
        {showLeaderboardTab ? (
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-slate-100">
              <h2 className="text-xl font-extrabold text-orange-600 flex items-center gap-2">
                🏆 Papan Pendahulu Kelas
              </h2>
              <button
                onClick={() => {
                  sound.click();
                  setShowLeaderboardTab(false);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                Kembali
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto mb-4 border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-amber-100 text-amber-900 sticky top-0 font-bold">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Nama</th>
                    <th className="p-2.5">Kelas</th>
                    <th className="p-2.5 text-right">Markah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400">
                        Belum ada rekod permainan.
                      </td>
                    </tr>
                  ) : (
                    sortedLeaderboard.slice(0, 10).map((r, i) => (
                      <tr key={`lb_${r.id}_${i}`} className="hover:bg-amber-50/50">
                        <td className="p-2.5 font-bold">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </td>
                        <td className="p-2.5 font-semibold text-slate-800">{r.name}</td>
                        <td className="p-2.5 text-slate-500">{r.class}</td>
                        <td className="p-2.5 text-right font-black text-emerald-600">{r.score}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => {
                sound.click();
                setShowLeaderboardTab(false);
              }}
              className="w-full py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md"
            >
              Kembali Ke Menu
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-black text-slate-800 mb-1 flex items-center justify-center gap-2">
              <span>⏸️</span>
              <span>Menu Permainan</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mb-6">
              Bab 3 Matematik Tingkatan 1: Kuasa & Punca Kuasa
            </p>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl mb-4">
              <span className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <span>{sfxOn ? '🔊' : '🔇'}</span>
                <span>Kesan Bunyi (SFX)</span>
              </span>
              <button
                onClick={handleToggleSfx}
                className={`px-4 py-1.5 rounded-full font-extrabold text-xs transition-colors ${
                  sfxOn ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                }`}
              >
                {sfxOn ? 'HIDUP' : 'MATI'}
              </button>
            </div>

            {/* Navigation Actions */}
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  sound.click();
                  onClose();
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-105 text-white font-extrabold rounded-xl shadow-md text-base transition-transform active:scale-95"
              >
                ▶️ Sambung Permainan
              </button>

              <button
                onClick={() => {
                  sound.click();
                  setShowLeaderboardTab(true);
                }}
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md text-sm transition-transform active:scale-95"
              >
                🏆 Papan Pendahulu (Leaderboard)
              </button>

              <button
                onClick={() => {
                  sound.click();
                  onSelectLevelModal();
                }}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-md text-sm transition-transform active:scale-95"
              >
                📋 Pilih Aras (1 - 15)
              </button>

              <button
                onClick={() => {
                  sound.click();
                  onRestartLevel();
                }}
                className="w-full py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl shadow-md text-sm transition-transform active:scale-95"
              >
                🔄 Ulang Semula Aras Ini
              </button>

              <button
                onClick={() => {
                  sound.click();
                  onOpenTeacherPortal();
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-sm transition-transform active:scale-95"
              >
                📊 Portal Rekod & Soalan Guru
              </button>

              <button
                onClick={() => {
                  sound.click();
                  onQuitToMenu();
                }}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md text-sm transition-transform active:scale-95"
              >
                🚪 Keluar Ke Halaman Utama
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
