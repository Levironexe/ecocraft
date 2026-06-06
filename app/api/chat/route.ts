import { NextRequest } from 'next/server';
import { chat } from '../../lib/llm';
import { CHAT_ASSISTANT_PROMPT, CRAFT_SUGGESTION_PROMPT } from '../../lib/prompts';
import { matchCrafts } from '../../lib/matcher';
import { crafts } from '../../lib/crafts';
import { materials } from '../../lib/materials';
import { SelectedItem, LLMConfig, Craft } from '../../lib/types';

function parseItemsFromResponse(text: string): { reply: string; items: { id: string; quantity: number }[] } {
  const marker = '---ITEMS---';
  const idx = text.indexOf(marker);

  if (idx === -1) {
    return { reply: text.trim(), items: [] };
  }

  const reply = text.slice(0, idx).trim();
  const jsonPart = text.slice(idx + marker.length).trim();

  try {
    const cleaned = jsonPart.replace(/```json\n?|```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return { reply, items: parsed.filter((i: { id: string }) => materials.some((m) => m.id === i.id)) };
    }
  } catch { /* parsing failed — just return reply */ }

  return { reply, items: [] };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [], llmConfig } = body as {
      message: string;
      history: { role: 'user' | 'assistant'; content: string }[];
      llmConfig: LLMConfig;
    };

    const chatMessages = [...history, { role: 'user' as const, content: message }];
    const rawResponse = await chat(CHAT_ASSISTANT_PROMPT, chatMessages, llmConfig);

    const { reply, items } = parseItemsFromResponse(rawResponse);

    const extractedItems: SelectedItem[] = items.map((item) => {
      const mat = materials.find((m) => m.id === item.id)!;
      return {
        materialId: item.id,
        size: mat.sizeOptions[0],
        quantity: item.quantity || 2,
      };
    });

    if (extractedItems.length === 0) {
      return Response.json({ reply, extractedItems: [] });
    }

    const matched = matchCrafts(extractedItems, crafts);

    if (matched.length > 0) {
      return Response.json({
        reply,
        extractedItems,
        matchedCrafts: matched.slice(0, 3),
      });
    }

    let suggestedCraft: Craft | undefined;
    try {
      const materialsJson = extractedItems
        .map((item) => {
          const mat = materials.find((m) => m.id === item.materialId);
          return mat ? mat.name : item.materialId;
        })
        .join(', ');

      const suggestionPrompt = CRAFT_SUGGESTION_PROMPT.replace('{materials_json}', materialsJson);
      const suggestionResult = await chat(suggestionPrompt, [{ role: 'user', content: 'Gợi ý sản phẩm' }], llmConfig);

      const cleanedSuggestion = suggestionResult.replace(/```json\n?|```\n?/g, '').trim();
      const suggestion = JSON.parse(cleanedSuggestion);

      if (suggestion.canSuggest && suggestion.steps?.length > 0) {
        suggestedCraft = {
          id: `ai-suggestion-${Date.now()}`,
          name: suggestion.name,
          emoji: suggestion.emoji || '🎨',
          description: suggestion.description,
          difficulty: 1,
          ageMin: 6,
          timeMinutes: 20,
          materials: extractedItems.map((item) => ({
            materialId: item.materialId,
            quantity: item.quantity,
          })),
          tools: ['Kéo', 'Keo dán'],
          steps: suggestion.steps.map((s: { number: number; title: string; detail: string }) => ({
            number: s.number,
            title: s.title,
            detail: s.detail,
          })),
          modelPath: null,
          imagePrompt: suggestion.image_prompt || undefined,
          isShowcase: false,
        };
        return Response.json({ reply, extractedItems, suggestedCraft });
      }
    } catch { /* suggestion failed — just return what we have */ }

    return Response.json({ reply, extractedItems });
  } catch {
    return Response.json({ reply: 'Mình đang gặp sự cố, thử lại nhé! 😅' });
  }
}
