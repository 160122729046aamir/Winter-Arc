// LocalStorage manager with JSON export/import support
import { addStudyDays } from './dateUtils';

const STORAGE_KEY = 'winter_arc_60_days_state_v1';
export const FIXED_CHALLENGE_START_DATE = '2026-11-17';

export function loadStoredState(defaultState) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);

    const startDate = FIXED_CHALLENGE_START_DATE;

    // Migrate saved progress for all days, but ensure dates strictly follow line-wise
    // sequence starting from 17-11-2026 with Sundays excluded
    const savedMap = {};
    if (parsed.days && Array.isArray(parsed.days)) {
      parsed.days.forEach(d => { savedMap[d.day] = d; });
    }

    const mergedDays = defaultState.days.map((d, idx) => {
      const saved = savedMap[d.day];
      const correctDate = addStudyDays(startDate, idx, true);
      if (saved) {
        return {
          ...d,
          date: correctDate,
          checkedVideos: saved.checkedVideos || {},
          checkedExercises: saved.checkedExercises || {},
          checkedRevision: saved.checkedRevision || {},
          customTasks: saved.customTasks || [],
          completed: saved.completed || false,
          completedAt: saved.completedAt || null,
          loggedStudyMinutes: saved.loggedStudyMinutes || 0,
          notes: saved.notes || ''
        };
      }
      return {
        ...d,
        date: correctDate
      };
    });

    return {
      ...defaultState,
      ...parsed,
      days: mergedDays,
      totalPausedDays: 0,
      totalSkippedDays: 0,
      journeyStatus: 'active',
      pausedAt: null,
      frozenChallengeDay: null,
      settings: {
        ...defaultState.settings,
        ...(parsed.settings || {}),
        startDate: startDate,
        challengeDuration: 90
      }
    };
  } catch (err) {
    console.error('Failed to load stored state from LocalStorage:', err);
    return defaultState;
  }
}

export function saveStateToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to LocalStorage:', err);
  }
}

export function exportStateAsJSON(state) {
  const exportData = {
    appName: 'Winter Arc - 90 Days of Backend Engineering',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    state
  };
  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `winter-arc-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseAndValidateImportJSON(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    if (!data.state || !Array.isArray(data.state.days)) {
      throw new Error('Invalid backup file format: missing state or days array');
    }
    return { success: true, state: data.state };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
