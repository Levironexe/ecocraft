import { useCallback } from 'react';
import { useAppStore } from './store';
import { useAuth } from '../components/AuthProvider';
import { getStats, saveStats, completeCraft, recordCoachMessage } from './gamification';
import { Craft } from './types';

export function useGameStats() {
  const { user } = useAuth();
  const gameStats = useAppStore((s) => s.gameStats);
  const setGameStats = useAppStore((s) => s.setGameStats);

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
  const selectCraft = useAppStore((s) => s.selectCraft);
  const setCraftLoading = useAppStore((s) => s.setCraftLoading);
  const setAiSuggestion = useAppStore((s) => s.setAiSuggestion);

  const handleCraft = useCallback(async () => {
    const { selectedItems, llmConfig, aiMatchedCrafts, aiSuggestion } = useAppStore.getState();
    const allSuggestions = aiMatchedCrafts.length > 0 ? aiMatchedCrafts : [];

    const highMatch = allSuggestions.find((s) => s.matchPercent >= 70);
    if (highMatch) {
      selectCraft(highMatch.craft);
      return;
    }

    if (aiSuggestion) {
      selectCraft(aiSuggestion);
      return;
    }

    if (selectedItems.length === 0) return;

    setCraftLoading(true);
    try {
      const res = await fetch('/api/craft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedItems, llmConfig }),
      });
      const data = await res.json();
      if (data.craft) {
        setAiSuggestion(data.craft);
        selectCraft(data.craft);
      }
    } catch { /* silent */ }
    finally { setCraftLoading(false); }
  }, [selectCraft, setCraftLoading, setAiSuggestion]);

  return { handleCraft };
}
