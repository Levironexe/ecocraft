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
  imageCache: Record<string, string>;
  onImageGenerated: (craftId: string, url: string) => void;
  onShowHistory?: () => void;
}

export function BuildScreen({ craft, selectedItems, llmConfig, onCraftComplete, onCoachMessage, imageCache, onImageGenerated, onShowHistory }: BuildScreenProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [leftWidth, setLeftWidth] = useState(55);
  const hasAwarded = useRef(false);
  const draggingRef = useRef(false);

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
        onCraftComplete(craft);
        setTimeout(() => {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 4000);
        }, 100);
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

  const handleMouseDown = () => {
    draggingRef.current = true;
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const container = document.getElementById('build-grid');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.max(30, Math.min(70, pct)));
    };
    const handleMouseUp = () => {
      draggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const rightWidth = 100 - leftWidth;
  const chatWidth = chatOpen ? 35 : 0;
  const stepsWidth = rightWidth - chatWidth;

  return (
    <div className="flex flex-col screen-enter relative" style={{ height: 'calc(100dvh - 90px)' }}>
      {showCelebration && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="pixel-box p-[24px] text-center pointer-events-auto">
            <div className="text-[24px] text-[var(--primary-dark)]">Tuyệt vời!</div>
            <div className="text-[20px]">Bạn đã hoàn thành {craft.name}!</div>
            <div className="text-[18px] text-[var(--accent)] mt-[4px]">+{50 + craft.steps.length * 10} điểm!</div>
          </div>
        </div>
      )}
      <div className="flex items-stretch gap-0">
        <div className="flex-1">
          <MaterialsBar craft={craft} selectedItems={selectedItems} />
        </div>
        {onShowHistory && (
          <button
            onClick={onShowHistory}
            className="pixel-btn pixel-btn-ghost shrink-0 text-[18px] p-[8px] leading-none"
          >
            Lịch sử
          </button>
        )}
      </div>
      <div id="build-grid" className="flex-1 flex min-h-0">
        {/* Left: Model Viewer */}
        <div className="flex flex-col overflow-hidden" style={{ width: `${leftWidth}%` }}>
          <ModelViewer craft={craft} cachedImageUrl={imageCache[craft.id]} onImageGenerated={(url) => onImageGenerated(craft.id, url)} />
        </div>

        {/* Drag handle */}
        <div
          className="w-[6px] cursor-col-resize bg-[var(--border)] hover:bg-[var(--primary)] transition-colors shrink-0"
          onMouseDown={handleMouseDown}
        />

        {/* Right: Steps + Chat */}
        <div className="flex min-h-0 overflow-hidden" style={{ width: `${rightWidth}%` }}>
          {/* Steps */}
          <div className="flex-1 border-r-[var(--pixel)] border-r-solid border-r-[var(--border)] overflow-hidden" style={{ minWidth: 0 }}>
            <StepsList
              steps={craft.steps}
              completedSteps={completedSteps}
              onToggleStep={handleToggleStep}
            />
          </div>

          {/* Chat toggle button when collapsed */}
          {!chatOpen && (
            <button
              onClick={() => setChatOpen(true)}
              className="w-[40px] shrink-0 flex items-center justify-center cursor-pointer bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors"
              style={{ writingMode: 'vertical-rl' }}
            >
              Thợ Cả
            </button>
          )}

          {/* Chat panel */}
          {chatOpen && (
            <div className="overflow-hidden relative" style={{ width: `${chatWidth}%`, minWidth: '200px' }}>
              <button
                onClick={() => setChatOpen(false)}
                className="absolute top-[8px] right-[8px] z-10 w-[24px] h-[24px] flex items-center justify-center bg-[var(--bg-warm)] border border-[var(--border)] cursor-pointer hover:bg-[var(--accent)] hover:text-white text-[14px]"
              >
                ✕
              </button>
              <CoachChat craft={craft} currentStep={currentStep} llmConfig={llmConfig} onCoachMessage={onCoachMessage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
