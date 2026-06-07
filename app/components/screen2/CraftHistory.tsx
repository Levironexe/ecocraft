'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../AuthProvider';
import { createBrowserClient } from '../../lib/supabase';
import { PixelBox } from '../ui/PixelBox';
import { PixelButton } from '../ui/PixelButton';

interface CraftHistoryItem {
  id: string;
  craft_name: string;
  craft_description: string | null;
  status: 'completed' | 'generating' | 'in-progress';
  created_at: string;
  glb_storage_path: string;
}

interface CraftHistoryProps {
  onBack: () => void;
  onLoadCraft?: (craftName: string) => void;
}

export function CraftHistory({ onBack }: CraftHistoryProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<CraftHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient();

      // Get generated models (these are completed 3D generations)
      const { data: models } = await supabase
        .from('generated_models')
        .select('id, craft_name, craft_description, glb_storage_path, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      const historyItems: CraftHistoryItem[] = (models || []).map((m) => ({
        id: m.id,
        craft_name: m.craft_name,
        craft_description: m.craft_description,
        status: 'completed' as const,
        created_at: m.created_at,
        glb_storage_path: m.glb_storage_path,
      }));

      setItems(historyItems);
      setLoading(false);
    }

    load();
  }, [user.id]);

  const statusConfig = {
    completed: { label: 'Hoàn thành', color: 'bg-green-500' },
    generating: { label: 'Đang tạo', color: 'bg-yellow-500' },
    'in-progress': { label: 'Đang làm', color: 'bg-blue-500' },
  };

  return (
    <div className="flex flex-col h-full p-[16px] overflow-y-auto">
      <div className="flex items-center justify-between mb-[16px]">
        <div className="text-[24px] text-[var(--primary-dark)] flex items-center gap-[8px]">
          <span>▸</span> 📜 Lịch Sử Chế Tạo
        </div>
        <PixelButton variant="ghost" onClick={onBack}>
          ← Quay lại
        </PixelButton>
      </div>

      {loading ? (
        <div className="text-center py-[32px] text-[var(--text-muted)] text-[20px] animate-pulse">
          Đang tải...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-[32px] text-[var(--text-muted)]">
          <div className="text-[48px] mb-[8px]">📭</div>
          <div className="text-[20px]">Chưa có sản phẩm nào</div>
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
              <PixelBox key={item.id} className="p-[12px]">
                <div className="flex items-center gap-[12px]">
                  <div className="flex-1 min-w-0">
                    <div className="text-[22px] text-[var(--text)]">{item.craft_name}</div>
                    {item.craft_description && (
                      <div className="text-[18px] text-[var(--text-light)] truncate">{item.craft_description}</div>
                    )}
                    <div className="text-[16px] text-[var(--text-muted)] mt-[2px]">{date}</div>
                  </div>
                  <span className={`${status.color} text-white px-[10px] py-[4px] text-[16px]`}>
                    {status.label}
                  </span>
                </div>
              </PixelBox>
            );
          })}
        </div>
      )}
    </div>
  );
}
