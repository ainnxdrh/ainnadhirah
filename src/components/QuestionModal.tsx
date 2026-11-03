import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { sound } from '../audio/soundEngine';

interface QuestionModalProps {
  question: Question;
  roundIndex: number;
  level: number;
  onCorrectAnswer: (firstTrySuccess: boolean) => void;
  onFailAndProceed: () => void;
  onFailAttempt: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  roundIndex,
  level,
  onCorrectAnswer,
  onFailAndProceed,
  onFailAttempt
}) => {
  const [shuffledOpts, setShuffledOpts] = useState<string[]>([]);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);

  // Shuffle options whenever the question changes
  useEffect(() => {
    const opts = [...question.opts];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    setShuffledOpts(opts);
    setSelectedOpt(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setAttempts(0);
  }, [question]);

  const handleSelect = (opt: string) => {
    if (isAnswered) return;
    const currentAttempt = attempts + 1;
    setAttempts(currentAttempt);
    setSelectedOpt(opt);
    setIsAnswered(true);

    if (opt === question.a) {
      setIsCorrect(true);
      sound.correct();
      const firstTry = currentAttempt === 1;
      // Auto-close after celebration so player advances
      setTimeout(() => {
        onCorrectAnswer(firstTry);
      }, 1400);
    } else {
      setIsCorrect(false);
      sound.wrong();
      onFailAttempt();
    }
  };

  const handleRetry = () => {
    sound.click();
    setIsAnswered(false);
    setSelectedOpt(null);
  };

  const handleProceedWithNormalBird = () => {
    sound.click();
    onFailAndProceed();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border-4 border-amber-500 shadow-2xl p-6 md:p-8 max-w-lg w-full text-center relative overflow-hidden">
        {/* Top Tag & Progress */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="bg-amber-100 text-amber-800 text-xs md:text-sm font-extrabold px-3 py-1 rounded-full border border-amber-300">
            Aras {level} • Pusingan {roundIndex + 1}/5
          </span>
          <span className="bg-emerald-100 text-emerald-800 text-xs md:text-sm font-extrabold px-3 py-1 rounded-full border border-emerald-300">
            {question.sp}
          </span>
        </div>

        {/* Motivational Header */}
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 rounded-2xl px-4 py-2 mb-2 inline-flex items-center justify-center gap-2 text-xs md:text-sm font-black text-amber-900 shadow-sm animate-pulse">
          <span className="text-base">💥</span>
          <span>Menara Tumbang! Jawab betul untuk membuka Burung Berkuasa:</span>
        </div>

        {/* Question Text */}
        <div className="my-5 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl">
          <h2 className="text-lg md:text-xl font-extrabold text-slate-800 leading-relaxed">
            {question.q}
          </h2>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          {shuffledOpts.map((opt, idx) => {
            let btnStyle = 'bg-white border-2 border-slate-300 hover:border-amber-400 hover:bg-amber-50 text-slate-700';

            if (isAnswered) {
              if (opt === question.a) {
                btnStyle = 'bg-emerald-500 border-2 border-emerald-600 text-white font-extrabold shadow-lg scale-[1.02]';
              } else if (opt === selectedOpt) {
                btnStyle = 'bg-rose-500 border-2 border-rose-600 text-white font-bold opacity-90';
              } else {
                btnStyle = 'bg-slate-100 border-2 border-slate-200 text-slate-400 opacity-50';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelect(opt)}
                className={`py-3.5 px-4 rounded-xl font-bold text-base md:text-lg transition-all active:scale-95 shadow-sm ${btnStyle}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Feedback Section */}
        {isAnswered && (
          <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-200 animate-slideUp">
            {isCorrect ? (
              <div className="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-800 font-extrabold text-sm md:text-base flex flex-col items-center justify-center gap-1">
                <div className="flex items-center gap-2">
                  <span>🎉</span>
                  <span>TAHNIAH! Jawapan Tepat!</span>
                </div>
                {attempts === 1 ? (
                  <span className="text-xs md:text-sm text-emerald-700 font-bold">
                    ⚡ Anda dihadiahkan Burung Berkuasa rawak untuk pusingan seterusnya!
                  </span>
                ) : (
                  <span className="text-xs text-amber-700 font-bold">
                    Konsep difahami! Anda menggunakan Burung Biasa untuk pusingan seterusnya.
                  </span>
                )}
              </div>
            ) : (
              <div className="text-left bg-rose-50 border-2 border-rose-300 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm mb-1">
                  <span>❌</span>
                  <span>Kurang tepat! Kuasa burung dinyahaktifkan bagi pusingan seterusnya.</span>
                </div>
                <p className="text-xs md:text-sm text-slate-700 font-medium mb-3 bg-white p-2.5 rounded-xl border border-rose-200">
                  <span className="font-bold text-slate-900 block mb-1">💡 Bimbingan Langkah:</span>
                  {question.exp}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleRetry}
                    className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs md:text-sm transition-all shadow-sm active:scale-95"
                  >
                    🔄 Cuba Lagi Soalan Ini
                  </button>
                  <button
                    onClick={handleProceedWithNormalBird}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs md:text-sm transition-all shadow-md active:scale-95"
                  >
                    ➡️ Teruskan (Guna Burung Biasa)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
