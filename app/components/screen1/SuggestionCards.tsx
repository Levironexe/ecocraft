'use client';

import { Craft, MatchResult } from '../../lib/types';
import { PixelBox } from '../ui/PixelBox';

interface SuggestionCardsProps {
  suggestions: MatchResult[];
  aiSuggestion: Craft | null;
  onSelectCraft: (craft: Craft) => void;
}

function matchColor(percent: number): string {
  if (percent >= 80) return 'bg-green-500';
  if (percent >= 60) return 'bg-yellow-500';
  return 'bg-orange-500';
}

export function SuggestionCards({ suggestions, aiSuggestion, onSelectCraft }: SuggestionCardsProps) {
  const hasContent = suggestions.length > 0 || aiSuggestion;

  return (
    <div className="mx-[16px] mb-[16px]">
      <div className="text-[22px] text-[var(--primary-dark)] mb-[8px] flex items-center gap-[6px]">
        <span>▸</span> 💡 Gợi Ý Chế Tạo
      </div>
      {!hasContent ? (
        <div className="text-center py-[16px] text-[var(--text-muted)] text-[18px]">
          Thêm vật liệu để xem gợi ý!
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-[10px]">
          {suggestions.map((result) => (
            <button
              key={result.craft.id}
              onClick={() => onSelectCraft(result.craft)}
              className="text-left cursor-pointer transition-all hover:scale-[1.02]"
            >
              <PixelBox className="p-[12px] h-full">
                <div className="flex items-start justify-between mb-[6px]">
                  <span className="text-[32px]">{result.craft.emoji}</span>
                  <span className={`${matchColor(result.matchPercent)} text-white px-[6px] py-[1px] text-[18px]`}>
                    {result.matchPercent}%
                  </span>
                </div>
                <div className="text-[18px] text-[var(--text)] mb-[4px]">{result.craft.name}</div>
                <div className="text-[18px] text-[var(--text-light)] mb-[6px] line-clamp-2">
                  {result.craft.description}
                </div>
                <div className="text-[18px] text-[var(--primary)]">🧊 3D</div>
              </PixelBox>
            </button>
          ))}

          {aiSuggestion && (
            <button
              onClick={() => onSelectCraft(aiSuggestion)}
              className="text-left cursor-pointer transition-all hover:scale-[1.02]"
            >
              <PixelBox className="p-[12px] h-full border-dashed">
                <div className="flex items-start justify-between mb-[6px]">
                  <span className="text-[32px]">{aiSuggestion.emoji}</span>
                  <span className="bg-purple-500 text-white px-[6px] py-[1px] text-[18px]">
                    🤖 AI
                  </span>
                </div>
                <div className="text-[18px] text-[var(--text)] mb-[4px]">{aiSuggestion.name}</div>
                <div className="text-[18px] text-[var(--text-light)] mb-[6px] line-clamp-2">
                  {aiSuggestion.description}
                </div>
                <div className="text-[13px] text-[var(--text-muted)]">📝 Gợi ý từ AI</div>
              </PixelBox>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
