import { Craft, SelectedItem, MatchResult } from './types';

export function matchCrafts(selected: SelectedItem[], allCrafts: Craft[]): MatchResult[] {
  if (selected.length === 0) return [];

  const selectedIds = new Set(selected.map((s) => s.materialId));

  const results: MatchResult[] = [];

  for (const craft of allCrafts) {
    if (craft.materials.length === 0) continue;

    const requiredIds = craft.materials.map((m) => m.materialId);
    const matched = requiredIds.filter((id) => selectedIds.has(id));
    const missing = requiredIds.filter((id) => !selectedIds.has(id));
    const matchPercent = Math.round((matched.length / requiredIds.length) * 100);

    if (matchPercent >= 40) {
      results.push({
        craft,
        matchPercent,
        matchedMaterials: matched,
        missingMaterials: missing,
      });
    }
  }

  results.sort((a, b) => b.matchPercent - a.matchPercent);
  return results;
}
