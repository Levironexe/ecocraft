'use client';

import { useEffect } from 'react';
import { PixelBox } from '../ui/PixelBox';

interface ModelViewerProps {
  modelPath: string | null;
}

export function ModelViewer({ modelPath }: ModelViewerProps) {
  useEffect(() => {
    if (modelPath) {
      import('@google/model-viewer');
    }
  }, [modelPath]);

  if (!modelPath) {
    return (
      <PixelBox className="flex-1 flex items-center justify-center">
        <div className="text-center text-[var(--text-muted)]">
          <div className="text-[48px] mb-[8px]">📝</div>
          <div className="text-[20px]">Gợi ý từ AI — không có mô hình 3D</div>
        </div>
      </PixelBox>
    );
  }

  return (
    <div className="flex-1 relative">
      <model-viewer
        src={modelPath}
        auto-rotate
        camera-controls
        shadow-intensity="1"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
