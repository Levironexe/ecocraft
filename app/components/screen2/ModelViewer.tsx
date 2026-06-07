'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
type ViewMode = '3d' | 'image';

export function ModelViewer({ craft, cachedImageUrl, onImageGenerated }: ModelViewerProps) {
  const [glbUrl, setGlbUrl] = useState<string | null>(null);
  const [refImageUrl, setRefImageUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<PipelineStage>('idle');
  const [stageMessage, setStageMessage] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const craftIdRef = useRef(craft.id);

  const startProgressTimer = useCallback(() => {
    setProgress(0);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    const stages = [
      { at: 0, pct: 3, msg: 'Đang tải hình tham khảo...' },
      { at: 5000, pct: 10, msg: 'Đang tạo hình ảnh...' },
      { at: 20000, pct: 25, msg: 'Đang gửi đến Meshy...' },
      { at: 30000, pct: 35, msg: 'Đang tạo mô hình 3D...' },
      { at: 60000, pct: 50, msg: 'Đang tạo mô hình 3D...' },
      { at: 120000, pct: 70, msg: 'Gần xong rồi...' },
      { at: 180000, pct: 85, msg: 'Đang hoàn thiện...' },
      { at: 240000, pct: 92, msg: 'Đang lưu mô hình...' },
    ];

    const start = Date.now();
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      let currentStage = stages[0];
      for (const s of stages) {
        if (elapsed >= s.at) currentStage = s;
      }
      setProgress(currentStage.pct);
      setStageMessage(currentStage.msg);
    }, 1000);
  }, []);

  const stopProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (glbUrl) {
      import('@google/model-viewer');
    }
  }, [glbUrl]);

  useEffect(() => {
    craftIdRef.current = craft.id;
    setGlbUrl(null);
    setRefImageUrl(null);
    setStage('idle');
    setStageMessage('');
    setViewMode('3d');

    if (cachedImageUrl) {
      setGlbUrl(cachedImageUrl);
      setStage('done');
      return;
    }

    const key = craftKey(craft);
    if (inFlightRequests.has(key)) return;

    inFlightRequests.add(key);

    setStage('generating-3d');
    startProgressTimer();

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
        steps: craft.steps,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        inFlightRequests.delete(key);
        if (craftIdRef.current !== craft.id) return;
        stopProgressTimer();
        if (data.glbUrl) {
          setProgress(100);
          setGlbUrl(data.glbUrl);
          setStage('done');
          setStageMessage(data.fromCache ? 'Mô hình từ kho!' : 'Mô hình 3D hoàn tất!');
          onImageGenerated?.(data.glbUrl);
        } else if (data.error) {
          setStage('error');
          setStageMessage('Không tạo được mô hình 3D');
        }
        if (data.referenceImageUrl) {
          setRefImageUrl(data.referenceImageUrl);
        }
      })
      .catch(() => {
        stopProgressTimer();
        inFlightRequests.delete(key);
        if (craftIdRef.current !== craft.id) return;
        setStage('error');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [craft.id, cachedImageUrl]);

  // GLB ready — show with toggle
  if (glbUrl) {
    return (
      <div className="flex-1 relative flex flex-col">
        {/* Toggle buttons */}
        {refImageUrl && (
          <div className="flex gap-0 shrink-0">
            <button
              onClick={() => setViewMode('3d')}
              className={`flex-1 py-[4px] text-[18px] cursor-pointer transition-all border-b-[2px] border-solid ${
                viewMode === '3d'
                  ? 'bg-[var(--primary)] text-white border-[var(--primary-dark)]'
                  : 'bg-[var(--bg-warm)] text-[var(--text-light)] border-[var(--border)] hover:bg-[var(--bg-card)]'
              }`}
            >
              Mô hình 3D
            </button>
            <button
              onClick={() => setViewMode('image')}
              className={`flex-1 py-[4px] text-[18px] cursor-pointer transition-all border-b-[2px] border-solid ${
                viewMode === 'image'
                  ? 'bg-[var(--primary)] text-white border-[var(--primary-dark)]'
                  : 'bg-[var(--bg-warm)] text-[var(--text-light)] border-[var(--border)] hover:bg-[var(--bg-card)]'
              }`}
            >
              Hình tham khảo
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 relative min-h-0">
          {viewMode === '3d' ? (
            <model-viewer
              src={glbUrl}
              auto-rotate
              rotation-per-second="36deg"
              camera-controls
              shadow-intensity="1"
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center overflow-auto bg-[var(--bg-warm)]">
              <img src={refImageUrl!} alt="Reference" className="max-w-full max-h-full object-contain" />
            </div>
          )}
          {craft.id.startsWith('ai-suggestion-') && viewMode === '3d' && (
            <div className="absolute bottom-[8px] left-[8px] text-[18px] text-[var(--text-muted)] bg-[var(--bg-card)] px-[8px] py-[2px]">
              Mô hình AI
            </div>
          )}
        </div>
      </div>
    );
  }

  // Generating or error
  return (
    <PixelBox className="flex-1 flex flex-col items-center justify-center overflow-hidden relative p-[24px]">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-[16px]">
          <div className="text-[24px] text-[var(--text)] mb-[4px]">{craft.name}</div>
          <div className="text-[18px] text-[var(--text-light)]">{stageMessage || 'Đang chuẩn bị...'}</div>
        </div>

        {stage === 'generating-3d' && (
          <>
            <div className="w-full h-[24px] bg-[var(--bg-warm)] border-[2px] border-solid border-[var(--border-dark)] overflow-hidden mb-[8px]">
              <div
                className="h-full transition-all duration-1000 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%)',
                }}
              />
            </div>
            <div className="flex justify-between text-[16px] text-[var(--text-muted)]">
              <span>{progress}%</span>
              <span>Bạn có thể làm theo hướng dẫn trong khi chờ</span>
            </div>
          </>
        )}

        {stage === 'error' && (
          <div className="text-center text-[18px] text-[var(--accent)] mt-[8px]">
            Không tạo được mô hình 3D
          </div>
        )}
      </div>
    </PixelBox>
  );
}
