import { ChatMessage } from './types';
import { createBrowserClient } from './supabase';

export async function loadChatHistory(userId: string): Promise<ChatMessage[]> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('chat_messages')
      .select('role, content, created_at')
      .eq('user_id', userId)
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

export async function saveChatMessage(
  userId: string,
  message: ChatMessage
): Promise<void> {
  try {
    const supabase = createBrowserClient();
    await supabase.from('chat_messages').insert({
      user_id: userId,
      role: message.role,
      content: message.content,
    });
  } catch {
    console.error('[chat-store] Failed to save message');
  }
}

export async function clearChatHistory(userId: string): Promise<void> {
  try {
    const supabase = createBrowserClient();
    await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId);
  } catch {
    console.error('[chat-store] Failed to clear history');
  }
}
