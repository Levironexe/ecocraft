import { NextRequest } from 'next/server';
import { generateImage } from '../../lib/gemini-image';

export async function POST(request: NextRequest) {
  try {
    const { craftName, description, materials, imagePrompt } = await request.json();

    const prompt = imagePrompt || `A cute children's craft toy: ${craftName}. Made from recycled ${materials}. ${description}. Simple, colorful, white background, product photography, no text, no watermark, cartoon game asset style.`;

    const imageBuffer = await generateImage(prompt);
    const base64 = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return Response.json({ imageUrl: dataUrl });
  } catch (err) {
    console.error('[/api/generate-image] Error:', err);
    return Response.json({ error: 'Lỗi tạo hình ảnh' }, { status: 500 });
  }
}
