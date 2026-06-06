'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Craft, SelectedItem, LLMConfig } from '../../lib/types';
import { MaterialsBar } from './MaterialsBar';
import { ModelViewer } from './ModelViewer';
import { StepsList } from './StepsList';
import { CoachChat } from './CoachChat';

interface BuildScreenProps {
  craft: Craft;
  selectedItems: SelectedItem[];
  llmConfig: LLMConfig;
  onCraftComplete: (craft: Craft) => void;
  onCoachMessage: () => void;
}

export function BuildScreen({ craft, selectedItems, llmConfig, onCraftComplete, onCoachMessage }: BuildScreenProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const hasAwarded = useRef(false);

  useEffect(() => {
    hasAwarded.current = false;
    setCompletedSteps(new Set());
    setShowCelebration(false);
  }, [craft.id]);

  const handleToggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNumber)) {
        next.delete(stepNumber);
      } else {
        next.add(stepNumber);
      }

      if (next.size === craft.steps.length && !hasAwarded.current) {
        hasAwarded.current = true;
        const points = 50 + craft.steps.length * 10;
        onCraftComplete(craft);
        setTimeout(() => {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 4000);
        }, 100);
        void points;
      }

      return next;
    });
  };

  const currentStep = useMemo(() => {
    const incomplete = craft.steps
      .map((s) => s.number)
      .filter((n) => !completedSteps.has(n))
      .sort((a, b) => a - b);
    return incomplete[0] ?? craft.steps[craft.steps.length - 1]?.number ?? 1;
  }, [craft.steps, completedSteps]);

  return (
    <div className="flex flex-col screen-enter relative" style={{ height: 'calc(100dvh - 90px)' }}>
      {showCelebration && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="pixel-box p-[24px] text-center pointer-events-auto">
            <div className="text-[48px] mb-[8px]">🎉</div>
            <div className="text-[24px] text-[var(--primary-dark)]">Tuyệt vời!</div>
            <div className="text-[20px]">Bạn đã hoàn thành {craft.name}!</div>
            <div className="text-[18px] text-[var(--accent)] mt-[4px]">+{50 + craft.steps.length * 10} điểm!</div>
          </div>
        </div>
      )}
      <MaterialsBar craft={craft} selectedItems={selectedItems} />
      <div className="flex-1 grid min-h-0" style={{ gridTemplateColumns: '55% 22.5% 22.5%' }}>
        <div className="flex flex-col border-r-[var(--pixel)] border-r-solid border-r-[var(--border)] overflow-hidden">
          <ModelViewer craft={craft} />
        </div>
        <div className="border-r-[var(--pixel)] border-r-solid border-r-[var(--border)] overflow-hidden">
          <StepsList
            steps={craft.steps}
            completedSteps={completedSteps}
            onToggleStep={handleToggleStep}
          />
        </div>
        <div className="overflow-hidden">
          <CoachChat craft={craft} currentStep={currentStep} llmConfig={llmConfig} onCoachMessage={onCoachMessage} />
        </div>
      </div>
    </div>
  );
}
