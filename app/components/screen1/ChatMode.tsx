'use client';

import { useState, useRef, useEffect } from 'react';
import { LLMConfig, ChatMessage, Craft } from '../../lib/types';
import { PixelButton } from '../ui/PixelButton';
import { PixelBox } from '../ui/PixelBox';
import { useAuth } from '../AuthProvider';
import { loadChatHistory, saveChatMessage } from '../../lib/chat-store';
import { materials } from '../../lib/materials';
import { useAppStore } from '../../lib/store';

interface CraftProposal {
  name: string;
  emoji: string;
  description: string;
  materials: { id: string; quantity: number }[];
}

interface ChatModeProps {
  llmConfig: LLMConfig;
}

export function ChatMode({ llmConfig }: ChatModeProps) {
  const { user } = useAuth();
  const selectCraft = useAppStore((s) => s.selectCraft);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Chào bạn! Kể cho mình nghe bạn có vật liệu gì và muốn làm gì nhé! 🎨', timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingCraft, setPendingCraft] = useState<{ proposal: CraftProposal; craft: Craft } | null>(null);
  const [craftLoading, setCraftLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadChatHistory(user.id).then((history) => {
      if (history.length > 0) setMessages(history);
    });
  }, [user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, pendingCraft]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: userMessage, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    saveChatMessage(user.id, userMsg);
    setIsTyping(true);
    setPendingCraft(null);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/craft-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history, llmConfig }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = { role: 'assistant', content: data.reply, timestamp: Date.now() };
      setMessages((prev) => [...prev, assistantMsg]);
      saveChatMessage(user.id, assistantMsg);

      if (data.craft && data.proposal) {
        setPendingCraft({ proposal: data.proposal, craft: data.craft });
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Mình đang gặp sự cố, thử lại nhé!',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleCraftNow = () => {
    if (!pendingCraft) return;
    setCraftLoading(true);
    selectCraft(pendingCraft.craft, 'ai-chat');
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 p-[14px]">
      <div className="flex items-center gap-[10px] mb-[8px] p-[8px] bg-[var(--primary-light)] border-[2px] border-solid border-[var(--primary)]">
        <div className="w-[40px] h-[40px] bg-[var(--primary)] border-[var(--pixel)] border-solid border-[var(--primary-dark)] flex items-center justify-center text-[15px]">
          🎨
        </div>
        <div>
          <div className="text-[15px] text-[var(--primary-dark)]">Trợ Lý Sáng Tạo</div>
          <div className="text-[13px] text-[var(--text-light)]">Kể cho mình bạn muốn làm gì!</div>
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
              {msg.role === 'assistant' ? 'Trợ Lý' : 'Bạn'}
            </span>
            {msg.content}
          </div>
        ))}

        {pendingCraft && !craftLoading && (
          <PixelBox className="self-start max-w-[90%] p-[12px]">
            <div className="text-[18px] mb-[6px]">
              {pendingCraft.proposal.emoji} {pendingCraft.proposal.name}
            </div>
            <div className="text-[14px] text-[var(--text-light)] mb-[8px]">
              {pendingCraft.proposal.description}
            </div>
            <div className="flex flex-wrap gap-[4px] mb-[10px]">
              {pendingCraft.proposal.materials.map((m, i) => {
                const mat = materials.find((mat) => mat.id === m.id);
                return mat ? (
                  <span key={i} className="text-[13px] px-[6px] py-[2px] bg-[var(--primary-light)] border-[1px] border-solid border-[var(--primary)]">
                    {mat.emoji} {mat.name} x{m.quantity}
                  </span>
                ) : null;
              })}
            </div>
            <PixelButton variant="accent" fullWidth onClick={handleCraftNow}>
              Chế Tạo Ngay!
            </PixelButton>
          </PixelBox>
        )}

        {craftLoading && (
          <div className="self-start p-[8px] bg-[var(--primary-light)] border-[2px] border-solid border-[var(--primary)] text-[15px]">
            Đang chuẩn bị xưởng chế tạo...
          </div>
        )}

        {isTyping && (
          <div className="self-start p-[8px] bg-white border-[2px] border-solid border-[var(--border)] text-[var(--text-muted)]">
            <span className="animate-pulse">● ● ●</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-0 mt-[6px]">
        <input
          ref={inputRef}
          type="text"
          placeholder="Mô tả vật liệu và ý tưởng của bạn..."
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
