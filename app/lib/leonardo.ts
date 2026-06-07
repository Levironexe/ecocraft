import { readFileSync } from 'fs';
import { join } from 'path';

const LEONARDO_API_V2 = 'https://cloud.leonardo.ai/api/rest/v2';
const LEONARDO_API_V1 = 'https://cloud.leonardo.ai/api/rest/v1';

const REFERENCE_IMAGE_DIR = join(process.cwd(), 'public', 'image-reference');

const MATERIAL_IMAGE_FILES: Record<string, string> = {
  'chai-nhua': 'chai-nhua.jpg',
  'ong-hut': 'ong-hut.jpeg',
  'giay-bao': 'giay-bao.jpeg',
  'lon-nuoc': 'lon-nuoc.jpeg',
  'nap-chai': 'nap-chai.jpg',
  'thung-carton': 'thung-carton.jpg',
  'loi-giay': 'loi-giay.jpeg',
  'vai-vun': 'vai-vun.jpeg',
  'dua-go': 'doi-dua.jpeg',
  'chai-thuy-tinh': 'chai-thuy-tinh.png',
  'day-ruy-bang': 'day-ruy-bang.jpeg',
  'vo-trung': 'vo-trung.jpeg',
};

function getApiKey(): string {
  const key = process.env.LEONARDO_API_KEY;
  if (!key) throw new Error('LEONARDO_API_KEY not configured');
  return key;
}

async function uploadImage(apiKey: string, filePath: string): Promise<string> {
  const fileBuffer = readFileSync(filePath);
  const ext = filePath.split('.').pop() || 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

  // Step 1: Get presigned URL
  const initRes = await fetch(`${LEONARDO_API_V1}/init-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ extension: ext }),
  });

  if (!initRes.ok) {
    const err = await initRes.text();
    throw new Error(`Leonardo init-image failed: ${initRes.status} ${err.slice(0, 200)}`);
  }

  const initData = await initRes.json();
  const { url: uploadUrl, fields, id: imageId } = initData.uploadInitImage || {};

  if (!uploadUrl || !imageId) {
    throw new Error(`No upload URL from Leonardo: ${JSON.stringify(initData).slice(0, 200)}`);
  }

  // Step 2: Upload to S3
  const formData = new FormData();
  const parsedFields = typeof fields === 'string' ? JSON.parse(fields) : fields;
  for (const [key, value] of Object.entries(parsedFields)) {
    formData.append(key, value as string);
  }
  formData.append('file', new Blob([fileBuffer], { type: mimeType }));

  const uploadRes = await fetch(uploadUrl, { method: 'POST', body: formData });
  if (!uploadRes.ok && uploadRes.status !== 204) {
    throw new Error(`S3 upload failed: ${uploadRes.status}`);
  }

  console.log(`[Leonardo] Uploaded reference image: ${imageId}`);
  return imageId;
}

export async function generateImageBuffer(
  prompt: string,
  materialIds?: string[]
): Promise<Buffer> {
  const apiKey = getApiKey();

  // Upload reference images for materials
  const imageReferences: { image: { id: string; type: string } }[] = [];

  if (materialIds && materialIds.length > 0) {
    const uniqueIds = [...new Set(materialIds)].slice(0, 6); // max 6 references
    for (const matId of uniqueIds) {
      const fileName = MATERIAL_IMAGE_FILES[matId];
      if (!fileName) continue;
      try {
        const filePath = join(REFERENCE_IMAGE_DIR, fileName);
        const imageId = await uploadImage(apiKey, filePath);
        imageReferences.push({ image: { id: imageId, type: 'UPLOADED' } });
      } catch (err) {
        console.error(`[Leonardo] Failed to upload ref image for ${matId}:`, err);
      }
    }
    console.log(`[Leonardo] ${imageReferences.length} reference images uploaded`);
  }

  // Create generation
  const params: Record<string, unknown> = {
    quality: 'MEDIUM',
    prompt,
    quantity: 1,
    width: 1024,
    height: 1024,
    prompt_enhance: 'OFF',
  };

  if (imageReferences.length > 0) {
    params.guidances = { image_reference: imageReferences };
  }

  const createRes = await fetch(`${LEONARDO_API_V2}/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      public: false,
      model: 'gpt-image-2',
      parameters: params,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Leonardo create failed: ${createRes.status} ${err.slice(0, 200)}`);
  }

  const createData = await createRes.json();
  console.log('[Leonardo] v2 create response:', JSON.stringify(createData).slice(0, 500));

  const generationId =
    createData.generate?.generationId ||
    createData.sdGenerationJob?.generationId ||
    createData.generationId ||
    createData.id;

  if (!generationId) {
    throw new Error(`No generationId from Leonardo v2: ${JSON.stringify(createData).slice(0, 300)}`);
  }

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
      const v2Res = await fetch(`${LEONARDO_API_V2}/generations/${generationId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });

      if (v2Res.ok) {
        const v2Data = await v2Res.json();
        const images = v2Data.generation?.generated_images || v2Data.generated_images || v2Data.images;
        if (images?.[0]?.url) return images[0].url;
      }
      continue;
    }

    const data = await res.json();
    const images = data.generations_by_pk?.generated_images;

    if (images?.[0]?.url) return images[0].url;

    if (data.generations_by_pk?.status === 'FAILED') {
      throw new Error('Leonardo generation failed');
    }
  }

  throw new Error('Leonardo generation timed out');
}
