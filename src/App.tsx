import { useState, useEffect, useRef, useCallback } from 'react';
import { ThreeGameScene } from './game3d/ThreeGameScene';
import { initialQuestionBank } from './data/questions';
import { BIRD_CONFIGS, getRandomPowerBirdType } from './data/birds';
import {
  GameState,
  Question,
  LevelProgress,
  StudentRecord,
  BirdType
} from './types';
import { HUD } from './components/HUD';
import { QuestionModal } from './components/QuestionModal';
import { LeftMenuModal } from './components/LeftMenuModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { LevelClearModal } from './components/LevelClearModal';
import { TeacherPortalModal } from './components/TeacherPortalModal';
import { StartModal } from './components/StartModal';
import { HelpModal } from './components/HelpModal';

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ThreeGameScene | null>(null);

  // Question bank state (supports teacher modifications)
  const [questionBank, setQuestionBank] = useState<Question[][]>(() => {
    const saved = localStorage.getItem('mathbirds_custom_q');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        //
      }
    }
    return initialQuestionBank;
  });

  // Player progress state
  const [progress, setProgress] = useState<LevelProgress>(() => {
    const saved = localStorage.getItem('mathbirds_progress_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        //
      }
    }
    return {
      unlockedLevel: 1,
      levelStars: {},
      highScores: {}
    };
  });

  // Student records for Teacher & Leaderboard
  const [records, setRecords] = useState<StudentRecord[]>(() => {
    const saved = localStorage.getItem('mathbirds_records_v4');
    if (saved) {
      try {
        const parsed: StudentRecord[] = JSON.parse(saved);
        const seen = new Set<string>();
        return parsed.map((rec, idx) => {
          if (!rec.id || seen.has(rec.id)) {
            const uniqueId = `rec_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`;
            seen.add(uniqueId);
            return { ...rec, id: uniqueId };
          }
          seen.add(rec.id);
          return rec;
        });
      } catch {
        //
      }
    }
    return [];
  });

  // Game UI state
  const [gameState, setGameState] = useState<GameState>('start');
  const [playerName, setPlayerName] = useState<string>('Wira Matematik');
  const [playerClass, setPlayerClass] = useState<string>('1 Cemerlang');
  const [gameMode, setGameMode] = useState<'individu' | 'kumpulan'>('individu');

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [currentLevelQuestions, setCurrentLevelQuestions] = useState<Question[]>([]);
  const [levelScore, setLevelScore] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [wrongAttempts, setWrongAttempts] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [remainingTargets, setRemainingTargets] = useState<number>(1);
  const [missedMessage, setMissedMessage] = useState<string | null>(null);

  // Bird & Power states
  // Every level starts with Burung Biasa (0).
  // Correct answer gives a random power bird (1-5).
  // Wrong answer revokes power and resets to Burung Biasa (0).
  const [activeBirdType, setActiveBirdType] = useState<BirdType>(0);
  const [powerNotification, setPowerNotification] = useState<{
    type: 'reward' | 'demote';
    birdName: string;
    birdIcon: string;
  } | null>(null);

  // Sub-modals
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(false);
  const [isTeacherPortalOpen, setIsTeacherPortalOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isLevelClearOpen, setIsLevelClearOpen] = useState<boolean>(false);

  // Flight & power states
  const [inFlight, setInFlight] = useState<boolean>(false);
  const [powerUsed, setPowerUsed] = useState<boolean>(false);
  const [currentWind, setCurrentWind] = useState<number>(0);

  const activeBirdConfig = BIRD_CONFIGS[activeBirdType] || BIRD_CONFIGS[0];

  // --------------------------------------------------------------------------
  // INITIALIZE 3D SCENE ONCE
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new ThreeGameScene(mountRef.current);
    sceneRef.current = scene;

    const handleResize = () => {
      scene.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scene.destroy();
    };
  }, []);

  // --------------------------------------------------------------------------
  // SETUP ROUND (BUILD TOWER FIRST!)
  // --------------------------------------------------------------------------
  const setupRound = useCallback((lvl: number, roundIdx: number, birdToUse?: BirdType) => {
    setGameState('aiming');
    setInFlight(false);
    setPowerUsed(false);
    setMissedMessage(null);

    const bType = birdToUse !== undefined ? birdToUse : 0;
    setActiveBirdType(bType);

    if (sceneRef.current) {
      sceneRef.current.setupLevel(lvl, roundIdx, bType);
      setCurrentWind(sceneRef.current.wind);

      // Number of chicks inside this tower: 1 for level 1-5, 2 for level 6-15
      const totalChicks = lvl <= 5 ? 1 : 2;
      setRemainingTargets(totalChicks);

      // Register callbacks
      sceneRef.current.setCallbacks(
        // 1. On chick hit / squashed
        (_chickIdx, remaining) => {
          setRemainingTargets(remaining);
          setLevelScore((prev) => prev + 25);
          setTotalScore((prev) => prev + 25);
        },
        // 2. On all chicks defeated / tower successfully collapsed!
        () => {
          setInFlight(false);
          setGameState('question');
        },
        // 3. On shot missed without defeating all targets
        () => {
          setInFlight(false);
          setMissedMessage('Bidikan belum menumbangkan sasaran! Tarik sekali lagi!');
          sceneRef.current?.reloadSlingshotForAnotherShot();
          setTimeout(() => {
            setMissedMessage(null);
          }, 3500);
        },
        // 4. On Launch
        () => {
          setInFlight(true);
          setPowerUsed(false);
        },
        // 5. On Flight End
        () => {
          setInFlight(false);
        },
        // 6. On Power Activated
        () => {
          setPowerUsed(true);
        }
      );
    }
  }, []);

  // --------------------------------------------------------------------------
  // PREPARE LEVEL
  // --------------------------------------------------------------------------
  const startLevel = useCallback((lvl: number) => {
    setCurrentLevel(lvl);
    setRoundIndex(0);
    setLevelScore(0);
    setWrongAttempts(0);
    setTotalAttempts(0);
    setActiveBirdType(0); // Level always starts with Burung Biasa!
    setPowerNotification(null);

    const rawQuestions = questionBank[lvl - 1] || questionBank[0];
    const shuffled = shuffleArray(rawQuestions);
    setCurrentLevelQuestions(shuffled);

    setIsLevelClearOpen(false);
    setIsLevelSelectOpen(false);
    setIsMenuOpen(false);

    // Build the first tower right away with Burung Biasa (0)
    setupRound(lvl, 0, 0);
  }, [questionBank, setupRound]);

  // Finish Level Helper
  const completeLevel = useCallback(() => {
    let stars = 3;
    if (wrongAttempts >= 3) stars = 1;
    else if (wrongAttempts >= 1) stars = 2;

    const accuracy = totalAttempts === 0
      ? 100
      : Math.round(((5) / (5 + wrongAttempts)) * 100);

    const nextUnlocked = Math.max(progress.unlockedLevel, Math.min(15, currentLevel + 1));
    const nextProgress: LevelProgress = {
      unlockedLevel: nextUnlocked,
      levelStars: {
        ...progress.levelStars,
        [currentLevel]: Math.max(progress.levelStars[currentLevel] || 0, stars)
      },
      highScores: {
        ...progress.highScores,
        [currentLevel]: Math.max(progress.highScores[currentLevel] || 0, levelScore + 25)
      }
    };
    setProgress(nextProgress);
    localStorage.setItem('mathbirds_progress_v2', JSON.stringify(nextProgress));

    const newRecord: StudentRecord = {
      id: 'rec_' + Date.now(),
      date: new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      name: playerName,
      class: playerClass,
      level: currentLevel,
      score: levelScore + 25,
      stars,
      accuracy,
      mode: gameMode
    };
    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('mathbirds_records_v4', JSON.stringify(updatedRecords));

    setIsLevelClearOpen(true);
    setGameState('level_clear');
  }, [currentLevel, wrongAttempts, totalAttempts, progress, levelScore, playerName, playerClass, gameMode, records]);

  // When player answers the math question correctly after collapsing the tower
  const handleCorrectQuestion = useCallback((firstTrySuccess: boolean) => {
    setLevelScore((prev) => prev + 25);
    setTotalScore((prev) => prev + 25);

    let nextBird: BirdType = 0;

    if (firstTrySuccess) {
      // Award a random power bird (1 to 5)
      nextBird = getRandomPowerBirdType();
      setActiveBirdType(nextBird);
      const cfg = BIRD_CONFIGS[nextBird];
      setPowerNotification({
        type: 'reward',
        birdName: cfg.name,
        birdIcon: cfg.icon
      });
    } else {
      // Revert to Burung Biasa
      nextBird = 0;
      setActiveBirdType(0);
      setPowerNotification({
        type: 'demote',
        birdName: 'Burung Biasa',
        birdIcon: '🎯'
      });
    }

    setTimeout(() => {
      setPowerNotification(null);
    }, 4000);

    if (roundIndex < 4) {
      // Advance to next round in this level with the awarded/demoted bird
      const nextRound = roundIndex + 1;
      setRoundIndex(nextRound);
      setupRound(currentLevel, nextRound, nextBird);
    } else {
      // Level complete!
      completeLevel();
    }
  }, [roundIndex, currentLevel, completeLevel, setupRound]);

  // When player fails a question and chooses to proceed with Burung Biasa
  const handleFailAndProceed = useCallback(() => {
    setActiveBirdType(0);
    setPowerNotification({
      type: 'demote',
      birdName: 'Burung Biasa',
      birdIcon: '🎯'
    });
    setTimeout(() => {
      setPowerNotification(null);
    }, 4000);

    if (roundIndex < 4) {
      const nextRound = roundIndex + 1;
      setRoundIndex(nextRound);
      setupRound(currentLevel, nextRound, 0);
    } else {
      completeLevel();
    }
  }, [roundIndex, currentLevel, completeLevel, setupRound]);

  // When an attempt is wrong
  const handleFailAttempt = useCallback(() => {
    setWrongAttempts((prev) => prev + 1);
    setTotalAttempts((prev) => prev + 1);
    // Revoke power bird
    setActiveBirdType(0);
  }, []);

  // Mid-air power trigger
  const handleActivatePower = () => {
    if (sceneRef.current && inFlight && !powerUsed && activeBirdType !== 0) {
      const ok = sceneRef.current.activatePower();
      if (ok) setPowerUsed(true);
    }
  };

  // Keyboard Spacebar to activate power
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && inFlight && !powerUsed && activeBirdType !== 0) {
        e.preventDefault();
        handleActivatePower();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inFlight, powerUsed, activeBirdType]);

  // Teacher portal operations
  const handleSaveQuestion = (lvl: number, roundIdx: number, updatedQ: Question) => {
    const nextBank = [...questionBank];
    if (nextBank[lvl - 1]) {
      nextBank[lvl - 1] = [...nextBank[lvl - 1]];
      nextBank[lvl - 1][roundIdx] = updatedQ;
      setQuestionBank(nextBank);
      localStorage.setItem('mathbirds_custom_q', JSON.stringify(nextBank));
    }
  };

  const handleResetQuestions = () => {
    setQuestionBank(initialQuestionBank);
    localStorage.removeItem('mathbirds_custom_q');
  };

  const handleClearRecords = () => {
    setRecords([]);
    localStorage.removeItem('mathbirds_records_v4');
  };

  const handleSeedSampleRecords = () => {
    const ts = Date.now();
    const samples: StudentRecord[] = [
      { id: `sample_${ts}_1`, date: '30/10/2026', name: 'Ahmad Faiz', class: '1 Cemerlang', level: 5, score: 150, stars: 3, accuracy: 100, mode: 'kumpulan' },
      { id: `sample_${ts}_2`, date: '30/10/2026', name: 'Nur Aisyah', class: '1 Cemerlang', level: 4, score: 125, stars: 3, accuracy: 95, mode: 'kumpulan' },
      { id: `sample_${ts}_3`, date: '30/10/2026', name: 'Chong Wei Lun', class: '1 Dinamik', level: 3, score: 95, stars: 2, accuracy: 80, mode: 'individu' },
      { id: `sample_${ts}_4`, date: '30/10/2026', name: 'Pravin Kumar', class: '1 Cemerlang', level: 3, score: 85, stars: 2, accuracy: 75, mode: 'kumpulan' },
      { id: `sample_${ts}_5`, date: '30/10/2026', name: 'Siti Nurhaliza', class: '1 Dinamik', level: 2, score: 70, stars: 2, accuracy: 70, mode: 'individu' }
    ];
    const combined = [...samples, ...records];
    setRecords(combined);
    localStorage.setItem('mathbirds_records_v4', JSON.stringify(combined));
  };

  const handleStartGame = (name: string, sClass: string, mode: 'individu' | 'kumpulan') => {
    setPlayerName(name);
    setPlayerClass(sClass);
    setGameMode(mode);
    setTotalScore(0);
    startLevel(1);
  };

  const currentQ = currentLevelQuestions[roundIndex] || (questionBank[currentLevel - 1]?.[roundIndex]);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-sky-300">
      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* In-Game HUD (Visible during gameplay & question) */}
      {(gameState === 'aiming' || gameState === 'flying' || gameState === 'question') && (
        <HUD
          level={currentLevel}
          roundIndex={roundIndex}
          score={totalScore}
          birdConfig={activeBirdConfig}
          wind={currentWind}
          inFlight={inFlight}
          powerUsed={powerUsed}
          onOpenMenu={() => setIsMenuOpen(true)}
          onActivatePower={handleActivatePower}
          playerName={playerName}
          playerClass={playerClass}
          remainingTargets={remainingTargets}
          missedMessage={missedMessage}
          powerNotification={powerNotification}
        />
      )}

      {/* 1. Start Modal */}
      {gameState === 'start' && (
        <StartModal
          onStartGame={handleStartGame}
          onOpenTeacherPortal={() => setIsTeacherPortalOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
      )}

      {/* 2. Math Question Modal (Pops up AFTER tower is demolished!) */}
      {gameState === 'question' && currentQ && (
        <QuestionModal
          question={currentQ}
          level={currentLevel}
          roundIndex={roundIndex}
          onCorrectAnswer={handleCorrectQuestion}
          onFailAndProceed={handleFailAndProceed}
          onFailAttempt={handleFailAttempt}
        />
      )}

      {/* 3. Level Complete Modal */}
      {isLevelClearOpen && (
        <LevelClearModal
          level={currentLevel}
          score={levelScore}
          stars={progress.levelStars[currentLevel] || 3}
          accuracy={
            totalAttempts === 0
              ? 100
              : Math.round(((5) / (5 + wrongAttempts)) * 100)
          }
          onNextLevel={() => startLevel(Math.min(15, currentLevel + 1))}
          onReplay={() => startLevel(currentLevel)}
          onLevelSelect={() => {
            setIsLevelClearOpen(false);
            setIsLevelSelectOpen(true);
          }}
        />
      )}

      {/* 4. Left Menu Modal */}
      <LeftMenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectLevelModal={() => {
          setIsMenuOpen(false);
          setIsLevelSelectOpen(true);
        }}
        onRestartLevel={() => {
          setIsMenuOpen(false);
          startLevel(currentLevel);
        }}
        onOpenTeacherPortal={() => {
          setIsMenuOpen(false);
          setIsTeacherPortalOpen(true);
        }}
        onQuitToMenu={() => {
          setIsMenuOpen(false);
          setGameState('start');
        }}
        records={records}
      />

      {/* 5. 15 Level Selector Modal */}
      {isLevelSelectOpen && (
        <LevelSelectModal
          progress={progress}
          onSelectLevel={(lvl) => {
            setIsLevelSelectOpen(false);
            startLevel(lvl);
          }}
          onBack={() => {
            setIsLevelSelectOpen(false);
            if (gameState !== 'start') {
              setGameState('start');
            }
          }}
        />
      )}

      {/* 6. Teacher Assessment & PBD Portal Modal */}
      <TeacherPortalModal
        isOpen={isTeacherPortalOpen}
        onClose={() => setIsTeacherPortalOpen(false)}
        records={records}
        onClearRecords={handleClearRecords}
        onSeedSampleRecords={handleSeedSampleRecords}
        questionBank={questionBank}
        onSaveQuestion={handleSaveQuestion}
        onResetQuestions={handleResetQuestions}
      />

      {/* 7. Help Modal (Bird Powers & Progression) */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
