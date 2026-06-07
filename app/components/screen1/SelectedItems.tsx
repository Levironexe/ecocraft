'use client';

import { SelectedItem } from '../../lib/types';
import { materials } from '../../lib/materials';
import { PixelBox } from '../ui/PixelBox';
import { PixelButton } from '../ui/PixelButton';

interface SelectedItemsProps {
  items: SelectedItem[];
  onRemove: (index: number) => void;
  onCraft: () => void;
  craftLoading?: boolean;
}

export function SelectedItems({ items, onRemove, onCraft, craftLoading }: SelectedItemsProps) {
  return (
    <PixelBox className="p-[14px] flex-1 flex flex-col min-h-0">
      <div className="text-[22px] text-[var(--primary-dark)] mb-[8px] flex items-center gap-[6px]">
        <span>▸</span> Đã Chọn
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {items.length === 0 ? (
          <div className="text-[var(--text-muted)] text-center py-4">
            Chưa chọn vật liệu nào
          </div>
        ) : (
          <div className="flex flex-col gap-[6px]">
            {items.map((item, i) => {
              const mat = materials.find((m) => m.id === item.materialId);
              if (!mat) return null;
              return (
                <div
                  key={`${item.materialId}-${item.size}`}
                  className="flex items-center gap-[8px] p-[6px] bg-[var(--bg-warm)] border border-[var(--border)]"
                >
                  {mat.modelPath ? (
                    <model-viewer
                      src={mat.modelPath}
                      auto-rotate
                      camera-controls={false}
                      shadow-intensity="0"
                      rotation-per-second="36deg"
                      style={{ width: '40px', height: '40px', pointerEvents: 'none', backgroundColor: 'transparent' }}
                    />
                  ) : (
                    <span className="text-[24px]">{mat.emoji}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[20px] truncate">{mat.name}</div>
                    <div className="text-[18px] text-[var(--text-light)]">{item.size}</div>
                  </div>
                  <span className="bg-[var(--accent)] text-white px-[6px] text-[20px]">
                    ×{item.quantity}
                  </span>
                  <button
                    onClick={() => onRemove(i)}
                    className="text-[var(--accent)] hover:text-[var(--primary-dark)] cursor-pointer text-[20px] px-[4px]"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="mt-[10px]">
        <PixelButton variant="accent" fullWidth disabled={items.length === 0 || craftLoading} onClick={onCraft}>
          {craftLoading ? '🔄 AI đang suy nghĩ...' : '🚀 Chế Tạo Ngay!'}
        </PixelButton>
      </div>
    </PixelBox>
  );
}
