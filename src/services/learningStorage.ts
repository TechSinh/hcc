import type { ErrorCategory, MistakeRecord } from '../data/seedQuestions';

export interface PersistedLearningState {
  mistakeMap: Record<string, MistakeRecord>;
  masteredIds: string[];
  needsReinforcementIds: string[];
  coachedIds: string[];
  extraPackLoaded: boolean;
  totalScore: number;
  bestStreak: number;
  updatedAt: string;
}

const STORAGE_KEY_V22 = 'hcc_l9_state_v22';
const LEGACY_MISTAKE_KEY = 'hcc_l9_mistakes_v21';
const LEGACY_MASTERED_KEY = 'hcc_l9_mastered_v21';
const LEGACY_REINFORCE_KEY = 'hcc_l9_reinforce_v21';
const LEGACY_COACHED_KEY = 'hcc_l9_parent_coached_v21';
const LEGACY_EXTRA_KEY = 'hcc_l9_extra_pack_v21';

function readStringArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function readMistakeMap(key: string): Record<string, MistakeRecord> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, MistakeRecord>;
  } catch {
    return {};
  }
}

export function loadInitialLearningState(): PersistedLearningState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V22);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedLearningState>;
      return {
        mistakeMap:
          parsed.mistakeMap && typeof parsed.mistakeMap === 'object' ? parsed.mistakeMap : {},
        masteredIds: Array.isArray(parsed.masteredIds)
          ? parsed.masteredIds.filter((x): x is string => typeof x === 'string')
          : [],
        needsReinforcementIds: Array.isArray(parsed.needsReinforcementIds)
          ? parsed.needsReinforcementIds.filter((x): x is string => typeof x === 'string')
          : [],
        coachedIds: Array.isArray(parsed.coachedIds)
          ? parsed.coachedIds.filter((x): x is string => typeof x === 'string')
          : [],
        extraPackLoaded: Boolean(parsed.extraPackLoaded),
        totalScore: typeof parsed.totalScore === 'number' ? parsed.totalScore : 0,
        bestStreak: typeof parsed.bestStreak === 'number' ? parsed.bestStreak : 0,
        updatedAt:
          typeof parsed.updatedAt === 'string'
            ? parsed.updatedAt
            : new Date().toISOString(),
      };
    }
  } catch {
    // Fallback sang bộ khóa cũ nếu cần
  }

  const mistakeMap = readMistakeMap(LEGACY_MISTAKE_KEY);
  const fallbackReinforce = Array.from(
    new Set([...readStringArray(LEGACY_REINFORCE_KEY), ...Object.keys(mistakeMap)])
  );

  return {
    mistakeMap,
    masteredIds: readStringArray(LEGACY_MASTERED_KEY),
    needsReinforcementIds: fallbackReinforce,
    coachedIds: readStringArray(LEGACY_COACHED_KEY),
    extraPackLoaded: localStorage.getItem(LEGACY_EXTRA_KEY) === 'true',
    totalScore: 0,
    bestStreak: 0,
    updatedAt: new Date().toISOString(),
  };
}

export function saveLearningState(state: PersistedLearningState): void {
  try {
    localStorage.setItem(STORAGE_KEY_V22, JSON.stringify(state));
  } catch {
    // Bỏ qua khi môi trường không hỗ trợ lưu trữ cục bộ
  }
}

export function getDominantErrorCategory(
  mistakeList: MistakeRecord[]
): ErrorCategory | null {
  if (mistakeList.length === 0) return null;
  const totals: Record<ErrorCategory, number> = {
    concept: 0,
    trap_condition: 0,
    execution: 0,
  };
  mistakeList.forEach((m) => {
    totals[m.errorCategory] = (totals[m.errorCategory] ?? 0) + m.wrongCount;
  });

  let best: ErrorCategory = 'concept';
  let bestVal = -1;
  (Object.keys(totals) as ErrorCategory[]).forEach((cat) => {
    if (totals[cat] > bestVal) {
      bestVal = totals[cat];
      best = cat;
    }
  });
  return best;
}