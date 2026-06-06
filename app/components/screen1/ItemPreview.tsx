'use client';

import { useState, useEffect } from 'react';
import { Material, SelectedItem } from '../../lib/types';
import { PixelBox } from '../ui/PixelBox';
import { PixelButton } from '../ui/PixelButton';
import { QuantityControl } from '../ui/QuantityControl';

interface ItemPreviewProps {
  material: Material | null;
  onAdd: (item: SelectedItem) => void;
}

export function ItemPreview({ material, onAdd }: ItemPreviewProps) {
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    import('@google/model-viewer');
  }, []);

  if (!material) {
    return (
      <PixelBox className="p-[14px] mb-[12px] text-center">
        <div className="text-[40px] mb-[6px]">📦</div>
        <div className="text-[var(--text-muted)]">Chọn vật liệu để xem chi tiết</div>
      </PixelBox>
    );
  }

  const currentSize = size || material.sizeOptions[0];

  const handleAdd = () => {
    onAdd({
      materialId: material.id,
      size: currentSize,
      quantity,
    });
    setQuantity(1);
  };

  return (
    <PixelBox className="p-[14px] mb-[12px] text-center">
      {material.modelPath ? (
        <div className="h-[120px] mb-[6px]">
          <model-viewer
            src={material.modelPath}
            auto-rotate
            camera-controls
            shadow-intensity="0.5"
            style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
          />
        </div>
      ) : (
        <div className="text-[56px] mb-[6px]">{material.emoji}</div>
      )}
      <div className="text-[24px] mb-[8px]">{material.name}</div>
      <div className="flex items-center justify-center gap-[12px] mb-[10px]">
        <label className="text-[20px] text-[var(--text-light)]">Kích cỡ:</label>
        <select
          value={currentSize}
          onChange={(e) => setSize(e.target.value)}
          className="py-[4px] px-[8px] border-[2px] border-solid border-[var(--border)] bg-white"
        >
          {material.sizeOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <QuantityControl value={quantity} onChange={setQuantity} />
      </div>
      <PixelButton variant="accent" fullWidth onClick={handleAdd}>
        ➕ Thêm vào túi
      </PixelButton>
    </PixelBox>
  );
}
