import React, { useState, useEffect, useCallback } from 'react';
import GlobeViz from './components/GlobeViz';
import InfoPanel from './components/InfoPanel';
import ChatInterface from './components/ChatInterface';
import AssessmentPanel from './components/AssessmentPanel';
import RegistrationPanel from './components/RegistrationPanel';
import ErrorBoundary from './components/ErrorBoundary';
import HistoricImage from './components/HistoricImage';
import { ILLUSTRATIONS, LOCATIONS, ROUTES, GAME_EVENTS, HISTORY_MILESTONES, QUIZ_QUESTIONS } from './constants';
import { GameStats, GameEvent, GameChoice, QuizQuestion, StudentProfile } from './types';
import { Clock, AlertTriangle, Skull, Minimize2, Maximize2, BookOpen, Anchor, ChevronLeft, ChevronRight, Home, GraduationCap } from 'lucide-react';

const INITIAL_STATS: GameStats = {
  trust: 50,
  morale: 50,
  knowledge: 0,
  connections: 0,
  silver: 50,
  hasQilin: false,
  timeRemaining: 1800 // 30 mins
};

type GamePhase = 'registration' | 'intro' | 'quiz' | 'playing' | 'challenge' | 'result' | 'gameover' | 'victory' | 'history' | 'assessment';

// Common wrapper class for modals to ensure consistent styling
const ModalWrapper = ({ children }: { children?: React.ReactNode }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-imperial-ocean/60 backdrop-blur-sm p-4 animate-fadeIn">
      {children}
  </div>
);

