import React, { useState, useEffect } from 'react';
import { StudentRecord, Question } from '../types';
import { sound } from '../audio/soundEngine';

interface TeacherPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: StudentRecord[];
  onClearRecords: () => void;
  onSeedSampleRecords: () => void;
  questionBank: Question[][];
  onSaveQuestion: (lvl: number, roundIdx: number, updatedQ: Question) => void;
  onResetQuestions: () => void;
}

const TEACHER_PASSCODE = '050530';

export const TeacherPortalModal: React.FC<TeacherPortalModalProps> = ({
  isOpen,
  onClose,
  records,
  onClearRecords,
  onSeedSampleRecords,
  questionBank,
  onSaveQuestion,
  onResetQuestions
}) => {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isPinVisible, setIsPinVisible] = useState<boolean>(false);

  // Tab & Filter states
  const [activeTab, setActiveTab] = useState<'records' | 'editor'>('records');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  // Confirmation & Toast states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Question editor states
  const [editLevel, setEditLevel] = useState<number>(1);
  const [editRound, setEditRound] = useState<number>(0);
  const [editQText, setEditQText] = useState<string>('');
  const [editQOpts, setEditQOpts] = useState<string>('');
  const [editQAns, setEditQAns] = useState<string>('');
  const [editQExp, setEditQExp] = useState<string>('');
  const [editorMsg, setEditorMsg] = useState<string>('');

  // Reset auth when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsAuthenticated(false);
      setEnteredPin('');
      setPinError('');
      setShowDeleteConfirm(false);
      setToastMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Initialize editor fields when tab or level changes
  const loadQuestionForEdit = (lvl: number, round: number) => {
    const q = questionBank[lvl - 1]?.[round];
    if (q) {
      setEditQText(q.q);
      setEditQOpts(q.opts.join(', '));
      setEditQAns(q.a);
      setEditQExp(q.exp);
      setEditorMsg('');
    }
  };

  // PIN validation
  const handlePinSubmit = (pinToCheck?: string) => {
    const pin = pinToCheck !== undefined ? pinToCheck : enteredPin;
    if (pin === TEACHER_PASSCODE) {
      sound.correct();
      setIsAuthenticated(true);
      setPinError('');
    } else {
      sound.wrong();
      setPinError('Kata laluan tidak tepat. Sila masukkan kod 6 digit guru yang sah (050530).');
      setEnteredPin('');
    }
  };

  const handleKeyPress = (digit: string) => {
    sound.click();
    if (enteredPin.length < 6) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      setPinError('');
      if (nextPin.length === 6) {
        handlePinSubmit(nextPin);
      }
    }
  };

  const handleKeyBackspace = () => {
    sound.click();
    setEnteredPin((prev) => prev.slice(0, -1));
    setPinError('');
  };

  const handleKeyClear = () => {
    sound.click();
    setEnteredPin('');
    setPinError('');
  };

  const handleSaveEditedQ = () => {
    sound.click();
    const currentQ = questionBank[editLevel - 1]?.[editRound];
    if (!currentQ) return;

    const parsedOpts = editQOpts.split(',').map((s) => s.trim()).filter(Boolean);
    if (parsedOpts.length < 2) {
      setEditorMsg('Sila masukkan sekurang-kurangnya 2 pilihan jawapan (asingkan dengan koma).');
      return;
    }
    if (!parsedOpts.includes(editQAns.trim())) {
      setEditorMsg('Jawapan betul mestilah sepadan dengan salah satu pilihan jawapan.');
      return;
    }

    const updated: Question = {
      ...currentQ,
      q: editQText.trim(),
      opts: parsedOpts,
      a: editQAns.trim(),
      exp: editQExp.trim()
    };

    onSaveQuestion(editLevel, editRound, updated);
    setEditorMsg('✅ Soalan berjaya dikemas kini!');
    setTimeout(() => setEditorMsg(''), 3000);
  };

  // Unique classes for filter
  const classList = Array.from(new Set(records.map((r) => r.class))).filter(Boolean);
  const filteredRecords = selectedClassFilter === 'all'
    ? records
    : records.filter((r) => r.class === selectedClassFilter);

  // Export CSV without window.alert
  const handleExportCSV = () => {
    sound.click();
    if (records.length === 0) {
      setToastMessage('⚠️ Tiada rekod murid untuk dieksport.');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'Tarikh,Nama Murid,Kelas,Aras Dicapai,Bintang,Markah,Ketepatan (%),Mod Permainan\n';

    records.forEach((r) => {
      csvContent += `"${r.date}","${r.name}","${r.class}","Aras ${r.level}","${r.stars} Bintang","${r.score}","${r.accuracy}%","${r.mode}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rekod_PBD_Bab3_Matematik_Tingkatan1.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToastMessage('📥 Fail CSV berjaya dimuat turun!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Perform record clearance safely without window.confirm
  const handleConfirmClearRecords = () => {
    sound.click();
    onClearRecords();
    setShowDeleteConfirm(false);
    setToastMessage('🗑️ Semua rekod murid telah berjaya dipadam.');
    setTimeout(() => setToastMessage(''), 3500);
  };

  // =========================================================================
  // VIEW 1: PASSCODE AUTHENTICATION SCREEN (Password: 050530)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
        <div className="bg-white rounded-3xl border-4 border-emerald-600 shadow-2xl p-6 md:p-8 max-w-md w-full text-center relative overflow-hidden">
          {/* Close button */}
          <button
            onClick={() => {
              sound.click();
              onClose();
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 font-bold flex items-center justify-center text-sm"
          >
            ✕
          </button>

          {/* Lock Icon */}
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-3xl shadow-lg border-2 border-emerald-300 animate-pulse">
            🔒
          </div>

          <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-1">
            Kemasukan Khas Guru
          </h2>
          <p className="text-xs text-slate-500 font-medium mb-5">
            Sila masukkan kata laluan keselamatan untuk membuka rekod PBD murid dan ubah soalan.
          </p>

          {/* 6 Digit Display */}
          <div className="flex justify-center gap-2 mb-4">
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const char = enteredPin[idx];
              return (
                <div
                  key={idx}
                  className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-black transition-all ${
                    char
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 scale-105 shadow-sm'
                      : 'border-slate-300 bg-slate-50 text-slate-300'
                  }`}
                >
                  {char ? (isPinVisible ? char : '●') : ''}
                </div>
              );
            })}
          </div>

          {/* Hidden/Native input for physical keyboards */}
          <input
            type="password"
            maxLength={6}
            value={enteredPin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              setEnteredPin(val);
              setPinError('');
              if (val.length === 6) {
                handlePinSubmit(val);
              }
            }}
            autoFocus
            className="w-full text-center tracking-widest text-lg py-2 border rounded-xl mb-3 focus:outline-none focus:border-emerald-500 bg-slate-50"
            placeholder="Taip 6 digit di sini..."
          />

          {/* Show / Hide toggle */}
          <div className="flex items-center justify-between px-1 mb-3 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => setIsPinVisible(!isPinVisible)}
              className="text-emerald-700 hover:underline font-bold"
            >
              {isPinVisible ? '🙈 Sembunyikan Kata Laluan' : '👁️ Tunjukkan Kata Laluan'}
            </button>
            <span className="text-[11px] text-slate-400">Kata laluan: 050530</span>
          </div>

          {/* Error Message */}
          {pinError && (
            <div className="bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold p-2.5 rounded-xl mb-4 animate-shake">
              {pinError}
            </div>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="py-3 bg-slate-100 hover:bg-emerald-100 active:bg-emerald-200 text-slate-800 font-black text-lg rounded-xl border border-slate-200 transition-all active:scale-95 shadow-sm"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleKeyClear}
              className="py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all active:scale-95"
            >
              Kosongkan
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="py-3 bg-slate-100 hover:bg-emerald-100 active:bg-emerald-200 text-slate-800 font-black text-lg rounded-xl border border-slate-200 transition-all active:scale-95 shadow-sm"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleKeyBackspace}
              className="py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm rounded-xl border border-slate-300 transition-all active:scale-95"
            >
              ⌫ Padam
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                sound.click();
                onClose();
              }}
              className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-sm transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => handlePinSubmit()}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-sm transition-all shadow-md active:scale-95"
            >
              Sahkan Akses ➔
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED TEACHER PORTAL
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border-4 border-emerald-600 shadow-2xl p-6 md:p-8 max-w-2xl w-full max-h-[92vh] overflow-y-auto text-center relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
          <div className="text-left">
            <h2 className="text-xl md:text-2xl font-black text-emerald-700 flex items-center gap-2">
              <span>📋</span>
              <span>Portal Guru: Pentaksiran Bilik Darjah (PBD)</span>
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                🔓 Akses Guru Disahkan
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Matematik Tingkatan 1 • Bab 3
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              sound.click();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold flex items-center justify-center text-sm"
            title="Tutup & Kunci Portal"
          >
            ✕
          </button>
        </div>

        {/* In-Modal Toast Feedback Notification */}
        {toastMessage && (
          <div className="my-3 p-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold shadow-md animate-slideDown flex items-center justify-center gap-2">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab switch */}
        <div className="flex gap-2 my-4 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => {
              sound.click();
              setActiveTab('records');
            }}
            className={`flex-1 py-2 rounded-xl text-xs md:text-sm font-extrabold transition-all ${
              activeTab === 'records' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📊 Rekod Murid ({records.length})
          </button>
          <button
            onClick={() => {
              sound.click();
              setActiveTab('editor');
              loadQuestionForEdit(editLevel, editRound);
            }}
            className={`flex-1 py-2 rounded-xl text-xs md:text-sm font-extrabold transition-all ${
              activeTab === 'editor' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ✏️ Editor Soalan Guru
          </button>
        </div>

        {activeTab === 'records' ? (
          <div>
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <span>Tapis Kelas:</span>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs"
                >
                  <option value="all">Semua Kelas</option>
                  {classList.map((c, i) => (
                    <option key={`cls_${c}_${i}`} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1 active:scale-95"
                >
                  <span>📥</span>
                  <span>Eksport CSV (Excel)</span>
                </button>
                <button
                  onClick={() => {
                    sound.click();
                    onSeedSampleRecords();
                    setToastMessage('✅ Data contoh berjaya ditambah!');
                    setTimeout(() => setToastMessage(''), 2500);
                  }}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm active:scale-95"
                  title="Tambah data contoh untuk demonstrasi"
                >
                  + Contoh
                </button>
              </div>
            </div>

            {/* In-Modal Delete Confirmation Box (No window.confirm needed!) */}
            {showDeleteConfirm && (
              <div className="mb-4 p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-left animate-slideDown shadow-md">
                <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm mb-1">
                  <span>⚠️</span>
                  <span>Pengesahan Pemadaman Rekod</span>
                </div>
                <p className="text-xs text-slate-700 mb-3">
                  Adakah anda pasti ingin memadam semua <strong>{records.length}</strong> rekod murid dari pangkalan data peranti ini? Tindakan ini <strong>tidak boleh dikembalikan</strong>.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirmClearRecords}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all active:scale-95"
                  >
                    🗑️ Ya, Padam Semua Rekod Sekarang
                  </button>
                  <button
                    onClick={() => {
                      sound.click();
                      setShowDeleteConfirm(false);
                    }}
                    className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-all"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-2xl mb-4 text-xs">
              <table className="w-full text-left">
                <thead className="bg-emerald-50 text-emerald-900 sticky top-0 font-bold border-b border-emerald-100">
                  <tr>
                    <th className="p-2.5">Tarikh</th>
                    <th className="p-2.5">Nama</th>
                    <th className="p-2.5">Kelas</th>
                    <th className="p-2.5">Aras</th>
                    <th className="p-2.5">Bintang</th>
                    <th className="p-2.5 text-right">Markah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                        Belum ada rekod murid dicatatkan.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r, idx) => (
                      <tr key={`rec_${r.id}_${idx}`} className="hover:bg-slate-50">
                        <td className="p-2.5 text-slate-500 whitespace-nowrap">{r.date}</td>
                        <td className="p-2.5 font-bold text-slate-800">{r.name}</td>
                        <td className="p-2.5 text-slate-600">{r.class}</td>
                        <td className="p-2.5 font-semibold text-orange-600">Aras {r.level}</td>
                        <td className="p-2.5 text-amber-500">
                          {r.stars === 3 ? '⭐⭐⭐' : r.stars === 2 ? '⭐⭐' : '⭐'}
                        </td>
                        <td className="p-2.5 text-right font-black text-emerald-600">{r.score}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {records.length > 0 && !showDeleteConfirm && (
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs text-slate-400">
                  Jumlah: {records.length} rekod disimpan
                </span>
                <button
                  onClick={() => {
                    sound.click();
                    setShowDeleteConfirm(true);
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span>🗑️</span>
                  <span>Padam Semua Rekod</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-left bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-6 space-y-3 text-xs md:text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Aras (1 - 15):</label>
                <select
                  value={editLevel}
                  onChange={(e) => {
                    const l = Number(e.target.value);
                    setEditLevel(l);
                    loadQuestionForEdit(l, editRound);
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 font-semibold"
                >
                  {Array.from({ length: 15 }, (_, i) => i + 1).map((lvl) => (
                    <option key={`edit_lvl_${lvl}`} value={lvl}>
                      Aras {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pusingan Soalan (1 - 5):</label>
                <select
                  value={editRound}
                  onChange={(e) => {
                    const r = Number(e.target.value);
                    setEditRound(r);
                    loadQuestionForEdit(editLevel, r);
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 font-semibold"
                >
                  <option value={0}>Soalan 1</option>
                  <option value={1}>Soalan 2</option>
                  <option value={2}>Soalan 3</option>
                  <option value={3}>Soalan 4</option>
                  <option value={4}>Soalan 5</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Teks Soalan:</label>
              <textarea
                value={editQText}
                onChange={(e) => setEditQText(e.target.value)}
                rows={2}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Pilihan Jawapan (Asingkan dengan koma):
              </label>
              <input
                type="text"
                value={editQOpts}
                onChange={(e) => setEditQOpts(e.target.value)}
                placeholder="cth: 36, 12, 18, 42"
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Jawapan Betul:</label>
              <input
                type="text"
                value={editQAns}
                onChange={(e) => setEditQAns(e.target.value)}
                placeholder="cth: 36"
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-emerald-700 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Penerangan Langkah / Panduan Kesilapan:
              </label>
              <textarea
                value={editQExp}
                onChange={(e) => setEditQExp(e.target.value)}
                rows={2}
                placeholder="cth: 6 × 6 = 36."
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium outline-none focus:border-emerald-500"
              />
            </div>

            {editorMsg && (
              <div
                className={`p-2.5 rounded-xl font-bold text-xs ${
                  editorMsg.startsWith('✅')
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {editorMsg}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveEditedQ}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all active:scale-95"
              >
                💾 Simpan Soalan
              </button>
              <button
                onClick={() => {
                  sound.click();
                  onResetQuestions();
                  loadQuestionForEdit(editLevel, editRound);
                  setEditorMsg('✅ Soalan dikembalikan ke asal.');
                }}
                className="py-3 px-4 bg-slate-300 hover:bg-slate-400 text-slate-700 font-bold rounded-xl text-xs"
              >
                Reset Soalan Asal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
