import { NextRequest } from 'next/server';

const LEONARDO_API = 'https://cloud.leonardo.ai/api/rest/v1';

async function createGeneration(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(`${LEONARDO_API}/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt,
      modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
      width: 512,
      height: 512,
      num_images: 1,
      alchemy: false,
      photoReal: false,
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
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const res = await fetch(`${LEONARDO_API}/generations/${generationId}`, {
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
  } catch {
    return Response.json({ error: 'Lỗi tạo hình ảnh' }, { status: 500 });
  }
}
