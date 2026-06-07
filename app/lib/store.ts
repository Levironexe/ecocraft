import { create } from 'zustand';
import { Material, SelectedItem, Craft, LLMConfig, MatchResult, GameStats } from './types';
import { crafts } from './crafts';
import { matchCrafts } from './matcher';

interface AppState {
  // Auth
  userId: string;
  setUserId: (id: string) => void;

  // Screen navigation
  activeScreen: 1 | 2;
  setActiveScreen: (screen: 1 | 2) => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;

  // Screen 1 — Material selection
  selectedMaterial: Material | null;
  setSelectedMaterial: (mat: Material | null) => void;
  selectedItems: SelectedItem[];
  addItem: (item: SelectedItem) => void;
  addItems: (items: SelectedItem[]) => void;
  removeItem: (index: number) => void;

  // Craft suggestions
  suggestions: MatchResult[];
  aiSuggestion: Craft | null;
  aiMatchedCrafts: MatchResult[];
  setAiSuggestion: (craft: Craft | null) => void;
  setAiMatchedCrafts: (crafts: MatchResult[]) => void;

  // Screen 2 — Build
  selectedCraft: Craft | null;
  selectCraft: (craft: Craft) => void;
  selectCraftFromHistory: (craft: Craft, glbUrl: string, refImageUrl?: string) => void;

  // LLM config
  llmConfig: LLMConfig;
  setLlmConfig: (config: LLMConfig) => void;

  // Game stats
  gameStats: GameStats;
  setGameStats: (stats: GameStats) => void;

  // Caches
  imageCache: Record<string, string>;
  setImageCache: (craftId: string, url: string) => void;

  // Craft loading
  craftLoading: boolean;
  setCraftLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  userId: '',
  setUserId: (id) => set({ userId: id }),

  activeScreen: 1,
  setActiveScreen: (screen) => set({ activeScreen: screen }),
  showHistory: false,
  setShowHistory: (show) => set({ showHistory: show }),

  selectedMaterial: null,
  setSelectedMaterial: (mat) => set({ selectedMaterial: mat }),
  selectedItems: [],
  addItem: (item) => set((s) => {
    const existing = s.selectedItems.findIndex(
      (i) => i.materialId === item.materialId && i.size === item.size
    );
    if (existing >= 0) {
      const updated = [...s.selectedItems];
      updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + item.quantity };
      return { selectedItems: updated };
    }
    return { selectedItems: [...s.selectedItems, item] };
  }),
  addItems: (items) => set((s) => {
    let updated = [...s.selectedItems];
    for (const item of items) {
      const existing = updated.findIndex(
        (i) => i.materialId === item.materialId && i.size === item.size
      );
      if (existing >= 0) {
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + item.quantity };
      } else {
        updated = [...updated, item];
      }
    }
    return { selectedItems: updated };
  }),
  removeItem: (index) => set((s) => ({
    selectedItems: s.selectedItems.filter((_, i) => i !== index),
  })),

  suggestions: [],
  aiSuggestion: null,
  aiMatchedCrafts: [],
  setAiSuggestion: (craft) => set({ aiSuggestion: craft }),
  setAiMatchedCrafts: (matched) => set({ aiMatchedCrafts: matched }),

  selectedCraft: null,
  selectCraft: (craft) => set({ selectedCraft: craft, showHistory: false, activeScreen: 2 }),
  selectCraftFromHistory: (craft, glbUrl, refImageUrl) => set((s) => {
    const cache = { ...s.imageCache, [craft.id]: glbUrl };
    if (refImageUrl) cache[`${craft.id}-ref`] = refImageUrl;
    return { selectedCraft: craft, showHistory: false, imageCache: cache };
  }),

  llmConfig: { provider: 'groq' },
  setLlmConfig: (config) => set({ llmConfig: config }),

  gameStats: { craftsCompleted: 0, itemsRecycled: 0, coachMessages: 0, level: 1, points: 0, activityDates: [] },
  setGameStats: (stats) => set({ gameStats: stats }),

  imageCache: {},
  setImageCache: (craftId, url) => set((s) => ({
    imageCache: { ...s.imageCache, [craftId]: url },
  })),

  craftLoading: false,
  setCraftLoading: (loading) => set({ craftLoading: loading }),
}));

// Derived selector — recompute suggestions when selectedItems changes
export function useAllSuggestions() {
  const selectedItems = useAppStore((s) => s.selectedItems);
  const aiMatchedCrafts = useAppStore((s) => s.aiMatchedCrafts);

  const librarySuggestions = matchCrafts(selectedItems, crafts).slice(0, 3);
  return aiMatchedCrafts.length > 0 ? aiMatchedCrafts.slice(0, 3) : librarySuggestions;
}
