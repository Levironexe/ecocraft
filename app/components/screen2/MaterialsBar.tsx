'use client';

import { useEffect } from 'react';
import { Craft, SelectedItem } from '../../lib/types';
import { materials } from '../../lib/materials';

const toolModels: Record<string, string> = {
  'Kéo': '/models/keo-cat.glb',
  'Keo dán': '/models/keo-dan.glb',
  'Bút lông': '/models/but-long.glb',
  'Sơn': '/models/son.glb',
  'Băng keo': '/models/bang-keo.glb',
};

interface MaterialsBarProps {
  craft: Craft;
  selectedItems: SelectedItem[];
}

export function MaterialsBar({ craft, selectedItems }: MaterialsBarProps) {
  const stars = '⭐'.repeat(craft.difficulty);

  useEffect(() => {
    import('@google/model-viewer');
  }, []);

  return (
    <div className="pixel-box p-[8px] mb-[8px]">
      <div className="flex items-center justify-between mb-[6px]">
        <div className="text-[22px] flex items-center gap-[8px]">
          <span>{craft.emoji}</span>
          <span className="text-[var(--primary-dark)]">{craft.name}</span>
        </div>
        <div className="flex items-center gap-[12px] text-[20px] text-[var(--text-light)]">
          <span>{stars}</span>
          <span>⏱ {craft.timeMinutes} phút</span>
          <span>👶 {craft.ageMin}+ tuổi</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-[6px] items-center">
        {selectedItems.map((item) => {
          const mat = materials.find((m) => m.id === item.materialId);
          if (!mat) return null;
          return (
            <span
              key={`${item.materialId}-${item.size}`}
              className="flex items-center gap-[4px] px-[8px] py-[2px] text-[18px] border-[2px] border-solid border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary-dark)]"
            >
              {mat.modelPath ? (
                <model-viewer
                  src={mat.modelPath}
                  auto-rotate
                  camera-controls={false}
                  shadow-intensity="0"
                  rotation-per-second="36deg"
                  style={{ width: '36px', height: '36px', pointerEvents: 'none', backgroundColor: 'transparent' }}
                />
              ) : (
                <span>{mat.emoji}</span>
              )}
              {mat.name} ×{item.quantity}
            </span>
          );
        })}
        {craft.tools.map((tool) => {
          const toolModel = toolModels[tool];
          return (
            <span
              key={tool}
              className="flex items-center gap-[4px] px-[8px] py-[2px] text-[18px] border-[2px] border-solid border-[var(--accent)] bg-[var(--accent-light)] text-[var(--text)]"
            >
              {toolModel ? (
                <model-viewer
                  src={toolModel}
                  auto-rotate
                  camera-controls={false}
                  shadow-intensity="0"
                  rotation-per-second="36deg"
                  style={{ width: '36px', height: '36px', pointerEvents: 'none', backgroundColor: 'transparent' }}
                />
              ) : (
                <span>🔧</span>
              )}
              {tool}
            </span>
          );
        })}
      </div>
    </div>
  );
}
