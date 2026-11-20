// LocalStorage manager with versioned migration and JSON export/import support
import { addStudyDays, setStudyWeekdays } from './dateUtils';
import { QUESTION_BANK_BY_DAY, QUESTION_IDS } from '../data/questionBankData';

/**
 * Keep only quiz answers/bookmarks that refer to questions that exist in the current bank
 * (the bank was rewritten, so answers to old question ids must not count), and recompute
 * each day's status/score from what remains.
 */
export function pruneQuizState(quizState) {
  const out = {};
  Object.entries(quizState || {}).forEach(([dayStr, q]) => {
    if (!q || typeof q !== 'object') return;
    const answers = {};
    Object.entries(q.answers || {}).forEach(([id, a]) => {
      if (QUESTION_IDS.has(id)) answers[id] = a;
    });
    const bookmarked = (q.bookmarked || []).filter((id) => QUESTION_IDS.has(id));
    const markedForReview = (q.markedForReview || []).filter((id) => QUESTION_IDS.has(id));
    const answered = Object.keys(answers).length;
    if (answered === 0 && bookmarked.length === 0 && markedForReview.length === 0) return;
    const total = QUESTION_BANK_BY_DAY[dayStr]?.totalQuestions || Infinity;
    const complete = answered >= total;
    out[dayStr] = {
      ...q,
      answers,
      bookmarked,
      markedForReview,
      status: complete ? 'completed' : answered > 0 ? 'in_progress' : 'not_started',
      score: Object.values(answers).filter((a) => a?.isCorrect).length,
      completedAt: complete ? (q.completedAt || null) : null
    };
  });
  return out;
}

const STORAGE_KEY = 'winter_arc_60_days_state_v1';
export const FIXED_CHALLENGE_START_DATE = '2026-11-17';
export const SCHEMA_VERSION = 3;

// Older builds wrote scheduler messages straight into the user's notes
// (sometimes once per page load). Strip those lines, keep everything the user typed.
const AUTO_NOTE_LINE = /^\s*\[(Schedule Rollover|Rescheduled|Recovery System)[^\]]*\]\s*$/;
export function cleanAutoNotes(notes) {
  if (!notes) return '';
  return String(notes)
    .split('\n')
    .filter((line) => !AUTO_NOTE_LINE.test(line))
    .join('\n')
    .trim();
}

// Per-day user progress fields. Curriculum content (title, videos, exercises…)
// always comes from the code so curriculum updates reach existing users.
const PROGRESS_FIELDS = [
  'checkedVideos', 'checkedExercises', 'checkedRevision', 'customTasks',
  'completed', 'completedAt', 'loggedStudyMinutes', 'notes', 'skipped', 'recovered', 'extraMinutes'
];

/**
 * Merge a saved (or imported) state object onto a fresh default state.
 * - schemaVersion < 3 (legacy): the old loader rebuilt every date from the fixed
 *   start date on each load and discarded journey state, so we do the same once,
 *   then keep everything from then on.
 * - schemaVersion >= 3: dates, pause state and settings are preserved as saved.
 */
export function hydrateState(parsed, defaultState) {
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.days)) return defaultState;
  const legacy = (parsed.schemaVersion || 0) < SCHEMA_VERSION;

  const settings = {
    ...defaultState.settings,
    ...(parsed.settings || {}),
    challengeDuration: defaultState.days.length,
    ...(legacy ? { startDate: FIXED_CHALLENGE_START_DATE } : {})
  };
  if (typeof settings.autoRescheduleMissedDays !== 'boolean') {
    settings.autoRescheduleMissedDays = true;
  }
  setStudyWeekdays(settings.preferredStudyDays);

  const savedMap = {};
  parsed.days.forEach((d) => { if (d && d.day != null) savedMap[d.day] = d; });

  const days = defaultState.days.map((d, idx) => {
    const saved = savedMap[d.day];
    const laidOutDate = addStudyDays(settings.startDate, idx, true);
    if (!saved) return { ...d, date: laidOutDate };

    const progress = {};
    PROGRESS_FIELDS.forEach((k) => { if (saved[k] !== undefined) progress[k] = saved[k]; });
    return {
      ...d,
      ...progress,
      checkedVideos: progress.checkedVideos || {},
      checkedExercises: progress.checkedExercises || {},
      checkedRevision: progress.checkedRevision || {},
      customTasks: Array.isArray(progress.customTasks) ? progress.customTasks : [],
      completed: !!progress.completed,
      completedAt: progress.completedAt || null,
      loggedStudyMinutes: Number(progress.loggedStudyMinutes) || 0,
      notes: cleanAutoNotes(progress.notes),
      targetMinutes: (d.targetMinutes || 90) + (Number(progress.extraMinutes) || 0),
      date: legacy ? laidOutDate : (saved.date || laidOutDate)
    };
  });

  const base = {
    ...defaultState,
    ...parsed,
    schemaVersion: SCHEMA_VERSION,
    days,
    settings,
    studySessions: Array.isArray(parsed.studySessions) ? parsed.studySessions : [],
    restDates: Array.isArray(parsed.restDates) ? parsed.restDates : [],
    completedProjects: parsed.completedProjects && typeof parsed.completedProjects === 'object'
      ? parsed.completedProjects
      : readLegacyCompletedProjects(),
    quizState: pruneQuizState(parsed.quizState && typeof parsed.quizState === 'object' ? parsed.quizState : {}),
    watchedVideosGlobal: parsed.watchedVideosGlobal && typeof parsed.watchedVideosGlobal === 'object'
      ? parsed.watchedVideosGlobal : {}
  };

  if (legacy) {
    return {
      ...base,
      totalPausedDays: 0,
      totalSkippedDays: 0,
      journeyStatus: 'active',
      pausedAt: null,
      frozenChallengeDay: null,
      activePauseReason: null
    };
  }
  return base;
}

// Older builds kept project completion in its own localStorage key
function readLegacyCompletedProjects() {
  try {
    const raw = localStorage.getItem('winter_arc_completed_projects');
    return raw ? JSON.parse(raw) || {} : {};
  } catch {
    return {};
  }
}

export function loadStoredState(defaultState) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return hydrateState(JSON.parse(raw), defaultState);
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
    appName: 'Winter Arc - Backend Engineering',
    version: '3.0.0',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    state
  };
  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `winter-arc-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after the click has been processed, otherwise some browsers cancel the download
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseAndValidateImportJSON(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    // Accept both the wrapped export format and a raw state object
    const state = data && data.state ? data.state : data;
    if (!state || !Array.isArray(state.days)) {
      throw new Error('This file is not a Winter Arc backup (no "days" list found).');
    }
    return { success: true, state };
  } catch (err) {
    return {
      success: false,
      error: err instanceof SyntaxError ? 'The file is not valid JSON.' : err.message
    };
  }
}
