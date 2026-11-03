import React from 'react';
import { BIRD_CONFIGS } from '../data/birds';
import { sound } from '../audio/soundEngine';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const birds = Object.values(BIRD_CONFIGS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border-4 border-purple-500 shadow-2xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto text-center relative">
        <h2 className="text-2xl font-black text-purple-700 mb-1 flex items-center justify-center gap-2">
          <span>ℹ️</span>
          <span>Panduan Permainan & Burung Wira</span>
        </h2>
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-2.5 text-xs text-purple-900 font-semibold mb-3 text-left">
          🌟 <strong>Peraturan Kuasa:</strong> Setiap aras bermula dengan <strong>Burung Biasa</strong>. Jawab soalan matematik dengan betul untuk membuka <strong>Burung Berkuasa</strong> rawak! Jika tersalah jawab, kuasa ditarik balik dan anda kembali menggunakan Burung Biasa.
        </div>

        {/* 5 Birds list */}
        <div className="space-y-2.5 my-3 text-left">
          {birds.map((b) => (
            <div
              key={b.id}
              className="p-3 rounded-2xl border-2 flex items-center gap-3 bg-slate-50"
              style={{ borderColor: b.color === '#ffeb3b' ? '#f59e0b' : b.color }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-inner border border-white shrink-0"
                style={{ backgroundColor: b.color }}
              >
                {b.icon}
              </div>
              <div>
                <div className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  <span>{b.name}</span>
                  <span className="text-[11px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                    {b.powerName}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tower Materials Guide */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-left text-xs my-4 space-y-1">
          <div className="font-bold text-amber-900 mb-1">Jenis Halangan Kubu:</div>
          <div>• <span className="font-bold text-cyan-600">Kaca (Cyan)</span>: Rapuh, mudah berkecai dengan 1 hentaman.</div>
          <div>• <span className="font-bold text-amber-800">Kayu (Coklat)</span>: Sederhana kuat, memerlukan 2 hentaman.</div>
          <div>• <span className="font-bold text-slate-700">Konkrit (Kelabu)</span>: Sangat pejal, runtuhkan tiang asas atau gunakan Burung Berat / Bom!</div>
        </div>

        <button
          onClick={() => {
            sound.click();
            onClose();
          }}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-md text-sm transition-transform active:scale-95"
        >
          Faham & Tutup
        </button>
      </div>
    </div>
  );
};
