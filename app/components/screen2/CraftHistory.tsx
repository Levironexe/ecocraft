'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../AuthProvider';
import { createBrowserClient } from '../../lib/supabase';
import { loadCraftHistory, craftRowToCraft, CraftRow } from '../../lib/craft-store';
import { PixelBox } from '../ui/PixelBox';
import { PixelButton } from '../ui/PixelButton';
import { Craft } from '../../lib/types';

interface CraftHistoryProps {
  onBack: () => void;
  onSelectCraft: (craft: Craft, glbUrl: string, refImageUrl?: string) => void;
}

export function CraftHistory({ onBack, onSelectCraft }: CraftHistoryProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<CraftRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCraftHistory(user.id).then((rows) => {
      setItems(rows);
      setLoading(false);
    });
  }, [user.id]);

  const handleClick = (item: CraftRow) => {
    const craft = craftRowToCraft(item);
    let glbUrl = '';
    let refImageUrl: string | undefined;

    if (item.glb_storage_path) {
      const supabase = createBrowserClient();
      const { data: glbData } = supabase.storage.from('models').getPublicUrl(item.glb_storage_path);
      glbUrl = glbData.publicUrl;

      if (item.ref_image_url) {
        refImageUrl = item.ref_image_url;
      } else {
        const refPath = item.glb_storage_path.replace('.glb', '-ref.png');
        const { data: refData } = supabase.storage.from('models').getPublicUrl(refPath);
        refImageUrl = refData.publicUrl;
      }
    }

    onSelectCraft(craft, glbUrl, refImageUrl);
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    completed: { label: 'Hoàn thành', color: 'bg-green-500' },
    generating: { label: 'Đang tạo 3D', color: 'bg-yellow-500' },
    created: { label: 'Đã tạo', color: 'bg-blue-500' },
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
            const status = statusConfig[item.status] || statusConfig.created;
            const date = new Date(item.created_at).toLocaleDateString('vi-VN', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            });
            const sourceLabel = item.source === 'ai-chat' ? '🎨 AI Chat'
              : item.source === 'library' ? '📚 Thư viện'
              : '🔧 Thủ công';

            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className="text-left cursor-pointer transition-all hover:scale-[1.01]"
              >
                <PixelBox className="p-[12px]">
                  <div className="flex items-center gap-[12px]">
                    <div className="flex-1 min-w-0">
                      <div className="text-[22px] text-[var(--text)]">
                        {item.emoji || '🎨'} {item.craft_name}
                      </div>
                      {item.craft_description && (
                        <div className="text-[18px] text-[var(--text-light)] truncate">{item.craft_description}</div>
                      )}
                      <div className="text-[15px] text-[var(--text-muted)] mt-[2px]">
                        {sourceLabel} · {date}
                      </div>
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
