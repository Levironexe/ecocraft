import { NextRequest } from 'next/server';
import { generateAndStoreModel, checkModelCache } from '../../lib/model-pipeline';
import { SelectedItem } from '../../lib/types';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const { selectedItems, craftName, craftDescription, imagePrompt } = await request.json() as {
      selectedItems: SelectedItem[];
      craftName: string;
      craftDescription: string;
      imagePrompt: string;
    };

    if (!selectedItems?.length || !craftName || !imagePrompt) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cached = await checkModelCache(selectedItems);
    if (cached) {
      return Response.json({ glbUrl: cached.glbUrl, referenceImageUrl: cached.referenceImageUrl, fromCache: true });
    }

    const result = await generateAndStoreModel(
      selectedItems,
      craftName,
      craftDescription,
      imagePrompt,
    );

    return Response.json(result);
  } catch (err) {
    console.error('[/api/generate-model] Error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const itemsParam = url.searchParams.get('items');
    if (!itemsParam) {
      return Response.json({ error: 'Missing items param' }, { status: 400 });
    }

    const selectedItems: SelectedItem[] = JSON.parse(decodeURIComponent(itemsParam));
    const cached = await checkModelCache(selectedItems);

    if (cached) {
      return Response.json({ glbUrl: cached.glbUrl, referenceImageUrl: cached.referenceImageUrl, fromCache: true });
    }

    return Response.json({ glbUrl: null, fromCache: false });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
