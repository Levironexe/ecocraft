'use client';

import { useEffect, useState, useRef } from 'react';
import { Craft } from '../../lib/types';
import { materials } from '../../lib/materials';
import { PixelBox } from '../ui/PixelBox';

interface ModelViewerProps {
  craft: Craft;
  cachedImageUrl?: string;
  onImageGenerated?: (url: string) => void;
}

const inFlightRequests = new Set<string>();

type PipelineStage = 'idle' | 'generating-image' | 'generating-3d' | 'done' | 'error';

export function ModelViewer({ craft, cachedImageUrl, onImageGenerated }: ModelViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(cachedImageUrl || null);
  const [glbUrl, setGlbUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<PipelineStage>('idle');
  const [stageMessage, setStageMessage] = useState('');
  const isAiCraft = craft.id.startsWith('ai-suggestion-');
  const craftIdRef = useRef(craft.id);

  useEffect(() => {
    if (craft.modelPath || glbUrl) {
      import('@google/model-viewer');
    }
  }, [craft.modelPath, glbUrl]);

  useEffect(() => {
    craftIdRef.current = craft.id;
    setGlbUrl(null);
    setStage('idle');
    setStageMessage('');

    if (cachedImageUrl) {
      setImageUrl(cachedImageUrl);
      return;
    }

    if (!isAiCraft || craft.modelPath) return;
    if (inFlightRequests.has(craft.id)) return;

    inFlightRequests.add(craft.id);

    setStage('generating-image');
    setStageMessage('Đang tạo hình ảnh...');
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
        if (craftIdRef.current !== craft.id) return;
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
          onImageGenerated?.(data.imageUrl);
        }
      })
      .catch(() => { /* image gen failed, not critical */ });

    setStage('generating-3d');
    setStageMessage('Đang tạo mô hình 3D... (2-5 phút)');

    fetch('/api/generate-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selectedItems: craft.materials.map((m) => ({
          materialId: m.materialId,
          size: '',
          quantity: m.quantity,
        })),
        craftName: craft.name,
        craftDescription: craft.description,
        imagePrompt: craft.imagePrompt || `A cute children's craft: ${craft.name}, made from ${materialNames}. Cartoon game asset, white background.`,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        inFlightRequests.delete(craft.id);
        if (craftIdRef.current !== craft.id) return;
        if (data.glbUrl) {
          setGlbUrl(data.glbUrl);
          setStage('done');
          setStageMessage(data.fromCache ? 'Mô hình từ kho!' : 'Mô hình 3D hoàn tất!');
        } else if (data.error) {
          setStage('error');
          setStageMessage('Không tạo được mô hình 3D');
        }
      })
      .catch(() => {
        inFlightRequests.delete(craft.id);
        if (craftIdRef.current !== craft.id) return;
        setStage('error');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [craft.id, cachedImageUrl]);

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

  if (glbUrl) {
    return (
      <div className="flex-1 relative">
        <model-viewer
          src={glbUrl}
          auto-rotate
          camera-controls
          shadow-intensity="1"
          style={{ width: '100%', height: '100%' }}
        />
        <div className="absolute bottom-[8px] left-[8px] text-[18px] text-[var(--text-muted)] bg-[var(--bg-card)] px-[8px] py-[2px]">
          🤖 Mô hình AI
        </div>
      </div>
    );
  }

  if (isAiCraft) {
    return (
      <PixelBox className="flex-1 flex flex-col items-center justify-center overflow-hidden relative">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={craft.name}
              className="max-w-full max-h-[70%] object-contain"
              onError={() => setImageUrl(null)}
            />
            {stage === 'generating-3d' && (
              <div className="mt-[8px] text-center text-[var(--text-muted)]">
                <div className="text-[18px] animate-pulse">⏳ {stageMessage}</div>
                <div className="text-[18px]">Bạn có thể làm theo hướng dẫn trong khi chờ</div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-[var(--text-muted)]">
            <div className="text-[48px] mb-[8px] animate-pulse">
              {stage === 'generating-image' ? '🎨' : stage === 'generating-3d' ? '🧊' : craft.emoji}
            </div>
            <div className="text-[20px]">{stageMessage || '📝 Gợi ý từ AI'}</div>
          </div>
        )}
        {stage === 'error' && (
          <div className="absolute bottom-[8px] text-[18px] text-[var(--accent)]">
            Không tạo được mô hình 3D — dùng hình ảnh thay thế
          </div>
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
