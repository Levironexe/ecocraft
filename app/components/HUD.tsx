'use client';

import { useState } from 'react';
import { LLMConfig, GameStats } from '../lib/types';
import { SettingsPanel } from './SettingsPanel';

interface HUDProps {
  llmConfig: LLMConfig;
  onConfigChange: (config: LLMConfig) => void;
  gameStats: GameStats;
}

export function HUD({ llmConfig, onConfigChange, gameStats }: HUDProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <div
        className="flex items-center justify-between py-[4px] px-[20px] sticky top-0 z-[100] text-white"
        style={{
          background: 'linear-gradient(180deg, var(--hud-gradient-from) 0%, var(--hud-gradient-to) 100%)',
          borderBottom: 'var(--pixel) solid var(--hud-border)',
        }}
      >
        <div className="text-[26px] flex items-center gap-[8px]" style={{ color: '#ffb74d', textShadow: '2px 2px 0 rgba(0,0,0,0.4)' }}>
          <span
            className="leaf-bob inline-block w-[20px] h-[20px]"
            style={{
              background: '#ffb74d',
              clipPath: 'polygon(50% 0%, 100% 40%, 80% 100%, 50% 80%, 20% 100%, 0% 40%)',
            }}
          />
          EcoCraft AI
        </div>

        <div className="flex gap-[18px] items-center">
          <div className="flex items-center gap-[5px] text-[20px]">
            ♻️ Đã tái chế: <span className="text-[#ffb74d] text-[20px]">{gameStats.itemsRecycled}</span>
          </div>
          <div className="flex items-center gap-[5px] text-[20px]">
            ⭐ Cấp độ: <span className="text-[#ffb74d] text-[20px]">{gameStats.level}</span>
          </div>
          <div className="flex items-center gap-[5px] text-[20px]">
            🏆 Điểm: <span className="text-[#ffb74d] text-[20px]">{gameStats.points}</span>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="text-[22px] cursor-pointer hover:scale-110 transition-transform"
          >
            ⚙️
          </button>
        </div>
      </div>

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          llmConfig={llmConfig}
          onConfigChange={onConfigChange}
          gameStats={gameStats}
        />
      )}
    </>
  );
}
