import { ChatMessage } from './types';
import { createBrowserClient } from './supabase';

function hashMaterials(materials: { materialId: string; quantity: number }[]): string {
  const normalized = materials
    .map((m) => `${m.materialId}:${m.quantity}`)
    .sort()
    .join('|');
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36).padStart(8, '0').slice(0, 16);
}

export function getCoachHash(materials: { materialId: string; quantity: number }[]): string {
  return hashMaterials(materials);
}

export async function loadCoachHistory(userId: string, comboHash: string): Promise<ChatMessage[]> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('coach_messages')
      .select('role, content, created_at')
      .eq('user_id', userId)
      .eq('material_combo_hash', comboHash)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error || !data) return [];

    return data.map((row) => ({
      role: row.role as 'user' | 'assistant',
      content: row.content,
      timestamp: new Date(row.created_at).getTime(),
    }));
  } catch {
    return [];
  }
}

export async function saveCoachMessage(
  userId: string,
  comboHash: string,
  message: ChatMessage
): Promise<void> {
  try {
    const supabase = createBrowserClient();
    await supabase.from('coach_messages').insert({
      user_id: userId,
      material_combo_hash: comboHash,
      role: message.role,
      content: message.content,
    });
  } catch {
    console.error('[coach-store] Failed to save message');
  }
}
