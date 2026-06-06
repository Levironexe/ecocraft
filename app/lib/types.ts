export interface Material {
  id: string;
  name: string;
  emoji: string;
  modelPath: string | null;
  sizeOptions: string[];
  category: 'plastic' | 'paper' | 'metal' | 'fabric' | 'wood' | 'glass' | 'other';
}

export interface CraftMaterial {
  materialId: string;
  quantity: number;
  sizePreference?: string;
}

export interface CraftStep {
  number: number;
  title: string;
  detail: string;
  tip?: string;
}

export interface Craft {
  id: string;
  name: string;
  emoji: string;
  description: string;
  difficulty: 1 | 2 | 3;
  ageMin: number;
  timeMinutes: number;
  materials: CraftMaterial[];
  tools: string[];
  steps: CraftStep[];
  modelPath: string | null;
  imagePrompt?: string;
  isShowcase: boolean;
}

export interface SelectedItem {
  materialId: string;
  size: string;
  quantity: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Theme {
  id: string;
  name: string;
  bg: string;
  bgWarm: string;
  bgCard: string;
  text: string;
  textLight: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  hudGradientFrom: string;
  hudGradientTo: string;
  hudBorder: string;
  border: string;
  borderDark: string;
}

export interface MatchResult {
  craft: Craft;
  matchPercent: number;
  matchedMaterials: string[];
  missingMaterials: string[];
}

export interface LLMConfig {
  provider: 'groq' | 'ollama';
  ollamaUrl?: string;
  ollamaModel?: string;
}

export interface GameStats {
  craftsCompleted: number;
  itemsRecycled: number;
  coachMessages: number;
  level: number;
  points: number;
  activityDates: string[];
}
