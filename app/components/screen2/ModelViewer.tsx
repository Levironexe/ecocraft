'use client';

import { useEffect, useState, useRef } from 'react';
import { Craft } from '../../lib/types';
import { materials } from '../../lib/materials';
import { PixelBox } from '../ui/PixelBox';

interface ModelViewerProps {
  craft: Craft;
}

export function ModelViewer({ craft }: ModelViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const fetchedRef = useRef<string | null>(null);
  const isAiCraft = craft.id.startsWith('ai-suggestion-');

  useEffect(() => {
    if (craft.modelPath) {
      import('@google/model-viewer');
    }
  }, [craft.modelPath]);

  useEffect(() => {
    if (!isAiCraft || craft.modelPath) return;
    if (fetchedRef.current === craft.id) return;

    fetchedRef.current = craft.id;
    setLoading(true);
    setError(false);
    setImageUrl(null);

    const materialNames = craft.materials
      .map((cm) => materials.find((m) => m.id === cm.materialId)?.name)
      .filter(Boolean)
      .join(', ');

    fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        craftName: craft.name,
        description: craft.description,
        materials: materialNames,
        imagePrompt: craft.imagePrompt,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [craft.id, craft.modelPath, craft.name, craft.description, craft.materials, isAiCraft]);

  if (craft.modelPath) {
    return (
      <div className="flex-1 relative">
        <model-viewer
          src={craft.modelPath}
          auto-rotate
          camera-controls
          shadow-intensity="1"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    );
  }

  if (isAiCraft) {
    return (
      <PixelBox className="flex-1 flex items-center justify-center overflow-hidden relative">
        {loading && (
          <div className="text-center text-[var(--text-muted)]">
            <div className="text-[48px] mb-[8px] animate-pulse">🎨</div>
            <div className="text-[20px]">Đang tạo hình ảnh...</div>
            <div className="text-[18px] text-[var(--text-muted)] mt-[4px]">Chờ khoảng 15-30 giây</div>
          </div>
        )}
        {error && !loading && (
          <div className="text-center text-[var(--text-muted)]">
            <div className="text-[64px] mb-[8px]">{craft.emoji}</div>
            <div className="text-[20px]">📝 Gợi ý từ AI</div>
          </div>
        )}
        {imageUrl && !loading && (
          <img
            src={imageUrl}
            alt={craft.name}
            className="max-w-full max-h-full object-contain"
            onError={() => { setError(true); setImageUrl(null); }}
          />
        )}
      </PixelBox>
    );
  }

  return (
    <PixelBox className="flex-1 flex items-center justify-center">
      <div className="text-center text-[var(--text-muted)]">
        <div className="text-[64px] mb-[8px]">{craft.emoji}</div>
        <div className="text-[20px]">{craft.name}</div>
      </div>
    </PixelBox>
  );
}
