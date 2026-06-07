'use client';

import { useState, useMemo, useEffect } from 'react';
import { Material, SelectedItem, Craft, LLMConfig, MatchResult, GameStats } from './lib/types';
import { crafts } from './lib/crafts';
import { matchCrafts } from './lib/matcher';
import { getStats, saveStats, completeCraft, recordCoachMessage } from './lib/gamification';
import { useAuth } from './components/AuthProvider';
import { HUD } from './components/HUD';
import { ScreenTabs } from './components/ScreenTabs';
import { MaterialScreen } from './components/screen1/MaterialScreen';
import { SuggestionCards } from './components/screen1/SuggestionCards';
import { BuildScreen } from './components/screen2/BuildScreen';
import { CraftHistory } from './components/screen2/CraftHistory';

const LLM_CONFIG_KEY = 'ecocraft-llm-config';
const DEFAULT_CONFIG: LLMConfig = { provider: 'groq' };

export default function Home() {
  const { user } = useAuth();
  const [activeScreen, setActiveScreen] = useState<1 | 2>(1);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [selectedCraft, setSelectedCraft] = useState<Craft | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<Craft | null>(null);
  const [aiMatchedCrafts, setAiMatchedCrafts] = useState<MatchResult[]>([]);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(DEFAULT_CONFIG);
  const [gameStats, setGameStats] = useState<GameStats>({
    craftsCompleted: 0, itemsRecycled: 0, coachMessages: 0, level: 1, points: 0, activityDates: [],
  });

  useEffect(() => {
    getStats(user.id).then(setGameStats);
    try {
      const saved = localStorage.getItem(LLM_CONFIG_KEY);
      if (saved) setLlmConfig(JSON.parse(saved));
    } catch {}
  }, [user.id]);

  const handleConfigChange = (config: LLMConfig) => {
    setLlmConfig(config);
    localStorage.setItem(LLM_CONFIG_KEY, JSON.stringify(config));
  };

  const handleCraftComplete = (craft: Craft) => {
    const updated = completeCraft(gameStats, craft);
    saveStats(user.id, updated);
    setGameStats(updated);
  };

  const handleCoachMessage = () => {
    const updated = recordCoachMessage(gameStats);
    saveStats(user.id, updated);
    setGameStats(updated);
  };

  const suggestions = useMemo(
    () => matchCrafts(selectedItems, crafts).slice(0, 3),
    [selectedItems]
  );

  const allSuggestions = aiMatchedCrafts.length > 0
    ? aiMatchedCrafts.slice(0, 3)
    : suggestions;

  const handleAddItem = (item: SelectedItem) => {
    setSelectedItems((prev) => {
      const existing = prev.findIndex(
        (i) => i.materialId === item.materialId && i.size === item.size
      );
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = {
          ...updated[existing],
          quantity: updated[existing].quantity + item.quantity,
        };
        return updated;
      }
      return [...prev, item];
    });
  };

  const handleAddItems = (items: SelectedItem[]) => {
    setSelectedItems((prev) => {
      let updated = [...prev];
      for (const item of items) {
        const existing = updated.findIndex(
          (i) => i.materialId === item.materialId && i.size === item.size
        );
        if (existing >= 0) {
          updated[existing] = {
            ...updated[existing],
            quantity: updated[existing].quantity + item.quantity,
          };
        } else {
          updated = [...updated, item];
        }
      }
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSuggestions = (matched: MatchResult[], aiCraft?: Craft) => {
    if (matched.length > 0) setAiMatchedCrafts(matched);
    if (aiCraft) setAiSuggestion(aiCraft);
  };

  const handleSelectCraft = (craft: Craft) => {
    setSelectedCraft(craft);
    setShowHistory(false);
    setActiveScreen(2);
  };

  const [craftLoading, setCraftLoading] = useState(false);

  const handleCraft = async () => {
    const highMatch = allSuggestions.find((s) => s.matchPercent >= 70);
    if (highMatch) {
      setSelectedCraft(highMatch.craft);
      setActiveScreen(2);
      return;
    }

    if (aiSuggestion) {
      setSelectedCraft(aiSuggestion);
      setActiveScreen(2);
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
        setSelectedCraft(data.craft);
        setAiSuggestion(data.craft);
        setShowHistory(false);
        setActiveScreen(2);
      }
    } catch { /* error handled silently */ }
    finally { setCraftLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HUD llmConfig={llmConfig} onConfigChange={handleConfigChange} gameStats={gameStats} />
      <ScreenTabs activeScreen={activeScreen} onTabChange={setActiveScreen} />
      {/* Screen 1 — always mounted, hidden when inactive */}
      <div style={{ display: activeScreen === 1 ? 'contents' : 'none' }}>
        <div className="flex-1 mx-[16px] border-[var(--pixel)] border-solid border-[var(--border-dark)] border-t-0 bg-[var(--bg-card)]">
          <MaterialScreen
            selectedMaterial={selectedMaterial}
            selectedItems={selectedItems}
            onSelectMaterial={setSelectedMaterial}
            onAddItem={handleAddItem}
            onAddItems={handleAddItems}
            onRemoveItem={handleRemoveItem}
            onCraft={handleCraft}
            craftLoading={craftLoading}
            llmConfig={llmConfig}
            onUpdateSuggestions={handleUpdateSuggestions}
          />
        </div>
        <SuggestionCards
          suggestions={allSuggestions}
          aiSuggestion={aiSuggestion}
          onSelectCraft={handleSelectCraft}
        />
      </div>

      {/* Screen 2 */}
      <div style={{ display: activeScreen === 2 ? 'contents' : 'none' }}>
        <div className="flex-1 mx-[16px] mb-[16px] border-[var(--pixel)] border-solid border-[var(--border-dark)] border-t-0 bg-[var(--bg-card)]">
          {selectedCraft && !showHistory ? (
            <div className="flex flex-col h-full">
              <BuildScreen
                craft={selectedCraft}
                selectedItems={selectedItems}
                llmConfig={llmConfig}
                onCraftComplete={handleCraftComplete}
                onCoachMessage={handleCoachMessage}
                imageCache={imageCache}
                onImageGenerated={(craftId, url) => setImageCache((prev) => ({ ...prev, [craftId]: url }))}
                onShowHistory={() => setShowHistory(true)}
              />
            </div>
          ) : (
            <CraftHistory onBack={() => setShowHistory(false)} />
          )}
        </div>
      </div>
    </div>
  );
}
