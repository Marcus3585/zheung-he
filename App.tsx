import React, { useState, useEffect, useCallback } from 'react';
import GlobeViz from './components/GlobeViz';
import InfoPanel from './components/InfoPanel';
import ChatInterface from './components/ChatInterface';
import { LOCATIONS, ROUTES, GAME_EVENTS, QUIZ_QUESTIONS } from './constants';
import { GameStats, GameEvent, GameChoice, QuizQuestion } from './types';
import { Clock, AlertTriangle, Skull, Minimize2, Maximize2 } from 'lucide-react';

const INITIAL_STATS: GameStats = {
  trust: 50,
  morale: 50,
  knowledge: 0,
  connections: 0,
  silver: 50,
  hasQilin: false,
  timeRemaining: 1800 // 30 mins
};

type GamePhase = 'intro' | 'quiz' | 'playing' | 'challenge' | 'result' | 'gameover' | 'victory';

const App: React.FC = () => {
  // Game State
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [isUiMinimized, setIsUiMinimized] = useState(false);
  
  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<{correct: boolean, text: string} | null>(null);

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
             setResultMessage({success: false, text: "時間耗盡，艦隊未能按時返航。", changes: []});
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
        setResultMessage({success: false, text: "皇帝震怒，下令召回艦隊，將你革職查辦。", changes: []});
      } else if (stats.morale <= 0) {
        setPhase('gameover');
        setResultMessage({success: false, text: "水手譁變，艦隊分崩離析。", changes: []});
      }
    }
  }, [stats, phase]);

  // --- Logic Functions ---

  const shuffleQuiz = () => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
    setQuizQuestions(shuffled.slice(0, 5));
    setUsedQuizIndices(shuffled.slice(0, 5).map(q => QUIZ_QUESTIONS.indexOf(q)));
  };

  const startQuiz = () => {
    shuffleQuiz();
    setPhase('quiz');
  };

  const handleQuizAnswer = (idx: number) => {
    const q = quizQuestions[currentQuizIndex];
    const isCorrect = idx === q.correct;
    if (isCorrect) setQuizScore(s => s + 1);
    setQuizFeedback({
      correct: isCorrect,
      text: q.explanation
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

  const handleChoice = (choice: GameChoice) => {
    if (choice.cost && stats.silver < choice.cost.silver) return; // Should be disabled in UI

    if (choice.cost) {
      setStats(s => ({...s, silver: s.silver - choice.cost!.silver}));
    }

    if (choice.needsChallenge) {
      setPendingChoice(choice);
      // Pick a random unused question
      const availableIndices = QUIZ_QUESTIONS.map((_, i) => i).filter(i => !usedQuizIndices.includes(i));
      const nextIdx = availableIndices.length > 0 
        ? availableIndices[Math.floor(Math.random() * availableIndices.length)] 
        : Math.floor(Math.random() * QUIZ_QUESTIONS.length);
      
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
        text: activeChallengeQuestion.explanation
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
    const changes: string[] = [];
    setStats(prev => {
      const next = { ...prev };
      if (effects.trust) { next.trust = Math.min(100, Math.max(0, next.trust + effects.trust)); changes.push(`信任 ${effects.trust > 0 ? '+' : ''}${effects.trust}`); }
      if (effects.morale) { next.morale = Math.min(100, Math.max(0, next.morale + effects.morale)); changes.push(`士氣 ${effects.morale > 0 ? '+' : ''}${effects.morale}`); }
      if (effects.knowledge) { next.knowledge += effects.knowledge; changes.push(`學識 +${effects.knowledge}`); }
      if (effects.connections) { next.connections += effects.connections; changes.push(`人脈 +${effects.connections}`); }
      if (effects.silver) { next.silver += effects.silver; changes.push(`銀兩 ${effects.silver > 0 ? '+' : ''}${effects.silver}`); }
      if (success && isQilin) { next.hasQilin = true; changes.push("獲得麒麟！"); }
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

  // Common wrapper class for modals to ensure consistent styling
  const ModalWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-imperial-ocean/60 backdrop-blur-sm p-4 animate-fadeIn">
       {children}
    </div>
  );
  
  const PaperCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-imperial-parchment border-2 border-imperial-ink/30 rounded-xl shadow-2xl relative overflow-hidden text-imperial-ink font-serif ${className}`}>
        {/* Paper texture feel */}
        <div className="absolute inset-0 bg-imperial-gold/5 pointer-events-none"></div>
        <div className="relative z-10">{children}</div>
    </div>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans">
      {/* 3D Background */}
      <GlobeViz 
        locations={LOCATIONS} 
        routes={ROUTES} 
        activeLocationId={currentEvent?.locationId}
      />

      {/* --- HUD (Top Bar) --- */}
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

      {/* --- Main UI Layer --- */}
      
      {/* 1. Location Info Panel - Top Right */}
      {phase === 'playing' && currentEvent && (
          <div className="absolute top-28 right-4 z-20 pointer-events-none flex flex-col items-end gap-2">
              <div className="pointer-events-auto">
                   <InfoPanel location={LOCATIONS.find(l => l.id === currentEvent.locationId) || null} />
              </div>
          </div>
      )}

      {/* 2. Event Card - Bottom Left */}
      {phase === 'playing' && currentEvent && (
        <div className={`absolute left-0 bottom-0 md:left-8 md:bottom-8 z-20 flex flex-col items-start p-2 md:p-0 pointer-events-none transition-all duration-500 ${isUiMinimized ? 'translate-y-[85%]' : 'translate-y-0'}`}>
            <PaperCard className="pointer-events-auto max-w-md w-full">
                <div className="p-6">
                    {/* Minimize Toggle */}
                    <button 
                        onClick={() => setIsUiMinimized(!isUiMinimized)}
                        className="absolute top-2 right-2 text-imperial-ink/40 hover:text-imperial-ink p-1 hover:bg-imperial-ink/5 rounded"
                    >
                        {isUiMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>

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
                                let reqMet = true;
                                if (choice.requirement) {
                                    reqMet = stats[choice.requirement.stat] >= choice.requirement.value;
                                }

                                return (
                                    <button 
                                        key={i}
                                        onClick={() => handleChoice(choice)}
                                        disabled={!canAfford}
                                        className={`text-left p-3 rounded-lg border-2 transition-all group relative overflow-hidden ${
                                            canAfford 
                                            ? 'bg-white border-imperial-ink/10 hover:border-imperial-gold hover:shadow-md' 
                                            : 'bg-gray-200 border-gray-300 opacity-60 cursor-not-allowed'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center relative z-10">
                                            <span className={`font-bold text-base font-serif ${canAfford ? 'group-hover:text-imperial-red' : ''} transition-colors`}>{choice.title}</span>
                                            <div className="text-xs flex flex-col items-end gap-0.5 font-sans">
                                                {choice.requirementText && (
                                                    <span className={`${reqMet ? 'text-game-morale' : 'text-imperial-red font-bold'}`}>
                                                        {choice.requirementText}
                                                    </span>
                                                )}
                                                {choice.cost && (
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

      {/* --- Overlays & Modals --- */}
      
      {/* Intro Screen */}
      {phase === 'intro' && (
        <ModalWrapper>
          <div className="max-w-2xl w-full text-center">
            <h1 className="text-6xl md:text-8xl font-serif text-imperial-gold mb-2 drop-shadow-lg" style={{textShadow: '0 4px 10px rgba(0,0,0,0.5)'}}>大明遠航</h1>
            <h2 className="text-3xl text-imperial-parchment mb-8 font-serif tracking-widest text-shadow-sm">麒麟之誓</h2>
            
            <PaperCard className="p-8 mb-8 text-left space-y-4 leading-relaxed text-lg">
                <p>永樂三年，大明皇帝朱棣命你出使西洋。此行路途凶險，伴君如伴虎。</p>
                <p>你將經歷<strong className="text-imperial-red">十個航段</strong>。請注意：皇帝的耐心是有限的，任何有損國威或延誤行程的決定，都可能導致信任崩塌。</p>
                <p>啟航前，需通過<strong className="text-imperial-gold bg-imperial-ink text-white px-2 py-0.5 rounded">歷史知識測試</strong>決定初始能力！</p>
            </PaperCard>

            <button onClick={startQuiz} className="bg-imperial-gold text-imperial-ink font-bold py-3 px-10 rounded-full text-xl hover:bg-yellow-500 transition-all hover:scale-105 shadow-xl border-2 border-imperial-parchment">
                開始測試
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* Quiz Screen */}
      {phase === 'quiz' && (
        <ModalWrapper>
          <PaperCard className="max-w-xl w-full p-8">
            <div className="flex justify-between items-center mb-6 border-b border-imperial-ink/10 pb-4">
                <h3 className="text-imperial-red text-2xl font-bold">航海知識測試</h3>
                <span className="text-imperial-ink/50 font-bold">第 {currentQuizIndex + 1} / 5 題</span>
            </div>
            
            <p className="text-xl mb-8 font-serif font-bold">{quizQuestions[currentQuizIndex]?.question}</p>
            
            <div className="space-y-3">
                {quizQuestions[currentQuizIndex]?.options.map((opt, i) => (
                    <button 
                        key={i}
                        onClick={() => !quizFeedback && handleQuizAnswer(i)}
                        disabled={!!quizFeedback}
                        className={`w-full p-4 rounded-lg text-left border-2 transition-all font-serif text-lg ${
                            quizFeedback 
                                ? i === quizQuestions[currentQuizIndex].correct 
                                    ? 'bg-green-100 border-green-500 text-green-900' 
                                    : 'bg-gray-100 border-gray-300 opacity-50'
                                : 'bg-white border-imperial-ink/10 hover:border-imperial-gold hover:bg-imperial-gold/5'
                        }`}
                    >
                        {opt}
                    </button>
                ))}
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
                    {activeChallengeQuestion.options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => !quizFeedback && handleChallengeAnswer(i)}
                            className={`w-full p-3 rounded border-2 text-left font-serif ${
                                quizFeedback 
                                ? i === activeChallengeQuestion.correct 
                                    ? 'bg-green-100 border-green-500 text-green-900' 
                                    : 'bg-gray-100 border-gray-300 opacity-50'
                                : 'bg-white border-imperial-ink/20 hover:border-imperial-gold'
                            }`}
                        >
                            {opt}
                        </button>
                    ))}
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
                                {getFinalGrade() === 'S' && "最高榮耀！你帶回了麒麟，象徵國力強盛。鄭和下西洋不僅是航海壯舉，更是和平外交的典範。"}
                                {getFinalGrade() === 'A' && "光榮歸航。雖無麒麟，但外交成果豐碩，展現了和平崛起的理念。"}
                                {getFinalGrade() === 'B' && "平安歸來。航行雖有波折，但最終平安。海洋政策的興衰值得深思。"}
                                {getFinalGrade() === 'C' && "勉強及格。損失不小，決策需更周全。"}
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
                
                <button onClick={() => window.location.reload()} className="bg-imperial-gold text-imperial-ink font-bold py-3 px-8 rounded-full hover:bg-yellow-500 transition-transform hover:scale-105 shadow-xl">
                    重新挑戰
                </button>
             </PaperCard>
        </ModalWrapper>
      )}

      {/* Chat is always available */}
      <ChatInterface />
    </div>
  );
};

export default App;