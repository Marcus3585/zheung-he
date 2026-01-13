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

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}
