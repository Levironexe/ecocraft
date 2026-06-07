'use client';

import { useEffect } from 'react';
import { Material } from '../../lib/types';

interface MaterialModalProps {
  material: Material;
  onClose: () => void;
}

export function MaterialModal({ material, onClose }: MaterialModalProps) {
  useEffect(() => {
    import('@google/model-viewer');
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const categoryLabels: Record<string, string> = {
    plastic: 'Nhựa',
    paper: 'Giấy',
    metal: 'Kim loại',
    fabric: 'Vải',
    wood: 'Gỗ',
    glass: 'Thủy tinh',
    other: 'Khác',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="pixel-box relative z-10 w-[600px] max-w-[90vw] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-[10px] right-[10px] z-20 w-[32px] h-[32px] flex items-center justify-center bg-[var(--bg-warm)] border-[2px] border-solid border-[var(--border-dark)] cursor-pointer hover:bg-[var(--accent)] hover:text-white text-[18px]"
        >
          ✕
        </button>

        {/* 3D Model viewer */}
        <div className="h-[350px] bg-[var(--bg-warm)] border-b-[var(--pixel)] border-b-solid border-b-[var(--border)]">
          {material.modelPath ? (
            <model-viewer
              src={material.modelPath}
              auto-rotate
              rotation-per-second="36deg"
              camera-controls
              shadow-intensity="0.5"
              style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[80px]">
              {material.emoji}
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="p-[16px] overflow-y-auto">
          <div className="flex items-center justify-between mb-[8px]">
            <div className="text-[28px] text-[var(--primary-dark)]">{material.name}</div>
            <span className="px-[10px] py-[2px] text-[16px] bg-[var(--primary-light)] text-[var(--primary-dark)] border-[2px] border-solid border-[var(--primary)]">
              {categoryLabels[material.category] || material.category}
            </span>
          </div>

          <div className="flex flex-wrap gap-[6px] mb-[12px]">
            {material.sizeOptions.map((size) => (
              <span key={size} className="px-[8px] py-[2px] text-[18px] bg-[var(--bg-warm)] border border-[var(--border)]">
                {size}
              </span>
            ))}
          </div>

          {material.funFact && (
            <div className="p-[12px] bg-[var(--bg-warm)] border-[2px] border-solid border-[var(--primary-light)]">
              <div className="text-[18px] text-[var(--primary-dark)] mb-[4px]">Bạn có biết?</div>
              <div className="text-[20px] text-[var(--text-light)] leading-[1.4]">{material.funFact}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
