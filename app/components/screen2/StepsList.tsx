'use client';

import { CraftStep } from '../../lib/types';

interface StepsListProps {
  steps: CraftStep[];
  completedSteps: Set<number>;
  onToggleStep: (stepNumber: number) => void;
}

export function StepsList({ steps, completedSteps, onToggleStep }: StepsListProps) {
  const currentStep = steps
    .map((s) => s.number)
    .filter((n) => !completedSteps.has(n))
    .sort((a, b) => a - b)[0] ?? null;

  return (
    <div className="flex flex-col gap-[6px] overflow-y-auto h-full p-[8px]">
      <div className="text-[20px] text-[var(--primary-dark)] mb-[4px] flex items-center gap-[6px]">
        <span>▸</span> 📋 Các Bước Làm (Click để đánh dấu hoàn thành)
      </div>
      {steps.map((step) => {
        const isDone = completedSteps.has(step.number);
        const isCurrent = step.number === currentStep;

        return (
          <button
            key={step.number}
            onClick={() => onToggleStep(step.number)}
            className={`pixel-box p-[8px] text-left cursor-pointer transition-all ${
              isDone ? 'opacity-50' : ''
            } ${isCurrent ? 'step-current border-[var(--accent)]' : ''}`}
          >
            <div className="flex items-start gap-[8px]">
              <div
                className={`w-[28px] h-[28px] flex items-center justify-center border-[2px] border-solid text-[20px] shrink-0 ${
                  isDone
                    ? 'bg-green-500 border-green-700 text-white'
                    : isCurrent
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                    : 'bg-[var(--bg-warm)] border-[var(--border-dark)] text-[var(--text-light)]'
                }`}
              >
                {isDone ? '✓' : step.number}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[26px] ${isDone ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text)]'}`}>
                  {step.title}
                </div>
                <div className={`text-[23px] mt-[2px] ${isDone ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-light)]'}`}>
                  {step.detail}
                </div>
                {step.tip && (
                  <div className="text-[18px] mt-[4px] text-[var(--accent)] flex items-start gap-[4px]">
                    <span>💡</span>
                    <span>{step.tip}</span>
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
