'use client';

import { useTheme } from './ThemeProvider';
import { themes } from '../lib/themes';
import { LLMConfig, GameStats } from '../lib/types';

interface SettingsPanelProps {
  onClose: () => void;
  llmConfig: LLMConfig;
  onConfigChange: (config: LLMConfig) => void;
  gameStats: GameStats;
}

export function SettingsPanel({ onClose, llmConfig, onConfigChange, gameStats }: SettingsPanelProps) {
  const { themeId, setTheme } = useTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="pixel-box relative z-10 p-[20px] w-[360px] max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-[16px]">
          <div className="text-[22px] text-[var(--primary-dark)]">⚙️ Cài Đặt</div>
          <button onClick={onClose} className="text-[24px] cursor-pointer hover:text-[var(--accent)]">✕</button>
        </div>

        <div className="text-[18px] text-[var(--text-light)] mb-[10px]">🎨 Giao Diện</div>
        <div className="grid grid-cols-2 gap-[8px] mb-[16px]">
          {Object.values(themes).map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex items-center gap-[8px] p-[8px] border-[2px] border-solid cursor-pointer transition-all ${
                themeId === t.id
                  ? 'border-[var(--primary)] bg-[var(--primary-light)]'
                  : 'border-[var(--border)] bg-[var(--bg-warm)] hover:border-[var(--primary)]'
              }`}
            >
              <div
                className="w-[24px] h-[24px] rounded-full border-[2px] border-solid border-[var(--border-dark)]"
                style={{ background: `linear-gradient(135deg, ${t.primary} 50%, ${t.accent} 50%)` }}
              />
              <span className="text-[20px]">{t.name}</span>
            </button>
          ))}
        </div>

        <div className="text-[18px] text-[var(--text-light)] mb-[10px]">🤖 AI Provider</div>
        <div className="flex flex-col gap-[8px] mb-[12px]">
          <button
            onClick={() => onConfigChange({ ...llmConfig, provider: 'groq' })}
            className={`flex items-center gap-[8px] p-[8px] border-[2px] border-solid cursor-pointer transition-all ${
              llmConfig.provider === 'groq'
                ? 'border-[var(--primary)] bg-[var(--primary-light)]'
                : 'border-[var(--border)] bg-[var(--bg-warm)] hover:border-[var(--primary)]'
            }`}
          >
            <span className="text-[18px]">🌐</span>
            <span className="text-[20px]">Groq (Online)</span>
          </button>
          <button
            onClick={() => onConfigChange({ ...llmConfig, provider: 'ollama' })}
            className={`flex items-center gap-[8px] p-[8px] border-[2px] border-solid cursor-pointer transition-all ${
              llmConfig.provider === 'ollama'
                ? 'border-[var(--primary)] bg-[var(--primary-light)]'
                : 'border-[var(--border)] bg-[var(--bg-warm)] hover:border-[var(--primary)]'
            }`}
          >
            <span className="text-[18px]">💻</span>
            <span className="text-[20px]">Ollama (Ngoại tuyến)</span>
          </button>
        </div>

        {llmConfig.provider === 'ollama' && (
          <div className="flex flex-col gap-[8px] p-[8px] bg-[var(--bg-warm)] border-[2px] border-solid border-[var(--border)]">
            <div>
              <label className="text-[18px] text-[var(--text-light)] block mb-[4px]">Server URL</label>
              <input
                type="text"
                value={llmConfig.ollamaUrl || 'http://localhost:11434'}
                onChange={(e) => onConfigChange({ ...llmConfig, ollamaUrl: e.target.value })}
                className="w-full py-[4px] px-[8px] border-[2px] border-solid border-[var(--border)] bg-white text-[20px]"
              />
            </div>
            <div>
              <label className="text-[18px] text-[var(--text-light)] block mb-[4px]">Model</label>
              <input
                type="text"
                value={llmConfig.ollamaModel || 'qwen2.5:7b'}
                onChange={(e) => onConfigChange({ ...llmConfig, ollamaModel: e.target.value })}
                className="w-full py-[4px] px-[8px] border-[2px] border-solid border-[var(--border)] bg-white text-[20px]"
              />
            </div>
          </div>
        )}

        <div className="text-[18px] text-[var(--text-light)] mb-[10px] mt-[16px]">📊 Thống Kê</div>
        <div className="p-[10px] bg-[var(--bg-warm)] border-[2px] border-solid border-[var(--border)] flex flex-col gap-[6px] text-[20px]">
          <div>🏆 Đã hoàn thành: <span className="text-[var(--primary-dark)]">{gameStats.craftsCompleted}</span> sản phẩm</div>
          <div>♻️ Đã tái chế: <span className="text-[var(--primary-dark)]">{gameStats.itemsRecycled}</span> vật liệu</div>
          <div>📅 Ngày hoạt động: <span className="text-[var(--primary-dark)]">{gameStats.activityDates.length}</span> ngày</div>
          <div>💬 Tin nhắn Thợ Cả: <span className="text-[var(--primary-dark)]">{gameStats.coachMessages}</span></div>
        </div>
      </div>
    </div>
  );
}
