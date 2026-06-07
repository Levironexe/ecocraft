import { NextRequest } from 'next/server';

const LEONARDO_API_V2 = 'https://cloud.leonardo.ai/api/rest/v2';

async function createGeneration(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(`${LEONARDO_API_V2}/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      public: false,
      model: 'gpt-image-2',
      parameters: {
        quality: 'MEDIUM',
        prompt,
        quantity: 1,
        width: 1024,
        height: 1024,
        prompt_enhance: 'OFF',
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Leonardo API error: ${err}`);
  }

  const data = await res.json();
  return data.sdGenerationJob?.generationId;
}

async function pollForResult(generationId: string, apiKey: string): Promise<string | null> {
  const LEONARDO_API_V1 = 'https://cloud.leonardo.ai/api/rest/v1';

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const res = await fetch(`${LEONARDO_API_V1}/generations/${generationId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!res.ok) continue;

    const data = await res.json();
    const images = data.generations_by_pk?.generated_images;

    if (images && images.length > 0 && images[0].url) {
      return images[0].url;
    }

    if (data.generations_by_pk?.status === 'FAILED') {
      return null;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.LEONARDO_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'Chưa cấu hình Leonardo API key' }, { status: 500 });
    }

    const { craftName, description, materials, imagePrompt } = await request.json();

    const prompt = imagePrompt || `A cute children's craft toy: ${craftName}. Made from recycled ${materials}. ${description}. Simple, colorful, white background, product photography, no text, no watermark.`;

    const generationId = await createGeneration(prompt, apiKey);
    if (!generationId) {
      return Response.json({ error: 'Không thể tạo hình ảnh' }, { status: 500 });
    }

    const imageUrl = await pollForResult(generationId, apiKey);
    if (!imageUrl) {
      return Response.json({ error: 'Hết thời gian tạo hình ảnh' }, { status: 500 });
    }

    return Response.json({ imageUrl });
  } catch (err) {
    console.error('[Leonardo] Error:', err);
    return Response.json({ error: 'Lỗi tạo hình ảnh' }, { status: 500 });
  }
}
