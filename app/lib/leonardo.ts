const LEONARDO_API_V2 = 'https://cloud.leonardo.ai/api/rest/v2';
const LEONARDO_API_V1 = 'https://cloud.leonardo.ai/api/rest/v1';

function getApiKey(): string {
  const key = process.env.LEONARDO_API_KEY;
  if (!key) throw new Error('LEONARDO_API_KEY not configured');
  return key;
}

export async function generateImageBuffer(prompt: string): Promise<Buffer> {
  const apiKey = getApiKey();

  // Create generation via v2 API (GPT Image 2)
  const createRes = await fetch(`${LEONARDO_API_V2}/generations`, {
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

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Leonardo create failed: ${createRes.status} ${err.slice(0, 200)}`);
  }

  const createData = await createRes.json();
  console.log('[Leonardo] v2 create response:', JSON.stringify(createData).slice(0, 500));

  // Try to extract generation ID from various response shapes
  const generationId =
    createData.generate?.generationId ||
    createData.sdGenerationJob?.generationId ||
    createData.generationId ||
    createData.id;

  if (!generationId) {
    throw new Error(`No generationId from Leonardo v2: ${JSON.stringify(createData).slice(0, 300)}`);
  }

  // Poll via v1 API (v2 doesn't have a get endpoint documented)
  const imageUrl = await pollForImageUrl(generationId, apiKey);

  const downloadRes = await fetch(imageUrl);
  if (!downloadRes.ok) throw new Error(`Failed to download Leonardo image: ${downloadRes.status}`);
  const arrayBuffer = await downloadRes.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function pollForImageUrl(generationId: string, apiKey: string): Promise<string> {
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const res = await fetch(`${LEONARDO_API_V1}/generations/${generationId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      if (i === 0) console.log(`[Leonardo] v1 poll failed (${res.status}), trying v2...`);
      const v2Res = await fetch(`${LEONARDO_API_V2}/generations/${generationId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });

      if (v2Res.ok) {
        const v2Data = await v2Res.json();
        if (i < 3) console.log('[Leonardo] v2 poll response:', JSON.stringify(v2Data).slice(0, 500));
        const images = v2Data.generation?.generated_images || v2Data.generated_images || v2Data.images;
        if (images?.[0]?.url) return images[0].url;
      } else if (i === 0) {
        console.log(`[Leonardo] v2 poll also failed (${v2Res.status})`);
      }
      continue;
    }

    const data = await res.json();
    if (i < 3) console.log('[Leonardo] v1 poll response:', JSON.stringify(data).slice(0, 500));
    const images = data.generations_by_pk?.generated_images;

    if (images?.[0]?.url) return images[0].url;

    if (data.generations_by_pk?.status === 'FAILED') {
      throw new Error('Leonardo generation failed');
    }
  }

  throw new Error('Leonardo generation timed out');
}
