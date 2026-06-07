'use client';

import { useState } from 'react';
import { Material, SelectedItem, LLMConfig, Craft, MatchResult } from '../../lib/types';
import { InventoryGrid } from './InventoryGrid';
import { ItemPreview } from './ItemPreview';
import { SelectedItems } from './SelectedItems';
import { ChatMode } from './ChatMode';

interface MaterialScreenProps {
  selectedMaterial: Material | null;
  selectedItems: SelectedItem[];
  onSelectMaterial: (material: Material) => void;
  onAddItem: (item: SelectedItem) => void;
  onAddItems: (items: SelectedItem[]) => void;
  onRemoveItem: (index: number) => void;
  onCraft: () => void;
  craftLoading?: boolean;
  llmConfig: LLMConfig;
  onUpdateSuggestions: (crafts: MatchResult[], aiCraft?: Craft) => void;
}

export function MaterialScreen({
  selectedMaterial,
  selectedItems,
  onSelectMaterial,
  onAddItem,
  onAddItems,
  onRemoveItem,
  onCraft,
  craftLoading,
  llmConfig,
  onUpdateSuggestions,
}: MaterialScreenProps) {
  const [mode, setMode] = useState<'inventory' | 'chat'>('inventory');

  return (
    <div className="grid grid-cols-2 gap-0 screen-enter" style={{ height: 'calc(100dvh - 200px)', minHeight: '300px' }}>
      <div className="p-[14px] border-r-[var(--pixel)] border-r-solid border-r-[var(--border)] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-[10px]">
          <div className="flex gap-0">
            <button
              onClick={() => setMode('inventory')}
              className={`text-[18px] py-[5px] px-[14px] border-[var(--pixel)] border-solid border-r-0 cursor-pointer transition-all ${
                mode === 'inventory' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-warm)] text-[var(--text-light)] hover:bg-[var(--bg-warm)]'
              }`}
            >
              📦 Kho Vật Liệu
            </button>
            <button
              onClick={() => setMode('chat')}
              className={`text-[18px] py-[5px] px-[14px] border-[var(--pixel)] border-solid cursor-pointer transition-all ${
                mode === 'chat' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-warm)] text-[var(--text-light)] hover:bg-[var(--bg-warm)]'
              }`}
            >
              💬 Chat AI
            </button>
          </div>
        </div>
        <div style={{ display: mode === 'inventory' ? 'flex' : 'none' }} className="flex-col flex-1 min-h-0">
          <InventoryGrid
            selectedMaterialId={selectedMaterial?.id ?? null}
            onSelect={onSelectMaterial}
          />
        </div>
        <div style={{ display: mode === 'chat' ? 'flex' : 'none' }} className="flex-col flex-1 min-h-0">
          <ChatMode
            selectedItems={selectedItems}
            llmConfig={llmConfig}
            onAddItems={onAddItems}
            onUpdateSuggestions={onUpdateSuggestions}
          />
        </div>
      </div>
      <div className="p-[14px] flex flex-col overflow-y-auto">
        <ItemPreview material={selectedMaterial} onAdd={onAddItem} />
        <SelectedItems items={selectedItems} onRemove={onRemoveItem} onCraft={onCraft} craftLoading={craftLoading} />
      </div>
    </div>
  );
}
