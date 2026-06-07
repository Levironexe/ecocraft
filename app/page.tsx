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

const LLM_CONFIG_KEY = 'ecocraft-llm-config';

export default function Home() {
  const { user } = useAuth();
  const store = useAppStore();
  const allSuggestions = useAllSuggestions();
  const { gameStats, loadStats, handleCraftComplete, handleCoachMessage } = useGameStats();
  const { handleCraft } = useCraftActions();

  useEffect(() => {
    store.setUserId(user.id);
    loadStats();
    try {
      const saved = localStorage.getItem(LLM_CONFIG_KEY);
      if (saved) store.setLlmConfig(JSON.parse(saved));
    } catch {}
  }, [user.id, loadStats, store]);

  const handleConfigChange = (config: typeof store.llmConfig) => {
    store.setLlmConfig(config);
    localStorage.setItem(LLM_CONFIG_KEY, JSON.stringify(config));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HUD llmConfig={store.llmConfig} onConfigChange={handleConfigChange} gameStats={gameStats} />
      <ScreenTabs activeScreen={store.activeScreen} onTabChange={store.setActiveScreen} />

      {/* Screen 1 — always mounted */}
      <div style={{ display: store.activeScreen === 1 ? 'contents' : 'none' }}>
        <div className="flex-1 mx-[16px] border-[var(--pixel)] border-solid border-[var(--border-dark)] border-t-0 bg-[var(--bg-card)]">
          <MaterialScreen
            selectedMaterial={store.selectedMaterial}
            selectedItems={store.selectedItems}
            onSelectMaterial={store.setSelectedMaterial}
            onAddItem={store.addItem}
            onAddItems={store.addItems}
            onRemoveItem={store.removeItem}
            onCraft={handleCraft}
            craftLoading={store.craftLoading}
            llmConfig={store.llmConfig}
            onUpdateSuggestions={(matched, aiCraft) => {
              if (matched.length > 0) store.setAiMatchedCrafts(matched);
              if (aiCraft) store.setAiSuggestion(aiCraft);
            }}
          />
        </div>
        <SuggestionCards
          suggestions={allSuggestions}
          aiSuggestion={store.aiSuggestion}
          onSelectCraft={store.selectCraft}
        />
      </div>

      {/* Screen 2 — Build or History */}
      {store.activeScreen === 2 && (
        <div className="flex-1 mx-[16px] mb-[16px] border-[var(--pixel)] border-solid border-[var(--border-dark)] border-t-0 bg-[var(--bg-card)]">
          {store.selectedCraft && !store.showHistory ? (
            <BuildScreen
              craft={store.selectedCraft}
              selectedItems={store.selectedItems}
              llmConfig={store.llmConfig}
              onCraftComplete={handleCraftComplete}
              onCoachMessage={handleCoachMessage}
              imageCache={store.imageCache}
              onImageGenerated={(craftId, url) => store.setImageCache(craftId, url)}
              onShowHistory={() => store.setShowHistory(true)}
            />
          ) : (
            <CraftHistory
              onBack={() => {
                store.setShowHistory(false);
                if (!store.selectedCraft) store.setActiveScreen(1);
              }}
              onSelectCraft={store.selectCraftFromHistory}
            />
          )}
        </div>
      )}
    </div>
  );
}
