import { NextRequest } from 'next/server';
import { chat } from '../../lib/llm';
import { CRAFT_SUGGESTION_PROMPT } from '../../lib/prompts';
import { materials } from '../../lib/materials';
import { SelectedItem, LLMConfig, Craft } from '../../lib/types';

export async function POST(request: NextRequest) {
  try {
    const { selectedItems, llmConfig } = await request.json() as {
      selectedItems: SelectedItem[];
      llmConfig: LLMConfig;
    };

    if (selectedItems.length === 0) {
      return Response.json({ error: 'Chưa chọn vật liệu nào' }, { status: 400 });
    }

    const materialsJson = selectedItems
      .map((item) => {
        const mat = materials.find((m) => m.id === item.materialId);
        return mat ? `${mat.name} ×${item.quantity}` : null;
      })
      .filter(Boolean)
      .join(', ');

    const prompt = CRAFT_SUGGESTION_PROMPT.replace('{materials_json}', materialsJson);
    const result = await chat(prompt, [{ role: 'user', content: 'Gợi ý sản phẩm từ các vật liệu này' }], llmConfig);

    const cleaned = result.replace(/```json\n?|```\n?/g, '').trim();
    const suggestion = JSON.parse(cleaned);

    if (!suggestion.canSuggest) {
      return Response.json({
        craft: null,
        message: suggestion.message || 'Mình chưa nghĩ ra cách làm hay với những thứ này.',
      });
    }

    if (!suggestion.steps?.length) {
      return Response.json({
        craft: null,
        message: 'Mình chưa nghĩ ra cách làm hay với những thứ này.',
      });
    }

    const craft: Craft = {
      id: `ai-suggestion-${Date.now()}`,
      name: suggestion.name,
      emoji: suggestion.emoji || '🎨',
      description: suggestion.description,
      difficulty: 1,
      ageMin: 6,
      timeMinutes: 20,
      materials: selectedItems.map((item) => ({
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

    return Response.json({ craft });
  } catch {
    return Response.json({ error: 'Mình đang gặp sự cố, thử lại nhé!' }, { status: 500 });
  }
}
