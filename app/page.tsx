'use client';

import { useEffect } from 'react';
import { useAppStore, useAllSuggestions } from './lib/store';
import { useAuth } from './components/AuthProvider';
import { useGameStats, useCraftActions } from './lib/hooks';
import { HUD } from './components/HUD';
import { ScreenTabs } from './components/ScreenTabs';
import { MaterialScreen } from './components/screen1/MaterialScreen';
import { SuggestionCards } from './components/screen1/SuggestionCards';
import { BuildScreen } from './components/screen2/BuildScreen';
import { CraftHistory } from './components/screen2/CraftHistory';

const LLM_CONFIG_KEY = 'rac-thai-xanh-ai-llm-config';

export default function Home() {
  const { user } = useAuth();
  const allSuggestions = useAllSuggestions();
  const { gameStats, loadStats, handleCraftComplete, handleCoachMessage } = useGameStats();
  const { handleCraft } = useCraftActions();

  const activeScreen = useAppStore((s) => s.activeScreen);
  const setActiveScreen = useAppStore((s) => s.setActiveScreen);
  const showHistory = useAppStore((s) => s.showHistory);
  const setShowHistory = useAppStore((s) => s.setShowHistory);
  const selectedMaterial = useAppStore((s) => s.selectedMaterial);
  const setSelectedMaterial = useAppStore((s) => s.setSelectedMaterial);
  const selectedItems = useAppStore((s) => s.selectedItems);
  const addItem = useAppStore((s) => s.addItem);
  const addItems = useAppStore((s) => s.addItems);
  const removeItem = useAppStore((s) => s.removeItem);
  const selectedCraft = useAppStore((s) => s.selectedCraft);
  const selectCraft = useAppStore((s) => s.selectCraft);
  const selectCraftFromHistory = useAppStore((s) => s.selectCraftFromHistory);
  const llmConfig = useAppStore((s) => s.llmConfig);
  const setLlmConfig = useAppStore((s) => s.setLlmConfig);
  const imageCache = useAppStore((s) => s.imageCache);
  const setImageCache = useAppStore((s) => s.setImageCache);
  const craftLoading = useAppStore((s) => s.craftLoading);
  const aiSuggestion = useAppStore((s) => s.aiSuggestion);
  const setAiSuggestion = useAppStore((s) => s.setAiSuggestion);
  const setAiMatchedCrafts = useAppStore((s) => s.setAiMatchedCrafts);
  const setUserId = useAppStore((s) => s.setUserId);

  useEffect(() => {
    setUserId(user.id);
    loadStats();
    try {
      const saved = localStorage.getItem(LLM_CONFIG_KEY);
      if (saved) setLlmConfig(JSON.parse(saved));
    } catch {}
  }, [user.id, loadStats, setUserId, setLlmConfig]);

  const handleConfigChange = (config: typeof llmConfig) => {
    setLlmConfig(config);
    localStorage.setItem(LLM_CONFIG_KEY, JSON.stringify(config));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HUD llmConfig={llmConfig} onConfigChange={handleConfigChange} gameStats={gameStats} />
      <ScreenTabs activeScreen={activeScreen} onTabChange={setActiveScreen} />

      {/* Screen 1 — always mounted */}
      <div style={{ display: activeScreen === 1 ? 'contents' : 'none' }}>
        <div className="flex-1 mx-[16px] border-[var(--pixel)] border-solid border-[var(--border-dark)] border-t-0 bg-[var(--bg-card)]">
          <MaterialScreen
            selectedMaterial={selectedMaterial}
            selectedItems={selectedItems}
            onSelectMaterial={setSelectedMaterial}
            onAddItem={addItem}
            onAddItems={addItems}
            onRemoveItem={removeItem}
            onCraft={handleCraft}
            craftLoading={craftLoading}
            llmConfig={llmConfig}
            onUpdateSuggestions={(matched, aiCraft) => {
              if (matched.length > 0) setAiMatchedCrafts(matched);
              if (aiCraft) setAiSuggestion(aiCraft);
            }}
          />
        </div>
        <SuggestionCards
          suggestions={allSuggestions}
          aiSuggestion={aiSuggestion}
          onSelectCraft={selectCraft}
        />
      </div>

      {/* Screen 2 — Build or History, stays mounted */}
      <div style={{ display: activeScreen === 2 ? 'flex' : 'none' }} className="flex-1 mx-[16px] mb-[16px] border-[var(--pixel)] border-solid border-[var(--border-dark)] border-t-0 bg-[var(--bg-card)]">
        {selectedCraft && !showHistory ? (
          <BuildScreen
            craft={selectedCraft}
            selectedItems={selectedItems}
            llmConfig={llmConfig}
            onCraftComplete={handleCraftComplete}
            onCoachMessage={handleCoachMessage}
            imageCache={imageCache}
            onImageGenerated={(craftId, url) => setImageCache(craftId, url)}
            onShowHistory={() => setShowHistory(true)}
          />
        ) : (
          <CraftHistory
            onBack={() => {
              setShowHistory(false);
              if (!selectedCraft) setActiveScreen(1);
            }}
            onSelectCraft={selectCraftFromHistory}
          />
        )}
      </div>
    </div>
  );
}
