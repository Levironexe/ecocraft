'use client';

import { useState, useEffect } from 'react';
import { Material } from '../../lib/types';
import { materials } from '../../lib/materials';

function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

interface InventoryGridProps {
  selectedMaterialId: string | null;
  onSelect: (material: Material) => void;
}

export function InventoryGrid({ selectedMaterialId, onSelect }: InventoryGridProps) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    import('@google/model-viewer');
  }, []);

  const filtered = materials.filter((m) => {
    if (!search.trim()) return true;
    return removeDiacritics(m.name).includes(removeDiacritics(search));
  });

  const handleClick = (m: Material) => {
    onSelect(m);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex gap-0 mb-[10px]">
        <input
          type="text"
          placeholder="🔍 Tìm vật liệu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 py-[5px] px-[10px] border-[var(--pixel)] border-solid border-[var(--border-dark)] bg-white outline-none focus:border-[var(--primary)]"
        />
      </div>
      <div className="grid grid-cols-4 gap-[8px] overflow-y-auto flex-1 min-h-0 content-start">
        {filtered.length === 0 ? (
          <div className="col-span-4 text-center py-8 text-[var(--text-muted)]">
            Không tìm thấy vật liệu nào.
          </div>
        ) : (
          filtered.map((m) => (
            <button
              key={m.id}
              onClick={() => handleClick(m)}
              className={`aspect-square border-[var(--pixel)] border-solid cursor-pointer transition-all relative p-[8px] overflow-hidden grid ${
                selectedMaterialId === m.id
                  ? 'border-[var(--primary-dark)] bg-[var(--primary-light)] shadow-[0_0_0_2px_var(--primary)_inset]'
                  : 'border-[var(--border)] bg-[var(--bg-warm)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:scale-[1.02]'
              }`}
              style={{ gridTemplateRows: '1fr auto' }}
            >
              {selectedMaterialId === m.id && (
                <span className="absolute top-[4px] right-[6px] text-[var(--primary-dark)] text-[18px] z-10">✓</span>
              )}
              <div className="flex items-center justify-center min-h-0">
                {m.modelPath ? (
                  <model-viewer
                    src={m.modelPath}
                    auto-rotate
                    camera-controls={false}
                    shadow-intensity="0"
                    style={{
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      backgroundColor: 'transparent',
                      // @ts-expect-error model-viewer custom CSS property
                      '--poster-color': 'transparent',
                    }}
                    rotation-per-second="36deg"
                  />
                ) : (
                  <span className="text-[28px]">{m.emoji}</span>
                )}
              </div>
              <span className={`text-[15px] text-center leading-tight pt-[4px] ${
                selectedMaterialId === m.id ? 'text-[var(--primary-dark)]' : 'text-[var(--text-light)]'
              }`}>
                {m.name}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
