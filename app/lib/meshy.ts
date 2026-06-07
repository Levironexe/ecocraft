const MESHY_API = 'https://api.meshy.ai/openapi/v2';

interface MeshyTaskResponse {
  result: string;
  id?: string;
}

interface MeshyTaskStatus {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED';
  progress: number;
  model_urls?: {
    glb?: string;
    obj?: string;
    fbx?: string;
  };
  task_error?: {
    message: string;
  };
}

export async function createImageTo3DTask(imageBuffer: Buffer): Promise<string> {
  const apiKey = process.env.MESHY_API_KEY;
  if (!apiKey) throw new Error('MESHY_API_KEY not configured');

  const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

  const res = await fetch(`${MESHY_API}/image-to-3d`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      image_url: base64Image,
      enable_pbr: true,
      should_remesh: true,
      should_generate_texture: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Meshy create task failed: ${res.status} ${err}`);
  }

  const data: MeshyTaskResponse = await res.json();
  if (!data.result) throw new Error('No task ID returned from Meshy');
  return data.result;
}

export async function pollMeshyTask(taskId: string, maxAttempts = 120): Promise<string> {
  const apiKey = process.env.MESHY_API_KEY;
  if (!apiKey) throw new Error('MESHY_API_KEY not configured');

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 5000));

    const res = await fetch(`${MESHY_API}/image-to-3d/${taskId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!res.ok) continue;

    const data: MeshyTaskStatus = await res.json();

    if (data.status === 'SUCCEEDED' && data.model_urls?.glb) {
      return data.model_urls.glb;
    }

    if (data.status === 'FAILED' || data.status === 'EXPIRED') {
      throw new Error(`Meshy task ${data.status}: ${data.task_error?.message || 'unknown'}`);
    }
  }

  throw new Error('Meshy task timed out');
}

export async function downloadGlb(glbUrl: string): Promise<Buffer> {
  const res = await fetch(glbUrl);
  if (!res.ok) throw new Error(`Failed to download GLB: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
