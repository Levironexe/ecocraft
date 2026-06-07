import { useCallback } from 'react';
import { useAppStore } from './store';
import { useAuth } from '../components/AuthProvider';
import { getStats, saveStats, completeCraft, recordCoachMessage } from './gamification';
import { Craft } from './types';

export function useGameStats() {
  const { user } = useAuth();
  const { gameStats, setGameStats } = useAppStore();

  const loadStats = useCallback(async () => {
    const stats = await getStats(user.id);
    setGameStats(stats);
  }, [user.id, setGameStats]);

  const handleCraftComplete = useCallback(async (craft: Craft) => {
    const updated = completeCraft(gameStats, craft);
    await saveStats(user.id, updated);
    setGameStats(updated);
  }, [user.id, gameStats, setGameStats]);

  const handleCoachMessage = useCallback(async () => {
    const updated = recordCoachMessage(gameStats);
    await saveStats(user.id, updated);
    setGameStats(updated);
  }, [user.id, gameStats, setGameStats]);

  return { gameStats, loadStats, handleCraftComplete, handleCoachMessage };
}

export function useCraftActions() {
  const store = useAppStore();

  const handleCraft = useCallback(async () => {
    const { selectedItems, llmConfig } = store;
    const allSuggestions = useAppStore.getState().aiMatchedCrafts.length > 0
      ? useAppStore.getState().aiMatchedCrafts
      : [];

    const highMatch = allSuggestions.find((s) => s.matchPercent >= 70);
    if (highMatch) {
      store.selectCraft(highMatch.craft);
      return;
    }

    const aiSug = useAppStore.getState().aiSuggestion;
    if (aiSug) {
      store.selectCraft(aiSug);
      return;
    }

    if (selectedItems.length === 0) return;

    store.setCraftLoading(true);
    try {
      const res = await fetch('/api/craft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedItems, llmConfig }),
      });
      const data = await res.json();
      if (data.craft) {
        store.setAiSuggestion(data.craft);
        store.selectCraft(data.craft);
      }
    } catch { /* silent */ }
    finally { store.setCraftLoading(false); }
  }, [store]);

  return { handleCraft };
}
