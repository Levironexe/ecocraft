import { NextRequest } from 'next/server';
import { chat } from '../../lib/llm';
import { CRAFT_CHAT_PROMPT, CRAFT_SUGGESTION_PROMPT } from '../../lib/prompts';
import { materials } from '../../lib/materials';
import { LLMConfig, Craft } from '../../lib/types';

interface CraftProposal {
  name: string;
  emoji: string;
  description: string;
  materials: { id: string; quantity: number }[];
  userIntent: string;
}

function parseResponse(text: string): { reply: string; proposal: CraftProposal | null } {
  const marker = '---CRAFT_PROPOSAL---';
  const idx = text.indexOf(marker);

  if (idx === -1) {
    return { reply: text.trim(), proposal: null };
  }

  const reply = text.slice(0, idx).trim();
  const jsonPart = text.slice(idx + marker.length).trim();

  try {
    const cleaned = jsonPart.replace(/```json\n?|```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.name && parsed.materials) {
      const validMaterials = parsed.materials.filter(
        (m: { id: string }) => materials.some((mat) => mat.id === m.id)
      );
      return { reply, proposal: { ...parsed, materials: validMaterials } };
    }
  } catch {}

  return { reply, proposal: null };
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [], llmConfig } = await request.json() as {
      message: string;
      history: { role: 'user' | 'assistant'; content: string }[];
      llmConfig: LLMConfig;
    };

    const chatMessages = [...history, { role: 'user' as const, content: message }];
    const rawResponse = await chat(CRAFT_CHAT_PROMPT, chatMessages, llmConfig);

    const { reply, proposal } = parseResponse(rawResponse);

    if (!proposal) {
      return Response.json({ reply });
    }

    const materialsJson = proposal.materials
      .map((m) => {
        const mat = materials.find((mat) => mat.id === m.id);
        return mat ? `${mat.name} ×${m.quantity}` : null;
      })
      .filter(Boolean)
      .join(', ');

    const userContext = proposal.userIntent
      ? `\n\nUSER'S SPECIFIC REQUEST: ${proposal.userIntent}\nProduct name: ${proposal.name}\nDescription: ${proposal.description}\nYou MUST design the craft to match this description exactly.`
      : '';

    const suggestionPrompt = CRAFT_SUGGESTION_PROMPT.replace('{materials_json}', materialsJson) + userContext;

    let craft: Craft | null = null;

    try {
      const suggestionResult = await chat(
        suggestionPrompt,
        [{ role: 'user', content: `Tạo hướng dẫn chi tiết cho: ${proposal.name} - ${proposal.description}` }],
        llmConfig,
        true
      );

      const cleaned = suggestionResult.replace(/```json\n?|```\n?/g, '').trim();
      let suggestion;
      try {
        suggestion = JSON.parse(cleaned);
      } catch {
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON');
        suggestion = JSON.parse(jsonMatch[0]);
      }

      if (suggestion.canSuggest && suggestion.steps?.length > 0) {
        craft = {
          id: `ai-craft-${Date.now()}`,
          name: proposal.name,
          emoji: proposal.emoji || '🎨',
          description: proposal.description,
          difficulty: 1,
          ageMin: 6,
          timeMinutes: 20,
          materials: proposal.materials.map((m) => ({
            materialId: m.id,
            quantity: m.quantity,
          })),
          tools: suggestion.tools || ['Kéo', 'Keo dán'],
          steps: suggestion.steps.map((s: { number: number; title: string; detail: string }) => ({
            number: s.number,
            title: s.title,
            detail: s.detail,
          })),
          modelPath: null,
          imagePrompt: suggestion.image_prompt || undefined,
          isShowcase: false,
        };
      }
    } catch {
      console.error('[craft-chat] Failed to generate steps');
    }

    return Response.json({ reply, proposal, craft });
  } catch {
    return Response.json({ reply: 'Mình đang gặp sự cố, thử lại nhé! 😅' });
  }
}
