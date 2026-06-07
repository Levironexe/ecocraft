'use client';

import { useState, useRef, useEffect } from 'react';
import { Craft, LLMConfig, ChatMessage } from '../../lib/types';

interface CoachChatProps {
  craft: Craft;
  currentStep: number;
  llmConfig: LLMConfig;
  onCoachMessage?: () => void;
}

export function CoachChat({ craft, currentStep, llmConfig, onCoachMessage }: CoachChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: `Chào bạn nhỏ! 🔧 Mình là Thợ Cả, sẽ giúp bạn làm "${craft.name}" hôm nay! Hãy hỏi mình nếu cần giúp nhé!`, timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    setMessages([
      { role: 'assistant', content: `Chào bạn nhỏ! 🔧 Mình là Thợ Cả, sẽ giúp bạn làm "${craft.name}" hôm nay! Hãy hỏi mình nếu cần giúp nhé!`, timestamp: Date.now() },
    ]);
  }, [craft.id, craft.name]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage, timestamp: Date.now() }]);
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
          currentStep,
          llmConfig,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, timestamp: Date.now() }]);
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
        <div className="w-[40px] h-[40px] bg-[var(--primary)] border-[var(--pixel)] border-solid border-[var(--primary-dark)] flex items-center justify-center text-[20px]">
          🔧
        </div>
        <div>
          <div className="text-[20px] text-[var(--primary-dark)]">Thợ Cả</div>
          <div className="text-[18px] text-[var(--text-light)]">Đang hỗ trợ: {craft.name} • Bước {currentStep}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-[8px] p-[8px] bg-[var(--bg-warm)] border-[2px] border-solid border-[var(--border)] min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[85%] p-[8px] text-[21px] leading-[1.4] ${
              msg.role === 'assistant'
                ? 'self-start bg-white border-[2px] border-solid border-[var(--border)] border-l-[var(--pixel)] border-l-[var(--primary)]'
                : 'self-end bg-[var(--accent-light)] border-[2px] border-solid border-[var(--accent)]'
            }`}
          >
            <span className={`text-[18px] block mb-[2px] ${
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

      <div className="flex gap-0 mt-[6px]">
        <input
          type="text"
          placeholder="Hỏi Thợ Cả..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isTyping}
          className="flex-1 py-[8px] px-[12px] bg-white border-[var(--pixel)] border-solid border-[var(--border-dark)] outline-none focus:border-[var(--primary)]"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="pixel-btn pixel-btn-primary"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