const PaperCard = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-imperial-parchment border-2 border-imperial-ink/30 rounded-xl shadow-2xl relative overflow-hidden text-imperial-ink font-serif ${className}`}>
      {/* Paper texture feel */}
      <div className="absolute inset-0 bg-imperial-gold/5 pointer-events-none"></div>
      <div className="relative z-10">{children}</div>
  </div>
);

const App: React.FC = () => {
  // Game State
  const [phase, setPhase] = useState<GamePhase>('registration');
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  
  // Student Data
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([]);

  // History State
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  
  const [isUiMinimized, setIsUiMinimized] = useState(false);
  
  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<{correct: boolean, text: string, selectedId: number | null} | null>(null);

  // Challenge/Result State
  const [pendingChoice, setPendingChoice] = useState<GameChoice | null>(null);
  const [activeChallengeQuestion, setActiveChallengeQuestion] = useState<QuizQuestion | null>(null);
  const [resultMessage, setResultMessage] = useState<{success: boolean, text: string, changes: string[]} | null>(null);
  const [usedQuizIndices, setUsedQuizIndices] = useState<number[]>([]);

  // Timer
  useEffect(() => {
    if (phase === 'playing' && stats.timeRemaining > 0) {
      const timer = setInterval(() => {
        setStats(prev => {
          if (prev.timeRemaining <= 1) {
             setPhase('gameover');
             setResultMessage({success: false, text: "時辰用盡了。船還沒有回到劉家港，這一趟只能記到這裡。", changes: []});
             return prev;
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase, stats.timeRemaining]);

  // Check Game Over conditions
  useEffect(() => {
    if (phase === 'playing') {
      if (stats.trust <= 0) {
        setPhase('gameover');
        setResultMessage({success: false, text: "皇上來信召回艦隊。信任用完了，船要掉頭。", changes: []});
      } else if (stats.morale <= 0) {
        setPhase('gameover');
        setResultMessage({success: false, text: "水手不肯再聽令。船散了，這一趟走不下去。", changes: []});
      }
    }
  }, [stats, phase]);

  // Determine Active Location ID based on phase
  const getActiveLocationId = () => {
    if (phase === 'history') {
      return HISTORY_MILESTONES[currentHistoryIndex]?.locationId;
    }
    return currentEvent?.locationId;
  };

  // --- Logic Functions ---

  const handleRegistrationComplete = (profiles: StudentProfile[]) => {
    setStudentProfiles(profiles);
    setPhase('intro');
  };

  const shuffleQuiz = () => {
    // Logic to select 5 unique questions that haven't been used yet (though initially usedQuizIndices is likely empty)
    // 1. Create a list of all possible indices
    const allIndices = Array.from({ length: QUIZ_QUESTIONS.length }, (_, i) => i);
    
    // 2. Filter out already used ones (if any, though usually this runs at start)
    const availableIndices = allIndices.filter(i => !usedQuizIndices.includes(i));
    
    // 3. Shuffle the available indices
    const shuffled = availableIndices.sort(() => 0.5 - Math.random());
    
    // 4. Take the first 5 (or fewer if we ran out)
    const selectedIndices = shuffled.slice(0, 5);
    
    // 5. Map back to question objects
    const selectedQuestions = selectedIndices.map(i => QUIZ_QUESTIONS[i]);

    setQuizQuestions(selectedQuestions);
    
    // 6. Update the used indices state so these aren't picked for challenges later
    setUsedQuizIndices(prev => [...prev, ...selectedIndices]);
  };

  const startQuiz = () => {
    shuffleQuiz();
    setPhase('quiz');
  };

  const startHistoryMode = () => {
    setPhase('history');
    setCurrentHistoryIndex(0);
  };

  const handleQuizAnswer = (idx: number) => {
    const q = quizQuestions[currentQuizIndex];
    const isCorrect = idx === q.correct;
    if (isCorrect) setQuizScore(s => s + 1);
    setQuizFeedback({
      correct: isCorrect,
      text: q.explanation,
      selectedId: idx
    });
  };

  const nextQuizQuestion = () => {
    setQuizFeedback(null);
    if (currentQuizIndex < 4) {
      setCurrentQuizIndex(i => i + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    // Calculate initial stats based on quiz
    const baseStats = { ...INITIAL_STATS };
    baseStats.trust = 50 + quizScore * 5;
    baseStats.morale = 60 + quizScore * 5;
    baseStats.silver = 80 + quizScore * 10;
    
    if (quizScore === 5) {
      baseStats.knowledge = 5;
      baseStats.connections = 5;
    } else {
      baseStats.knowledge = 2 + Math.floor(quizScore / 2);
      baseStats.connections = 2 + Math.floor(quizScore / 2);
    }
    
    setStats(baseStats);
    setPhase('playing');
    loadEvent(0);
  };

  const loadEvent = (idx: number) => {
    if (idx >= GAME_EVENTS.length) {
      finishGame();
      return;
    }
    setCurrentEventIndex(idx);
    setCurrentEvent(GAME_EVENTS[idx]);
  };

  const requirementMet = (choice: GameChoice) => {
    if (!choice.requirement) return true;
    return stats[choice.requirement.stat] >= choice.requirement.value;
  };

  const handleChoice = (choice: GameChoice) => {
    if (choice.cost && stats.silver < choice.cost.silver) return;
    if (!requirementMet(choice)) return;

    if (choice.cost) {
      setStats(s => ({...s, silver: s.silver - choice.cost!.silver}));
    }

    if (choice.needsChallenge) {
      setPendingChoice(choice);
      
      // Select a question that HASN'T been used yet
      // 1. Find all indices not in usedQuizIndices
      const allIndices = Array.from({ length: QUIZ_QUESTIONS.length }, (_, i) => i);
      const availableIndices = allIndices.filter(i => !usedQuizIndices.includes(i));
      
      let nextIdx: number;
      
      if (availableIndices.length > 0) {
        // Pick random from available
        nextIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      } else {
        // Fallback: If we exhausted all questions, pick any random one (rare case)
        nextIdx = Math.floor(Math.random() * QUIZ_QUESTIONS.length);
      }
      
      setUsedQuizIndices(prev => [...prev, nextIdx]);
      setActiveChallengeQuestion(QUIZ_QUESTIONS[nextIdx]);
      setPhase('challenge');
    } else {
      applyEffects(choice.effects, choice.successText, true, choice.isQilinEvent);
    }
  };

  const handleChallengeAnswer = (idx: number) => {
    if (!activeChallengeQuestion || !pendingChoice) return;
    const isCorrect = idx === activeChallengeQuestion.correct;
    
    setQuizFeedback({
        correct: isCorrect,
        text: activeChallengeQuestion.explanation,
        selectedId: idx
    });

    // Delay to show feedback before result
    setTimeout(() => {
        setQuizFeedback(null);
        if (isCorrect) {
          applyEffects(pendingChoice.effects, pendingChoice.successText, true, pendingChoice.isQilinEvent);
        } else {
          applyEffects(pendingChoice.failEffects || {}, pendingChoice.failText || "判定失敗", false, false);
        }
    }, 2000);
  };

  const applyEffects = (effects: any, text: string, success: boolean, isQilin: boolean = false) => {
    // Build the badge list once, outside the state updater. React Strict Mode
    // invokes updaters twice in development; pushing inside setStats duplicated
    // 「信任 -10」 / 「士氣 +5」. The stat write itself already used `prev`, so
    // the HUD only moved once. Production does not double-invoke updaters.
    const changes: string[] = [];
    if (effects.trust) changes.push(`信任 ${effects.trust > 0 ? '+' : ''}${effects.trust}`);
    if (effects.morale) changes.push(`士氣 ${effects.morale > 0 ? '+' : ''}${effects.morale}`);
    if (effects.knowledge) changes.push(`學識 +${effects.knowledge}`);
    if (effects.connections) changes.push(`人脈 +${effects.connections}`);
    if (effects.silver) changes.push(`銀兩 ${effects.silver > 0 ? '+' : ''}${effects.silver}`);
    if (success && isQilin) changes.push('獲得麒麟！');

    setStats(prev => {
      const next = { ...prev };
      if (effects.trust) next.trust = Math.min(100, Math.max(0, next.trust + effects.trust));
      if (effects.morale) next.morale = Math.min(100, Math.max(0, next.morale + effects.morale));
      if (effects.knowledge) next.knowledge += effects.knowledge;
      if (effects.connections) next.connections += effects.connections;
      if (effects.silver) next.silver += effects.silver;
      if (success && isQilin) next.hasQilin = true;
      return next;
    });

    setResultMessage({ success, text, changes });
    setPhase('result');
  };

  const nextTurn = () => {
    setPhase('playing');
    setResultMessage(null);
    setPendingChoice(null);
    loadEvent(currentEventIndex + 1);
  };

  const historyNext = () => {
    if (currentHistoryIndex < HISTORY_MILESTONES.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
    }
  };

  const historyPrev = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
    }
  };

  const finishGame = () => {
    setPhase('victory');
  };

  // --- Render Helpers ---
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  const getFinalGrade = () => {
    if (stats.trust >= 90 && stats.hasQilin && stats.morale >= 80) return 'S';
    if (stats.trust >= 80) return 'A';
    if (stats.trust >= 60) return 'B';
    return 'C';
  };

  const currentHistoryEvent = phase === 'history' ? HISTORY_MILESTONES[currentHistoryIndex] : null;

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans">
      {/* 3D Background */}
      <ErrorBoundary inline>
        <GlobeViz 
          locations={LOCATIONS} 
          routes={ROUTES} 
          activeLocationId={getActiveLocationId()}
        />
      </ErrorBoundary>

      {/* --- HUD (Top Bar) --- */}
      {/* Only show stats during gameplay phases */}
      {(phase === 'playing' || phase === 'result' || phase === 'challenge') && (
        <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
          {/* Top Gradient Overlay */}
          <div className="absolute inset-0 h-32 bg-gradient-to-b from-imperial-ocean/90 to-transparent pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between p-4 max-w-7xl mx-auto w-full gap-4">
             {/* Left: Timer & Main Stats */}
             <div className="flex flex-col gap-2 w-full md:w-auto pointer-events-auto">
                <div className="flex items-center gap-4 bg-imperial-parchment/90 backdrop-blur-md p-2 rounded-lg border border-imperial-ink/20 shadow-lg text-imperial-ink">
                    <div className="flex items-center gap-2 px-2">
                        <Clock size={18} className="text-imperial-red" />
                        <span className={`font-mono font-bold text-lg ${stats.timeRemaining < 180 ? 'text-imperial-red animate-pulse' : 'text-imperial-ink'}`}>
                            {formatTime(stats.timeRemaining)}
                        </span>
                    </div>
                    <div className="h-8 w-[1px] bg-imperial-ink/20"></div>
                    <div className="flex gap-4 px-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-imperial-ink/60 uppercase tracking-wider font-bold">皇帝信任</span>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-imperial-ink/10 rounded-full overflow-hidden border border-imperial-ink/10">
                                    <div className="h-full bg-game-trust transition-all duration-500" style={{width: `${stats.trust}%`}}></div>
                                </div>
                                <span className="text-xs font-bold">{stats.trust}</span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-imperial-ink/60 uppercase tracking-wider font-bold">部下士氣</span>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-imperial-ink/10 rounded-full overflow-hidden border border-imperial-ink/10">
                                    <div className="h-full bg-game-morale transition-all duration-500" style={{width: `${stats.morale}%`}}></div>
                                </div>
                                <span className="text-xs font-bold">{stats.morale}</span>
                            </div>
                        </div>
                    </div>
                </div>
             </div>

             {/* Right: Resources */}
             <div className="flex gap-3 text-xs md:text-sm pointer-events-auto bg-imperial-parchment/90 backdrop-blur-md p-2 rounded-lg border border-imperial-ink/20 shadow-lg font-serif font-bold text-imperial-ink">
                <span className="flex items-center gap-1 px-2"><span className="text-imperial-gold text-lg">📜</span> 學識 {stats.knowledge}</span>
                <span className="flex items-center gap-1 px-2 border-l border-imperial-ink/10"><span className="text-imperial-gold text-lg">🤝</span> 人脈 {stats.connections}</span>
                <span className="flex items-center gap-1 px-2 border-l border-imperial-ink/10"><span className="text-imperial-gold text-lg">💰</span> 銀兩 {stats.silver}</span>
                {stats.hasQilin && <span className="flex items-center gap-1 px-2 border-l border-imperial-ink/10 text-imperial-red font-bold">🦒 麒麟</span>}
             </div>
          </div>
        </div>
      )}

      {/* History Mode Top Badge */}
      {phase === 'history' && (
        <div className="absolute top-4 left-4 z-30 bg-imperial-ocean text-white px-4 py-2 rounded-full shadow-lg border border-white/20 font-serif font-bold flex items-center gap-2">
           <BookOpen size={18} /> 史實漫遊：跟着鄭和的船跡走
        </div>
      )}

      {/* --- Main UI Layer --- */}
      
      {/* 1. Location Info Panel - Top Right */}
      {(phase === 'playing' || phase === 'history') && getActiveLocationId() && (
          <div className="absolute top-28 right-4 z-20 pointer-events-none flex flex-col items-end gap-2">
              <div className="pointer-events-auto">
                   <InfoPanel location={LOCATIONS.find(l => l.id === getActiveLocationId()) || null} />
              </div>
          </div>
      )}

      {/* 2. Event Card - Bottom Left (Gameplay Version) */}
      {phase === 'playing' && currentEvent && (
        <div className={`absolute left-0 bottom-0 md:left-8 md:bottom-8 z-20 flex flex-col items-start p-2 md:p-0 pointer-events-none transition-all duration-500 ${isUiMinimized ? 'translate-y-[85%]' : 'translate-y-0'}`}>
            <PaperCard className="pointer-events-auto max-w-md w-full">
                <div className="p-6">
                    {/* Minimize Toggle */}
                    <button 
                        onClick={() => setIsUiMinimized(!isUiMinimized)}
                        className="absolute top-2 right-2 z-10 bg-imperial-parchment/90 text-imperial-ink/60 hover:text-imperial-ink p-1 hover:bg-imperial-parchment rounded"
                    >
                        {isUiMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>

                    <HistoricImage
                        src={LOCATIONS.find(l => l.id === currentEvent.locationId)?.image}
                        alt={LOCATIONS.find(l => l.id === currentEvent.locationId)?.imageAlt || currentEvent.title}
                        className="w-full h-28 object-cover rounded-lg mb-4 border border-imperial-ink/10"
                    />
                    <div className="flex items-center gap-3 mb-4 border-b border-imperial-ink/10 pb-3 pr-8">
                        <span className="text-4xl filter drop-shadow-sm">{currentEvent.icon}</span>
                        <div>
                            <div className="text-xs uppercase text-imperial-red font-bold tracking-widest mb-1">第 {currentEvent.stage} 航段</div>
                            <h2 className="text-2xl font-serif font-bold text-imperial-ink">{currentEvent.title}</h2>
                        </div>
                    </div>

                    <div className={`transition-opacity duration-300 ${isUiMinimized ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                        <p className="text-imperial-ink/80 mb-6 leading-relaxed text-base font-serif border-l-4 border-imperial-gold pl-3 bg-imperial-gold/5 py-2 rounded-r">
                            {currentEvent.description}
                        </p>

                        <div className="grid gap-3">
                            {currentEvent.choices.map((choice, i) => {
                                const canAfford = !choice.cost || stats.silver >= choice.cost.silver;
                                const reqMet = requirementMet(choice);
                                const enabled = canAfford && reqMet;

                                return (
                                    <button 
                                        key={i}
                                        onClick={() => handleChoice(choice)}
                                        disabled={!enabled}
                                        className={`text-left p-3 rounded-lg border-2 transition-all group relative overflow-hidden ${
                                            enabled 
                                            ? 'bg-white border-imperial-ink/10 hover:border-imperial-gold hover:shadow-md' 
                                            : 'bg-gray-200 border-gray-300 opacity-60 cursor-not-allowed'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center relative z-10">
                                            <span className={`font-bold text-base font-serif ${enabled ? 'group-hover:text-imperial-red' : ''} transition-colors`}>{choice.title}</span>
                                            <div className="text-xs flex flex-col items-end gap-0.5 font-sans">
                                                {choice.requirementText && (
                                                    <span className={`${!reqMet || (choice.cost && !canAfford) ? 'text-imperial-red font-bold' : 'text-game-morale'}`}>
                                                        {choice.requirementText}
                                                    </span>
                                                )}
                                                {choice.cost && !choice.requirementText?.includes('銀') && (
                                                    <span className={`${canAfford ? 'text-imperial-gold' : 'text-imperial-red font-bold'}`}>
                                                        耗銀 {choice.cost.silver}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </PaperCard>
        </div>
      )}

      {/* 3. History Control Card - Bottom Left (History Version) */}
      {phase === 'history' && currentHistoryEvent && (
        <div className="absolute left-0 bottom-0 md:left-8 md:bottom-8 z-20 flex flex-col items-start p-2 md:p-0 pointer-events-auto">
             <PaperCard className="max-w-md w-full">
                <div className="p-6">
                    <HistoricImage
                        src={LOCATIONS.find(l => l.id === currentHistoryEvent.locationId)?.image}
                        alt={LOCATIONS.find(l => l.id === currentHistoryEvent.locationId)?.imageAlt || currentHistoryEvent.title}
                        className="w-full h-32 object-cover rounded-lg mb-4 border border-imperial-ink/10"
                    />
                    <div className="flex items-center gap-3 mb-4 border-b border-imperial-ink/10 pb-3">
                        <div>
                            <div className="text-xs uppercase text-imperial-ocean font-bold tracking-widest mb-1 flex items-center gap-2">
                                <span className="bg-imperial-ocean text-white px-1 rounded">{currentHistoryEvent.year}</span>
                                歷史航跡 {currentHistoryIndex + 1} / {HISTORY_MILESTONES.length}
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-imperial-ink mt-2">{currentHistoryEvent.title}</h2>
                        </div>
                    </div>

                    <p className="text-imperial-ink/80 mb-6 leading-relaxed text-base font-serif border-l-4 border-imperial-ocean pl-3 bg-imperial-ocean/5 py-2 rounded-r">
                        {currentHistoryEvent.description}
                    </p>

                    <div className="flex justify-between items-center mt-4">
                        <button 
                            onClick={historyPrev}
                            disabled={currentHistoryIndex === 0}
                            className="flex items-center gap-1 px-4 py-2 rounded bg-imperial-parchment_dark text-imperial-ink disabled:opacity-30 hover:bg-imperial-gold/20 transition-colors font-bold"
                        >
                            <ChevronLeft size={18} /> 上一站
                        </button>

                        <button 
                            onClick={() => setPhase('intro')}
                            className="flex items-center gap-1 px-4 py-2 rounded text-imperial-ink/60 hover:text-imperial-red hover:bg-red-50 transition-colors text-sm"
                        >
                            <Home size={16} /> 返回
                        </button>

                        <button 
                            onClick={historyNext}
                            disabled={currentHistoryIndex === HISTORY_MILESTONES.length - 1}
                            className="flex items-center gap-1 px-4 py-2 rounded bg-imperial-ocean text-white disabled:opacity-30 hover:bg-blue-900 transition-colors font-bold shadow-md"
                        >
                            下一站 <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
             </PaperCard>
        </div>
      )}


      {/* --- Overlays & Modals --- */}
      
      {/* Registration Screen */}
      {phase === 'registration' && (
        <ModalWrapper>
          <RegistrationPanel onComplete={handleRegistrationComplete} />
        </ModalWrapper>
      )}

      {/* Intro Screen */}
      {phase === 'intro' && (
        <ModalWrapper>
          <div className="max-w-2xl w-full text-center">
            <h1 className="text-6xl md:text-8xl font-serif text-imperial-gold mb-2 drop-shadow-lg" style={{textShadow: '0 4px 10px rgba(0,0,0,0.5)'}}>大明遠航</h1>
            <h2 className="text-3xl text-imperial-parchment mb-6 font-serif tracking-widest text-shadow-sm">麒麟之誓</h2>
            <HistoricImage
              src={ILLUSTRATIONS.ship.src}
              alt={ILLUSTRATIONS.ship.alt}
              className="mx-auto mb-6 w-full max-w-2xl h-40 md:h-52 object-cover rounded-xl border-2 border-imperial-parchment/40 shadow-2xl"
            />
            
            <PaperCard className="p-8 mb-8 text-left space-y-4 leading-relaxed text-lg">
                <p>永樂三年（1405年），明成祖遣正使太監鄭和統領舟師，展開首次下西洋遠航。船隊載着絲綢、瓷器與詔書揚帆出海，奉命通使西洋諸國，宣示朝廷德威並頒行賞賜，在季候風吹拂的浩瀚航道上，開啟明初官方海外交往的序幕。</p>
                <p>遊戲裡你會走<strong className="text-imperial-red">十一個航段</strong>。頭一程是在劉家港集結，再沿岸南下候風，不是盛夏直渡南海。麒麟是後來的事。皇上的耐心有限，水手的水桶也有限。</p>
                <p className="text-sm text-imperial-ink/60 mt-4 border-t border-imperial-ink/10 pt-2">
                    想自己掌舵，就按「啟航挑戰」。想先沿着鄭和的腳印走一遍，就按「史實漫遊」。你不用做完美的人，船還在，路就還沒斷。
                </p>
            </PaperCard>

            <div className="flex flex-col md:flex-row gap-4 justify-center w-full">
                <button onClick={startQuiz} className="bg-imperial-gold text-imperial-ink font-bold py-3 px-8 rounded-full text-xl hover:bg-yellow-500 transition-all hover:scale-105 shadow-xl border-2 border-imperial-parchment flex items-center justify-center gap-2">
                    <Anchor size={24} /> 啟航挑戰
                </button>
                <button onClick={startHistoryMode} className="bg-imperial-ocean text-white font-bold py-3 px-8 rounded-full text-xl hover:bg-blue-900 transition-all hover:scale-105 shadow-xl border-2 border-imperial-parchment flex items-center justify-center gap-2">
                    <BookOpen size={24} /> 史實漫遊
                </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Quiz Screen */}
      {phase === 'quiz' && (
        <ModalWrapper>
          <PaperCard className="max-w-xl w-full p-8">
            <HistoricImage
              src={ILLUSTRATIONS.quiz.src}
              alt={ILLUSTRATIONS.quiz.alt}
              className="w-full h-28 object-cover rounded-lg mb-4 border border-imperial-ink/10"
            />
            <div className="flex justify-between items-center mb-2 border-b border-imperial-ink/10 pb-4">
                <h3 className="text-imperial-red text-2xl font-bold">航海知識測試</h3>
                <span className="text-imperial-ink/50 font-bold">第 {currentQuizIndex + 1} / 5 題</span>
            </div>
            <p className="text-sm text-imperial-ink/60 mb-4">出發前對一對舊事。答錯也不要緊，我講給你聽。</p>
            
            <p className="text-xl mb-8 font-serif font-bold">{quizQuestions[currentQuizIndex]?.question}</p>
            
            <div className="space-y-3">
                {quizQuestions[currentQuizIndex]?.options.map((opt, i) => {
                    let btnClass = 'bg-white border-imperial-ink/10 hover:border-imperial-gold hover:bg-imperial-gold/5';
                    if (quizFeedback) {
                        if (i === quizQuestions[currentQuizIndex].correct) {
                            btnClass = 'bg-green-100 border-green-500 text-green-900';
                        } else if (i === quizFeedback.selectedId) {
                             // Correctly highlight the WRONG selection in red
                            btnClass = 'bg-red-100 border-red-500 text-red-900';
                        } else {
                            btnClass = 'bg-gray-100 border-gray-300 opacity-50';
                        }
                    }

                    return (
                        <button 
                            key={i}
                            onClick={() => !quizFeedback && handleQuizAnswer(i)}
                            disabled={!!quizFeedback}
                            className={`w-full p-4 rounded-lg text-left border-2 transition-all font-serif text-lg ${btnClass}`}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>

            {quizFeedback && (
                <div className={`mt-6 p-4 rounded-lg border-2 ${quizFeedback.correct ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} animate-fadeIn`}>
                    <p className="font-bold mb-1 text-lg">{quizFeedback.correct ? '✅ 正確' : '❌ 錯誤'}</p>
                    <p className="">{quizFeedback.text}</p>
                    <button onClick={nextQuizQuestion} className="mt-4 w-full bg-imperial-gold text-imperial-ink font-bold py-2 rounded shadow-md hover:bg-yellow-500 transition-colors">
                        下一題
                    </button>
                </div>
            )}
          </PaperCard>
        </ModalWrapper>
      )}

      {/* Challenge Phase */}
      {phase === 'challenge' && activeChallengeQuestion && (
        <ModalWrapper>
             <PaperCard className="max-w-lg w-full p-8 text-center border-imperial-red/50">
                <AlertTriangle size={48} className="mx-auto text-imperial-red mb-4" />
                <h3 className="text-2xl font-bold mb-2">命運抉擇：知識考驗</h3>
                <p className="text-imperial-ink/60 mb-6 text-sm">通過考驗以執行此決策...</p>
                
                <p className="text-lg font-serif mb-6 text-left font-bold">{activeChallengeQuestion.question}</p>
                
                <div className="space-y-3">
                    {activeChallengeQuestion.options.map((opt, i) => {
                        let btnClass = 'bg-white border-imperial-ink/20 hover:border-imperial-gold';
                        if (quizFeedback) {
                            if (i === activeChallengeQuestion.correct) {
                                btnClass = 'bg-green-100 border-green-500 text-green-900';
                            } else if (i === quizFeedback.selectedId) {
                                btnClass = 'bg-red-100 border-red-500 text-red-900';
                            } else {
                                btnClass = 'bg-gray-100 border-gray-300 opacity-50';
                            }
                        }

                        return (
                            <button
                                key={i}
                                onClick={() => !quizFeedback && handleChallengeAnswer(i)}
                                className={`w-full p-3 rounded border-2 text-left font-serif ${btnClass}`}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>
                {quizFeedback && (
                    <div className="mt-4 text-sm text-imperial-ink/80 animate-fadeIn bg-imperial-gold/10 p-2 rounded">
                        {quizFeedback.text}
                    </div>
                )}
             </PaperCard>
        </ModalWrapper>
      )}

      {/* Result Phase */}
      {phase === 'result' && resultMessage && (
        <ModalWrapper>
            <PaperCard className="max-w-md w-full p-8 text-center">
                <div className="text-6xl mb-4">{resultMessage.success ? '✅' : '⚠️'}</div>
                <h3 className={`text-2xl font-bold mb-4 ${resultMessage.success ? 'text-game-morale' : 'text-game-trust'}`}>
                    {resultMessage.success ? '執行成功' : '遭遇困難'}
                </h3>
                <p className="text-imperial-ink mb-6 leading-relaxed text-lg">{resultMessage.text}</p>
                
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {resultMessage.changes.map((c, i) => (
                        <span key={i} className={`px-2 py-1 rounded text-sm font-bold border ${c.includes('+') ? 'border-game-morale text-game-morale bg-game-morale/10' : 'border-game-trust text-game-trust bg-game-trust/10'}`}>
                            {c}
                        </span>
                    ))}
                </div>

                <button onClick={nextTurn} className="bg-imperial-gold text-imperial-ink font-bold py-3 px-8 rounded-full hover:bg-yellow-500 w-full transition-transform hover:scale-105 shadow-md">
                    繼續航行
                </button>
            </PaperCard>
        </ModalWrapper>
      )}

      {/* Assessment Phase */}
      {phase === 'assessment' && (
        <ModalWrapper>
          <AssessmentPanel 
            studentProfiles={studentProfiles} 
            onRestart={() => window.location.reload()} 
          />
        </ModalWrapper>
      )}

      {/* Victory / Game Over */}
      {(phase === 'victory' || phase === 'gameover') && (
        <ModalWrapper>
             <PaperCard className="max-w-2xl w-full p-8 text-center border-4 border-imperial-gold">
                {phase === 'victory' ? (
                    <>
                        <div className="text-8xl font-serif text-imperial-red mb-2 drop-shadow-sm font-bold">
                            {getFinalGrade()}
                        </div>
                        <h2 className="text-3xl font-bold text-imperial-ink mb-6">航行結束</h2>
                        <div className="bg-white/50 rounded-lg p-6 mb-8 text-left space-y-2 border border-imperial-ink/10">
                             <p className="text-lg">最終信任: <span className="text-imperial-red font-bold">{stats.trust}</span></p>
                             <p className="text-lg">最終士氣: <span className="text-game-morale font-bold">{stats.morale}</span></p>
                             <p className="text-lg">麒麟祥瑞: {stats.hasQilin ? '🦒 已帶回' : '❌ 未獲得'}</p>
                             <hr className="border-imperial-ink/20 my-4"/>
                             <p className="italic text-imperial-ink/70">
                                {getFinalGrade() === 'S' && "麒麟真的跟船回來了。人還齊，皇上也還肯笑。這趟走得完整。"}
                                {getFinalGrade() === 'A' && "船回來了，朋友也結下了幾個。沒有麒麟不要緊，海路是通的。"}
                                {getFinalGrade() === 'B' && "有風浪，有耽誤，人總算都在甲板上。能這樣回來，已經不容易。"}
                                {getFinalGrade() === 'C' && "船是靠岸了，行李卻輕。下一趟，記得在開口之前先看清水桶和星圖。"}
                             </p>
                        </div>
                    </>
                ) : (
                    <>
                        <Skull size={80} className="mx-auto text-imperial-ink/80 mb-6" />
                        <h2 className="text-3xl font-bold text-imperial-red mb-4">航行失敗</h2>
                        <p className="text-xl text-imperial-ink mb-8">{resultMessage?.text}</p>
                    </>
                )}
                
                <div className="flex gap-4 justify-center">
                    <button onClick={() => setPhase('assessment')} className="bg-imperial-ocean text-white font-bold py-3 px-8 rounded-full hover:bg-blue-900 transition-transform hover:scale-105 shadow-xl flex items-center gap-2">
                        <GraduationCap size={20} /> 前往總結與反思
                    </button>
                    {/* Fallback reload if user wants to skip assessment and just replay */}
                    <button onClick={() => window.location.reload()} className="bg-imperial-gold text-imperial-ink font-bold py-3 px-8 rounded-full hover:bg-yellow-500 transition-transform hover:scale-105 shadow-xl">
                        重新挑戰
                    </button>
                </div>
             </PaperCard>
        </ModalWrapper>
      )}

      {/* Chat is always available */}
      <ChatInterface />
    </div>
  );
};

export default App;