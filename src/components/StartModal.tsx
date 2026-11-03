import React, { useState } from 'react';
import { sound } from '../audio/soundEngine';

interface StartModalProps {
  onStartGame: (name: string, studentClass: string, mode: 'individu' | 'kumpulan') => void;
  onOpenTeacherPortal: () => void;
  onOpenHelp: () => void;
}

export const StartModal: React.FC<StartModalProps> = ({
  onStartGame,
  onOpenTeacherPortal,
  onOpenHelp
}) => {
  const [name, setName] = useState<string>('Wira Matematik');
  const [studentClass, setStudentClass] = useState<string>('1 Cemerlang');
  const [sfxOn, setSfxOn] = useState<boolean>(sound.isEnabled());

  const handleStart = (mode: 'individu' | 'kumpulan') => {
    if (!name.trim()) {
      alert('Sila masukkan Nama Pelajar!');
      return;
    }
    if (!studentClass.trim()) {
      alert('Sila masukkan Nama Kelas!');
      return;
    }
    sound.click();
    onStartGame(name.trim(), studentClass.trim(), mode);
  };

  const handleToggleSfx = () => {
    const nextVal = !sfxOn;
    setSfxOn(nextVal);
    sound.setEnabled(nextVal);
    if (nextVal) sound.correct();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-sky-400/90 to-blue-600/95 backdrop-blur-md animate-fadeIn">
      <div className="bg-white/95 rounded-3xl border-4 border-amber-500 shadow-2xl p-6 md:p-8 max-w-lg w-full text-center relative overflow-hidden">
        {/* Cartoon Header */}
        <div className="mb-2">
          <div className="inline-block bg-amber-100 text-amber-900 border-2 border-amber-300 rounded-full px-4 py-1 text-xs md:text-sm font-extrabold uppercase tracking-wide">
            Matematik Tingkatan 1 KSSM
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-rose-600 tracking-tight">
          🎯 MISI MATEMATIK:
        </h1>
        <h2 className="text-xl md:text-2xl font-black bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 bg-clip-text text-transparent mb-2 tracking-wide uppercase drop-shadow-sm flex items-center justify-center gap-2">
          <span>🏰</span>
          <span>JOM RUNTUHKAN MENARA!</span>
          <span>💥</span>
        </h2>

        <p className="text-xs md:text-sm text-slate-600 font-medium mb-5">
          Bab 3: Kuasa Dua, Punca Kuasa Dua, Kuasa Tiga & Punca Kuasa Tiga
          <br />
          <span className="text-orange-600 font-bold">
            (Standard Pembelajaran SP 3.1.4 & SP 3.1.5)
          </span>
        </p>

        {/* Inputs */}
        <div className="space-y-3 my-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Nama Pelajar:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan Nama Pelajar..."
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Nama Kelas:
            </label>
            <input
              type="text"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              placeholder="cth: 1 Cemerlang, 1 Dinamik..."
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Game Mode Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
          <button
            onClick={() => handleStart('individu')}
            className="py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-105 text-white font-black rounded-2xl shadow-lg flex flex-col items-center justify-center transition-transform active:scale-95"
          >
            <span className="text-lg">🎮</span>
            <span className="text-sm md:text-base">Mod Latihan</span>
            <span className="text-[10px] text-amber-100 font-normal">Individu & Bintang</span>
          </button>

          <button
            onClick={() => handleStart('kumpulan')}
            className="py-3.5 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-105 text-white font-black rounded-2xl shadow-lg flex flex-col items-center justify-center transition-transform active:scale-95"
          >
            <span className="text-lg">🏆</span>
            <span className="text-sm md:text-base">Mod Cabaran</span>
            <span className="text-[10px] text-sky-100 font-normal">Kumpulan & Leaderboard</span>
          </button>
        </div>

        {/* Bottom Options */}
        <div className="pt-4 border-t-2 border-dashed border-slate-200 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => {
              sound.click();
              onOpenTeacherPortal();
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1 active:scale-95"
          >
            <span>📋</span>
            <span>Portal Guru (PBD)</span>
          </button>

          <button
            onClick={() => {
              sound.click();
              onOpenHelp();
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1 active:scale-95"
          >
            <span>ℹ️</span>
            <span>5 Kuasa Burung</span>
          </button>

          <button
            onClick={handleToggleSfx}
            className={`font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1 active:scale-95 transition-colors ${
              sfxOn ? 'bg-amber-500 text-white' : 'bg-slate-300 text-slate-700'
            }`}
          >
            <span>{sfxOn ? '🔊' : '🔇'}</span>
            <span>Bunyi {sfxOn ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
