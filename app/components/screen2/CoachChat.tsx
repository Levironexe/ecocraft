'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Craft, LLMConfig, ChatMessage } from '../../lib/types';
import { useAuth } from '../AuthProvider';
import { loadCoachHistory, saveCoachMessage, getCoachHash } from '../../lib/coach-store';

interface CoachChatProps {
  craft: Craft;
  currentStep: number;
  llmConfig: LLMConfig;
  onCoachMessage?: () => void;
}

export function CoachChat({ craft, currentStep, llmConfig, onCoachMessage }: CoachChatProps) {
  const { user } = useAuth();
  const greeting: ChatMessage = useMemo(() => ({
    role: 'assistant',
    content: `Chào bạn nhỏ! Mình là Thợ Cả, sẽ giúp bạn làm "${craft.name}" hôm nay! Hãy hỏi mình nếu cần giúp nhé!`,
    timestamp: Date.now(),
  }), [craft.name]);

  const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const comboHash = useMemo(() => getCoachHash(craft.materials), [craft.materials]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    loadCoachHistory(user.id, comboHash).then((history) => {
      if (history.length > 0) {
        setMessages([greeting, ...history]);
      } else {
        setMessages([greeting]);
      }
    });
  }, [craft.id, user.id, comboHash, greeting]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: userMessage, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    saveCoachMessage(user.id, comboHash, userMsg);
    setIsTyping(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history,
          craftId: craft.id,
          craftName: craft.name,
          craftSteps: craft.steps,
          currentStep,
          llmConfig,
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = { role: 'assistant', content: data.reply, timestamp: Date.now() };
      setMessages((prev) => [...prev, assistantMsg]);
      saveCoachMessage(user.id, comboHash, assistantMsg);
      onCoachMessage?.();
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Mình đang gặp sự cố, thử lại nhé! 😅', timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-[8px]">
      <div className="flex items-center gap-[10px] mb-[8px] p-[8px] bg-[var(--primary-light)] border-[2px] border-solid border-[var(--primary)]">
        <div className="w-[40px] h-[40px] bg-[var(--primary)] border-[var(--pixel)] border-solid border-[var(--primary-dark)] flex items-center justify-center text-[18px]">
          🔧
        </div>
        <div>
          <div className="text-[15px] text-[var(--primary-dark)]">Thợ Cả</div>
          <div className="text-[13px] text-[var(--text-light)]">Đang hỗ trợ: {craft.name} · Bước {currentStep}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-[8px] p-[8px] bg-[var(--bg-warm)] border-[2px] border-solid border-[var(--border)] min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[85%] p-[8px] text-[15px] leading-[1.4] ${
              msg.role === 'assistant'
                ? 'self-start bg-white border-[2px] border-solid border-[var(--border)] border-l-[var(--pixel)] border-l-[var(--primary)]'
                : 'self-end bg-[var(--accent-light)] border-[2px] border-solid border-[var(--accent)]'
            }`}
          >
            <span className={`text-[13px] block mb-[2px] ${
              msg.role === 'assistant' ? 'text-[var(--primary-dark)]' : 'text-[var(--accent)]'
            }`}>
              {msg.role === 'assistant' ? 'Thợ Cả' : 'Bạn'}
            </span>
            {msg.content}
          </div>
        ))}

        {isTyping && (
          <div className="self-start p-[8px] bg-white border-[2px] border-solid border-[var(--border)] text-[var(--text-muted)]">
            <span className="animate-pulse">● ● ●</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-0 mt-[6px] min-w-0">
        <input
          type="text"
          placeholder="Hỏi Thợ Cả..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isTyping}
          className="flex-1 min-w-0 py-[8px] px-[12px] bg-white border-[var(--pixel)] border-solid border-[var(--border-dark)] outline-none focus:border-[var(--primary)]"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="pixel-btn pixel-btn-primary shrink-0"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
