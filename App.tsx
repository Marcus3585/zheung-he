import React, { useState, useEffect, useRef } from 'react';
import GlobeViz from './components/GlobeViz';
import InfoPanel from './components/InfoPanel';
import ChatInterface from './components/ChatInterface';
import AssessmentPanel from './components/AssessmentPanel';
import RegistrationPanel from './components/RegistrationPanel';
import ErrorBoundary from './components/ErrorBoundary';
import HistoricImage from './components/HistoricImage';
import DialoguePanel from './components/DialoguePanel';
import { ILLUSTRATIONS, LOCATIONS, ROUTES, GAME_EVENTS, HISTORY_MILESTONES, QUIZ_QUESTIONS } from './constants';
import { CHARACTERS, INITIAL_BONDS } from './data/characters';
import { CRISIS_TALK, EPILOGUE, TALK_SCENES } from './data/voyageTalk';
import { GameStats, GameEvent, GameChoice, QuizQuestion, StudentProfile, ChoiceEffects } from './types';
import {
  applyTalkToStats,
  attitudeLabel,
  bondOf,
  findScene,
  mergeEffects,
  resolveChoices,
  resolveCrisis,
  resolveText,
  sideEffects,
  TalkChoice,
  TalkScene,
} from './services/talk';
import { Clock, AlertTriangle, Skull, BookOpen, Anchor, ChevronLeft, ChevronRight, Home, GraduationCap } from 'lucide-react';

const INITIAL_STATS: GameStats = {
  trust: 50,
  morale: 50,
  knowledge: 0,
  connections: 0,
  silver: 50,
  hasQilin: false,
  timeRemaining: 1800, // 30 mins
  flags: [],
  bonds: { ...INITIAL_BONDS },
};

function freshStats(over: Partial<GameStats> = {}): GameStats {
  return {
    ...INITIAL_STATS,
    ...over,
    flags: [],
    bonds: { ...INITIAL_BONDS },
    timeRemaining: over.timeRemaining ?? INITIAL_STATS.timeRemaining,
  };
}

