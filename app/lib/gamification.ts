import { GameStats, Craft } from './types';

const STORAGE_KEY = 'ecocraft-stats';

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

export function getStats(): GameStats {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* use default */ }
  return { ...DEFAULT_STATS };
}

export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch { /* localStorage full — silent fail */ }
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
