'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../AuthProvider';
import { createBrowserClient } from '../../lib/supabase';
import { PixelBox } from '../ui/PixelBox';
import { PixelButton } from '../ui/PixelButton';
import { Craft } from '../../lib/types';
import { crafts as libraryCrafts } from '../../lib/crafts';

interface CraftHistoryItem {
  id: string;
  craft_name: string;
  craft_description: string | null;
  materials: { materialId: string; quantity: number }[];
  steps: { number: number; title: string; detail: string; tip?: string }[];
  status: 'completed' | 'generating' | 'in-progress';
  created_at: string;
  glb_storage_path: string;
  glbUrl: string;
  refImageUrl: string;
}

interface CraftHistoryProps {
  onBack: () => void;
  onSelectCraft: (craft: Craft, glbUrl: string, refImageUrl?: string) => void;
}

export function CraftHistory({ onBack, onSelectCraft }: CraftHistoryProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<CraftHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient();

      const { data: models } = await supabase
        .from('generated_models')
        .select('id, craft_name, craft_description, materials, steps, glb_storage_path, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      const historyItems: CraftHistoryItem[] = (models || []).map((m) => {
        const { data: glbData } = supabase.storage.from('models').getPublicUrl(m.glb_storage_path);
        const refPath = m.glb_storage_path.replace('.glb', '-ref.png');
        const { data: refData } = supabase.storage.from('models').getPublicUrl(refPath);
        return {
          id: m.id,
          craft_name: m.craft_name,
          craft_description: m.craft_description,
          materials: m.materials || [],
          steps: m.steps || [],
          status: 'completed' as const,
          created_at: m.created_at,
          glb_storage_path: m.glb_storage_path,
          glbUrl: glbData.publicUrl,
          refImageUrl: refData.publicUrl,
        };
      });

      setItems(historyItems);
      setLoading(false);
    }

    load();
  }, [user.id]);

  const handleClick = (item: CraftHistoryItem) => {
    const craft: Craft = {
      id: `history-${item.id}`,
      name: item.craft_name,
      emoji: '',
      description: item.craft_description || '',
      difficulty: 1,
      ageMin: 6,
      timeMinutes: 20,
      materials: item.materials.map((m) => ({ materialId: m.materialId, quantity: m.quantity })),
      tools: libraryCrafts.find((c) => c.name === item.craft_name)?.tools || ['Kéo', 'Keo dán'],
      steps: item.steps.length > 0
        ? item.steps
        : [{ number: 1, title: 'Đã hoàn thành', detail: 'Sản phẩm này đã được chế tạo trước đó.' }],
      modelPath: null,
      isShowcase: false,
    };
    onSelectCraft(craft, item.glbUrl, item.refImageUrl);
  };

  const statusConfig = {
    completed: { label: 'Hoàn thành', color: 'bg-green-500' },
    generating: { label: 'Đang tạo', color: 'bg-yellow-500' },
    'in-progress': { label: 'Đang làm', color: 'bg-blue-500' },
  };

  return (
    <div className="flex flex-col h-full p-[16px] overflow-y-auto">
      <div className="flex items-center justify-between mb-[16px]">
        <div className="text-[22px] text-[var(--primary-dark)] flex items-center gap-[8px]">
          <span>▸</span> Lịch Sử Chế Tạo
        </div>
        <PixelButton variant="ghost" onClick={onBack}>
          ← Quay lại
        </PixelButton>
      </div>

      {loading ? (
        <div className="text-center py-[32px] text-[var(--text-muted)] text-[18px] animate-pulse">
          Đang tải...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-[32px] text-[var(--text-muted)]">
          <div className="text-[18px]">Chưa có sản phẩm nào</div>
          <div className="text-[18px]">Hãy chọn vật liệu và bắt đầu chế tạo!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-[10px]">
          {items.map((item) => {
            const status = statusConfig[item.status];
            const date = new Date(item.created_at).toLocaleDateString('vi-VN', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            });

            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className="text-left cursor-pointer transition-all hover:scale-[1.01]"
              >
                <PixelBox className="p-[12px]">
                  <div className="flex items-center gap-[12px]">
                    <div className="flex-1 min-w-0">
                      <div className="text-[22px] text-[var(--text)]">{item.craft_name}</div>
                      {item.craft_description && (
                        <div className="text-[18px] text-[var(--text-light)] truncate">{item.craft_description}</div>
                      )}
                      <div className="text-[15px] text-[var(--text-muted)] mt-[2px]">{date}</div>
                    </div>
                    <span className={`${status.color} text-black px-[10px] py-[4px] text-[15px] shrink-0`}>
                      {status.label}
                    </span>
                  </div>
                </PixelBox>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
