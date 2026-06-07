const ATTEMPTS = [
  { model: 'gemini-2.5-flash-image', apiVersion: 'v1beta', configKey: 'responseModalities' },
  { model: 'gemini-2.5-flash-image', apiVersion: 'v1', configKey: 'responseModalities' },
  { model: 'gemini-2.5-flash-image', apiVersion: 'v1beta', configKey: 'response_modalities' },
];

export async function generateImage(prompt: string): Promise<Buffer> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  let lastError = '';

  for (const { model, apiVersion, configKey } of ATTEMPTS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            [configKey]: ['IMAGE'],
          },
        }),
      }
    );

    if (!res.ok) {
      lastError = await res.text();
      console.error(`[Gemini] ${apiVersion}/${model} (${configKey}) failed (${res.status}):`, lastError.slice(0, 200));
      continue;
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        console.log(`[Gemini] Image generated: ${apiVersion}/${model} (${configKey})`);
        return Buffer.from(part.inlineData.data, 'base64');
      }
    }

    lastError = `No image in response from ${model}`;
    console.error(`[Gemini] ${model}: no image data in parts`);
  }

  throw new Error(`Gemini image gen failed after all attempts: ${lastError.slice(0, 200)}`);
}
