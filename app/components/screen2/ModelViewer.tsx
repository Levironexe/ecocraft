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

function craftKey(craft: { materials: { materialId: string; quantity: number }[] }): string {
  return craft.materials.map(m => `${m.materialId}:${m.quantity}`).sort().join('|');
}

type PipelineStage = 'idle' | 'generating-3d' | 'done' | 'error';

export function ModelViewer({ craft, cachedImageUrl, onImageGenerated }: ModelViewerProps) {
  const [glbUrl, setGlbUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<PipelineStage>('idle');
  const [stageMessage, setStageMessage] = useState('');
  const craftIdRef = useRef(craft.id);

  useEffect(() => {
    if (glbUrl) {
      import('@google/model-viewer');
    }
  }, [glbUrl]);

  useEffect(() => {
    craftIdRef.current = craft.id;
    setGlbUrl(null);
    setStage('idle');
    setStageMessage('');

    if (cachedImageUrl) {
      // cachedImageUrl is actually the cached glbUrl from page state
      setGlbUrl(cachedImageUrl);
      setStage('done');
      return;
    }

    const key = craftKey(craft);
    if (inFlightRequests.has(key)) return;

    inFlightRequests.add(key);

    setStage('generating-3d');
    setStageMessage('Đang tạo mô hình 3D... (2-5 phút)');

    const materialNames = craft.materials
      .map((cm) => materials.find((m) => m.id === cm.materialId)?.name)
      .filter(Boolean)
      .join(', ');

    const imagePrompt = craft.imagePrompt ||
      `Multi-view orthographic reference sheet of a finished children's craft toy: ${craft.name}. ${craft.description}. Made from recycled ${materialNames}. Show six views arranged on a clean dark grey background: large isometric 3/4 view in the top-left as the hero shot, then FRONT VIEW, LEFT SIDE VIEW, BACK VIEW, RIGHT SIDE VIEW in a row across the middle, and TOP VIEW in the lower section. Each view labeled in clean white sans-serif text. Include simple dimension lines. Stylized cartoon game asset style, bright vivid saturated colors, soft studio lighting, clean low-poly aesthetic, consistent colors across all views. Professional game asset turnaround reference sheet layout.`;

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
        imagePrompt,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        inFlightRequests.delete(key);
        if (craftIdRef.current !== craft.id) return;
        if (data.glbUrl) {
          setGlbUrl(data.glbUrl);
          setStage('done');
          setStageMessage(data.fromCache ? 'Mô hình từ kho!' : 'Mô hình 3D hoàn tất!');
          onImageGenerated?.(data.glbUrl);
        } else if (data.error) {
          setStage('error');
          setStageMessage('Không tạo được mô hình 3D');
        }
      })
      .catch(() => {
        inFlightRequests.delete(key);
        if (craftIdRef.current !== craft.id) return;
        setStage('error');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [craft.id, cachedImageUrl]);

  // GLB ready — show 3D model
  if (glbUrl) {
    return (
      <div className="flex-1 relative">
        <model-viewer
          src={glbUrl}
          auto-rotate
          rotation-per-second="36deg"
          camera-controls
          shadow-intensity="1"
          style={{ width: '100%', height: '100%' }}
        />
        {craft.id.startsWith('ai-suggestion-') && (
          <div className="absolute bottom-[8px] left-[8px] text-[18px] text-[var(--text-muted)] bg-[var(--bg-card)] px-[8px] py-[2px]">
            🤖 Mô hình AI
          </div>
        )}
      </div>
    );
  }

  // Generating or error
  return (
    <PixelBox className="flex-1 flex flex-col items-center justify-center overflow-hidden relative">
      <div className="text-center text-[var(--text-muted)]">
        <div className="text-[48px] mb-[8px] animate-pulse">
          {stage === 'generating-3d' ? '🧊' : stage === 'error' ? craft.emoji : '🧊'}
        </div>
        <div className="text-[20px]">{stageMessage || `${craft.emoji} ${craft.name}`}</div>
        {stage === 'generating-3d' && (
          <div className="text-[18px] mt-[4px]">Bạn có thể làm theo hướng dẫn trong khi chờ</div>
        )}
      </div>
      {stage === 'error' && (
        <div className="absolute bottom-[8px] text-[18px] text-[var(--accent)]">
          Không tạo được mô hình 3D
        </div>
      )}
    </PixelBox>
  );
}
