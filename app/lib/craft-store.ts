import { Craft } from './types';
import { createBrowserClient } from './supabase';

export async function saveCraftToDb(userId: string, craft: Craft, source: string): Promise<string | null> {
  try {
    const supabase = createBrowserClient();
    const hash = craft.materials
      .map((m) => `${m.materialId}:${m.quantity}`)
      .sort()
      .join('|');

    const { data, error } = await supabase
      .from('generated_models')
      .insert({
        user_id: userId,
        material_combo_hash: hash,
        materials: craft.materials,
        craft_name: craft.name,
        craft_description: craft.description,
        emoji: craft.emoji,
        tools: craft.tools,
        steps: craft.steps,
        image_prompt: craft.imagePrompt || null,
        source,
        status: 'created',
        glb_storage_path: null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[craft-store] Save failed:', error);
      return null;
    }
    return data.id;
  } catch {
    console.error('[craft-store] Save failed');
    return null;
  }
}

export async function updateCraftStatus(
  craftDbId: string,
  status: string,
  glbUrl?: string,
  refImageUrl?: string,
  glbStoragePath?: string,
): Promise<void> {
  try {
    const supabase = createBrowserClient();
    const update: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (glbStoragePath) update.glb_storage_path = glbStoragePath;
    if (refImageUrl) update.ref_image_url = refImageUrl;

    await supabase
      .from('generated_models')
      .update(update)
      .eq('id', craftDbId);
  } catch {
    console.error('[craft-store] Update failed');
  }
}

export interface CraftRow {
  id: string;
  craft_name: string;
  craft_description: string | null;
  emoji: string;
  materials: { materialId: string; quantity: number }[];
  tools: string[];
  steps: { number: number; title: string; detail: string; tip?: string }[];
  image_prompt: string | null;
  glb_storage_path: string | null;
  ref_image_url: string | null;
  source: string;
  status: string;
  created_at: string;
}

export async function loadCraftHistory(userId: string): Promise<CraftRow[]> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('generated_models')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !data) return [];
    return data as CraftRow[];
  } catch {
    return [];
  }
}

export function craftRowToCraft(row: CraftRow): Craft {
  return {
    id: `history-${row.id}`,
    name: row.craft_name,
    emoji: row.emoji || '🎨',
    description: row.craft_description || '',
    difficulty: 1,
    ageMin: 6,
    timeMinutes: 20,
    materials: row.materials || [],
    tools: row.tools || ['Kéo', 'Keo dán'],
    steps: row.steps?.length > 0
      ? row.steps
      : [{ number: 1, title: 'Đã hoàn thành', detail: 'Sản phẩm này đã được chế tạo trước đó.' }],
    modelPath: null,
    imagePrompt: row.image_prompt || undefined,
    isShowcase: false,
  };
}
