import { GameStats, Craft } from './types';
import { createBrowserClient } from './supabase';

const LOCAL_STORAGE_KEY = 'rac-thai-xanh-ai-stats';

const DEFAULT_STATS: GameStats = {
  craftsCompleted: 0,
  itemsRecycled: 0,
  coachMessages: 0,
  level: 1,
  points: 0,
  activityDates: [],
};

function calculateLevel(points: number): number {
  if (points >= 1000) return 5;
  if (points >= 500) return 4;
  if (points >= 250) return 3;
  if (points >= 100) return 2;
  return 1;
}

function addToday(dates: string[]): string[] {
  const today = new Date().toISOString().split('T')[0];
  if (dates.includes(today)) return dates;
  return [...dates, today];
}

function toDbRow(userId: string, stats: GameStats) {
  return {
    user_id: userId,
    crafts_completed: stats.craftsCompleted,
    items_recycled: stats.itemsRecycled,
    coach_messages: stats.coachMessages,
    level: stats.level,
    points: stats.points,
    activity_dates: stats.activityDates,
    updated_at: new Date().toISOString(),
  };
}

function fromDbRow(row: Record<string, unknown>): GameStats {
  return {
    craftsCompleted: (row.crafts_completed as number) || 0,
    itemsRecycled: (row.items_recycled as number) || 0,
    coachMessages: (row.coach_messages as number) || 0,
    level: (row.level as number) || 1,
    points: (row.points as number) || 0,
    activityDates: (row.activity_dates as string[]) || [],
  };
}

export async function getStats(userId: string): Promise<GameStats> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return getLocalStats();
    }

    const stats = fromDbRow(data);
    saveLocalStats(stats);
    return stats;
  } catch {
    return getLocalStats();
  }
}

export async function saveStats(userId: string, stats: GameStats): Promise<void> {
  saveLocalStats(stats);

  try {
    const supabase = createBrowserClient();
    await supabase
      .from('user_stats')
      .upsert(toDbRow(userId, stats));
  } catch {
    console.error('[gamification] Failed to save to Supabase');
  }
}

export function completeCraft(stats: GameStats, craft: Craft): GameStats {
  const itemsAdded = craft.materials.reduce((sum, m) => sum + m.quantity, 0);
  const pointsEarned = 50 + craft.steps.length * 10;
  const newPoints = stats.points + pointsEarned;

  return {
    ...stats,
    craftsCompleted: stats.craftsCompleted + 1,
    itemsRecycled: stats.itemsRecycled + itemsAdded,
    points: newPoints,
    level: calculateLevel(newPoints),
    activityDates: addToday(stats.activityDates),
  };
}

export function recordCoachMessage(stats: GameStats): GameStats {
  const newPoints = stats.points + 5;

  return {
    ...stats,
    coachMessages: stats.coachMessages + 1,
    points: newPoints,
    level: calculateLevel(newPoints),
    activityDates: addToday(stats.activityDates),
  };
}

function getLocalStats(): GameStats {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { ...DEFAULT_STATS };
}

function saveLocalStats(stats: GameStats): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}