type GamePhase = 'registration' | 'intro' | 'quiz' | 'playing' | 'dialogue' | 'challenge' | 'result' | 'gameover' | 'victory' | 'history' | 'assessment';
type TalkStep = 'arrival' | 'local' | 'crisis' | 'aftermath' | 'epilogue';

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
  const [stats, setStats] = useState<GameStats>(() => freshStats());
  const statsRef = useRef(stats);
  statsRef.current = stats;
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  
  // Student Data
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([]);

  // History State
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  
  const [isUiMinimized, setIsUiMinimized] = useState(false);
  const [talkStep, setTalkStep] = useState<TalkStep>('arrival');
  const [nodeId, setNodeId] = useState('');
  const [talkChanges, setTalkChanges] = useState<string[]>([]);
  const [showBlurb, setShowBlurb] = useState(false);
  const [showHistoryBlurb, setShowHistoryBlurb] = useState(false);
  
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

  const collapseVoyage = (latest: GameStats) => {
    if (latest.trust <= 0) {
      setPhase('gameover');
      setResultMessage({ success: false, text: '皇上來信召回艦隊。信任用完了，船要掉頭。王景弘把令旗收了。', changes: [] });
      return true;
    }
    if (latest.morale <= 0) {
      setPhase('gameover');
      setResultMessage({ success: false, text: '水手不肯再聽令。船散了，這一趟走不下去。', changes: [] });
      return true;
    }
    return false;
  };

  const openStep = (index: number, step: TalkStep) => {
    const event = GAME_EVENTS[index];
    if (!event) {
      setPhase('victory');
      return;
    }
    setCurrentEventIndex(index);
    setCurrentEvent(event);
    setTalkStep(step);
    setTalkChanges([]);
    setShowBlurb(false);
    setIsUiMinimized(false);
    if (step === 'crisis') {
      setPhase('playing');
      setNodeId('');
      return;
    }
    const scene: TalkScene = step === 'epilogue'
      ? EPILOGUE
      : findScene(TALK_SCENES, event.locationId, step);
    setPhase('dialogue');
    setNodeId(scene.entry);
  };

  const finishTalkScene = (latest: GameStats) => {
    if (collapseVoyage(latest)) return;
    if (talkStep === 'arrival') openStep(currentEventIndex, 'local');
    else if (talkStep === 'local') openStep(currentEventIndex, 'crisis');
    else if (talkStep === 'aftermath') {
      if (currentEventIndex >= GAME_EVENTS.length - 1) openStep(currentEventIndex, 'epilogue');
      else openStep(currentEventIndex + 1, 'arrival');
    } else if (talkStep === 'epilogue') setPhase('victory');
  };

  const handleTalkChoice = (choice: TalkChoice) => {
    const { stats: next, labels } = applyTalkToStats(statsRef.current, choice.effects);
    statsRef.current = next;
    setStats(next);
    setTalkChanges(labels);
    if (choice.next) setNodeId(choice.next);
    else finishTalkScene(next);
  };

  const finishQuiz = () => {
    const baseStats = freshStats({
      trust: 50 + quizScore * 5,
      morale: 60 + quizScore * 5,
      silver: 80 + quizScore * 10,
      knowledge: quizScore === 5 ? 5 : 2 + Math.floor(quizScore / 2),
      connections: quizScore === 5 ? 5 : 2 + Math.floor(quizScore / 2),
    });
    statsRef.current = baseStats;
    setStats(baseStats);
    openStep(0, 'arrival');
  };

  const requirementMet = (choice: GameChoice) => {
    if (!choice.requirement) return true;
    return stats[choice.requirement.stat] >= choice.requirement.value;
  };

  const handleChoice = (choice: GameChoice) => {
    if (choice.cost && stats.silver < choice.cost.silver) return;
    if (!requirementMet(choice)) return;

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
      applyEffects(choice.effects, choice.successText, true, !!choice.isQilinEvent, choice);
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
          applyEffects(pendingChoice.effects, pendingChoice.successText, true, !!pendingChoice.isQilinEvent, pendingChoice);
        } else {
          applyEffects(pendingChoice.failEffects || {}, pendingChoice.failText || '判定失敗', false, false, pendingChoice);
        }
    }, 2000);
  };

  const applyEffects = (effects: ChoiceEffects, text: string, success: boolean, isQilin = false, choice?: GameChoice) => {
    // One write, outside any state updater, so a silver cost cannot be
    // overwritten by a second update and badges are not listed twice.
    const prev = statsRef.current;
    const addedFlags = success ? (choice?.setsFlags ?? []) : (choice?.setsFlagsOnFail ?? []);
    const addedBonds = success ? (choice?.bonds ?? []) : (choice?.bondsOnFail ?? []);
    const merged = mergeEffects(
      {
        trust: effects.trust,
        morale: effects.morale,
        knowledge: effects.knowledge,
        connections: effects.connections,
        silver: effects.silver,
        flags: addedFlags,
        bonds: addedBonds,
      },
      sideEffects(prev.flags, addedFlags),
    );
    const { stats: next, labels } = resolveCrisis(prev, merged, choice?.cost?.silver ?? 0, success && isQilin);
    statsRef.current = next;
    setStats(next);
    setResultMessage({ success, text, changes: labels });
    setPhase('result');
  };

  const nextTurn = () => {
    setResultMessage(null);
    setPendingChoice(null);
    setQuizFeedback(null);
    if (collapseVoyage(statsRef.current)) return;
    openStep(currentEventIndex, 'aftermath');
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
  const activeLocation = LOCATIONS.find((item) => item.id === getActiveLocationId()) ?? null;
  const talkScene: TalkScene | null = phase === 'dialogue' && currentEvent
    ? (talkStep === 'epilogue'
      ? EPILOGUE
      : (talkStep === 'arrival' || talkStep === 'local' || talkStep === 'aftermath')
        ? findScene(TALK_SCENES, currentEvent.locationId, talkStep)
        : null)
    : null;
  const talkNode = talkScene?.nodes.find((node) => node.id === nodeId) ?? null;
  const crisisScript = phase === 'playing' && currentEvent ? CRISIS_TALK[currentEvent.locationId] : undefined;

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans">
      {/* 3D Background */}
      <ErrorBoundary inline>
        <GlobeViz 
          locations={LOCATIONS} 
          routes={ROUTES} 
          activeLocationId={getActiveLocationId()}
          rightClearance={
            phase === 'history' || ((phase === 'playing' || phase === 'dialogue') && !isUiMinimized)
              ? 440
              : 16
          }
        />
      </ErrorBoundary>

      {/* --- HUD (Top Bar) --- */}
      {/* Only show stats during gameplay phases */}
      {(phase === 'playing' || phase === 'dialogue' || phase === 'result' || phase === 'challenge') && (
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
      {isUiMinimized && (phase === 'playing' || phase === 'dialogue') && getActiveLocationId() && (
          <div className="absolute top-28 right-4 z-20 pointer-events-none flex flex-col items-end gap-2">
              <div className="pointer-events-auto">
                   <InfoPanel location={LOCATIONS.find(l => l.id === getActiveLocationId()) || null} />
              </div>
          </div>
      )}

      {talkScene && talkNode && (
        <DialoguePanel
          kicker={talkStep === 'epilogue' ? talkScene.kicker : `第 ${currentEvent?.stage ?? ''} 段 · ${talkScene.kicker}`}
          title={activeLocation?.nameCn ?? '船上'}
          speaker={CHARACTERS[talkNode.speakerId] ?? CHARACTERS.wang}
          text={resolveText(talkNode.text, talkNode.variants, stats)}
          blurb={activeLocation?.blurb}
          blurbOpen={showBlurb}
          onToggleBlurb={() => setShowBlurb((open) => !open)}
          attitude={attitudeLabel(bondOf(stats, talkNode.speakerId))}
          changes={talkChanges}
          minimized={isUiMinimized}
          onToggleMinimized={() => setIsUiMinimized((value) => !value)}
          footnote="對談的時候，沙漏先歇一歇。"
          choices={
            resolveChoices(talkNode, stats).length > 0
              ? resolveChoices(talkNode, stats).map((item, index) => ({
                  key: `${talkNode.id}-${index}`,
                  text: item.choice.text,
                  hint: item.hint,
                  disabled: item.locked,
                  onSelect: () => handleTalkChoice(item.choice),
                }))
              : [{
                  key: `${talkNode.id}-continue`,
                  text: talkNode.continueLabel ?? '我知道了',
                  onSelect: () => {
                    if (talkNode.next) setNodeId(talkNode.next);
                    else finishTalkScene(statsRef.current);
                  },
                }]
          }
        />
      )}

      {phase === 'playing' && currentEvent && crisisScript && (
        <DialoguePanel
          kicker={`第 ${currentEvent.stage} 段 · 眼前的事`}
          title={currentEvent.title}
          speaker={CHARACTERS[crisisScript.speakerId] ?? CHARACTERS.wang}
          text={resolveText(crisisScript.lead, crisisScript.leadVariants, stats)}
          narration={currentEvent.description}
          aside={{
            speaker: CHARACTERS[crisisScript.asideSpeakerId] ?? CHARACTERS.wang,
            text: resolveText(crisisScript.aside, crisisScript.asideVariants, stats),
          }}
          blurb={activeLocation?.blurb}
          blurbOpen={showBlurb}
          onToggleBlurb={() => setShowBlurb((open) => !open)}
          attitude={attitudeLabel(bondOf(stats, crisisScript.speakerId))}
          changes={[]}
          minimized={isUiMinimized}
          onToggleMinimized={() => setIsUiMinimized((value) => !value)}
          footnote="想好了再按。這一段沙漏在走。"
          choices={currentEvent.choices.map((choice, index) => {
            const canAfford = !choice.cost || stats.silver >= choice.cost.silver;
            const reqMet = requirementMet(choice);
            const enabled = canAfford && reqMet;
            const hints = [
              choice.requirementText,
              choice.cost && !choice.requirementText?.includes('銀') ? `耗銀 ${choice.cost.silver}` : '',
            ].filter(Boolean);
            return {
              key: `crisis-${index}`,
              text: choice.title,
              hint: hints.join(' · '),
              disabled: !enabled,
              onSelect: () => handleChoice(choice),
            };
          })}
        />
      )}

      {/* History card stays on the right so the left limb of the globe — where 木骨都束 sits when the camera is on 劉家港 — stays clear. */}
      {phase === 'history' && currentHistoryEvent && (
        <div className="absolute right-3 bottom-3 z-20 w-[min(24rem,calc(100%-5.5rem))] max-h-[calc(100vh-5.5rem)] overflow-y-auto pointer-events-auto">
             <PaperCard className="w-full">
                <div className="p-6">
                    <HistoricImage
                        src={LOCATIONS.find(l => l.id === currentHistoryEvent.locationId)?.image}
                        alt={LOCATIONS.find(l => l.id === currentHistoryEvent.locationId)?.imageAlt || currentHistoryEvent.title}
                        className="w-full h-24 object-cover rounded-lg mb-3 border border-imperial-ink/10"
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

                    <p className="text-imperial-ink/80 mb-4 leading-relaxed text-base font-serif border-l-4 border-imperial-ocean pl-3 bg-imperial-ocean/5 py-2 rounded-r">
                        {currentHistoryEvent.description}
                    </p>
                    {activeLocation?.blurb && (
                      <div className="mb-4">
                        <button
                          type="button"
                          onClick={() => setShowHistoryBlurb((open) => !open)}
                          className="text-sm font-bold text-imperial-ocean"
                        >
                          {showHistoryBlurb ? '收起考證' : '這站的考證'}
                        </button>
                        {showHistoryBlurb && (
                          <p className="mt-2 text-sm leading-relaxed text-imperial-ink/80">{activeLocation.blurb}</p>
                        )}
                      </div>
                    )}

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
                <p>副使王景弘會在每一站跟你說話。港口上的國王、商人、僧人和通事也有話要說。你怎樣回答，後面的人聽得見。</p>
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
                        {currentQuizIndex >= quizQuestions.length - 1 ? '開始航行' : '下一題'}
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
                    {stats.trust <= 0 || stats.morale <= 0 ? '航行到此為止' : '聽聽副使怎麼說'}
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
                             <p className="text-lg">王景弘: <span className="font-bold">{attitudeLabel(stats.bonds.wang ?? 0)}</span></p>
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