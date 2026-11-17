export interface Location {
  id: string;
  name: string;
  nameCn: string;
  lat: number;
  lng: number;
  description: string;
  tradeGoods: string[];
}

export interface Route {
  start: string;
  end: string;
  voyages: number[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

// --- Game Specific Types ---

export type StatType = 'trust' | 'morale' | 'knowledge' | 'connections' | 'silver';

export interface GameStats {
  trust: number;
  morale: number;
  knowledge: number;
  connections: number;
  silver: number;
  hasQilin: boolean;
  timeRemaining: number;
}

export interface ChoiceRequirement {
  stat: StatType;
  value: number;
}

export interface ChoiceCost {
  silver: number;
}

export interface ChoiceEffects {
  trust?: number;
  morale?: number;
  knowledge?: number;
  connections?: number;
  silver?: number;
  qilin?: boolean;
}

export interface GameChoice {
  title: string;
  requirement?: ChoiceRequirement;
  requirementText?: string;
  cost?: ChoiceCost;
  effects: ChoiceEffects;
  failEffects?: ChoiceEffects; // For challenge failures
  successText: string;
  failText?: string;
  autoSuccess?: boolean;
  needsChallenge?: boolean;
  isQilinEvent?: boolean;
}

export interface GameEvent {
  stage: number;
  locationId: string; // Maps to Location.id
  icon: string;
  title: string;
  description: string;
  choices: GameChoice[];
}

export interface HistoryMilestone {
  year: string;
  title: string;
  locationId: string;
  description: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface AssessmentResult {
  score1: number;
  score2: number;
  feedback1: string;
  feedback2: string;
  totalComment: string;
}

export interface StudentProfile {
  id: string;
  className: string;
  classNumber: string;
  studentId: string;
  studentName: string;
  uploadStatus?: 'idle' | 'uploading' | 'success' | 'error';
  uploadMessage?: string;
}