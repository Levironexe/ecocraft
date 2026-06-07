import { LLMConfig } from './types';

export async function chat(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  config: LLMConfig,
  jsonMode = false
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    if (config.provider === 'groq') {
      return await chatGroq(systemPrompt, messages, controller.signal, jsonMode);
    } else {
      return await chatOllama(systemPrompt, messages, config, controller.signal, jsonMode);
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function chatGroq(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  signal: AbortSignal,
  jsonMode: boolean
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('Chưa cấu hình API key cho Groq.');

  const groqMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages,
  ];

  const body: Record<string, unknown> = {
    model: 'llama-3.3-70b-versatile',
    messages: groqMessages,
    temperature: 0.7,
    max_tokens: 1024,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('[Groq] Error:', res.status, errText);
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 2000));
      const retry = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal,
      });
      if (!retry.ok) throw new Error('AI đang bận, thử lại sau nhé!');
      const retryData = await retry.json();
      return retryData.choices?.[0]?.message?.content || '';
    }
    throw new Error(`Lỗi AI: ${errText.slice(0, 100)}`);
  }

  const data = await res.json();
  console.log('[Groq] Model used:', data.model, '| Tokens:', data.usage?.total_tokens);
  return data.choices?.[0]?.message?.content || '';
}

async function chatOllama(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  config: LLMConfig,
  signal: AbortSignal,
  jsonMode: boolean
): Promise<string> {
  const url = (config.ollamaUrl || 'http://localhost:11434') + '/api/chat';
  const model = config.ollamaModel || 'qwen2.5:7b';

  const ollamaMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const body: Record<string, unknown> = {
    model,
    messages: ollamaMessages,
    stream: false,
  };

  if (jsonMode) {
    body.format = 'json';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    throw new Error('Không thể kết nối AI ngoại tuyến.');
  }

  const data = await res.json();
  return data.message?.content || '';
}
