import { NextRequest } from 'next/server';
import { chat } from '../../lib/llm';
import { BUILD_COACH_PROMPT } from '../../lib/prompts';
import { crafts } from '../../lib/crafts';
import { LLMConfig } from '../../lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [], craftId, craftName: clientCraftName, craftSteps: clientSteps, currentStep, llmConfig } = body as {
      message: string;
      history: { role: 'user' | 'assistant'; content: string }[];
      craftId: string;
      craftName?: string;
      craftSteps?: { number: number; title: string; detail: string; tip?: string }[];
      currentStep: number;
      llmConfig: LLMConfig;
    };

    const libraryCraft = crafts.find((c) => c.id === craftId);

    const craftName = libraryCraft?.name || clientCraftName || 'Sản phẩm tái chế';
    const steps = libraryCraft?.steps || clientSteps || [];
    const currentStepObj = steps.find((s) => s.number === currentStep);

    const stepTitle = currentStepObj?.title || `Bước ${currentStep}`;
    const stepDetail = currentStepObj?.detail || 'Đang thực hiện';
    const stepsSummary = steps.length > 0
      ? steps.map((s) => `${s.number}. ${s.title}: ${s.detail}`).join('\n')
      : 'Sản phẩm được gợi ý bởi AI';

    const prompt = BUILD_COACH_PROMPT
      .replace('{craft_name}', craftName)
      .replace('{step_number}', String(currentStep))
      .replace('{step_title}', stepTitle)
      .replace('{step_detail}', stepDetail)
      .replace('{steps_summary}', stepsSummary);

    const messages = [...history, { role: 'user' as const, content: message }];
    const reply = await chat(prompt, messages, llmConfig);

    return Response.json({ reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('thời gian') || msg.includes('abort')) {
      return Response.json({ reply: 'AI đang bận quá, thử lại sau nhé! ⏳' });
    }
    return Response.json({ reply: 'Mình đang gặp sự cố, thử lại nhé! 😅' });
  }
}
