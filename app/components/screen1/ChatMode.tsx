'use client';

import { useState, useRef, useEffect } from 'react';
import { SelectedItem, LLMConfig, ChatMessage, Craft, MatchResult } from '../../lib/types';
import { PixelButton } from '../ui/PixelButton';
import { useAuth } from '../AuthProvider';
import { loadChatHistory, saveChatMessage } from '../../lib/chat-store';

interface ChatModeProps {
  selectedItems: SelectedItem[];
  llmConfig: LLMConfig;
  onAddItems: (items: SelectedItem[]) => void;
  onUpdateSuggestions: (crafts: MatchResult[], aiCraft?: Craft) => void;
}

export function ChatMode({ selectedItems, llmConfig, onAddItems, onUpdateSuggestions }: ChatModeProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Chào bạn nhỏ! Hãy kể cho mình nghe bạn có những vật liệu tái chế gì nhé!', timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingItems, setPendingItems] = useState<SelectedItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadChatHistory(user.id).then((history) => {
      if (history.length > 0) setMessages(history);
    });
  }, [user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: userMessage, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    saveChatMessage(user.id, userMsg);
    setIsTyping(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history,
          selectedItems,
          llmConfig,
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = { role: 'assistant', content: data.reply, timestamp: Date.now() };
      setMessages((prev) => [...prev, assistantMsg]);
      saveChatMessage(user.id, assistantMsg);

      if (data.extractedItems?.length > 0) {
        setPendingItems(data.extractedItems);
      }

      if (data.matchedCrafts) {
        onUpdateSuggestions(data.matchedCrafts);
      }

      if (data.suggestedCraft) {
        onUpdateSuggestions([], data.suggestedCraft);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Mình đang gặp sự cố, thử lại nhé! 😅', timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleAddPending = () => {
    onAddItems(pendingItems);
    setPendingItems([]);
    setMessages((prev) => [...prev, { role: 'assistant', content: 'Đã thêm vào túi!', timestamp: Date.now() }]);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center gap-[10px] mb-[8px] p-[8px] bg-[var(--primary-light)] border-[2px] border-solid border-[var(--primary)]">
        <div className="w-[40px] h-[40px] bg-[var(--primary)] border-[var(--pixel)] border-solid border-[var(--primary-dark)] flex items-center justify-center text-[15px]">
          🤖
        </div>
        <div>
          <div className="text-[15px] text-[var(--primary-dark)]">Trợ Lý AI</div>
          <div className="text-[13px] text-[var(--text-light)]">Giúp bạn tìm vật liệu</div>
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

        {pendingItems.length > 0 && (
          <div className="self-start p-[8px] bg-[var(--primary-light)] border-[2px] border-solid border-[var(--primary)]">
            <div className="text-[13px] mb-[6px]">Thêm vào túi?</div>
            <PixelButton variant="primary" onClick={handleAddPending}>
              Thêm {pendingItems.length} vật liệu
            </PixelButton>
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
          placeholder="Mô tả vật liệu của bạn..."
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
