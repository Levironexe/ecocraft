'use client';

import { useState } from 'react';
import { LLMConfig, GameStats } from '../lib/types';
import { SettingsPanel } from './SettingsPanel';
import { useAuth } from './AuthProvider';

interface HUDProps {
  llmConfig: LLMConfig;
  onConfigChange: (config: LLMConfig) => void;
  gameStats: GameStats;
}

export function HUD({ llmConfig, onConfigChange, gameStats }: HUDProps) {
  const { user, logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="text-[18px] text-white/70 hover:text-white cursor-pointer bg-transparent border-none"
            title={user.email}
          >
            🚪
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

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLogoutConfirm(false)} />
          <div className="pixel-box relative z-10 p-[24px] w-[340px] text-center">
            <div className="text-[32px] mb-[8px]">🚪</div>
            <div className="text-[22px] text-[var(--text)] mb-[4px]">Đăng xuất?</div>
            <div className="text-[18px] text-[var(--text-light)] mb-[16px]">Bạn có chắc muốn đăng xuất không?</div>
            <div className="flex gap-[10px]">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="pixel-btn pixel-btn-ghost flex-1"
              >
                Hủy
              </button>
              <button
                onClick={() => { setShowLogoutConfirm(false); logout(); }}
                className="pixel-btn pixel-btn-accent flex-1"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
