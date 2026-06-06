'use client';

interface QuantityControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

export function QuantityControl({ value, onChange, min = 1 }: QuantityControlProps) {
  return (
    <div className="flex items-center gap-0">
      <button
        className="w-[30px] h-[30px] flex items-center justify-center border-[2px] border-[var(--border-dark)] bg-[var(--bg-warm)] cursor-pointer hover:bg-[var(--accent)] hover:text-white text-[22px]"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <div className="w-[36px] h-[30px] flex items-center justify-center border-y-[2px] border-[var(--border-dark)] bg-white text-[22px] text-[var(--accent)]">
        {value}
      </div>
      <button
        className="w-[30px] h-[30px] flex items-center justify-center border-[2px] border-[var(--border-dark)] bg-[var(--bg-warm)] cursor-pointer hover:bg-[var(--accent)] hover:text-white text-[22px]"
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
